import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    maxWorkers: 4,
    projects: [
      { extends: true, test: { name: 'server', include: ['tests/unit/**/*.test.js', 'tests/integration/**/*.test.js'], environment: 'node' } },
      { extends: true, test: { name: 'client', include: ['tests/client/**/*.test.jsx'], environment: 'jsdom', setupFiles: ['tests/setup.js'] } },
    ],
  },
});
