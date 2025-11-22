import { defineStore } from "pinia";
import { authService } from "../services/auth.service";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    accessToken: "",
    statusMessage: "",
    errorMessage: "",
    loading: false,
  }),
  actions: {
    async register(payload) {
      await this.executeTask(async () => {
        const response = await authService.register(payload);
        this.accessToken = response.access_token ?? "";
        this.statusMessage = response.message;
      });
    },
    async login(payload) {
      await this.executeTask(async () => {
        const response = await authService.login(payload);
        this.accessToken = response.access_token ?? "";
        this.statusMessage = response.message;
      });
    },
    async requestPasswordReset(payload) {
      await this.executeTask(async () => {
        const response = await authService.requestPasswordReset(payload);
        this.statusMessage = response.message;
      });
    },
    async resetPassword(payload) {
      await this.executeTask(async () => {
        const response = await authService.resetPassword(payload);
        this.statusMessage = response.message;
      });
    },
    async changePassword(payload) {
      await this.executeTask(async () => {
        const response = await authService.changePassword(payload);
        this.statusMessage = response.message;
      });
    },
    async changeEmail(payload) {
      await this.executeTask(async () => {
        const response = await authService.changeEmail(payload);
        this.statusMessage = response.message;
      });
    },
    async logout() {
      await this.executeTask(async () => {
        const response = await authService.logout(this.accessToken);
        this.accessToken = "";
        this.statusMessage = response.message;
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
  persist: {
    paths: ["accessToken"],
  },
});
