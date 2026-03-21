<script setup lang="ts"></script>

<template>
  <div class="loading" role="status" aria-live="polite">
    <span class="loader" aria-hidden="true"></span>
    <span class="sr-only">Loading content</span>
  </div>
</template>

<style scoped>
.loading {
  display: inline-flex;
  align-items: center;
}

.loader {
  --speed: 600ms;
  --size: 8px;

  position: relative;
  width: 100px;
  height: var(--size);
}
.loader:before,
.loader:after {
  content: '';
  position: absolute;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background: #fff;
  box-shadow: 16px 0 #fff;
  left: 0;
  top: 0;
  animation: ballMoveX var(--speed) linear infinite;
}
.loader:after {
  box-shadow: none;
  transform-origin: 20px 0;
  transform: rotate(-153deg);
  animation: rotateLoader var(--speed) linear infinite;
}

@keyframes rotateLoader {
  0%,
  10% {
    transform: rotate(-153deg);
  }
  90%,
  100% {
    transform: rotate(0deg);
  }
}
@keyframes ballMoveX {
  0%,
  10% {
    transform: translateX(0);
  }
  90%,
  100% {
    transform: translateX(16px);
  }
}

/* hide the status text visually but keep it for screen readers */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  /* stop the spinner for people who prefer reduced motion */
  .loader:before,
  .loader:after {
    animation: none;
  }
}
</style>
