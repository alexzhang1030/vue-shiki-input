import { useScroll, useVModel } from '@vueuse/core'
import type { Ref } from 'vue'
import { defineComponent, ref, toRef } from 'vue'
import 'uno.css'
import './style.css'
import { useHighlight } from './composables'
import type { ResolvedVueShikiInputProps } from './types'
import { vueShikiInputProps } from './types'

const commonClass = 'h-full tab-4 whitespace-pre inset-0 font-mono tracking-normal box-border!'

export const VueShikiInput = defineComponent({
  props: vueShikiInputProps,
  emits: {
    'update:modelValue': (_value: string) => true,
  },
  setup(props, { emit }) {
    const modelValue = useVModel(props, 'modelValue', emit, {
      defaultValue: '',
      passive: true,
    })
    const highlightContainerRef = ref<HTMLSpanElement>()
    const textareaRef = ref<HTMLTextAreaElement>()
    const propsRef = toRef(props)
    const { output } = useHighlight(modelValue, propsRef as unknown as Ref<ResolvedVueShikiInputProps>)
    const { x, y } = useScroll(textareaRef)

    return () => (
      <div
        class={[
          'relative overflow-hidden rounded-4px __shiki-vue-input flex',
          { 'line-numbers': props.lineNumbers },
        ]}
        style={{
          '--shiki-vue-input-line-number-color': props.lineNumbersColor,
        }}
      >
        <span
          ref={highlightContainerRef}
          innerHTML={output.value}
          class={[
            commonClass,
            'block absolute w-full',
          ]}
          style={{
            top: `${-y.value}px`,
            left: `${-x.value}px`,
            padding: `${props.offset!.y}px ${props.offset!.x}px`,
          }}
        >
        </span>
        <textarea
          v-model={modelValue.value}
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          ref={textareaRef}
          disabled={props.disabled}
          class={[
            commonClass,
            'absolute z-10 resize-none font-mono overflow-auto bg-transparent b-none',
            'outline-none caret-white text-transparent flex-1 p-0',
            {
              'ml-2.5rem!': props.lineNumbers,
            },
          ]}
          style={{
            padding: `${props.offset!.y}px ${props.offset!.x}px`,
          }}
        />
      </div>
    )
  },
})
