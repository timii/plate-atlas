<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="atlas-header">
    <div class="header-left">
      <div class="brand">Logo (TBD)</div>
      <nav class="main-nav" aria-label="primary">
        <RouterLink class="nav-link" to="/overview">Overview</RouterLink>
      </nav>
    </div>
    <div class="header-right">
      <span class="meta-link">About</span>
      <span class="meta-link">Toggle</span>
    </div>
  </header>
</template>

<style scoped>
.atlas-header {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 50;
  height: var(--atlas-header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  border-bottom: 1px solid color-mix(in oklab, var(--atlas-line) 84%, #ffffff 16%);
  background: linear-gradient(
    180deg,
    var(--atlas-header-surface),
    color-mix(in oklab, var(--atlas-header-surface) 76%, transparent)
  );
  backdrop-filter: blur(8px);
}

.atlas-header::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(210, 186, 255, 0.26), transparent);
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand {
  font-size: 1.03rem;
  color: var(--atlas-text);
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.main-nav {
  display: flex;
  align-items: center;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  min-height: 2rem;
  border-radius: 999px;
  border: 1px solid transparent;
  padding: 0.16rem 0.74rem;
  color: color-mix(in oklab, var(--atlas-text) 92%, #ffffff 8%);
  text-decoration: none;
  letter-spacing: 0.01em;
  transition:
    background 140ms ease,
    border-color 140ms ease,
    color 140ms ease;
}

.nav-link:hover {
  border-color: color-mix(in oklab, var(--atlas-line) 86%, #ffffff 14%);
  background: color-mix(in oklab, var(--atlas-surface) 80%, #ffffff 20%);
}

.nav-link.router-link-exact-active {
  border-color: color-mix(in oklab, #8ea3f2 54%, var(--atlas-line));
  background: color-mix(in oklab, #8ea3f2 24%, var(--atlas-surface));
  color: #fff7ff;
}

.nav-link.router-link-active {
  border-color: color-mix(in oklab, #8ea3f2 46%, var(--atlas-line));
}

.meta-link {
  color: var(--atlas-muted);
  font-size: 0.95rem;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

@media (max-width: 760px) {
  .atlas-header {
    height: var(--atlas-header-height-mobile);
    padding: 0 0.75rem;
    gap: 0.5rem;
    background: linear-gradient(
      180deg,
      var(--atlas-header-surface-mobile),
      color-mix(in oklab, var(--atlas-header-surface-mobile) 84%, transparent)
    );
  }

  .brand {
    font-size: 0.94rem;
  }

  .header-left {
    gap: 0.58rem;
    min-width: 0;
  }

  .header-right {
    gap: 0.72rem;
  }

  .nav-link {
    min-height: 1.86rem;
    padding: 0.12rem 0.58rem;
    font-size: 0.92rem;
  }

  .meta-link {
    font-size: 0.9rem;
  }
}
</style>
