<template>
  <div class="flex items-center justify-between mb-6">
    <div class="flex flex-col justify-between gap-4">
      <h2 class="text-[20px]">Calendar View</h2>

      <BaseTabs
        :active-tab="currentActionActiveTab!"
        :tabs="actionsTabs"
        @on-change="emit('onActionTabChange', $event)"
      />
    </div>

    <div class="text-[20px] font-medium text-gray-700 self-end">
      {{ calendarTitle }}
    </div>

    <BaseTabs
      :active-tab="currentDateActiveTab!"
      :tabs="dateTabs"
      @on-change="emit('onDateTabChange', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import BaseTabs from "@/components/Base/BaseTabs.vue";
import type { Tab } from "../types";

interface Props {
  calendarTitle: string;
  actionsTabs: Tab[];
  dateTabs: Tab[];
}

defineProps<Props>();
const emit = defineEmits<{
  (e: "onActionTabChange", tab: Tab): void;
  (e: "onDateTabChange", tab: Tab): void;
}>();

const currentActionActiveTab = defineModel<Tab>("action");
const currentDateActiveTab = defineModel<Tab>("date");
</script>
