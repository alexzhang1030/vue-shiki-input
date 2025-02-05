import jsx from '@vitejs/plugin-vue-jsx'
import unocss from 'unocss/vite'
import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Vue-Shiki-Input',
  description: 'A Shiki Input component for Vue.',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Usage', link: '/usage' },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/alexzhang1030/vue-shiki-input' },
    ],
  },
  vite: {
    plugins: [
      unocss(),
      jsx(),
    ],
  },
})
