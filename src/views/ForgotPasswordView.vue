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
import Divider from 'primevue/divider';

const store = useAuthStore();
const router = useRouter();

const email = ref("");
const resetToken = ref("");
const newPassword = ref("");

const handleRequest = () =>
  store.requestPasswordReset({
    email: email.value,
  });

const handleReset = async () => {
  await store.resetPassword({
    recovery_token: resetToken.value,
    new_password: newPassword.value,
  });
  if (!store.errorMessage) {
    // Optional: redirect or clear form
  }
};
</script>

<template>
  <Card class="w-full shadow-lg border-0">
    <template #title>
      <h2 class="text-2xl font-bold text-center text-slate-800 mb-2">Восстановление пароля</h2>
    </template>
    <template #content>
      <!-- Step 1: Request Token -->
      <form @submit.prevent="handleRequest" class="space-y-4 mt-2">
        <div class="flex flex-col gap-2">
          <label for="email" class="text-sm font-medium text-slate-700">Email</label>
          <InputText id="email" v-model="email" type="email" placeholder="user@example.com" class="w-full" required />
        </div>
        <Button 
          type="submit" 
          label="Отправить код" 
          :loading="store.loading" 
          severity="secondary"
          class="w-full" 
        />
      </form>

      <Divider align="center" type="dashed">
        <span class="text-xs text-slate-400">или введите код</span>
      </Divider>

      <!-- Step 2: Reset Password -->
      <form @submit.prevent="handleReset" class="space-y-4">
        <div class="flex flex-col gap-2">
          <label for="token" class="text-sm font-medium text-slate-700">Код из письма</label>
          <InputText id="token" v-model="resetToken" type="text" placeholder="Код" class="w-full" required />
        </div>
        
        <div class="flex flex-col gap-2">
          <label for="newPassword" class="text-sm font-medium text-slate-700">Новый пароль</label>
          <Password 
            id="newPassword" 
            v-model="newPassword" 
            toggleMask 
            class="w-full" 
            inputClass="w-full"
            placeholder="********" 
            required 
            :feedback="true"
          />
        </div>

        <Button 
          type="submit" 
          label="Сбросить пароль" 
          :loading="store.loading" 
          class="w-full" 
        />
      </form>

      <div v-if="store.errorMessage" class="mt-4">
        <Message severity="error" :closable="false" class="w-full whitespace-pre-wrap">{{ store.errorMessage }}</Message>
      </div>
      
      <div v-if="store.statusMessage && !store.errorMessage" class="mt-4">
        <Message severity="success" :closable="false" class="w-full">{{ store.statusMessage }}</Message>
      </div>

      <div class="flex items-center justify-center mt-6 text-sm">
        <router-link to="/login" class="text-primary-600 hover:text-primary-700 font-medium">Вернуться ко входу</router-link>
      </div>
    </template>
  </Card>
</template>

<style scoped>
:deep(.p-password-input) {
  width: 100%;
}
</style>
