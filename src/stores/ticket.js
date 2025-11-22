import { defineStore } from "pinia";
import { ticketService } from "../services/ticket.service";
import { useAuthStore } from "./auth";

export const useTicketStore = defineStore("ticket", {
  state: () => ({
    tickets: [],
    currentTicket: null,
    loading: false,
    errorMessage: "",
    statusMessage: "",
  }),
  actions: {
    async fetchTickets(eventId = null) {
      const authStore = useAuthStore();
      if (!authStore.accessToken) {
        throw new Error("Not authenticated");
      }

      await this.executeTask(async () => {
        const response = await ticketService.getAll(authStore.accessToken, eventId);
        this.tickets = response;
        this.statusMessage = "Билеты загружены";
      });
    },
    async fetchTicketById(id) {
      const authStore = useAuthStore();
      if (!authStore.accessToken) {
        throw new Error("Not authenticated");
      }

      await this.executeTask(async () => {
        const response = await ticketService.getById(id, authStore.accessToken);
        this.currentTicket = response;
      });
    },
    async fetchTicketByQR(qrCode) {
      await this.executeTask(async () => {
        const response = await ticketService.getByQR(qrCode);
        this.currentTicket = response;
      });
    },
    async checkIn(qrCode, guestsCount) {
      await this.executeTask(async () => {
        const response = await ticketService.checkIn(qrCode, { guests_count: guestsCount });
        const index = this.tickets.findIndex((t) => t.qr_code === qrCode);
        if (index !== -1) {
          this.tickets[index] = response;
        }
        if (this.currentTicket?.qr_code === qrCode) {
          this.currentTicket = response;
        }
        this.statusMessage = "Билет проверен";
        return response;
      });
    },
    async create(payload) {
      const authStore = useAuthStore();
      if (!authStore.accessToken) {
        throw new Error("Not authenticated");
      }

      await this.executeTask(async () => {
        const response = await ticketService.create(payload, authStore.accessToken);
        this.tickets.unshift(response);
        this.statusMessage = "Билет успешно создан";
        return response;
      });
    },
    async update(id, payload) {
      const authStore = useAuthStore();
      if (!authStore.accessToken) {
        throw new Error("Not authenticated");
      }

      await this.executeTask(async () => {
        const response = await ticketService.update(id, payload, authStore.accessToken);
        const index = this.tickets.findIndex((t) => t.id === id);
        if (index !== -1) {
          this.tickets[index] = response;
        }
        if (this.currentTicket?.id === id) {
          this.currentTicket = response;
        }
        this.statusMessage = "Билет обновлен";
        return response;
      });
    },
    async remove(id) {
      const authStore = useAuthStore();
      if (!authStore.accessToken) {
        throw new Error("Not authenticated");
      }

      await this.executeTask(async () => {
        await ticketService.delete(id, authStore.accessToken);
        this.tickets = this.tickets.filter((t) => t.id !== id);
        if (this.currentTicket?.id === id) {
          this.currentTicket = null;
        }
        this.statusMessage = "Билет удален";
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
