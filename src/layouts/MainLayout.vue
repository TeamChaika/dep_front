<script setup>
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";
import { ref } from "vue";

// PrimeVue components
import Menubar from 'primevue/menubar';
import Button from 'primevue/button';

const store = useAuthStore();
const router = useRouter();

const items = ref([
  { label: 'Мои заведения', icon: 'pi pi-building', command: () => router.push('/establishments') },
  { label: 'События', icon: 'pi pi-calendar', command: () => router.push('/events') },
  { label: 'Депозиты', icon: 'pi pi-wallet', command: () => router.push('/deposits') },
  { label: 'Билеты', icon: 'pi pi-ticket', command: () => router.push('/tickets') },
  { label: 'Промокоды', icon: 'pi pi-tag', command: () => router.push('/promo-codes') },
]);

const handleLogout = async () => {
  await store.logout();
  router.push("/login");
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <header class="bg-white shadow-sm">
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 justify-between items-center">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-slate-900">Deposits Tickets</h1>
          </div>
          
          <nav class="hidden md:flex space-x-4">
            <RouterLink 
              v-for="item in items" 
              :key="item.label" 
              :to="item.command ? '#' : item.to" 
              @click="item.command"
              class="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium"
              active-class="bg-slate-100 text-slate-900"
            >
              {{ item.label }}
            </RouterLink>
          </nav>

          <div class="flex items-center">
            <Button 
              label="Выйти" 
              icon="pi pi-sign-out" 
              @click="handleLogout" 
              :loading="store.loading"
              severity="secondary"
              text
            />
          </div>
        </div>
      </div>
    </header>

    <main class="flex-1 py-6 px-4 sm:px-6 lg:px-8">
      <slot />
    </main>
  </div>
</template>

<style scoped>
/* Custom styles if needed, but Tailwind handles most */
</style>

