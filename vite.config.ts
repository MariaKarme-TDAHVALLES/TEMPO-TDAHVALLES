import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Carrega les variables d'entorn (com la API KEY)
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Això permet que el teu codi llegeixi la clau de Gemini
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.VITE_GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          // Com que no tens carpeta 'src', el projecte neix a l'arrel '.'
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Indiquem que l'entrada és el index.html de l'arrel
        rollupOptions: {
          input: path.resolve(__dirname, 'index.html'),
        },
      }
    };
});
