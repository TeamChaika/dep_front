<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import MainLayout from './layouts/MainLayout.vue';
import AuthLayout from './layouts/AuthLayout.vue';
import EmptyLayout from './layouts/EmptyLayout.vue';

const route = useRoute();

const layout = computed(() => {
  switch (route.meta.layout) {
    case 'auth':
      return AuthLayout;
    case 'empty':
      return EmptyLayout;
    default:
      return MainLayout;
  }
});
</script>

<template>
  <component :is="layout">
    <RouterView />
  </component>
</template>

<style>
/* Global styles can go here or in assets/main.css */
</style>
