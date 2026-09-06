import { IProfileRepository } from './IProfileRepository';
import { IStorageAdapter } from '../storage/IStorageAdapter';
import { Profile } from '../types';

export class ProfileRepository implements IProfileRepository {
  private readonly storage: IStorageAdapter;
  private readonly storageKey = 'profiles';

  constructor(storage: IStorageAdapter) {
    this.storage = storage;
  }

  public async getAll(): Promise<Profile[]> {
    const profiles = await this.storage.get<Profile[]>(this.storageKey);
    return profiles || [];
  }

  public async getById(id: string): Promise<Profile | null> {
    const profiles = await this.getAll();
    return profiles.find((p) => p.id === id) || null;
  }

  public async create(data: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>): Promise<Profile> {
    const profiles = await this.getAll();
    const now = new Date().toISOString();
    const newProfile: Profile = {
      ...data,
      id: `profile_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };

    profiles.push(newProfile);
    await this.storage.set(this.storageKey, profiles);
    return newProfile;
  }

  public async update(id: string, updates: Partial<Omit<Profile, 'id' | 'createdAt'>>): Promise<Profile> {
    const profiles = await this.getAll();
    const index = profiles.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Profile with id "${id}" not found.`);
    }

    const updatedProfile: Profile = {
      ...profiles[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    profiles[index] = updatedProfile;
    await this.storage.set(this.storageKey, profiles);
    return updatedProfile;
  }

  public async delete(id: string): Promise<void> {
    const profiles = await this.getAll();
    const filtered = profiles.filter((p) => p.id !== id);
    await this.storage.set(this.storageKey, filtered);
  }
}
