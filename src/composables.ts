import type { Ref } from 'vue'
import { computed, ref, shallowRef, watchEffect } from 'vue'
import type { HighlighterCore, LanguageRegistration, ThemeRegistration } from 'shiki/core'
import type { ResolvedVueShikiInputProps } from './types'
import { currentLangLoaded, getCurrentTheme, loadHighlighter, loadLanguages, loadThemes } from './utils'

export function useHighlight(input: Ref<string | undefined>, props: Ref<ResolvedVueShikiInputProps>) {
  const loadingInfra = ref(true)
  const loadingToHTML = ref(false)
  const output = ref<string>('')
  const highlighter = shallowRef<HighlighterCore>()

  loadHighlighter({
    skipLoadBuiltins: props.value.skipLoadBuiltins,
  })
    .then(h => highlighter.value = h)
    .then(() => {
      loadingInfra.value = false
    })
    .catch(console.error)

  const propsThemes = computed(() => props.value.themes ?? [])
  const propsLangs = computed(() => props.value.langs ?? [])

  watchEffect(async () => {
    if (props.value.skipLoadBuiltins || !highlighter.value || !propsThemes.value.length || !propsLangs.value.length)
      return

    loadingInfra.value = true

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

    loadingInfra.value = false
  })

  watchEffect(() => {
    // use these dep to trigger reactivity
    // eslint-disable-next-line no-unused-expressions
    input.value
    // eslint-disable-next-line no-unused-expressions
    props.value.codeToHastOptions

    if (!highlighter.value || loadingInfra.value || !props.value.themes.length || !props.value.langs.length) {
      output.value = input.value ?? ''
      return
    }

    // if current theme / lang is not loaded, skip

    const themeLoaded = currentLangLoaded(highlighter.value, props.value.codeToHastOptions)
    const langLoaded = currentLangLoaded(highlighter.value, props.value.codeToHastOptions)

    if (!themeLoaded || !langLoaded)
      return

    highlighting(highlighter.value)
  })

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
    if (!highlighter.value || !props.value || !props.value.autoBackground || loadingInfra.value)
      return null
    const themeLoaded = currentLangLoaded(highlighter.value, props.value.codeToHastOptions)
    if (!themeLoaded)
      return
    const theme = getCurrentTheme(propsThemes.value, props.value.codeToHastOptions, highlighter.value)
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
    loading: computed(() => loadingInfra.value || loadingToHTML.value),
    output,
    background,
  }
}
