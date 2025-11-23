<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

// PrimeVue components
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Password from 'primevue/password';
import Card from 'primevue/card';
import Message from 'primevue/message';

const store = useAuthStore();
const router = useRouter();

const email = ref("");
const password = ref("");

const handleLogin = async () => {
  await store.login({
    email: email.value,
    password: password.value,
  });
  if (store.accessToken) {
    router.push("/establishments");
  }
};
</script>

<template>
  <Card class="w-full shadow-xl border border-supabase-border !bg-supabase-surface">
    <template #title>
      <h2 class="text-2xl font-bold text-center text-supabase-text mb-2">Вход</h2>
      <p class="text-center text-supabase-textSecondary text-sm font-normal">Добро пожаловать обратно</p>
    </template>
    <template #content>
      <form @submit.prevent="handleLogin" class="space-y-5 mt-4">
        <div class="flex flex-col gap-2">
          <label for="email" class="text-sm font-medium text-supabase-textSecondary">Email</label>
          <InputText id="email" v-model="email" type="email" placeholder="user@example.com" class="w-full" required />
        </div>

        <div class="flex flex-col gap-2">
          <label for="password" class="text-sm font-medium text-supabase-textSecondary">Пароль</label>
          <Password 
            id="password" 
            v-model="password" 
            :feedback="false" 
            toggleMask 
            class="w-full" 
            inputClass="w-full"
            placeholder="********" 
            required 
          />
        </div>

        <Button 
          type="submit" 
          label="Войти" 
          :loading="store.loading" 
          class="w-full" 
        />

        <div v-if="store.errorMessage" class="mt-4">
          <Message severity="error" :closable="false" class="w-full">{{ store.errorMessage }}</Message>
        </div>

        <div class="flex items-center justify-between mt-6 text-sm">
          <router-link to="/register" class="text-supabase-brand hover:text-supabase-brandHover font-medium">Регистрация</router-link>
          <router-link to="/forgot-password" class="text-supabase-textSecondary hover:text-white">Забыли пароль?</router-link>
        </div>
      </form>
    </template>
  </Card>
</template>

<style scoped>
:deep(.p-password-input) {
  width: 100%;
}
</style>
