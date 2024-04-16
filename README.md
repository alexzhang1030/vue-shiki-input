# vue-shiki-input

<a href="https://www.npmjs.com/package/vue-shiki-input" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/npm/v/vue-shiki-input" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/package/vue-shiki-input" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/npm/dt/vue-shiki-input" alt="NPM Downloads" /></a>
<a href="https://github.com/alexzhang1030/vue-shiki-input/blob/main/LICENSE" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/github/license/alexzhang1030/vue-shiki-input" alt="License" /></a>

A Shiki input component for Vue.

Inspired by the awesome🤩 shiki playground from [shiki-docs home](https://shiki.style/).

Check out the [docs](https://vue-shiki-input.vercel.app/)!

> 🔨 Working on docs...

## Installation

```bash
pnpm i vue-shiki-input
```

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VueShikiInput } from 'vue-shiki-input'
import 'vue-shiki-input/style.css'

const text = ref('const a = 1;')
</script>

<template>
  <VueShikiInput
    v-model="text"
    class="w-500px h-500px bg-gray-800 text-gray-200"
    :langs="['javascript']" :themes="['vitesse-dark']"
    :code-to-hast-options="{
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

## License

MIT
