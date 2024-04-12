import type { Ref } from 'vue'
import { computed, ref, shallowRef, watchEffect } from 'vue'
import type { HighlighterCore, LanguageRegistration, ThemeRegistration } from 'shiki/core'
import type { ResolvedVueShikiInputProps } from './types'
import { loadHighlighter } from './utils'

export function useHighlight(input: Ref<string | undefined>, props: Ref<ResolvedVueShikiInputProps>) {
  const loadingInfra = ref(true)
  const loadingToHTML = ref(false)
  const output = ref<string>('')
  const highlighter = shallowRef<HighlighterCore>()

  const [builtinThemes, customThemes] = props.value.themes?.reduce<[string[], ThemeRegistration[]]>((acc, t) => {
    if (!t)
      return acc
    if (typeof t === 'string')
      acc[0].push(t)
    else
      acc[1].push(t as ThemeRegistration)
    return acc
  }, [[], []])
  const [builtinLanguages, customLanguages] = props.value.langs?.reduce<[string[], LanguageRegistration[]]>((acc, t) => {
    if (!t)
      return acc
    if (typeof t === 'string')
      acc[0].push(t)
    else
      acc[1].push(t as LanguageRegistration)
    return acc
  }, [[], []])

  loadHighlighter({
    builtinLanguages,
    builtinThemes,
    customLanguages,
    customThemes,
    skipLoadBuiltins: props.value.skipLoadBuiltins,
  })
    .then(h => highlighter.value = h)
    .then(() => {
      loadingInfra.value = false
    })
    .catch(console.error)

  watchEffect(() => {
    // use input.value as a dependency
    // eslint-disable-next-line no-unused-expressions
    input.value
    if (!highlighter.value) {
      output.value = input.value ?? ''
      return
    }
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

  return {
    loading: computed(() => loadingInfra.value || loadingToHTML.value),
    output,
  }
}
