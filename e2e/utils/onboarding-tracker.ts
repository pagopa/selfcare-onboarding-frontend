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
    // Validate onboarding ID to prevent injection
    if (!isValidOnboardingId(onboardingId)) {
      console.error('❌ Invalid onboarding ID format:', onboardingId);
      return;
    }

    // eslint-disable-next-line functional/no-let
    let tracker: OnboardingTracker = {
      onboardingIds: [],
      timestamp: new Date().toISOString(),
    };

    // Try to read existing file
    try {
      const fileContent = await fs.readFile(TRACKING_FILE, 'utf-8');
      tracker = JSON.parse(fileContent);
    } catch (readError) {
      // File doesn't exist yet, use default tracker
      console.log('📝 Creating new tracking file');
    }

    // Add the new onboarding ID if not already present
    if (!tracker.onboardingIds.includes(onboardingId)) {
      // eslint-disable-next-line functional/immutable-data
      tracker.onboardingIds.push(onboardingId);
      // eslint-disable-next-line functional/immutable-data
      tracker.timestamp = new Date().toISOString();

      await fs.writeFile(TRACKING_FILE, JSON.stringify(tracker, null, 2), 'utf-8');
      console.log(`✅ Tracked onboarding ID: ${onboardingId}`);
    } else {
      console.log(`ℹ️ Onboarding ID already tracked: ${onboardingId}`);
    }
  } catch (error) {
    console.error('❌ Error tracking onboarding ID:', error);
  }
};

// Retrieves all tracked onboarding IDs
export const getTrackedOnboardingIds = async (): Promise<Array<string>> => {
  try {
    const fileContent = await fs.readFile(TRACKING_FILE, 'utf-8');
    const tracker: OnboardingTracker = JSON.parse(fileContent);
    return tracker.onboardingIds;
  } catch (error) {
    console.log('ℹ️ No tracked onboarding IDs found');
    return [];
  }
};

// Clears the tracking file
export const clearTrackedOnboardingIds = async (): Promise<void> => {
  try {
    await fs.unlink(TRACKING_FILE);
    console.log('✅ Tracking file cleared');
  } catch (error) {
    console.log('ℹ️ No tracking file to clear');
  }
};
