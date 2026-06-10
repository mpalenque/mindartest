import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  server: {
    https: true,
    host: true, // Allow external access (tablet)
    port: 3000,
  },
  plugins: [mkcert()],
});
