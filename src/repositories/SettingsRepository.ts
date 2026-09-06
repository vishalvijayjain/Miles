import { ISettingsRepository } from './ISettingsRepository';
import { IStorageAdapter } from '../storage/IStorageAdapter';
import { UserSettings } from '../types';

export class SettingsRepository implements ISettingsRepository {
  private readonly storage: IStorageAdapter;
  private readonly activeProfileKey = 'active_profile_id';
  private readonly globalThemeKey = 'global_theme';

  constructor(storage: IStorageAdapter) {
    this.storage = storage;
  }

  public async getSettings(profileId: string): Promise<UserSettings> {
    const key = `settings_${profileId}`;
    const saved = await this.storage.get<UserSettings>(key);
    const globalTheme = await this.storage.get<'light' | 'dark'>(this.globalThemeKey);

    if (saved) {
      return {
        ...saved,
        theme: globalTheme || saved.theme || 'light',
      };
    }

    return {
      profileId,
      theme: globalTheme || 'light',
      defaultView: 'kanban',
    };
  }

  public async saveSettings(settings: UserSettings): Promise<void> {
    const key = `settings_${settings.profileId}`;
    await this.storage.set(key, settings);
    if (settings.theme) {
      await this.storage.set(this.globalThemeKey, settings.theme);
    }
  }

  public async getActiveProfileId(): Promise<string | null> {
    return await this.storage.get<string>(this.activeProfileKey);
  }

  public async setActiveProfileId(profileId: string): Promise<void> {
    await this.storage.set(this.activeProfileKey, profileId);
  }
}
