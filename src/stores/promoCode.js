import { defineStore } from "pinia";
import { promoCodeService } from "../services/promoCode.service";
import { useAuthStore } from "./auth";

export const usePromoCodeStore = defineStore("promoCode", {
  state: () => ({
    promoCodes: [],
    currentPromoCode: null,
    validationResult: null,
    loading: false,
    errorMessage: "",
    statusMessage: "",
  }),
  actions: {
    async fetchPromoCodes(eventId = null) {
      const authStore = useAuthStore();
      if (!authStore.accessToken) {
        throw new Error("Not authenticated");
      }

      await this.executeTask(async () => {
        const response = await promoCodeService.getAll(authStore.accessToken, eventId);
        this.promoCodes = response;
        this.statusMessage = "Промокоды загружены";
      });
    },
    async fetchPromoCodeById(id) {
      const authStore = useAuthStore();
      if (!authStore.accessToken) {
        throw new Error("Not authenticated");
      }

      await this.executeTask(async () => {
        const response = await promoCodeService.getById(id, authStore.accessToken);
        this.currentPromoCode = response;
      });
    },
    async validate(code, eventId, ticketPrice) {
      this.loading = true;
      this.errorMessage = "";
      this.statusMessage = "";
      try {
        const response = await promoCodeService.validate({
          code,
          event_id: eventId,
          ticket_price: ticketPrice,
        });
        this.validationResult = response;
        this.loading = false;
        return response;
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : "Unknown error";
        this.loading = false;
        this.validationResult = null;
        throw error;
      }
    },
    async create(payload) {
      const authStore = useAuthStore();
      if (!authStore.accessToken) {
        throw new Error("Not authenticated");
      }

      await this.executeTask(async () => {
        const response = await promoCodeService.create(payload, authStore.accessToken);
        this.promoCodes.unshift(response);
        this.statusMessage = "Промокод успешно создан";
        return response;
      });
    },
    async update(id, payload) {
      const authStore = useAuthStore();
      if (!authStore.accessToken) {
        throw new Error("Not authenticated");
      }

      await this.executeTask(async () => {
        const response = await promoCodeService.update(id, payload, authStore.accessToken);
        const index = this.promoCodes.findIndex((p) => p.id === id);
        if (index !== -1) {
          this.promoCodes[index] = response;
        }
        if (this.currentPromoCode?.id === id) {
          this.currentPromoCode = response;
        }
        this.statusMessage = "Промокод обновлен";
        return response;
      });
    },
    async remove(id) {
      const authStore = useAuthStore();
      if (!authStore.accessToken) {
        throw new Error("Not authenticated");
      }

      await this.executeTask(async () => {
        await promoCodeService.delete(id, authStore.accessToken);
        this.promoCodes = this.promoCodes.filter((p) => p.id !== id);
        if (this.currentPromoCode?.id === id) {
          this.currentPromoCode = null;
        }
        this.statusMessage = "Промокод удален";
      });
    },
    async executeTask(task) {
      this.loading = true;
      this.errorMessage = "";
      this.statusMessage = "";
      try {
        await task();
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : "Unknown error";
      } finally {
        this.loading = false;
      }
    },
  },
});
