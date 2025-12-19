<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { fetchShikiBundles, VueShikiInput } from '../../../src'
import '../../../src/style.css'

const text = ref('')

const shikiLoading = ref(false)
const sampleLoading = ref(false)
const loading = computed(() => shikiLoading.value || sampleLoading.value)

const themes = ref<{ id: string, displayName: string, type: 'dark' | 'light' }[]>([])
const langs = ref<{ id: string, name: string }[]>([])
const init = ref(false)

const currentTheme = ref<string>()
const themeDark = computed(() => {
  if (!currentTheme.value)
    return false
  const index = themes.value.findIndex(theme => theme.id === currentTheme.value)
  return themes.value[index].type === 'dark'
})
const currentLang = ref<string>()

watchEffect(() => {
  if (themes.value.length && langs.value.length && !init.value) {
    init.value = true
    randomize()
  }
})

;(async () => {
  const { bundledLanguagesInfo, bundledThemesInfo } = await fetchShikiBundles()
  themes.value = bundledThemesInfo.map(item => ({
    id: item.id,
    displayName: item.displayName,
    type: item.type,
  }))
  langs.value = bundledLanguagesInfo.map(item => ({
    id: item.id,
    name: item.name,
  }))
})()

function pickRandomTheme() {
  const randomThemeIndex = Math.floor(Math.random() * themes.value.length)
  return themes.value[randomThemeIndex].id
}

function pickRandomLang() {
  const randomLangIndex = Math.floor(Math.random() * langs.value.length)
  return langs.value[randomLangIndex].id
}

async function updateSample() {
  if (currentLang.value) {
    sampleLoading.value = true
    const code = await fetchSample(currentLang.value)
    if (!code)
      return
    text.value = code
    sampleLoading.value = false
  }
}

const samplesCache = new Map<string, Promise<string | undefined>>()

function fetchSample(id: string) {
  if (!samplesCache.has(id)) {
    samplesCache.set(id, fetch(`https://raw.githubusercontent.com/antfu/textmate-grammars-themes/main/samples/${id}.sample`)
      .then(r => r.text())
      .catch((e) => {
        console.error(e)
        return undefined
      }))
  }
  return samplesCache.get(id)!
}

async function randomize() {
  currentLang.value = pickRandomLang()
  await updateSample()
  currentTheme.value = pickRandomTheme()
}
</script>

<template>
  <VueShikiInput
    v-model="text"
    v-model:loading="shikiLoading"
    class="w-full h-500px bg-gray-800 text-gray-200 mt4 b-1 b-solid border-gray/8 rounded-lg!"
    :code-to-html-options="{
      lang: currentLang!,
      theme: currentTheme!,
    }"
    :offset="{
      x: 10,
      y: 10,
    }"
    line-numbers auto-background focus
  >
    <template #header>
      <div
        class="py2 pr3 pl5 flex gap-1 items-center border-b border-gray/5" :class="[
          themeDark ? 'text-gray-200' : 'text-gray-800',
        ]"
      >
        <div class="i-carbon:chevron-down op50" />
        <select
          v-model="currentTheme"
          class="font-mono bg-transparent cursor-pointer " :class="[
            themeDark ? 'text-gray-200' : 'text-gray-800',
          ]"
        >
          <option v-for="theme in themes.filter(i => i.type === 'light')" :key="theme.id" :value="theme.id">
            {{ theme.displayName }}
          </option>
          <option disabled>
            ──────────
          </option>
          <option v-for="theme in themes.filter(i => i.type === 'dark')" :key="theme.id" :value="theme.id">
            {{ theme.displayName }}
          </option>
        </select>
        <div class="i-carbon:chevron-down op50" />
        <select
          v-model="currentLang"
          class="font-mono bg-transparent cursor-pointer "
          @change="updateSample"
        >
          <option v-for="lang in langs" :key="lang.id" :value="lang.id">
            {{ lang.name }}
          </option>
        </select>
        <div class="flex-auto" />
        <div
          class="i-svg-spinners-3-dots-fade"
          :class="loading ? 'op100' : 'op0'"
          flex-none transition-opacity
        />
        <div op50 text-xs class="mx-0.2">
          Randomize
        </div>
        <button title="Randomize" hover="bg-gray/10" p1 rounded @click="randomize">
          <div i-carbon:shuffle op50 />
        </button>
      </div>
    </template>
    <template #footer>
      <div class="h-30px text-sm text-gray-500 flex justify-end px-5 font-mono">
        Vue Shiki Input
      </div>
    </template>
  </VueShikiInput>
</template>
