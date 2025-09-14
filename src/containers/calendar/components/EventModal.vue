<template>
  <div>
    <div
      ref="event-modal"
      class="absolute w-[260px] z-50"
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
          <ul
            v-if="Object.keys(errors).length"
            class="text-red-400 text-sm space-y-1"
          >
            <li v-for="(msg, field) in errors" :key="field">
              {{ msg }}
            </li>
          </ul>
        </div>

        <BaseInput
          type="text"
          label="Event name"
          class="mb-4"
          v-model="form.title"
        />

        <BaseInput type="date" label="Date" class="mb-4" v-model="form.date" />

        <BaseInput type="time" label="Time" class="mb-4" v-model="form.time" />

        <BaseInput
          type="text"
          label="Notes"
          class="mb-2"
          v-model="form.notes"
        />

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
          <template v-if="editingEvent">
            <button
              @click="emit('deleteEvent')"
              class="text-red-500 text-sm font-medium hover:underline"
            >
              Discard
            </button>

            <div class="flex items-center gap-4">
              <button
                @click="emit('saveEvent')"
                class="text-[14px] font-medium"
              >
                Edit
              </button>
            </div>
          </template>

          <template v-else>
            <button
              @click="emit('closeModal')"
              class="text-red-500 text-sm font-medium hover:underline"
            >
              Cancel
            </button>
            <div class="flex items-center gap-4">
              <button
                @click="emit('saveEvent')"
                class="text-[14px] font-medium"
              >
                Save
              </button>
            </div>
          </template>
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
import BaseInput from "@/components/Base/BaseInput.vue";

interface Props {
  editingEvent: any;
  modalPosition: {
    top: number;
    left: number;
  };
  colorOptions: string[];
  errors: string[];
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
