<template>
  <div class="inline-flex rounded-md shadow-sm border border-gray-200 bg-white">
    <button
      v-for="(tab, index) in tabs"
      :key="tab.value"
      @click="emit('onChange', tab)"
      :class="[
        'px-6 py-2 text-sm font-medium transition-colors cursor-pointer',
        isActive(tab) ? 'text-blue-500' : 'text-gray-600 hover:text-gray-800',
        index !== tabs.length - 1 ? 'border-r border-gray-200' : '',
      ]"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
interface Tab {
  label: string;
  value: string;
}

interface Props {
  activeTab: Tab;
  tabs: Tab[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "onChange", tab: Tab): void;
}>();

const isActive = (tab: Tab) => {
  return tab.value === props.activeTab.value;
};
</script>
