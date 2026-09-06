import { ISettingsRepository } from '../repositories/ISettingsRepository';
import { UserSettings } from '../types';

export class SettingsService {
  private settingsRepo: ISettingsRepository;

  constructor(settingsRepo: ISettingsRepository) {
    this.settingsRepo = settingsRepo;
  }

  public async getSettings(profileId: string): Promise<UserSettings> {
    return await this.settingsRepo.getSettings(profileId);
  }

  public async updateSettings(settings: UserSettings): Promise<void> {
    await this.settingsRepo.saveSettings(settings);
  }

  public async getActiveProfileId(): Promise<string | null> {
    return await this.settingsRepo.getActiveProfileId();
  }

  public async setActiveProfileId(profileId: string): Promise<void> {
    await this.settingsRepo.setActiveProfileId(profileId);
  }
}
