<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { ReadMore, type ReadMoreOptions } from '../../../../src/readmore';
import { sample } from '../sample';

const props = defineProps<{
    /** Options handed to `ReadMore`, read once on mount. */
    options?: ReadMoreOptions
    /** Adds the `readmore-fade` class (height mode). */
    fade?: boolean
    /** Adds the transition used on the animation page. */
    animate?: boolean
}>();

const el = ref<HTMLElement | null>(null);
let instance: ReadMore | undefined;

onMounted(() => {
    instance = new ReadMore(el.value!, props.options);
});

onBeforeUnmount(() => instance?.destroy());
</script>

<template>
  <div class="rm-demo">
    <p
      ref="el"
      class="rm-demo-text"
      :class="{ 'readmore-fade': fade, 'rm-demo-animated': animate }"
    >
      <slot>{{ sample }}</slot>
    </p>
  </div>
</template>
