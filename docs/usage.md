# Usage

## Installation

```bash
pnpm install vue-shiki-input
```

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VueShikiInput } from 'vue-shiki-input'
import 'vue-shiki-input/index.css'

const text = ref('const a = 1;')
</script>

<template>
  <VueShikiInput
    v-model="text"
    class="w-500px h-500px bg-gray-800 text-gray-200"
    :langs="['javascript']" :themes="['vitesse-dark']"
    :code-to-html-options="{
      lang: 'javascript',
      theme: 'vitesse-dark',
    }"
    :offset="{
      x: 10,
      y: 50,
    }"
    line-numbers
  />
</template>
```

## Props

```ts
interface VueShikiInputProps {
  /**
   * The code to be edited
   */
  modelValue: string
  /**
   * Disabled editor, will only render code
   */
  disabled?: boolean
  /**
   * Loading state, you should use v-model:loading to bind this prop
   */
  loading?: boolean
  /**
   * Automatically set background color based on the theme
   * @default false
   */
  autoBackground?: boolean
  /**
   * Preload languages, you can ignore this if you don't need to preload languages
   */
  langs?: (LanguageInput | string)[]
  /**
   * Preload themes, you can ignore this if you don't need to preload languages
   */
  themes?: (ThemeInput | string)[]
  /**
   * Same as codeToHTML props in shiki
   */
  codeToHtmlOptions?: CodeToHastOptions
  /**
   * Show line numbers
   */
  lineNumbers?: boolean
  /**
   * Line numbers color
   */
  lineNumbersColor?: string
  /**
   * Custom styles
   */
  styles?: {
    textareaClass?: string
    codeClass?: string
  }
  /**
   * Skip loading bundled themes and languages
   * This will be useful when you sure you don't need built-in themes and languages
   */
  skipLoadBundled?: boolean
  /**
   * Editor offset
   * - x -> padding left+right
   * - y -> padding top+bottom
   */
  offset?: {
    x: number
    y: number
  }
  /**
   * Required when use customTheme, and cannot detect dark theme automatically (by type in theme)
   */
  darkTheme?: boolean
}
```
