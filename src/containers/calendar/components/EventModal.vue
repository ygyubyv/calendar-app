<template>
  <div>
    <div
      ref="event-modal"
      class="absolute w-[200px] z-50"
      :style="{
        top: modalPosition.top + 'px',
        left: modalPosition.left + 'px',
      }"
    >
      <div class="absolute -top-3 left-1/2 transform -translate-x-1/2">
        <div
          class="w-3 h-3 bg-white rotate-45 border-t border-l border-gray-300"
        ></div>
      </div>

      <div
        class="relative bg-white rounded-[14px] border modal-border shadow-[0_10px_30px_rgba(33,37,41,0.08)] p-6"
      >
        <button
          @click="emit('closeModal')"
          aria-label="Close"
          class="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center border modal-border text-gray-400 hover:text-gray-600 bg-white"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>

        <div class="mb-4">
          <label class="block text-xs font-medium text-gray-400"
            >Event name</label
          >
          <input
            v-model="form.title"
            type="text"
            maxlength="30"
            class="w-full text-sm text-gray-700 outline-none bg-transparent border-0 border-b-[1px] border-b-[#EDEFF6] py-1"
          />
        </div>

        <div class="mb-4">
          <label class="block text-xs font-medium text-gray-400">Date</label>
          <input
            v-model="form.date"
            type="date"
            class="w-full text-sm text-gray-700 outline-none bg-transparent border-0 border-b-[1px] border-b-[#EDEFF6] py-1"
          />
        </div>

        <div class="mb-4">
          <label class="block text-xs font-medium text-gray-400">Time</label>
          <input
            v-model="form.time"
            type="time"
            class="w-full text-sm text-gray-700 outline-none bg-transparent border-0 border-b-[1px] border-b-[#EDEFF6] py-1"
          />
        </div>

        <div class="mb-2">
          <label class="block text-xs font-medium text-gray-400">Notes</label>
          <input
            v-model="form.notes"
            type="text"
            class="w-full text-sm text-gray-700 outline-none bg-transparent border-0 border-b-[1px] border-b-[#EDEFF6] py-1"
          />
        </div>

        <div class="mb-4">
          <label class="block text-xs font-medium text-gray-400 mb-2"
            >Color</label
          >
          <div class="flex gap-2">
            <div
              v-for="colorOption in colorOptions"
              :key="colorOption"
              @click="form.color = colorOption"
              :style="{ backgroundColor: colorOption }"
              :class="[
                'w-6 h-6 rounded-full cursor-pointer border-2',
                form.color === colorOption
                  ? 'border-black'
                  : 'border-transparent',
              ]"
            ></div>
          </div>
        </div>

        <div class="pt-4 flex items-center justify-between">
          <button
            @click="emit('closeModal')"
            class="text-red-500 text-sm font-medium hover:underline"
          >
            Cancel
          </button>
          <div class="flex items-center gap-4">
            <button
              v-if="editingEvent"
              @click="emit('deleteEvent')"
              class="text-red-500 text-sm font-medium hover:underline"
            >
              Delete
            </button>
            <button @click="emit('saveEvent')" class="text-[14px] font-medium">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { XMarkIcon } from "@heroicons/vue/24/outline";
import type { Form } from "../types";
import { useTemplateRef } from "vue";
import { onClickOutside } from "@vueuse/core";

interface Props {
  editingEvent: any;
  modalPosition: {
    top: number;
    left: number;
  };
  colorOptions: string[];
}
defineProps<Props>();

const modal = useTemplateRef("event-modal");

const form = defineModel<Form>({ required: true });

const emit = defineEmits<{
  (e: "saveEvent"): void;
  (e: "deleteEvent"): void;
  (e: "closeModal"): void;
}>();

onClickOutside(modal, () => {
  emit("closeModal");
});
</script>
