import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**', 'www/**']
    }
  },
  build: {
    minify: 'esbuild',
    target: ['esnext']
  },
  esbuild: {
    // This is required by PIXI.JS 8.0
    minifyIdentifiers: false,
    // Actually mangleCache is not used
    mangleCache: {
      cu: false,
      cv: false,
      v: false,
      location: false,
      gl: false,
      name: false,
      data: false,
      ud: false,
      uv: false,
      t: false,
      offset: false
    }
  }
});
