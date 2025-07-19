import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react({
        // Include .jsx files
        include: "**/*.{jsx,tsx}",
      }),
    ],
    
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@/components': fileURLToPath(new URL('./src/components', import.meta.url)),
        '@/pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
        '@/hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
        '@/services': fileURLToPath(new URL('./src/services', import.meta.url)),
        '@/store': fileURLToPath(new URL('./src/store', import.meta.url)),
        '@/types': fileURLToPath(new URL('./src/types', import.meta.url)),
        '@/utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
        '@/styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
      },
    },
    
    // Environment variables
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    
    server: {
      port: 3000,
      host: true,
      open: false,
      cors: true,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/ws': {
          target: env.VITE_WS_BASE_URL || 'ws://localhost:3001',
          ws: true,
          changeOrigin: true,
        },
      },
    },
    
    build: {
      outDir: 'dist',
      sourcemap: command === 'serve' ? true : false,
      minify: 'terser',
      target: 'es2020',
      cssCodeSplit: true,
      
      // Rollup options for optimization
      rollupOptions: {
        output: {
          manualChunks: {
            // React ecosystem
            react: ['react', 'react-dom'],
            'react-router': ['react-router-dom'],
            
            // State management
            zustand: ['zustand'],
            
            // UI libraries
            ui: ['@headlessui/react', '@heroicons/react'],
            
            // Form handling
            forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
            
            // Code editor (large dependency)
            monaco: ['@monaco-editor/react'],
            
            // Charts
            charts: ['recharts'],
            
            // HTTP client and WebSocket
            network: ['axios', 'socket.io-client'],
          },
          
          // Optimize chunk file names
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
              ? chunkInfo.facadeModuleId.split('/').pop()
              : 'chunk';
            return `js/${facadeModuleId}-[hash].js`;
          },
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') ?? [];
            let extType = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType ?? '')) {
              extType = 'img';
            } else if (/woff|woff2/.test(extType ?? '')) {
              extType = 'css';
            }
            return `${extType}/[name]-[hash][extname]`;
          },
        },
      },
      
      // Terser options for better minification
      terserOptions: {
        compress: {
          drop_console: command !== 'serve',
          drop_debugger: command !== 'serve',
        },
      },
      
      // Chunk size warning limit
      chunkSizeWarningLimit: 1000,
    },
    
    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'zustand',
        'axios',
        '@headlessui/react',
        '@heroicons/react/24/outline',
        '@heroicons/react/24/solid',
        'react-hook-form',
        'zod',
      ],
      exclude: [
        '@monaco-editor/react', // Large dependency, load on demand
      ],
    },
    
    // CSS configuration
    css: {
      devSourcemap: true,
      postcss: './postcss.config.js',
    },
    
    // Preview server configuration
    preview: {
      port: 3000,
      host: true,
      cors: true,
    },
  };
});
