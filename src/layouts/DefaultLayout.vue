<template>
  <div class="flex h-screen bg-gray-50">
    <aside
      ref="aside-menu"
      :class="[
        'fixed inset-y-0 left-0 w-64 bg-gray-600 text-gray-100 flex flex-col transform transition-transform duration-300 ease-in-out z-50',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0 md:static md:flex-shrink-0',
      ]"
    >
      <div
        class="h-16 flex items-center px-6 font-bold text-lg tracking-wide border-b border-gray-700"
      >
        IMPEKABLE
      </div>

      <nav class="flex-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.to"
          class="flex items-center gap-3 px-6 py-3.5 hover:bg-gray-700"
          active-class="bg-gray-700 border-l-4 border-gray-800"
          @click="isOpen = false"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span>{{ item.name }}</span>
        </RouterLink>
      </nav>
    </aside>

    <div class="flex-1 flex flex-col">
      <header
        class="h-16 bg-white shadow flex items-center justify-between px-6"
      >
        <div class="flex items-center gap-3">
          <button
            @click="isOpen = !isOpen"
            class="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <Bars3Icon v-if="!isOpen" class="w-6 h-6" />
            <XMarkIcon v-else class="w-6 h-6" />
          </button>

          <MagnifyingGlassIcon class="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions, invoices or help"
            class="outline-none border-0 focus:ring-0 text-sm w-72"
          />
        </div>

        <div class="flex items-center gap-6">
          <EnvelopeIcon class="w-6 h-6 text-gray-500 cursor-pointer" />
          <FlagIcon class="w-6 h-6 text-gray-500 cursor-pointer" />
          <BellIcon class="w-6 h-6 text-gray-500 cursor-pointer" />
          <div class="flex items-center gap-2 cursor-pointer">
            <span class="text-sm font-medium">John Doe</span>
            <ChevronDownIcon class="w-4 h-4 text-gray-500" />
            <UserCircleIcon class="w-12 h-12 text-gray-500 cursor-pointer" />
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import {
  HomeIcon,
  Squares2X2Icon,
  InboxIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  QuestionMarkCircleIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  EnvelopeIcon,
  FlagIcon,
} from "@heroicons/vue/24/outline";
import { onClickOutside } from "@vueuse/core";

const navItems = [
  { name: "Home", to: "/", icon: HomeIcon },
  { name: "Dashboard", to: "/dashboard", icon: Squares2X2Icon },
  { name: "Inbox", to: "/inbox", icon: InboxIcon },
  { name: "Products", to: "/products", icon: ShoppingBagIcon },
  { name: "Invoices", to: "/invoices", icon: DocumentTextIcon },
  { name: "Customers", to: "/customers", icon: UserIcon },
  { name: "Chat Room", to: "/chat", icon: ChatBubbleLeftRightIcon },
  { name: "Calendar", to: "/calendar", icon: CalendarIcon },
  { name: "Help Center", to: "/help", icon: QuestionMarkCircleIcon },
  { name: "Settings", to: "/settings", icon: Cog6ToothIcon },
];

const isOpen = ref(false);

const aside = useTemplateRef("aside-menu");

onClickOutside(aside, () => {
  isOpen.value = false;
});
</script>
