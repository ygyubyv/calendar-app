import { createRouter, createWebHistory } from "vue-router";

import calendar from "@/containers/calendar/routes/index";
import customers from "@/containers/customers/routes/index";
import dashboard from "@/containers/dashboard/routes/index";
import help from "@/containers/help/routes/index";
import chat from "@/containers/chat/routes/index";
import home from "@/containers/home/routes/index";
import inbox from "@/containers/inbox/routes/index";
import invoices from "@/containers/invoices/routes/index";
import products from "@/containers/products/routes/index";
import settings from "@/containers/settings/routes/index";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...home,
    ...calendar,
    ...customers,
    ...dashboard,
    ...help,
    ...chat,
    ...inbox,
    ...invoices,
    ...products,
    ...settings,
  ],
});

export default router;
