import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function selectivePublicCopy() {
  return {
    name: 'selective-public-copy',
    writeBundle() {
      const publicDir = 'public';
      const outDir = 'dist';

      if (!existsSync(publicDir)) return;
      if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

      const filesToCopy = [
        'background_1.jpg',
        'img_4010.jpg',
        'img_4030.jpg',
        'img_4038.jpg',
        'nash_background.png',
        'shield_marketing.jpg'
      ];

      filesToCopy.forEach(file => {
        const src = join(publicDir, file);
        const dest = join(outDir, file);
        try {
          if (existsSync(src)) {
            copyFileSync(src, dest);
            console.log(`Copied: ${file}`);
          }
        } catch (err) {
          console.warn(`Skipping ${file}:`, err.message);
        }
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), selectivePublicCopy()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  publicDir: false,
});
