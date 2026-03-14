<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import Github from '@/assets/icons/Github.vue'
import Info from '@/assets/icons/Info.vue'
import logo from '@/assets/logo.svg'
import AboutDialog from './AboutDialog.vue'

const route = useRoute()
const isAboutOpen = ref(false)
const repositoryUrl = 'https://github.com/timii/plate-atlas'

function openAbout() {
  isAboutOpen.value = true
}

function closeAbout() {
  isAboutOpen.value = false
}

// close the about dialog when navigation changes
watch(
  () => route.fullPath,
  () => {
    isAboutOpen.value = false
  },
)
</script>

<template>
  <header class="header">
    <div class="header-inner">
      <RouterLink class="brand-link" to="/overview" aria-label="Go to the countries overview">
        <img :src="logo" alt="" class="logo" />
        <span class="title">Plate Atlas</span>
      </RouterLink>

      <div class="header-actions">
        <a
          :href="repositoryUrl"
          class="icon-link"
          target="_blank"
          rel="noreferrer"
          aria-label="Open the Plate Atlas repository on GitHub"
          title="GitHub repository"
        >
          <Github />
        </a>
        <button
          type="button"
          class="icon-link"
          aria-haspopup="dialog"
          aria-controls="about-dialog-panel"
          :aria-expanded="isAboutOpen"
          aria-label="About Plate Atlas"
          title="About Plate Atlas"
          @click="openAbout"
        >
          <Info />
        </button>
      </div>
    </div>
  </header>

  <AboutDialog :open="isAboutOpen" @close="closeAbout" />
</template>

<style scoped>
.header {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 50;
  padding: var(--atlas-header-offset) var(--atlas-page-gutter) 0;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: min(var(--atlas-content-width), 100%);
  min-height: var(--atlas-header-height);
  margin-inline: auto;
  padding: 0 1rem;
  border: 1px solid color-mix(in oklab, var(--atlas-line) 50%, #ffffff 8%);
  border-radius: var(--atlas-radius-shell);
  background: linear-gradient(
    180deg,
    color-mix(in oklab, var(--atlas-header-surface) 97%, rgba(255, 255, 255, 0.025)),
    color-mix(in oklab, var(--atlas-header-surface) 86%, transparent)
  );
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.03),
    0 16px 36px rgba(5, 4, 10, 0.2);
  backdrop-filter: blur(16px);
}

.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 0.62rem;
  min-width: 0;
  color: inherit;
  text-decoration: none;
}

.brand-link:focus-visible {
  outline: 2px solid color-mix(in oklab, #8ea3f2 58%, #ffffff 42%);
  outline-offset: 4px;
  border-radius: var(--atlas-radius-control);
}

.logo {
  width: 1.9rem;
  height: 1.9rem;
  flex: 0 0 auto;
  filter: drop-shadow(0 3px 8px rgba(5, 4, 10, 0.22));
}

.title {
  color: var(--atlas-text);
  font-size: 0.98rem;
  font-weight: 540;
  letter-spacing: 0.008em;
  white-space: nowrap;
}

.header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.04rem;
  flex: 0 0 auto;
  min-width: 0;
}

.icon-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  padding: 0;
  color: color-mix(in oklab, var(--atlas-muted) 88%, #ffffff 12%);
  cursor: pointer;
  transition:
    background-color 160ms ease,
    color 160ms ease;
}

.icon-link:hover {
  background: var(--atlas-control-hover);
  color: var(--atlas-text);
}

.icon-link:focus-visible {
  outline: 2px solid color-mix(in oklab, #8ea3f2 58%, #ffffff 42%);
  outline-offset: 3px;
}

.icon-link svg,
.icon-link :deep(svg) {
  width: 1.16rem;
  height: 1.16rem;
}

@media (max-width: 760px) {
  .header {
    padding: var(--atlas-header-offset-mobile) var(--atlas-page-gutter-mobile) 0;
  }

  .header-inner {
    min-height: var(--atlas-header-height-mobile);
    padding: 0 0.82rem;
  }

  .brand-link {
    gap: 0.52rem;
  }

  .logo {
    width: 1.78rem;
    height: 1.78rem;
  }

  .title {
    font-size: 0.89rem;
  }
}

@media (max-width: 520px) {
  .header-inner {
    gap: 0.72rem;
    padding: 0 0.74rem;
  }

  .brand-link {
    gap: 0.44rem;
  }

  .logo {
    width: 1.68rem;
    height: 1.68rem;
  }

  .title {
    font-size: 0.84rem;
  }

  .icon-link {
    width: 2.3rem;
    height: 2.3rem;
  }
}

@media (min-width: 1500px) {
  .header-inner {
    width: min(var(--atlas-content-width-wide), 100%);
  }
}
</style>