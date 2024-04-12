import DefaultTheme from 'vitepress/theme'
import HomeDemo from '../components/HomeDemo.vue'

import 'uno.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HomeDemo', HomeDemo)
  },
}
