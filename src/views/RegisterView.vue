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
import InputMask from 'primevue/inputmask';

const store = useAuthStore();
const router = useRouter();

const email = ref("");
const password = ref("");
const phone = ref("");
const firstName = ref("");
const lastName = ref("");

const handleRegister = async () => {
  await store.register({
    email: email.value,
    password: password.value,
    phone: phone.value,
    first_name: firstName.value,
    last_name: lastName.value,
  });
  
  if (store.accessToken) {
    router.push("/establishments");
  }
};
</script>

<template>
  <Card class="w-full shadow-lg border-0">
    <template #title>
      <h2 class="text-2xl font-bold text-center text-slate-800 mb-2">Регистрация</h2>
      <p class="text-center text-slate-500 text-sm font-normal">Создайте новый аккаунт</p>
    </template>
    <template #content>
      <form @submit.prevent="handleRegister" class="space-y-4 mt-4">
        <div class="flex flex-col gap-2">
          <label for="email" class="text-sm font-medium text-slate-700">Email</label>
          <InputText id="email" v-model="email" type="email" placeholder="user@example.com" class="w-full" required />
        </div>

        <div class="flex flex-col gap-2">
          <label for="password" class="text-sm font-medium text-slate-700">Пароль</label>
          <Password 
            id="password" 
            v-model="password" 
            toggleMask 
            class="w-full" 
            inputClass="w-full"
            placeholder="********" 
            required 
            :feedback="true"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="phone" class="text-sm font-medium text-slate-700">Телефон</label>
          <InputMask 
            id="phone" 
            v-model="phone" 
            mask="+7 (999) 999-99-99" 
            placeholder="+7 (999) 123-45-67" 
            class="w-full" 
            required 
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="firstName" class="text-sm font-medium text-slate-700">Имя</label>
            <InputText id="firstName" v-model="firstName" type="text" placeholder="Иван" class="w-full" required />
          </div>
          <div class="flex flex-col gap-2">
            <label for="lastName" class="text-sm font-medium text-slate-700">Фамилия</label>
            <InputText id="lastName" v-model="lastName" type="text" placeholder="Иванов" class="w-full" required />
          </div>
        </div>

        <Button 
          type="submit" 
          label="Создать аккаунт" 
          :loading="store.loading" 
          class="w-full mt-2" 
        />

        <div v-if="store.errorMessage" class="mt-4">
          <Message severity="error" :closable="false" class="w-full whitespace-pre-wrap">{{ store.errorMessage }}</Message>
        </div>
        
        <div v-if="store.statusMessage && !store.errorMessage" class="mt-4">
          <Message severity="success" :closable="false" class="w-full">{{ store.statusMessage }}</Message>
        </div>

        <div class="flex items-center justify-center mt-6 text-sm">
          <span class="text-slate-600 mr-1">Уже есть аккаунт?</span>
          <router-link to="/login" class="text-primary-600 hover:text-primary-700 font-medium">Войти</router-link>
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
