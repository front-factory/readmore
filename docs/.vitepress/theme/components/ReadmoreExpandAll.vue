<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { ReadMore } from '../../../../src/readmore';
import { sample } from '../sample';

const root = ref<HTMLElement | null>(null);
let instances: ReadMore[] = [];

onMounted(() => {
    instances = ReadMore.init('.rm-demo-text', { lines: 2 }, root.value!);
});

onBeforeUnmount(() => instances.forEach((instance) => instance.destroy()));
</script>

<template>
  <div
    ref="root"
    class="rm-demo"
  >
    <div class="rm-demo-actions">
      <button
        type="button"
        class="rm-demo-action"
        @click="instances.forEach((instance) => instance.toggle(true))"
      >
        Expand all
      </button>
      <button
        type="button"
        class="rm-demo-action"
        @click="instances.forEach((instance) => instance.toggle(false))"
      >
        Collapse all
      </button>
    </div>

    <div
      v-for="n in 3"
      :key="n"
      class="rm-demo-item"
    >
      <p class="rm-demo-text">
        {{ sample }}
      </p>
    </div>
  </div>
</template>
