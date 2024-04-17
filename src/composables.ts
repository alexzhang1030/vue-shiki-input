import type { Ref } from 'vue'
import { computed, ref, shallowRef, watchEffect } from 'vue'
import type { HighlighterCore, LanguageRegistration, ThemeRegistration } from 'shiki/core'
import { watchDebounced } from '@vueuse/core'
import type { ResolvedVueShikiInputProps } from './types'
import { currentLangLoaded, currentThemeLoaded, getCurrentTheme, loadHighlighter, loadLanguages, loadThemes } from './utils'

export function useHighlight(input: Ref<string | undefined>, props: Ref<ResolvedVueShikiInputProps>) {
  const preloading = ref(false)
  const loadingOnDemand = ref(false)
  const loadingToHTML = ref(false)
  const output = ref<string>('')
  const highlighter = shallowRef<HighlighterCore>()

  loadHighlighter({
    skipLoadBuiltins: props.value.skipLoadBuiltins,
  })
    .then(h => highlighter.value = h)
    .catch(console.error)

  const propsThemes = computed(() => props.value.themes ?? [])
  const propsLangs = computed(() => props.value.langs ?? [])
  const propsCodeToHastOptions = computed(() => props.value.codeToHastOptions ?? {})

  // Preload logic
  watchEffect(async () => {
    if (props.value.skipLoadBuiltins || !highlighter.value || !propsThemes.value.length || !propsLangs.value.length)
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

  watchDebounced(() => [input.value, propsCodeToHastOptions.value, highlighter.value, preloading.value] as const, async (
    [,,highlighter, preloading],
  ) => {
    if (!highlighter || preloading) {
      output.value = input.value ?? ''
      return
    }

    const { loaded: themeLoaded, preloaded: themePreloaded, id: themeId } = currentThemeLoaded(highlighter, props.value.codeToHastOptions)
    const { loaded: langLoaded, preloaded: langPreloaded, id: langId } = currentLangLoaded(highlighter, props.value.codeToHastOptions)

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
    output.value = highlighter.codeToHtml(input.value ?? '', {
      ...props.value.codeToHastOptions,
      transformers: [
        ...props.value.codeToHastOptions.transformers ?? [],
        {
          preprocess(code) {
            // Workaround for https://github.com/shikijs/shiki/issues/608
            // When last span is empty, it's height is 0px
            // so add a newline to render it correctly
            if (code.endsWith('\n'))
              return `${code}\n`
          },
        },
      ],
    })
    loadingToHTML.value = false
  }

  const background = computed(() => {
    if (!highlighter.value || !props.value || !props.value.autoBackground || preloading.value || loadingOnDemand.value)
      return null
    const { loaded } = currentLangLoaded(highlighter.value, props.value.codeToHastOptions)
    if (!loaded)
      return
    const theme = getCurrentTheme(props.value.codeToHastOptions, highlighter.value)
    if (!theme)
      return null
    const color = theme.bg
    const type = theme.type
    if (!color || !color.trim().length)
      return null
    return {
      color,
      type,
    }
  })

  return {
    loading: computed(() => preloading.value || loadingToHTML.value),
    output,
    background,
  }
}
