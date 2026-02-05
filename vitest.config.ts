import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    coverage: {
      provider: 'v8',
      exclude: [
        'src/index.tsx',
        'src/reportWebVitals.ts',
        'src/utils/constants.ts',
        'src/consentAndAnalyticsConfiguration.ts',
        'src/model',
        'src/views/onboardingPremium/components/subProductStepPricingPlan/*',
      ],
    },
  },
});
