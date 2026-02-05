import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      createHtmlPlugin({
        inject: {
          data: {
            // Inietta variabili nell'HTML
            VITE_URL_CDN: env.VITE_URL_CDN,
            VITE_ONE_TRUST_BASE_URL: env.VITE_ONE_TRUST_BASE_URL,
            VITE_ONETRUST_DOMAIN_ID: env.VITE_ONETRUST_DOMAIN_ID,
          },
        },
      }),
    ],
    base: '/onboarding/',
    server: {
      port: 3000,
      open: true,
    },
    build: {
      outDir: 'build',
      sourcemap: true,
    },
    define: {
      // Espone tutte le VITE_* come process.env per compatibilità con env-var
      'process.env': Object.fromEntries(
        Object.entries(env).filter(([key]) => key.startsWith('VITE_'))
      ),
    },
  };
});
