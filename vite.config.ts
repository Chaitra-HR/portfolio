import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    // Keep the exports' kebab-case class names in CSS, use camelCase in TSX.
    modules: { localsConvention: 'camelCaseOnly' },
  },
  // three.js is one lazy chunk (the glass mascot), loaded only near the footer
  build: { chunkSizeWarningLimit: 600 },
});
