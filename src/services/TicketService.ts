import { ITicketRepository } from '../repositories/ITicketRepository';
import {
  Ticket,
  TicketStatus,
  DashboardStats,
  FilterState,
  SortOption,
  DeletedTicketArchive,
} from '../types';
import {
  calculateRevisedEndDate,
  isTicketOverdue,
} from '../utils/dateUtils';

export class TicketService {
  private ticketRepo: ITicketRepository;

  constructor(ticketRepo: ITicketRepository) {
    this.ticketRepo = ticketRepo;
  }

  public async getTicketsForProfile(profileId: string): Promise<Ticket[]> {
    if (!profileId) return [];
    return await this.ticketRepo.getByProfileId(profileId);
  }

  public async getDeletedTickets(profileId: string): Promise<DeletedTicketArchive[]> {
    if (!profileId) return [];
    return await this.ticketRepo.getDeleted(profileId);
  }

  public async getNextTicketNumber(profileId: string): Promise<string> {
    return await this.ticketRepo.getNextTicketNumber(profileId);
  }

  public async createTicket(
    data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'closedAt' | 'ticketNumber' | 'deletedAt'>
  ): Promise<Ticket> {
    this.validateTicketInput(data);

    // Validate parent ticket if specified
    if (data.parentTicketId) {
      const activeTickets = await this.ticketRepo.getByProfileId(data.profileId);
      const parentTicket = activeTickets.find((t) => t.id === data.parentTicketId);
      if (!parentTicket) {
        throw new Error('Specified parent ticket does not exist in this workspace.');
      }
    }

    // Auto-generate ticket number for this profile
    const ticketNumber = await this.ticketRepo.getNextTicketNumber(data.profileId);

    // Compute revised end date if extension is specified
    let revisedEndDate = data.revisedEndDate;
    if (data.originalEndDate && data.extensionPeriod && data.extensionPeriod > 0) {
      revisedEndDate = calculateRevisedEndDate(data.originalEndDate, data.extensionPeriod);
    }

    return await this.ticketRepo.create({
      ...data,
      ticketNumber,
      parentTicketId: data.parentTicketId || null,
      revisedEndDate: revisedEndDate || undefined,
    });
  }

  public async updateTicket(
    id: string,
    profileId: string,
    updates: Partial<Omit<Ticket, 'id' | 'profileId' | 'createdAt'>>
  ): Promise<Ticket> {
    this.validatePartialTicketInput(updates);

    const currentTicket = await this.ticketRepo.getById(id, profileId);
    if (!currentTicket) {
      throw new Error(`Ticket "${id}" not found.`);
    }

    // Validate parent-child relationship
    if (updates.parentTicketId !== undefined) {
      if (updates.parentTicketId === id) {
        throw new Error('A ticket cannot be its own parent.');
      }

      if (updates.parentTicketId) {
        const activeTickets = await this.ticketRepo.getByProfileId(profileId);
        const parent = activeTickets.find((t) => t.id === updates.parentTicketId);
        if (!parent) {
          throw new Error('Parent ticket does not exist in this workspace.');
        }

        // Prevent cyclic parent relationship (e.g., if parent's parent is this ticket)
        if (parent.parentTicketId === id) {
          throw new Error('Cannot set parent: cyclic parent-child relationship detected.');
        }
      }
    }

    const merged = { ...currentTicket, ...updates };
    let revisedEndDate = updates.revisedEndDate !== undefined ? updates.revisedEndDate : currentTicket.revisedEndDate;

    if (merged.originalEndDate && merged.extensionPeriod && merged.extensionPeriod > 0) {
      revisedEndDate = calculateRevisedEndDate(merged.originalEndDate, merged.extensionPeriod);
    } else if (!merged.extensionPeriod || merged.extensionPeriod <= 0) {
      revisedEndDate = undefined;
    }

    return await this.ticketRepo.update(id, profileId, {
      ...updates,
      revisedEndDate,
    });
  }

  public async moveTicketStatus(id: string, profileId: string, newStatus: TicketStatus): Promise<Ticket> {
    return await this.ticketRepo.update(id, profileId, { status: newStatus });
  }

  public async deleteTicket(id: string, profileId: string): Promise<void> {
    // Soft delete to 60-day recoverable trash
    await this.ticketRepo.softDelete(id, profileId);
  }

  public async restoreTicket(id: string, profileId: string): Promise<Ticket> {
    return await this.ticketRepo.restore(id, profileId);
  }

  public async permanentDeleteTicket(id: string, profileId: string): Promise<void> {
    await this.ticketRepo.permanentDelete(id, profileId);
  }

  public async emptyTrash(profileId: string): Promise<void> {
    await this.ticketRepo.emptyTrash(profileId);
  }

  public async purgeExpired(profileId: string): Promise<number> {
    return await this.ticketRepo.purgeExpired(profileId, 60);
  }

  /**
   * Returns all child tickets for a given parent ticket ID.
   */
  public getChildrenTickets(parentTicketId: string, allTickets: Ticket[]): Ticket[] {
    if (!parentTicketId) return [];
    return allTickets.filter((t) => t.parentTicketId === parentTicketId);
  }

