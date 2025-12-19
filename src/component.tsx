import type { Ref, SlotsType } from 'vue'
import type { ResolvedVueShikiInputProps } from './types'
import { useScroll, useVModel } from '@vueuse/core'
import { defineComponent, ref, toRef, watchEffect } from 'vue'
import { useHighlight } from './composables'
import { vueShikiInputProps } from './types'
import './style.css'

export const VueShikiInput = defineComponent({
  props: vueShikiInputProps,
  emits: {
    'update:modelValue': (_value: string) => true,
    'update:loading': (_value: boolean) => true,
  },
  slots: Object as SlotsType<{
    header?: void
    footer?: void
  }>,
  setup(props, { emit, slots }) {
    const modelValue = useVModel(props, 'modelValue', emit, {
      defaultValue: '',
      passive: true,
    })
    const loadingUpstream = useVModel(props, 'loading', emit, {
      defaultValue: false,
      passive: true,
    })

    const highlightContainerRef = ref<HTMLSpanElement>()
    const textareaRef = ref<HTMLTextAreaElement>()

    const propsRef = toRef(props) as Ref<ResolvedVueShikiInputProps>
    const { output, loading, background } = useHighlight(modelValue, propsRef)
    const { x, y } = useScroll(textareaRef)

    watchEffect(() => {
      loadingUpstream.value = loading.value
    })

    return () => (
      <div
        class={[
          '__shiki-vue-input-container',
        ]}
        style={[
          props.autoBackground && background.value?.color
            ? {
                'background-color': background.value.color,
              }
            : null,
        ]}
      >
        <div>{ slots.header?.() }</div>
        <div
          class={['__shiki-vue-input', {
            'line-numbers': props.lineNumbers,
          }]}
          style={{
            '--shiki-vue-input-line-number-color': props.lineNumbersColor,
          }}
        >
          <span
            ref={highlightContainerRef}
            innerHTML={output.value}
            class={[
              '__shiki-vue-input-highlighted',
            ]}
            style={{
              top: `${-y.value}px`,
              left: `${-x.value}px`,
              padding: `${props.offset!.y}px ${props.offset!.x}px`,
            }}
          >
          </span>
          {
            props.disabled
              ? null
              : (
                  <textarea
                    v-model={modelValue.value}
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"
                    ref={textareaRef}
                    disabled={props.disabled}
                    class={[
                      '__shiki-vue-input-textarea',
                      {
                        'has-line-numbers': props.lineNumbers,
                        'is-dark': props.darkTheme || background.value?.type === 'dark',
                      },
                    ]}
                    style={{
                      padding: `${props.offset!.y}px ${props.offset!.x}px`,
                    }}
                  />
                )
          }
        </div>
        <div>{ slots.footer?.() }</div>
      </div>
    )
  },
})
