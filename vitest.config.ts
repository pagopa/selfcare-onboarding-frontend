import { resolve } from 'path';
import { defineConfig } from 'vitest/config';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [svgr() as any],
  resolve: {
    alias: {
      i18next: resolve('node_modules/i18next/dist/esm/i18next.js'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    exclude: ['**/node_modules/**', '**/e2e/**'],
    server: {
      deps: {
        inline: ['@pagopa/selfcare-common-frontend', '@pagopa/mui-italia'],
      },
    },
    pool: 'forks',
    isolate: false,
    coverage: {
      provider: 'v8',
      exclude: [
        'src/index.tsx',
        'src/reportWebVitals.ts',
        'src/utils/constants.ts',
        'src/consentAndAnalyticsConfiguration.ts',
        'src/model',
        'src/views/onboardingPremium/components/subProductStepPricingPlan/*',
        'e2e/**',
      ],
    },
  },
});
