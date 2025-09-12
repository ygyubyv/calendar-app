<template>
  <div class="py-6 px-16 font-source">
    <h2 class="text-3xl mb-10">Calendar</h2>

    <div class="bg-white rounded-lg shadow-sm p-6">
      <Header
        v-model:action="currentActionActiveTab"
        v-model:date="currentDateActiveTab"
        :actions-tabs="actionsTabs"
        :date-tabs="dateTabs"
        :calendar-title="calendarTitle"
        @on-date-tab-change="handleDateTabChange"
        @on-action-tab-change="handleActionTabChange"
      />

      <FullCalendar
        ref="calendarRef"
        :options="calendarOptions"
        initial-view="dayGridMonth"
        class="custom-calendar"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import Header from "../components/Header.vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { actionsTabs, dateTabs } from "../data";
import type { CalendarOptions } from "@fullcalendar/core";
import type { Tab } from "../types";

const calendarOptions = ref<CalendarOptions>({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: "dayGridMonth",
  selectable: true,
  editable: false,
  events: [],
  headerToolbar: false,
});

const calendarRef = ref<InstanceType<typeof FullCalendar> | null>(null);
const currentActionActiveTab = ref<Tab>(actionsTabs[0]);
const currentDateActiveTab = ref<Tab>(dateTabs[0]);
const calendarTitle = ref<string>("");

const getCalendarApi = () => {
  return calendarRef.value?.getApi();
};

const syncCalendarTitle = () => {
  const api = getCalendarApi();
  if (!api) {
    return;
  }

  const start = api.view.currentStart;
  const month = start.toLocaleString("en-US", { month: "long" });
  const year = start.getFullYear();

  calendarTitle.value = `${month}, ${year}`;
};

const handleActionTabChange = (tab: Tab) => {
  currentActionActiveTab.value = tab;

  const api = getCalendarApi();

  if (!api) {
    return;
  }

  switch (tab.value) {
    case "today":
      api.today();
      break;
    case "back":
      api.prev();
      break;
    case "next":
      api.next();
      break;
  }

  syncCalendarTitle();
};

const handleDateTabChange = (tab: Tab) => {
  currentDateActiveTab.value = tab;

  const api = getCalendarApi();

  if (!api) {
    return;
  }

  switch (tab.value) {
    case "month":
      api.changeView("dayGridMonth");
      break;
    case "week":
      api.changeView("timeGridWeek");
      break;
    case "day":
      api.changeView("timeGridDay");
      break;
    case "agenda":
      api.changeView("listWeek");
      break;
  }

  syncCalendarTitle();
};

onMounted(() => {
  syncCalendarTitle();
});
</script>

<style>
.custom-calendar .fc-col-header-cell-cushion {
  background-color: #eaf0f4;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border: 1px #eaf0f4;
  color: #9ca3af;
  font-family: var(--font-source);
}

.fc-daygrid-day {
  background-color: #ffffff;
  border: 3px solid #eaf0f4;
  padding: 20px 10px 0 0;
  font-family: var(--font-source);
  color: #4b5563;
}

.custom-calendar .fc-day-today .fc-daygrid-day-frame {
  background-color: #e0f2fe;
}
</style>
