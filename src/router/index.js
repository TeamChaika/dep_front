import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

import ForgotPasswordView from "../views/ForgotPasswordView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import EstablishmentsView from "../views/EstablishmentsView.vue";
import EventsView from "../views/EventsView.vue";
import DepositsView from "../views/DepositsView.vue";
import PaymentView from "../views/PaymentView.vue";
import TicketsView from "../views/TicketsView.vue";
import PromoCodesView from "../views/PromoCodesView.vue";
import TicketCheckInView from "../views/TicketCheckInView.vue";
import EventPublicView from "../views/EventPublicView.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: LoginView, meta: { guest: true, layout: 'auth' } },
  { path: "/register", component: RegisterView, meta: { guest: true, layout: 'auth' } },
  { path: "/forgot-password", component: ForgotPasswordView, meta: { guest: true, layout: 'auth' } },
  { path: "/establishments", component: EstablishmentsView, meta: { requiresAuth: true } },
  { path: "/events", component: EventsView, meta: { requiresAuth: true } },
  { path: "/deposits", component: DepositsView, meta: { requiresAuth: true } },
  { path: "/tickets", component: TicketsView, meta: { requiresAuth: true } },
  { path: "/promo-codes", component: PromoCodesView, meta: { requiresAuth: true } },
  { path: "/check-in/:qrCode", component: TicketCheckInView, name: "check-in", meta: { requiresAuth: true } },
  { path: "/event/:id", component: EventPublicView, name: "event-public", meta: { layout: 'empty' } },
  { path: "/payment/:link", component: PaymentView, name: "payment", meta: { layout: 'empty' } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.accessToken) {
    next("/login");
  } else if (to.meta.guest && authStore.accessToken) {
    next("/establishments");
  } else {
    next();
  }
});

export default router;
