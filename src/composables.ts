import type {
  HighlighterCore,
  LanguageRegistration,
  ThemeRegistration,
  ThemeRegistrationResolved,
} from 'shiki'
import type { Ref } from 'vue'
import type { ResolvedVueShikiInputProps } from './types'
import { watchDebounced } from '@vueuse/core'
import { computed, ref, shallowRef, watchEffect } from 'vue'
import {
  currentLangLoaded,
  currentThemeLoaded,
  getCurrentTheme,
  loadHighlighter,
  loadLanguages,
  loadThemes,
} from './utils'

export function useHighlight(input: Ref<string | undefined>, props: Ref<ResolvedVueShikiInputProps>) {
  const preloading = ref(false)
  const loadingOnDemand = ref(false)
  const loadingToHTML = ref(false)
  const output = ref<string>('')
  const highlighter = shallowRef<HighlighterCore>()

  loadHighlighter({
    skipLoadShikiBundled: props.value.skipLoadShikiBundled,
  })
    .then(h => highlighter.value = h)
    .catch(console.error)

  const propsThemes = computed(() => props.value.themes ?? [])
  const propsLangs = computed(() => props.value.langs ?? [])
  const propsCodeToHtmlOptions = computed(() => props.value.codeToHtmlOptions ?? {})

  // Preload logic
  watchEffect(async () => {
    if (props.value.skipLoadShikiBundled || !highlighter.value || !propsThemes.value.length || !propsLangs.value.length)
      return

    preloading.value = true

    const [builtinThemes, customThemes] = propsThemes.value.reduce<[string[], ThemeRegistration[]]>((acc, t) => {
      if (!t)
        return acc
      if (typeof t === 'string')
        acc[0].push(t)
      else
        acc[1].push(t as ThemeRegistration)
      return acc
    }, [[], []])

    const [builtinLanguages, customLanguages] = propsLangs.value.reduce<[string[], LanguageRegistration[]]>((acc, t) => {
      if (!t)
        return acc
      if (typeof t === 'string')
        acc[0].push(t)
      else
        acc[1].push(t as LanguageRegistration)
      return acc
    }, [[], []])

    const [themes, langs] = await Promise.all([
      loadThemes(builtinThemes),
      loadLanguages(builtinLanguages),
    ])

    await Promise.all([
      highlighter.value.loadTheme(...customThemes, ...themes),
      highlighter.value.loadLanguage(...customLanguages, ...langs),
    ])

    preloading.value = false
  })

  watchDebounced(() => [input.value, propsCodeToHtmlOptions.value, highlighter.value, preloading.value] as const, async (
    [,,highlighter, preloading],
  ) => {
    if (!highlighter || preloading) {
      output.value = input.value ?? ''
      return
    }

    const { loaded: themeLoaded, preloaded: themePreloaded, id: themeId } = currentThemeLoaded(highlighter, props.value.codeToHtmlOptions)
    const { loaded: langLoaded, preloaded: langPreloaded, id: langId } = currentLangLoaded(highlighter, props.value.codeToHtmlOptions)

    // if current theme / lang is not loaded but preloaded, skip
    // cause will rerun this fn when loaded
    if ((!themeLoaded && themePreloaded) || (!langLoaded && langPreloaded) || !themeId)
      return

    const tasks: Promise<any>[] = []
    if (!themePreloaded)
      tasks.push(loadThemes([themeId]).then(themes => highlighter.loadTheme(...themes)))
    if (!langPreloaded)
      tasks.push(loadLanguages([langId]).then(langs => highlighter.loadLanguage(...langs)))

    if (tasks.length) {
      loadingOnDemand.value = true
      await Promise.all(tasks)
      loadingOnDemand.value = false
    }

    highlighting(highlighter)
  }, { immediate: true })

  function highlighting(highlighter: HighlighterCore) {
    loadingToHTML.value = true
    output.value = highlighter.codeToHtml(input.value ?? '', props.value.codeToHtmlOptions)
    loadingToHTML.value = false
  }

  const background = ref<{ color: string, type: ThemeRegistrationResolved['type'] } | null>(null)

  watchEffect(() => {
    if (!highlighter.value || !props.value || !props.value.autoBackground || preloading.value || loadingOnDemand.value)
      return
    const { loaded } = currentLangLoaded(highlighter.value, props.value.codeToHtmlOptions)
    if (!loaded)
      return
    const theme = getCurrentTheme(props.value.codeToHtmlOptions, highlighter.value)
    if (!theme)
      return
    const color = theme.bg
    const type = theme.type
    if (!color || !color.trim().length) {
      background.value = null
      return
    }
    background.value = { color, type }
  })

  return {
    loading: computed(() => preloading.value || loadingOnDemand.value || loadingToHTML.value),
    output,
    background,
  }
}
