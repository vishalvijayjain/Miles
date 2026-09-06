import { ITicketRepository } from './ITicketRepository';
import { IStorageAdapter } from '../storage/IStorageAdapter';
import { Ticket, DeletedTicketArchive } from '../types';

export class TicketRepository implements ITicketRepository {
  private readonly storage: IStorageAdapter;

  constructor(storage: IStorageAdapter) {
    this.storage = storage;
  }

  private getStorageKey(profileId: string): string {
    return `tickets_profile_${profileId}`;
  }

  private getDeletedStorageKey(profileId: string): string {
    return `deleted_tickets_profile_${profileId}`;
  }

  public async getByProfileId(profileId: string): Promise<Ticket[]> {
    if (!profileId) return [];
    const tickets = await this.storage.get<Ticket[]>(this.getStorageKey(profileId));
    return (tickets || []).filter((t) => !t.deletedAt);
  }

  public async getById(id: string, profileId: string): Promise<Ticket | null> {
    const tickets = await this.getByProfileId(profileId);
    return tickets.find((t) => t.id === id && t.profileId === profileId) || null;
  }

  public async getNextTicketNumber(profileId: string): Promise<string> {
    const activeTickets = await this.getByProfileId(profileId);
    const deletedArchives = await this.getDeleted(profileId);
    let maxNumber = 0;

    const checkNumber = (ticketNumber?: string) => {
      if (!ticketNumber) return;
      const match = ticketNumber.match(/TASK-(\d+)/i);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    };

    activeTickets.forEach((t) => checkNumber(t.ticketNumber));
    deletedArchives.forEach((a) => checkNumber(a.ticket.ticketNumber));

    const nextNum = maxNumber + 1;
    return `TASK-${String(nextNum).padStart(3, '0')}`;
  }

  public async create(
    data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'closedAt' | 'deletedAt'>
  ): Promise<Ticket> {
    const tickets = await this.getByProfileId(data.profileId);
    const now = new Date().toISOString();

    const newTicket: Ticket = {
      ...data,
      id: `ticket_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: now,
      updatedAt: now,
      closedAt: data.status === 'CLOSED' ? now : null,
      deletedAt: null,
    };

    tickets.push(newTicket);
    await this.storage.set(this.getStorageKey(data.profileId), tickets);
    return newTicket;
  }

  public async update(
    id: string,
    profileId: string,
    updates: Partial<Omit<Ticket, 'id' | 'profileId' | 'createdAt'>>
  ): Promise<Ticket> {
    const tickets = await this.getByProfileId(profileId);
    const index = tickets.findIndex((t) => t.id === id);

    if (index === -1) {
      throw new Error(`Ticket with id "${id}" not found in profile "${profileId}".`);
    }

    const currentTicket = tickets[index];
    const now = new Date().toISOString();

    // Track closedAt status transition
    let closedAt = currentTicket.closedAt;
    if (updates.status && updates.status !== currentTicket.status) {
      if (updates.status === 'CLOSED') {
        closedAt = now;
      } else {
        closedAt = null;
      }
    }

    const updatedTicket: Ticket = {
      ...currentTicket,
      ...updates,
      closedAt,
      updatedAt: now,
    };

    tickets[index] = updatedTicket;
    await this.storage.set(this.getStorageKey(profileId), tickets);
    return updatedTicket;
  }

  public async delete(id: string, profileId: string): Promise<void> {
    await this.softDelete(id, profileId);
  }

  public async softDelete(id: string, profileId: string): Promise<void> {
    const tickets = await this.getByProfileId(profileId);
    const ticket = tickets.find((t) => t.id === id);
    if (!ticket) return;

    const remaining = tickets.filter((t) => t.id !== id);
    await this.storage.set(this.getStorageKey(profileId), remaining);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString();
    const nowIso = now.toISOString();

    const archiveItem: DeletedTicketArchive = {
      schemaVersion: 1,
      deletedAt: nowIso,
      expiresAt,
      ticket: {
        ...ticket,
        deletedAt: nowIso,
      },
    };

    const deletedArchives = await this.getDeleted(profileId);
    // Remove if already in archive
    const filteredArchive = deletedArchives.filter((a) => a.ticket.id !== id);
    filteredArchive.unshift(archiveItem);
    await this.storage.set(this.getDeletedStorageKey(profileId), filteredArchive);
  }

  public async restore(id: string, profileId: string): Promise<Ticket> {
    const deletedArchives = await this.getDeleted(profileId);
    const archiveItem = deletedArchives.find((a) => a.ticket.id === id);
    if (!archiveItem) {
      throw new Error(`Ticket "${id}" not found in trash.`);
    }

    // Remove from trash
    const remainingArchives = deletedArchives.filter((a) => a.ticket.id !== id);
    await this.storage.set(this.getDeletedStorageKey(profileId), remainingArchives);

    // Add back to active tickets
    const restoredTicket: Ticket = {
      ...archiveItem.ticket,
      deletedAt: null,
      updatedAt: new Date().toISOString(),
    };

    const tickets = await this.getByProfileId(profileId);
    // Ensure no duplicates
    const filtered = tickets.filter((t) => t.id !== id);
    filtered.push(restoredTicket);
    await this.storage.set(this.getStorageKey(profileId), filtered);

    return restoredTicket;
  }

  public async permanentDelete(id: string, profileId: string): Promise<void> {
    const deletedArchives = await this.getDeleted(profileId);
    const filtered = deletedArchives.filter((a) => a.ticket.id !== id);
    await this.storage.set(this.getDeletedStorageKey(profileId), filtered);
  }

  public async getDeleted(profileId: string): Promise<DeletedTicketArchive[]> {
    if (!profileId) return [];
    const archives = await this.storage.get<DeletedTicketArchive[]>(this.getDeletedStorageKey(profileId));
    return archives || [];
  }

  public async emptyTrash(profileId: string): Promise<void> {
    await this.storage.set(this.getDeletedStorageKey(profileId), []);
  }

  public async purgeExpired(profileId: string, maxAgeDays = 60): Promise<number> {
    const archives = await this.getDeleted(profileId);
    const now = Date.now();
    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;

    const kept: DeletedTicketArchive[] = [];
    let purgedCount = 0;

    for (const item of archives) {
      const deletedTime = new Date(item.deletedAt).getTime();
      if (now - deletedTime >= maxAgeMs) {
        purgedCount++;
      } else {
        kept.push(item);
      }
    }

    if (purgedCount > 0) {
      await this.storage.set(this.getDeletedStorageKey(profileId), kept);
    }
    return purgedCount;
  }

  public async deleteAllForProfile(profileId: string): Promise<void> {
    await this.storage.remove(this.getStorageKey(profileId));
    await this.storage.remove(this.getDeletedStorageKey(profileId));
  }
}

