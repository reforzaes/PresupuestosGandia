
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANTE: Esta es la clave para que funcione en tu subdirectorio de Gandía
  base: '/presupuestosgandias/', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
  server: {
    historyApiFallback: true,
  }
});
