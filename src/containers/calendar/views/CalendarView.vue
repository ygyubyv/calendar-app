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
        class="custom-calendar"
      />
    </div>

    <EventModal
      v-if="showModal"
      v-model="form"
      :modal-position="modalPosition"
      :editing-event="editingEvent"
      @close-modal="closeModal"
      @delete-event="deleteEvent"
      @save-event="saveEvent"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from "vue";
import Header from "../components/Header.vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { actionsTabs, dateTabs } from "../data";
import type { CalendarOptions, EventInput } from "@fullcalendar/core";
import type { Tab } from "../types";
import EventModal from "../components/EventModal.vue";

const events = ref<EventInput[]>([]);

const calendarRef = ref<InstanceType<typeof FullCalendar> | null>(null);
const currentActionActiveTab = ref<Tab>(actionsTabs[0]);
const currentDateActiveTab = ref<Tab>(dateTabs[0]);
const calendarTitle = ref<string>("");

const showModal = ref(false);
const editingEvent = ref<any>(null);

const modalPosition = reactive({ top: 0, left: 0 });

const form = reactive({
  title: "",
  date: "",
  time: "",
  notes: "",
  color: "#6B4EFF",
});

const calendarOptions = reactive<CalendarOptions>({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: "dayGridMonth",
  selectable: true,
  editable: true,
  events: events.value,
  headerToolbar: false,
  dateClick: (info) => openModal(info),
  eventDrop: (info) => updateEvent(info.event),
  eventResize: (info) => updateEvent(info.event),
});

const getCalendarApi = () => calendarRef.value?.getApi();

const closeModal = () => {
  showModal.value = false;
};

const saveEvent = () => {
  const api = getCalendarApi();

  if (!api) {
    return;
  }

  const startDateTime =
    form.date && form.time ? `${form.date}T${form.time}` : form.date;

  if (editingEvent.value) {
    editingEvent.value.setProp("title", form.title);
    editingEvent.value.setStart(startDateTime);
    editingEvent.value.setExtendedProp("notes", form.notes);
    editingEvent.value.setProp("backgroundColor", form.color);
  } else {
    api.addEvent({
      title: form.title,
      start: startDateTime,
      backgroundColor: form.color,
      extendedProps: { notes: form.notes },
    });
  }

  closeModal();
};

const deleteEvent = () => {
  if (editingEvent.value) {
    editingEvent.value.remove();
  }

  closeModal();
};

const updateEvent = (event: any) => {
  console.log("Updated event:", event);
};

const openModal = (info: any) => {
  const api = getCalendarApi();

  if (!api || api.view.type !== "dayGridMonth") {
    return;
  }

  const dayCell = info.dayEl as HTMLElement;
  const rect = dayCell.getBoundingClientRect();
  const scrollTop = window.scrollY;
  const scrollLeft = window.scrollX;

  const MODAL_WIDTH = 200;
  const ARROW_OFFSET = 8;

  modalPosition.left =
    rect.left + scrollLeft + rect.width / 2 - MODAL_WIDTH / 2;
  modalPosition.top = rect.top + scrollTop + rect.height + ARROW_OFFSET;

  form.date = info.dateStr.slice(0, 10);
  showModal.value = true;
};

const handleDateTabChange = (tab: Tab) => {
  currentDateActiveTab.value = tab;
  const api = getCalendarApi();
  if (!api) return;

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

const handleActionTabChange = (tab: Tab) => {
  currentActionActiveTab.value = tab;
  const api = getCalendarApi();
  if (!api) return;

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

const syncCalendarTitle = () => {
  const api = getCalendarApi();
  if (!api) return;
  const start = api.view.currentStart;
  const month = start.toLocaleString("en-US", { month: "long" });
  const year = start.getFullYear();
  calendarTitle.value = `${month}, ${year}`;
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
  color: #9ca3af;
  font-family: var(--font-source);
}

.custom-calendar .fc-daygrid-day-top a {
  margin: 20px 10px 0 0;
}

.custom-calendar .fc-col-header-cell {
  border: 0;
}

.custom-calendar .fc-day-today .fc-daygrid-day-frame {
  background-color: #e0f2fe;
}

.modal-arrow {
  width: 8px;
  height: 8px;
  background: white;
  transform: rotate(45deg);
  border-left: 1px solid #d1d5db;
  border-top: 1px solid #d1d5db;
}
</style>
