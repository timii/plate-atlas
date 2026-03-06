<script setup lang="ts"></script>

<template>
  <div>
    <span class="loader"></span>
  </div>
</template>

<style scoped>
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
</style>
