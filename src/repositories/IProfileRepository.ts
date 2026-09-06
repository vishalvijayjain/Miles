import { Profile } from '../types';

export interface IProfileRepository {
  getAll(): Promise<Profile[]>;
  getById(id: string): Promise<Profile | null>;
  create(data: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>): Promise<Profile>;
  update(id: string, updates: Partial<Omit<Profile, 'id' | 'createdAt'>>): Promise<Profile>;
  delete(id: string): Promise<void>;
}
