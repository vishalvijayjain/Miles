import { UserSettings } from '../types';

export interface ISettingsRepository {
  getSettings(profileId: string): Promise<UserSettings>;
  saveSettings(settings: UserSettings): Promise<void>;
  getActiveProfileId(): Promise<string | null>;
  setActiveProfileId(profileId: string): Promise<void>;
}
