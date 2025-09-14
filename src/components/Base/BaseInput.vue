<template>
  <div>
    <label class="block text-xs font-medium text-gray-400">{{ label }}</label>
    <input
      v-model="inputValue"
      :type="type"
      class="w-full text-sm text-gray-700 outline-none bg-transparent border-0 border-b-[1px] border-b-[#EDEFF6] py-1"
    />
  </div>
</template>

<script setup lang="ts">
type InputType = "text" | "date" | "time";

interface Props {
  label: string;
  type: InputType;
}

defineProps<Props>();

const inputValue = defineModel();
</script>
