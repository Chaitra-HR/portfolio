import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Read without @types/node, which the project doesn't install.
const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};

export default defineConfig({
  plugins: [react()],
  // On Windows the project lives in OneDrive, which turns node_modules/.vite into read-only
  // placeholders that Vite can't clear on start. Keep its cache in local app data instead.
  cacheDir: env.LOCALAPPDATA ? `${env.LOCALAPPDATA}/vite-cache/chaitra-portfolio` : undefined,
  css: {
    // Keep the exports' kebab-case class names in CSS, use camelCase in TSX.
    modules: { localsConvention: 'camelCaseOnly' },
  },
  // three.js is one lazy chunk (the glass mascot), loaded only near the footer
  build: { chunkSizeWarningLimit: 600 },
});
