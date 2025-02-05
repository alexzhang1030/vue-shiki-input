import type {
  BundledLanguageInfo,
  BundledThemeInfo,
  CodeToHastOptions,
  HighlighterCore,
  LanguageRegistration,
  ThemeRegistration,
} from 'shiki'
import { createHighlighterCore, loadWasm } from 'shiki'
import wasm from 'shiki/wasm'

let globalBundles: {
  bundledLanguagesInfo: BundledLanguageInfo[]
  bundledThemesInfo: BundledThemeInfo[]
}
let globalBundlesFetcher: Promise<typeof globalBundles> | null = null

const themeCache = new Map<string, ThemeRegistration>()
const languageCache = new Map<string, LanguageRegistration[]>()

export async function fetchShikiBundles() {
  const [{ bundledLanguagesInfo }, { bundledThemesInfo }] = await Promise.all([
    import('shiki/bundle/full'),
    import('shiki/themes'),
  ])
  return {
    bundledLanguagesInfo,
    bundledThemesInfo,
  }
}

async function fetchBundles(skip: boolean) {
  await loadWasm(wasm).catch(console.error)
  if (skip)
    return globalBundles
  const { bundledLanguagesInfo, bundledThemesInfo } = await fetchShikiBundles()
  globalBundles = {
    bundledLanguagesInfo,
    bundledThemesInfo,
  }
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

export async function loadHighlighter(props: {
  skipLoadShikiBundled: boolean
}) {
  const {
    skipLoadShikiBundled,
  } = props

  await loadBundles(skipLoadShikiBundled)
  const highlighter = await createHighlighterCore()

  return highlighter
}

export async function loadThemes(names: string[]) {
  if (!names.length)
    return []
  return (await Promise.all(
    names.map(async (name) => {
      const cache = themeCache.get(name)
      if (cache)
        return cache
      const theme = globalBundles.bundledThemesInfo.find(t => t.id === name)
      if (theme) {
        const themeValue = (await theme.import()).default
        themeCache.set(name, themeValue)
        return themeValue
      }
    }),
  ).then(l => l.filter(Boolean))) as ThemeRegistration[]
}

export async function loadLanguages(names: string[]) {
  if (!names.length)
    return []
  return (await Promise.all(
    names.map(async (name) => {
      const cache = languageCache.get(name)
      if (cache)
        return cache
      const lang = globalBundles.bundledLanguagesInfo.find(t => t.id === name)
      if (lang) {
        const langValue = (await lang.import()).default
        languageCache.set(name, langValue)
        return langValue
      }
    }),
  ).then(l => l.filter(Boolean))).flat() as LanguageRegistration[]
}

export function getCurrentThemeName(options: CodeToHastOptions) {
  const theme = 'theme' in options
    ? options.theme
    : options.defaultColor
      ? options.themes[options.defaultColor]
      : null
  return theme
}

export function getCurrentTheme(options: CodeToHastOptions, highlighter: HighlighterCore) {
  const theme = getCurrentThemeName(options)
  if (!theme)
    return null
  const themeValue = highlighter.getTheme(theme)
  if (!themeValue)
    return null
  return themeValue
}

export function currentThemeLoaded(highlighter: HighlighterCore, codeToHastOptions: CodeToHastOptions) {
  const loadedTheme = highlighter.getLoadedThemes()

  const theme = getCurrentThemeName(codeToHastOptions)
  const themeId = typeof theme === 'string' ? theme : theme?.name

  return {
    loaded: themeId && loadedTheme.includes(themeId),
    preloaded: themeId ? themeCache.has(themeId) : false,
    id: themeId,
  }
}

export function currentLangLoaded(highlighter: HighlighterCore, codeToHastOptions: CodeToHastOptions) {
  const loadedLang = highlighter.getLoadedLanguages()
  const langId = codeToHastOptions.lang

  return {
    loaded: langId && loadedLang.includes(langId),
    preloaded: langId ? languageCache.has(langId) : false,
    id: langId,
  }
}
