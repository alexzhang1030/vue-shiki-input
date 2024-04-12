<script setup lang="ts">
import { ref } from 'vue'
import { VueShikiInput } from 'vue-shiki-input'
import 'vue-shiki-input/style.css'

const text = ref('const a = 1;')
</script>

<template>
  <VueShikiInput
    v-model="text"
    class="w-full h-500px bg-gray-800 text-gray-200 mt4"
    :langs="['javascript']" :themes="['vitesse-dark']"
    :code-to-hast-options="{
      lang: 'javascript',
      theme: 'vitesse-dark',
    }"
    :offset="{
      x: 10,
      y: 10,
    }"
    line-numbers
  />
</template>
