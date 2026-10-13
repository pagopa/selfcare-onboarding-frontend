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
    testTimeout: 30000,
    hookTimeout: 15000,
    // jsdom + MUI suites are CPU-heavy: one worker per core starves them and makes the long onboarding flows time out
    maxWorkers: '50%',
    server: {
      deps: {
        inline: ['@pagopa/selfcare-common-frontend', '@pagopa/mui-italia'],
      },
    },
    deps: {
      optimizer: {
        client: {
          enabled: true,
          include: [
            'react',
            'react-dom',
            'react-dom/client',
            'react/jsx-runtime',
            'react/jsx-dev-runtime',
            '@emotion/react',
            '@emotion/styled',
            '@mui/material',
            '@mui/icons-material',
          ],
        },
      },
    },
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
        'src/locale/**',
        'src/**/__mocks__/**',
        'src/setupTests.ts',
        'src/assets/**',
        'src/utils/test/**',
        'src/utils/config.json',
        'src/**/__tests__/**',
        'src/App.tsx',
        'src/redux/store.ts',
      ],
    },
  },
});
