<script setup>
import { useAuthStore } from "../stores/auth";
import { useRouter, useRoute } from "vue-router";
import { ref, computed } from "vue";

// PrimeVue components
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';

const store = useAuthStore();
const router = useRouter();
const route = useRoute();

const items = ref([
  { label: 'Заведения', icon: 'pi pi-building', to: '/establishments' },
  { label: 'События', icon: 'pi pi-calendar', to: '/events' },
  { label: 'Депозиты', icon: 'pi pi-wallet', to: '/deposits' },
  { label: 'Билеты', icon: 'pi pi-ticket', to: '/tickets' },
  { label: 'Промокоды', icon: 'pi pi-tag', to: '/promo-codes' },
]);

const handleLogout = async () => {
  await store.logout();
  router.push("/login");
};

const currentRouteName = computed(() => {
    const match = items.value.find(item => item.to === route.path || route.path.startsWith(item.to));
    return match ? match.label : 'Dashboard';
});
</script>

<template>
  <div class="min-h-screen bg-supabase-bg flex text-supabase-text font-sans">
    <!-- Sidebar -->
    <aside class="w-64 bg-supabase-sidebar border-r border-supabase-border flex-shrink-0 fixed h-full z-20 flex flex-col">
      <!-- Logo Area -->
      <div class="h-16 flex items-center px-6 border-b border-supabase-border">
        <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded bg-supabase-brand flex items-center justify-center shadow-[0_0_15px_rgba(62,207,142,0.4)]">
               <i class="pi pi-ticket text-black font-bold text-lg"></i>
            </div>
            <h1 class="text-base font-bold text-supabase-text tracking-wide">Deposits</h1>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <p class="px-3 text-xs font-semibold text-supabase-textSecondary uppercase tracking-wider mb-4">Меню</p>
        
        <RouterLink 
          v-for="item in items" 
          :key="item.label" 
          :to="item.to" 
          class="group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200"
          active-class="bg-supabase-surface text-supabase-brand"
          :class="[$route.path.startsWith(item.to) ? '' : 'text-supabase-textSecondary hover:text-supabase-text hover:bg-supabase-hover']"
        >
          <i :class="[item.icon, 'mr-3 text-lg transition-colors', $route.path.startsWith(item.to) ? 'text-supabase-brand' : 'text-supabase-textSecondary group-hover:text-supabase-text']"></i>
          {{ item.label }}
        </RouterLink>
      </nav>

      <!-- User / Bottom -->
      <div class="p-4 border-t border-supabase-border">
          <div class="flex items-center gap-3 mb-4 px-2">
            <Avatar icon="pi pi-user" class="bg-supabase-surface text-supabase-textSecondary" shape="circle" />
            <div class="flex flex-col overflow-hidden">
                <span class="text-sm font-medium text-supabase-text truncate">Admin User</span>
                <span class="text-xs text-supabase-textSecondary truncate">admin@example.com</span>
            </div>
          </div>
          <Button 
              label="Выйти" 
              icon="pi pi-sign-out" 
              size="small"
              @click="handleLogout" 
              :loading="store.loading"
              severity="secondary"
              outlined
              class="w-full !border-supabase-border !text-supabase-textSecondary hover:!text-supabase-text hover:!bg-supabase-hover hover:!border-supabase-textSecondary"
          />
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col ml-64 min-h-screen transition-all duration-300">
      <!-- Top Header (Breadcrumbs/Title) -->
      <header class="h-16 bg-supabase-bg border-b border-supabase-border sticky top-0 z-10 flex items-center justify-between px-8 backdrop-blur-sm bg-opacity-90">
         <h2 class="text-lg font-medium text-supabase-text">{{ currentRouteName }}</h2>
         <!-- Right side actions could go here -->
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-8">
        <div class="max-w-6xl mx-auto">
           <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Custom Scrollbar for sidebar */
nav::-webkit-scrollbar {
    width: 4px;
}
nav::-webkit-scrollbar-track {
    background: transparent;
}
nav::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 2px;
}
</style>
