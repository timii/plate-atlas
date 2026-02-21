<script setup lang="ts">
import Info from '@/assets/icons/Info.vue'

const props = defineProps<{
  title?: string
}>()
</script>

<template>
  <div
    class="relative w-full overflow-hidden rounded-xl border border-border-light3 bg-background-light-highlight px-5 py-4 text-text-light-default dark:border-border-dark3 dark:bg-background-dark-highlight dark:text-text-dark-default"
  >
    <div
      class="pointer-events-none absolute top-0 left-0 h-full w-1 bg-cyan-500/30 dark:bg-cyan-300/35"
    ></div>
    <div class="relative z-10 flex items-start gap-2.5">
      <div
        class="shrink-0 pt-px text-text-light-info [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:min-w-[18px] dark:text-text-dark-info"
      >
        <Info />
      </div>
      <div class="min-w-0 flex flex-col gap-1">
        <span
          v-if="props.title"
          class="text-xs font-semibold tracking-[0.06em] text-text-light-info uppercase dark:text-text-dark-info"
          >{{ props.title }}</span
        >
        <p class="text-sm leading-relaxed text-text-light-default dark:text-text-dark-default">
          <slot />
        </p>
      </div>
    </div>
  </div>
</template>
