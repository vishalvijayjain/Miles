import { IProfileRepository } from '../repositories/IProfileRepository';
import { ITicketRepository } from '../repositories/ITicketRepository';
import { Profile } from '../types';

export const MAX_PROFILES = 5;

const PROFILE_PALETTE = [
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#059669', // Emerald
  '#d97706', // Amber
  '#dc2626', // Rose
];

export class ProfileService {
  private profileRepo: IProfileRepository;
  private ticketRepo: ITicketRepository;

  constructor(profileRepo: IProfileRepository, ticketRepo: ITicketRepository) {
    this.profileRepo = profileRepo;
    this.ticketRepo = ticketRepo;
  }

  public async getProfiles(): Promise<Profile[]> {
    let profiles = await this.profileRepo.getAll();
    if (profiles.length === 0) {
      // Auto-create initial default profile
      const defaultProfile = await this.profileRepo.create({
        name: 'Personal Workspace',
        color: PROFILE_PALETTE[0],
      });
      profiles = [defaultProfile];
    }
    return profiles;
  }

  public async getProfileById(id: string): Promise<Profile | null> {
    return await this.profileRepo.getById(id);
  }

  public async createProfile(name: string): Promise<Profile> {
    const trimmed = (name || '').trim();
    if (!trimmed) {
      throw new Error('Profile name cannot be empty.');
    }
    if (trimmed.length > 30) {
      throw new Error('Profile name must not exceed 30 characters.');
    }

    const currentProfiles = await this.profileRepo.getAll();
    if (currentProfiles.length >= MAX_PROFILES) {
      throw new Error(`Profile limit reached. Maximum ${MAX_PROFILES} profiles allowed.`);
    }

    const colorIndex = currentProfiles.length % PROFILE_PALETTE.length;
    return await this.profileRepo.create({
      name: trimmed,
      color: PROFILE_PALETTE[colorIndex],
    });
  }

  public async updateProfile(id: string, name: string): Promise<Profile> {
    const trimmed = (name || '').trim();
    if (!trimmed) {
      throw new Error('Profile name cannot be empty.');
    }
    if (trimmed.length > 30) {
      throw new Error('Profile name must not exceed 30 characters.');
    }

    return await this.profileRepo.update(id, { name: trimmed });
  }

  public async deleteProfile(id: string): Promise<Profile> {
    const currentProfiles = await this.profileRepo.getAll();
    if (currentProfiles.length <= 1) {
      throw new Error('Cannot delete the only profile. At least one profile must exist.');
    }

    // Delete tickets associated with this profile
    await this.ticketRepo.deleteAllForProfile(id);
    await this.profileRepo.delete(id);

    // Return next available profile
    const remaining = currentProfiles.filter((p) => p.id !== id);
    return remaining[0];
  }
}
