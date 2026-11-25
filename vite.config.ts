import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' đảm bảo chạy mượt trên mọi đường dẫn GitHub Pages (https://user.github.io/ten-repo/)
export default defineConfig({
  plugins: [react()],
  base: './',
});
