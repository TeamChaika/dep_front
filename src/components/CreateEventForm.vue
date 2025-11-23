<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useEventStore } from "../stores/event";
import { useVuelidate } from "@vuelidate/core";
import { required, minValue, helpers } from "@vuelidate/validators";

// PrimeVue Components
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import DatePicker from 'primevue/datepicker';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';
import Message from 'primevue/message';
import Divider from 'primevue/divider';

const props = defineProps({
  event: {
    type: Object,
    default: null,
  },
  establishmentId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["created", "updated", "cancel"]);

const store = useEventStore();

const isEditMode = computed(() => !!props.event);

// State
const form = ref({
  name: "",
  description: "",
  eventDate: null,
  eventTime: null,
  startSaleDate: null,
  startSaleTime: null,
  endSaleDate: null,
  endSaleTime: null,
  ticketTypes: [{ name: "", price: 0, quantity: 0, available: 0 }],
});

const posterFile = ref(null);
const posterPreview = ref("");
const isUploadingPoster = ref(false);

// Validation Rules
const rules = {
  name: { required: helpers.withMessage("Название обязательно", required) },
  eventDate: { required: helpers.withMessage("Дата обязательна", required) },
  eventTime: { required: helpers.withMessage("Время обязательно", required) },
  startSaleDate: { required: helpers.withMessage("Дата начала продаж обязательна", required) },
  startSaleTime: { required: helpers.withMessage("Время начала продаж обязательно", required) },
  ticketTypes: {
    required,
    $each: helpers.forEach({
      name: { required: helpers.withMessage("Название обязательно", required) },
      price: { required, minValue: minValue(0) },
      quantity: { required, minValue: minValue(1) },
      available: { required, minValue: minValue(0) }
    })
  }
};

const v$ = useVuelidate(rules, form);

// Helper to parse time string "HH:MM" to Date
const parseTime = (timeStr) => {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// Helper to format Date to "HH:MM"
const formatTime = (date) => {
  if (!date) return "";
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};

// Load Data
const loadEventData = () => {
  if (!props.event) {
    // Default values
    form.value.eventDate = new Date();
    form.value.eventTime = new Date();
    form.value.eventTime.setHours(20, 0, 0, 0);
    
    form.value.startSaleDate = new Date();
    form.value.startSaleTime = new Date();
    form.value.startSaleTime.setHours(0, 0, 0, 0);
    
    form.value.ticketTypes = [{ name: "", price: 0, quantity: 0, available: 0 }];
    return;
  }

  const evt = props.event;
  form.value.name = evt.name || "";
  form.value.description = evt.description || "";
  form.value.eventDate = evt.event_date ? new Date(evt.event_date) : null;
  form.value.eventTime = evt.event_time ? parseTime(evt.event_time) : null;
  
  if (evt.start_sale_date) {
    const startDate = new Date(evt.start_sale_date);
    form.value.startSaleDate = startDate;
    form.value.startSaleTime = startDate;
  }
  
  if (evt.end_sale_date) {
    const endDate = new Date(evt.end_sale_date);
    form.value.endSaleDate = endDate;
    form.value.endSaleTime = endDate;
  }
  
  posterPreview.value = evt.poster_url || "";
  
  if (evt.ticket_types && evt.ticket_types.length > 0) {
    form.value.ticketTypes = evt.ticket_types.map((t) => ({
      name: t.name || "",
      price: t.price || 0,
      quantity: t.quantity || 0,
      available: t.available || 0,
    }));
  }
};

onMounted(() => {
  loadEventData();
});

watch(() => props.event, () => {
  loadEventData();
}, { deep: true });

const addTicketType = () => {
  form.value.ticketTypes.push({ name: "", price: 0, quantity: 0, available: 0 });
};

const removeTicketType = (index) => {
  if (form.value.ticketTypes.length > 1) {
    form.value.ticketTypes.splice(index, 1);
  }
};

const handlePosterSelect = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  if (!file.type.startsWith("image/")) {
    store.errorMessage = "Выберите изображение";
    return;
  }
  
  if (file.size > 10 * 1024 * 1024) {
    store.errorMessage = "Размер файла не должен превышать 10MB";
    return;
  }
  
  posterFile.value = file;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    posterPreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

const handleSubmit = async () => {
  const isFormValid = await v$.value.$validate();
  if (!isFormValid) {
    store.errorMessage = "Пожалуйста, заполните все обязательные поля корректно";
    return;
  }

  // Additional validation for ticket available <= quantity
  for (const ticket of form.value.ticketTypes) {
    if (ticket.available > ticket.quantity) {
      store.errorMessage = `Доступное количество билетов "${ticket.name}" не может превышать общее количество`;
      return;
    }
  }

  // Upload poster if needed
  let finalPosterUrl = props.event?.poster_url || null;
  
  // If user removed preview
  if (!posterPreview.value) {
    finalPosterUrl = null;
  }

  if (posterFile.value) {
    try {
      isUploadingPoster.value = true;
      const response = await store.uploadPoster(posterFile.value);
      finalPosterUrl = response.url;
    } catch (error) {
      store.errorMessage = "Ошибка загрузки афиши";
      isUploadingPoster.value = false;
      return;
    } finally {
      isUploadingPoster.value = false;
    }
  }

  // Format dates for API
  const eventDateStr = form.value.eventDate.toISOString().split("T")[0];
  const eventTimeStr = formatTime(form.value.eventTime);

  // Combine start sale date/time
  const startSaleDateTime = new Date(form.value.startSaleDate);
  const startTime = form.value.startSaleTime;
  startSaleDateTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

  // Combine end sale date/time if exists
  let endSaleDateTime = null;
  if (form.value.endSaleDate && form.value.endSaleTime) {
    endSaleDateTime = new Date(form.value.endSaleDate);
    const endTime = form.value.endSaleTime;
    endSaleDateTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);
  } else {
     // Default end sale = event start
     endSaleDateTime = new Date(eventDateStr + 'T' + eventTimeStr);
  }

  const payload = {
    establishment_id: props.establishmentId,
    name: form.value.name.trim(),
    description: form.value.description?.trim() || null,
    event_date: eventDateStr,
    event_time: eventTimeStr,
    poster_url: finalPosterUrl,
    ticket_types: form.value.ticketTypes.map((t) => ({
      name: t.name.trim(),
      price: parseFloat(t.price),
      quantity: parseInt(t.quantity),
      available: parseInt(t.available),
    })),
    start_sale_date: startSaleDateTime.toISOString(),
    end_sale_date: endSaleDateTime ? endSaleDateTime.toISOString() : null,
  };

  if (isEditMode.value) {
    await store.update(props.event.id, payload);
    if (!store.errorMessage) {
      emit("updated");
    }
  } else {
    await store.create(payload);
    if (!store.errorMessage) {
      emit("created");
      // Reset is handled by parent typically via closing modal, or we can reset here
      // For now, we rely on parent handling 'created' event
    }
  }
};
</script>

<template>
  <div class="bg-supabase-surface rounded-xl shadow-lg p-6 border border-supabase-border">
    <h3 class="text-xl font-bold text-supabase-text mb-6">
      {{ isEditMode ? "Редактировать событие" : "Добавить событие" }}
    </h3>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Main Info -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-supabase-textSecondary">Название события *</label>
        <InputText 
          v-model="form.name" 
          placeholder="Название" 
          :class="{'p-invalid': v$.name.$error}"
          class="w-full" 
        />
        <small v-if="v$.name.$error" class="text-red-500">
          {{ v$.name.$errors[0].$message }}
        </small>
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-supabase-textSecondary">Описание</label>
        <Textarea 
          v-model="form.description" 
          rows="3" 
          placeholder="Описание события" 
          class="w-full" 
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-supabase-textSecondary">Дата события *</label>
          <DatePicker 
            v-model="form.eventDate" 
            dateFormat="dd.mm.yy" 
            showIcon 
            class="w-full" 
            :class="{'p-invalid': v$.eventDate.$error}"
          />
          <small v-if="v$.eventDate.$error" class="text-red-500">
            {{ v$.eventDate.$errors[0].$message }}
          </small>
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-supabase-textSecondary">Время события *</label>
          <DatePicker 
            v-model="form.eventTime" 
            timeOnly 
            showIcon 
            class="w-full" 
            :class="{'p-invalid': v$.eventTime.$error}"
          />
           <small v-if="v$.eventTime.$error" class="text-red-500">
            {{ v$.eventTime.$errors[0].$message }}
          </small>
        </div>
      </div>

      <!-- Poster -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-supabase-textSecondary">Афиша (фото)</label>
        <div class="flex items-start gap-4">
          <div v-if="posterPreview" class="relative w-32 h-48 rounded-lg overflow-hidden bg-supabase-bg border border-supabase-border shrink-0">
            <img :src="posterPreview" alt="Preview" class="w-full h-full object-cover" />
            <button 
              type="button" 
              @click="posterFile = null; posterPreview = '';"
              class="absolute top-1 right-1 p-1 bg-red-600/90 text-white rounded hover:bg-red-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          <div class="flex flex-col gap-2">
             <label class="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-supabase-bg border border-supabase-border rounded-lg text-supabase-text hover:border-supabase-brand transition-colors text-sm font-medium">
                <span>Выбрать файл</span>
                <input type="file" class="hidden" accept="image/*" @change="handlePosterSelect" />
             </label>
             <small class="text-supabase-textSecondary text-xs">JPG, PNG, WebP, GIF, макс. 10MB</small>
          </div>
        </div>
      </div>

      <Divider />

      <!-- Sales Info -->
      <h4 class="text-lg font-semibold text-supabase-text">Продажа билетов</h4>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-supabase-textSecondary">Начало продаж *</label>
          <div class="flex gap-2">
             <DatePicker v-model="form.startSaleDate" dateFormat="dd.mm.yy" placeholder="Дата" class="w-full" :class="{'p-invalid': v$.startSaleDate.$error}" />
             <DatePicker v-model="form.startSaleTime" timeOnly placeholder="Время" class="w-32 shrink-0" :class="{'p-invalid': v$.startSaleTime.$error}" />
          </div>
           <small v-if="v$.startSaleDate.$error || v$.startSaleTime.$error" class="text-red-500">
            Дата и время начала продаж обязательны
          </small>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-supabase-textSecondary">Конец продаж</label>
          <div class="flex gap-2">
             <DatePicker v-model="form.endSaleDate" dateFormat="dd.mm.yy" placeholder="Дата" class="w-full" />
             <DatePicker v-model="form.endSaleTime" timeOnly placeholder="Время" class="w-32 shrink-0" />
          </div>
          <small class="text-supabase-textSecondary">По умолчанию: начало мероприятия</small>
        </div>
      </div>

      <!-- Ticket Types -->
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <h4 class="text-lg font-semibold text-supabase-text">Типы билетов *</h4>
          <Button 
            type="button" 
            label="Добавить тип" 
            icon="pi pi-plus" 
            size="small" 
            outlined 
            @click="addTicketType" 
          />
        </div>

        <div class="border border-supabase-border rounded-lg overflow-hidden">
           <div class="grid grid-cols-12 gap-2 bg-supabase-bg p-3 text-xs font-semibold text-supabase-textSecondary uppercase tracking-wider border-b border-supabase-border">
              <div class="col-span-4 md:col-span-5">Название</div>
              <div class="col-span-3 md:col-span-2 text-center">Цена (₽)</div>
              <div class="col-span-2 md:col-span-2 text-center">Всего</div>
              <div class="col-span-2 md:col-span-2 text-center">Доступно</div>
              <div class="col-span-1 text-center"></div>
           </div>
           
           <div v-for="(ticket, index) in form.ticketTypes" :key="index" class="grid grid-cols-12 gap-2 p-3 border-b border-supabase-border last:border-0 items-start">
              <div class="col-span-4 md:col-span-5">
                <InputText v-model="ticket.name" placeholder="Название" class="w-full p-inputtext-sm" :class="{'p-invalid': v$.ticketTypes.$each.$response.$errors[index].name.length}" />
              </div>
              <div class="col-span-3 md:col-span-2">
                <InputNumber v-model="ticket.price" mode="currency" currency="RUB" locale="ru-RU" placeholder="0" class="w-full p-inputtext-sm" :min="0" :class="{'p-invalid': v$.ticketTypes.$each.$response.$errors[index].price.length}" />
              </div>
              <div class="col-span-2 md:col-span-2">
                <InputNumber v-model="ticket.quantity" placeholder="0" class="w-full p-inputtext-sm" :min="1" :class="{'p-invalid': v$.ticketTypes.$each.$response.$errors[index].quantity.length}" />
              </div>
              <div class="col-span-2 md:col-span-2">
                <InputNumber v-model="ticket.available" placeholder="0" class="w-full p-inputtext-sm" :min="0" :max="ticket.quantity" :class="{'p-invalid': v$.ticketTypes.$each.$response.$errors[index].available.length}" />
              </div>
              <div class="col-span-1 flex justify-center pt-1">
                <button 
                  type="button" 
                  @click="removeTicketType(index)" 
                  :disabled="form.ticketTypes.length === 1"
                  class="text-red-500 hover:text-red-400 disabled:text-supabase-border transition-colors"
                >
                  <i class="pi pi-trash"></i>
                </button>
              </div>
           </div>
        </div>
        <small v-if="v$.ticketTypes.$error" class="text-red-500 block">
           Проверьте правильность заполнения типов билетов
        </small>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 pt-4 border-t border-supabase-border">
        <Button 
          type="button" 
          label="Отмена" 
          severity="secondary" 
          text 
          @click="emit('cancel')" 
        />
        <Button 
          type="submit" 
          :label="store.loading || isUploadingPoster ? 'Сохранение...' : (isEditMode ? 'Сохранить' : 'Создать')" 
          :loading="store.loading || isUploadingPoster" 
        />
      </div>
      
      <div v-if="store.errorMessage" class="mt-4">
         <Message severity="error" :closable="false">{{ store.errorMessage }}</Message>
      </div>
    </form>
  </div>
</template>
