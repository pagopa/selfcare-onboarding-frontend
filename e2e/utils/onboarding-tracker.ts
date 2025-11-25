import fs from 'fs/promises';
import path from 'path';

const TRACKING_FILE = path.resolve(__dirname, '../onboarding-ids.json');

interface OnboardingTracker {
  onboardingIds: Array<string>;
  timestamp: string;
}

const isValidOnboardingId = (onboardingId: string): boolean =>
  /^[a-zA-Z0-9_-]+$/.test(onboardingId) && onboardingId.length > 0 && onboardingId.length < 256;

export const trackOnboardingId = async (onboardingId: string): Promise<void> => {
  try {
    if (!isValidOnboardingId(onboardingId)) {
      console.error('Invalid onboarding ID format:', onboardingId);
      return;
    }

    // eslint-disable-next-line functional/no-let
    let tracker: OnboardingTracker = {
      onboardingIds: [],
      timestamp: new Date().toISOString(),
    };

    try {
      const fileContent = await fs.readFile(TRACKING_FILE, 'utf-8');
      tracker = JSON.parse(fileContent);
    } catch (readError) {
      // File doesn't exist yet, use default tracker
    }

    if (!tracker.onboardingIds.includes(onboardingId)) {
      // eslint-disable-next-line functional/immutable-data
      tracker.onboardingIds.push(onboardingId);
      // eslint-disable-next-line functional/immutable-data
      tracker.timestamp = new Date().toISOString();

      await fs.writeFile(TRACKING_FILE, JSON.stringify(tracker, null, 2), 'utf-8');
    }
  } catch (error) {
    console.error('Error tracking onboarding ID:', error);
  }
};

export const getTrackedOnboardingIds = async (): Promise<Array<string>> => {
  try {
    const fileContent = await fs.readFile(TRACKING_FILE, 'utf-8');
    const tracker: OnboardingTracker = JSON.parse(fileContent);
    return tracker.onboardingIds;
  } catch (error) {
    return [];
  }
};

export const clearTrackedOnboardingIds = async (): Promise<void> => {
  try {
    await fs.unlink(TRACKING_FILE);
  } catch (error) {
    // No tracking file to clear
  }
};
