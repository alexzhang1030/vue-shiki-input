import { getHighlighterCore, loadWasm } from 'shiki/core'
import type { BundledLanguageInfo, BundledThemeInfo, LanguageRegistration, ThemeRegistration } from 'shiki/core'
import wasm from 'shiki/wasm'

let globalBundles: {
  bundledLanguagesInfo: BundledLanguageInfo[]
  bundledThemesInfo: BundledThemeInfo[]
}
let globalBundlesFetcher: Promise<typeof globalBundles> | null = null

async function fetchBundles(skip: boolean) {
  await loadWasm(wasm).catch(console.error)
  if (skip)
    return globalBundles
  const [{ bundledLanguagesInfo }, { bundledThemesInfo }] = await Promise.all([
    import('shiki/bundle/web'),
    import('shiki/themes'),
  ])
  return {
    bundledLanguagesInfo,
    bundledThemesInfo,
  }
}

export async function loadBundles(skip: boolean) {
  if (globalBundles)
    return globalBundles
  globalBundlesFetcher ??= fetchBundles(skip)
  return globalBundlesFetcher
}

// If use built-in themes and languages, should load theme first
export async function loadHighlighter(props: {
  builtinThemes?: string[]
  builtinLanguages?: string[]
  customThemes?: ThemeRegistration[]
  customLanguages?: LanguageRegistration[]
  skipLoadBuiltins: boolean
}) {
  const {
    builtinLanguages = [],
    builtinThemes = [],
    customLanguages = [],
    customThemes = [],
    skipLoadBuiltins,
  } = props

  const { bundledLanguagesInfo, bundledThemesInfo } = await loadBundles(skipLoadBuiltins)

  const [themes, langs] = await Promise.all([
    loadThemes(bundledThemesInfo, builtinThemes),
    loadLanguages(bundledLanguagesInfo, builtinLanguages),
  ])

  const highlighter = await getHighlighterCore({
    themes: [...themes, ...customThemes],
    langs: [...langs, ...customLanguages],
  })

  return highlighter
}

async function loadThemes(themes: BundledThemeInfo[], names: string[]) {
  return (await Promise.all(
    names.map(async (name) => {
      const theme = themes.find(t => t.id === name)
      if (theme)
        return (await theme.import()).default
    }),
  ).then(l => l.filter(Boolean))) as ThemeRegistration[]
}

async function loadLanguages(langs: BundledLanguageInfo[], names: string[]) {
  return (await Promise.all(
    names.map(async (name) => {
      const lang = langs.find(t => t.id === name)
      if (lang)
        return (await lang.import()).default
    }),
  ).then(l => l.filter(Boolean))).flat() as LanguageRegistration[]
}
