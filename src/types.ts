import type { CodeToHastOptions, LanguageInput, ThemeInput } from 'shiki'
import type { Prop } from 'vue'

export interface VueShikiInputProps {
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
   * Skip loading built-in themes and languages
   * This will be useful when you sure you don't need built-in themes and languages
   */
  skipLoadShikiBundled?: boolean
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

export type ResolvedVueShikiInputProps = Required<VueShikiInputProps>

export const vueShikiInputProps = {
  modelValue: {
    type: String,
    required: true,
  },
  loading: {
    type: Boolean,
  },
  autoBackground: {
    type: Boolean,
    default: false,
  },
  langs: {
    type: Array,
    default: () => [],
  },
  themes: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  lineNumbers: {
    type: Boolean,
    default: false,
  },
  codeToHtmlOptions: {
    type: Object,
    default: () => ({}),
  },
  lineNumbersColor: {
    type: String,
    default: 'rgba(115,138,148,.4)',
  },
  styles: {
    type: Object,
    default: () => ({}),
  },
  skipLoadShikiBundled: {
    type: Boolean,
    default: false,
  },
  offset: {
    type: Object,
    default: () => ({ x: 0, y: 0 }),
  },
  darkTheme: {
    type: Boolean,
  },
} as {
  [K in keyof ResolvedVueShikiInputProps]: Prop<ResolvedVueShikiInputProps[K]>
}
