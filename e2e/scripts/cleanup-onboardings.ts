import { chromium } from '@playwright/test';
import { getTrackedOnboardingIds, clearTrackedOnboardingIds } from '../utils/onboarding-tracker';
import { deleteOnboardingById } from '../utils/api-utils';
async function cleanupOnboardings() {
  console.log('🧹 Starting onboarding cleanup process...');

  // Check for required environment variables
  if (!process.env.APIM_SUBSCRIPTION_KEY) {
    console.error('❌ APIM_SUBSCRIPTION_KEY environment variable is required');
    process.exit(1);
  }

  // Get tracked onboarding IDs
  const onboardingIds = await getTrackedOnboardingIds();

  if (onboardingIds.length === 0) {
    console.log('ℹ️ No onboarding IDs to clean up');
    return;
  }

  console.log(`📋 Found ${onboardingIds.length} onboarding(s) to clean up:`);
  onboardingIds.forEach((id, index) => {
    console.log(`   ${index + 1}. ${id}`);
  });

  // Launch browser to get page context for API calls
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // eslint-disable-next-line functional/no-let
  let successCount = 0;
  // eslint-disable-next-line functional/no-let
  let failureCount = 0;

  // Delete each onboarding
  for (const onboardingId of onboardingIds) {
    console.log(`\n🗑️  Attempting to delete onboarding: ${onboardingId}`);

    const success = await deleteOnboardingById(page, onboardingId);

    if (success) {
      // eslint-disable-next-line functional/immutable-data
      successCount++;
    } else {
      // eslint-disable-next-line functional/immutable-data
      failureCount++;
    }
  }

  // Close browser
  await browser.close();

  // Clear the tracking file
  await clearTrackedOnboardingIds();

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Cleanup Summary:');
  console.log(`   ✅ Successfully deleted: ${successCount}`);
  console.log(`   ❌ Failed to delete: ${failureCount}`);
  console.log(`   📝 Total processed: ${onboardingIds.length}`);
  console.log('='.repeat(50));

  if (failureCount > 0) {
    console.error('\n⚠️ Some onboardings could not be deleted');
    process.exit(1);
  } else {
    console.log('\n✅ All onboardings cleaned up successfully');
  }
}

// Run the cleanup
cleanupOnboardings()
  .then(() => {
    console.log('✅ Cleanup process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Cleanup process failed:', error);
    process.exit(1);
  });
