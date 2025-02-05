import type { Ref, SlotsType } from 'vue'
import type { ResolvedVueShikiInputProps } from './types'
import { useScroll, useVModel } from '@vueuse/core'
import { defineComponent, ref, toRef, watchEffect } from 'vue'
import { useHighlight } from './composables'
import { vueShikiInputProps } from './types'
import 'uno.css'
import './style.css'

const commonClass = 'h-full tab-4 whitespace-pre inset-0 font-mono tracking-normal box-border!'

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
          'overflow-hidden rounded-4px __shiki-vue-input-container grid grid-rows-[auto_1fr_auto]',
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
          class={['__shiki-vue-input relative overflow-hidden', {
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
                      commonClass,
                      'absolute z-10 resize-none font-mono overflow-auto bg-transparent b-none',
                      'outline-none text-transparent p-0',
                      props.lineNumbers ? 'ml-2.5rem! w-[calc(100%-2.5rem)]!' : 'w-full!',
                      [
                        props.darkTheme || background.value?.type === 'dark'
                          ? 'caret-white'
                          : 'caret-black',
                      ],
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
