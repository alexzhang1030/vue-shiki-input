import type { CodeToHastOptions, LanguageInput, ThemeInput } from 'shiki/core'
import type { Prop } from 'vue'

export interface VueShikiInputProps {
  modelValue: string
  disabled?: boolean
  langs?: (LanguageInput | string)[]
  themes?: (ThemeInput | string)[]
  codeToHastOptions?: CodeToHastOptions
  lineNumbers?: boolean
  lineNumbersColor?: string
  styles?: {
    textareaClass?: string
    codeClass?: string
  }
  skipLoadBuiltins?: boolean
  focus?: boolean
  offset?: {
    x: number
    y: number
  }
}

export type ResolvedVueShikiInputProps = Required<VueShikiInputProps>

export const vueShikiInputProps = {
  modelValue: {
    type: String,
    required: true,
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
} as {
  [K in keyof ResolvedVueShikiInputProps]: Prop<ResolvedVueShikiInputProps[K]>
}
