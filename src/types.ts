import type { CodeToHastOptions, LanguageInput, ThemeInput } from 'shiki/core'
import type { Prop } from 'vue'

export interface VueShikiInputProps {
  modelValue: string
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
   * Preload languages
   */
  langs?: (LanguageInput | string)[]
  /**
   * Preload themes
   */
  themes?: (ThemeInput | string)[]
  codeToHastOptions?: CodeToHastOptions
  lineNumbers?: boolean
  lineNumbersColor?: string
  styles?: {
    textareaClass?: string
    codeClass?: string
  }
  /**
   * Skip loading built-in themes and languages
   * This will be useful when you sure you don't need built-in themes and languages
   */
  skipLoadBuiltins?: boolean
  focus?: boolean
  offset?: {
    x: number
    y: number
  }
  /**
   * Required when use customTheme
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
  codeToHastOptions: {
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
  skipLoadBuiltins: {
    type: Boolean,
    default: false,
  },
  focus: {
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
