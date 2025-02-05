import VueJSX from '@vitejs/plugin-vue-jsx'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import DTS from 'vite-plugin-dts'
import TSConfigPaths from 'vite-tsconfig-paths'
import { peerDependencies } from './package.json'

export default defineConfig({
  build: {
    lib: {
      entry: './src/index',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: Object.keys(peerDependencies).map(item => new RegExp(`^${item}`)),
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  plugins: [
    VueJSX(),
    DTS({
      cleanVueFileName: true,
      outDir: 'dist/types',
      include: ['src/**/*'],
    }),
    UnoCSS(),
    TSConfigPaths(),
  ],
})
