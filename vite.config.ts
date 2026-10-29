import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  // polling: на Windows обычное отслеживание иногда пропускает быстрые правки и отдаёт старый модуль
  server: { port: 5173, watch: { usePolling: true, interval: 300 } },
});
