import { Ticket, DeletedTicketArchive } from '../types';

export interface ITicketRepository {
  getByProfileId(profileId: string): Promise<Ticket[]>;
  getById(id: string, profileId: string): Promise<Ticket | null>;
  create(ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'closedAt' | 'deletedAt'>): Promise<Ticket>;
  update(id: string, profileId: string, updates: Partial<Omit<Ticket, 'id' | 'profileId' | 'createdAt'>>): Promise<Ticket>;
  delete(id: string, profileId: string): Promise<void>; // Alias for softDelete
  softDelete(id: string, profileId: string): Promise<void>;
  restore(id: string, profileId: string): Promise<Ticket>;
  permanentDelete(id: string, profileId: string): Promise<void>;
  getDeleted(profileId: string): Promise<DeletedTicketArchive[]>;
  emptyTrash(profileId: string): Promise<void>;
  purgeExpired(profileId: string, maxAgeDays?: number): Promise<number>;
  deleteAllForProfile(profileId: string): Promise<void>;
  getNextTicketNumber(profileId: string): Promise<string>;
}