  /**
   * Derive canonical dashboard statistics directly from a profile's tickets.
   */
  public calculateStats(tickets: Ticket[]): DashboardStats {
    const total = tickets.length;
    let todo = 0;
    let inProgress = 0;
    let closed = 0;
    let blocked = 0;
    let overdue = 0;
    let extended = 0;

    for (const t of tickets) {
      if (t.status === 'TODO') todo++;
      else if (t.status === 'IN_PROGRESS') inProgress++;
      else if (t.status === 'CLOSED') closed++;

      // Active blockers check
      if (t.blockers && t.blockers.length > 0 && t.blockers.some((b) => b && b.trim().length > 0)) {
        blocked++;
      }

      // Overdue check
      if (isTicketOverdue(t.status, t.originalEndDate, t.revisedEndDate, t.extensionPeriod)) {
        overdue++;
      }

      // Extended check
      if (t.extensionPeriod && t.extensionPeriod > 0) {
        extended++;
      }
    }

    const completionRate = total > 0 ? Math.round((closed / total) * 100) : 0;

    return {
      total,
      todo,
      inProgress,
      closed,
      blocked,
      overdue,
      extended,
      completionRate,
    };
  }

  /**
   * Filter tickets based on search query and filter criteria.
   */
  public filterTickets(tickets: Ticket[], filter: FilterState): Ticket[] {
    return tickets.filter((ticket) => {
      // Search term
      if (filter.search && filter.search.trim()) {
        const query = filter.search.toLowerCase().trim();
        const matchesId = ticket.ticketNumber.toLowerCase().includes(query);
        const matchesTitle = ticket.title.toLowerCase().includes(query);
        const matchesDesc = (ticket.description || '').toLowerCase().includes(query);
        const matchesNotes = (ticket.notes || '').toLowerCase().includes(query);
        const matchesTags = (ticket.tags || []).some((tag) => tag.toLowerCase().includes(query));
        const matchesBlockers = (ticket.blockers || []).some((b) => b.toLowerCase().includes(query));

        if (!matchesId && !matchesTitle && !matchesDesc && !matchesNotes && !matchesTags && !matchesBlockers) {
          return false;
        }
      }

      // Status filter
      if (filter.status !== 'ALL' && ticket.status !== filter.status) {
        return false;
      }

      // Priority filter
      if (filter.priority !== 'ALL' && ticket.priority !== filter.priority) {
        return false;
      }

      // Type filter
      if (filter.type !== 'ALL' && ticket.type !== filter.type) {
        return false;
      }

      // Only Blocked
      if (filter.onlyBlocked) {
        const hasBlocker = ticket.blockers && ticket.blockers.length > 0 && ticket.blockers.some((b) => b && b.trim().length > 0);
        if (!hasBlocker) return false;
      }

      // Only Overdue
      if (filter.onlyOverdue) {
        if (!isTicketOverdue(ticket.status, ticket.originalEndDate, ticket.revisedEndDate, ticket.extensionPeriod)) {
          return false;
        }
      }

      // Only Extended
      if (filter.onlyExtended) {
        if (!ticket.extensionPeriod || ticket.extensionPeriod <= 0) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Sort tickets according to sort configuration.
   */
  public sortTickets(tickets: Ticket[], sort: SortOption): Ticket[] {
    const priorityWeights: Record<string, number> = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    return [...tickets].sort((a, b) => {
      let comparison = 0;

      switch (sort.field) {
        case 'priority': {
          const weightA = priorityWeights[a.priority] || 0;
          const weightB = priorityWeights[b.priority] || 0;
          comparison = weightB - weightA; // High priority first by default
          break;
        }
        case 'deadline': {
          const dateA = (a.extensionPeriod && a.extensionPeriod > 0 && a.revisedEndDate) ? a.revisedEndDate : a.originalEndDate || '9999-99-99';
          const dateB = (b.extensionPeriod && b.extensionPeriod > 0 && b.revisedEndDate) ? b.revisedEndDate : b.originalEndDate || '9999-99-99';
          comparison = dateA.localeCompare(dateB);
          break;
        }
        case 'startDate': {
          const dateA = a.startDate || '9999-99-99';
          const dateB = b.startDate || '9999-99-99';
          comparison = dateA.localeCompare(dateB);
          break;
        }
        case 'createdAt': {
          comparison = (b.createdAt || '').localeCompare(a.createdAt || '');
          break;
        }
        case 'updatedAt': {
          comparison = (b.updatedAt || '').localeCompare(a.updatedAt || '');
          break;
        }
        case 'ticketNumber': {
          comparison = a.ticketNumber.localeCompare(b.ticketNumber);
          break;
        }
      }

      return sort.direction === 'desc' ? -comparison : comparison;
    });
  }

  private validateTicketInput(data: Partial<Ticket>): void {
    if (!data.title || !data.title.trim()) {
      throw new Error('Ticket title is required.');
    }
    if (data.title.trim().length > 150) {
      throw new Error('Ticket title must not exceed 150 characters.');
    }
    if (!data.profileId) {
      throw new Error('Ticket must be assigned to a valid profile.');
    }
    this.validateDates(data.startDate, data.originalEndDate);
  }

  private validatePartialTicketInput(data: Partial<Ticket>): void {
    if (data.title !== undefined && (!data.title || !data.title.trim())) {
      throw new Error('Ticket title cannot be empty.');
    }
    this.validateDates(data.startDate, data.originalEndDate);
  }

  private validateDates(startDate?: string, originalEndDate?: string): void {
    if (startDate && originalEndDate) {
      if (originalEndDate < startDate) {
        throw new Error('Original target end date cannot be earlier than start date.');
      }
    }
  }
}

