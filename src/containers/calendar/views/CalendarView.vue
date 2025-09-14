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

    <teleport to="body">
      <EventModal
        v-if="showModal"
        v-model="form"
        :modal-position="modalPosition"
        :editing-event="editingEvent"
        :color-options="colorOptions"
        :errors="formErrors"
        @close-modal="closeModal"
        @delete-event="deleteEvent"
        @save-event="saveEvent"
      />
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, reactive } from "vue";
import Header from "../components/Header.vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { actionsTabs, colorOptions, dateTabs } from "../data";
import type { CalendarOptions, EventInput } from "@fullcalendar/core";
import type { Tab } from "../types";
import EventModal from "../components/EventModal.vue";
import { useEventForm } from "../validation/hooks/useEventForm";

const { form, handleSubmit } = useEventForm();

const events = ref<EventInput[]>([]);

const calendarRef = ref<InstanceType<typeof FullCalendar> | null>(null);
const currentActionActiveTab = ref<Tab>(actionsTabs[0]);
const currentDateActiveTab = ref<Tab>(dateTabs[0]);
const calendarTitle = ref<string>("");

const showModal = ref(false);
const editingEvent = ref<any>(null);
const formErrors = ref<any>([]);

const modalPosition = reactive({ top: 0, left: 0 });

let activeTargetEl: HTMLElement | null = null;
let scrollParents: (Window | HTMLElement)[] = [];
let boundUpdatePosition: (() => void) | null = null;

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
  eventClick: (info) => openModal(info, info.event),
  eventContent: (arg) => {
    return {
      html: `<div class="${
        arg.view.type === "dayGridMonth" ? "custom-event" : ""
      }" style="background-color: ${
        arg.event.backgroundColor || "transparent"
      };">
               ${arg.event.title}
             </div>`,
    };
  },
  slotDuration: "1:00",
  slotLabelClassNames: ["my-time-label"],
  slotLabelFormat: { hour: "numeric", minute: "2-digit", hour12: true },
  slotEventOverlap: false,
  dayHeaderDidMount: (arg) => {
    arg.el.classList.add("my-day-header");
  },
});

const getCalendarApi = () => calendarRef.value?.getApi();

const getScrollParents = (el: HTMLElement | null): (Window | HTMLElement)[] => {
  if (!el) {
    return [window];
  }

  const parents: (Window | HTMLElement)[] = [];
  let cur: HTMLElement | null = el;
  while (cur) {
    const style = getComputedStyle(cur);
    const overflowY = style.overflowY;
    const isScrollable =
      (overflowY === "auto" || overflowY === "scroll") &&
      cur.scrollHeight > cur.clientHeight;
    if (isScrollable) parents.push(cur);
    cur = cur.parentElement;
  }
  parents.push(window);
  return parents;
};

const computeAndSetPosition = (targetEl: HTMLElement) => {
  if (!targetEl) {
    return;
  }

  const rect = targetEl.getBoundingClientRect();
  const scrollTop = window.scrollY || window.pageYOffset;
  const scrollLeft = window.scrollX || window.pageXOffset;
  const MODAL_WIDTH = 260;
  const ARROW_OFFSET = 8;

  modalPosition.left =
    rect.left + scrollLeft + rect.width / 2 - MODAL_WIDTH / 2;
  modalPosition.top = rect.top + scrollTop + rect.height + ARROW_OFFSET;

  const maxLeft = document.documentElement.scrollWidth - MODAL_WIDTH - 8;
  if (modalPosition.left < 8) modalPosition.left = 8;
  if (modalPosition.left > maxLeft) modalPosition.left = maxLeft;
};

const attachPositionUpdater = (targetEl: HTMLElement) => {
  removePositionUpdater();
  activeTargetEl = targetEl;
  boundUpdatePosition = () => {
    if (activeTargetEl) computeAndSetPosition(activeTargetEl);
  };

  scrollParents = getScrollParents(targetEl);
  scrollParents.forEach((p) => {
    if (p === window) {
      window.addEventListener("scroll", boundUpdatePosition!, {
        passive: true,
      });
      window.addEventListener("resize", boundUpdatePosition!);
    } else {
      (p as HTMLElement).addEventListener("scroll", boundUpdatePosition!, {
        passive: true,
      });
    }
  });

  boundUpdatePosition();
};

const removePositionUpdater = () => {
  if (!boundUpdatePosition) {
    return;
  }

  scrollParents.forEach((p) => {
    if (p === window) {
      window.removeEventListener("scroll", boundUpdatePosition!);
      window.removeEventListener("resize", boundUpdatePosition!);
    } else {
      (p as HTMLElement).removeEventListener("scroll", boundUpdatePosition!);
    }
  });
  scrollParents = [];
  boundUpdatePosition = null;
  activeTargetEl = null;
};

const loadEvents = (): EventInput[] => {
  try {
    const data = localStorage.getItem("calendar-events");
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load events:", e);
    return [];
  }
};

const saveEventsToStorage = () => {
  const api = getCalendarApi();
  if (!api) return;

  const allEvents = api.getEvents().map((ev) => ({
    id: ev.id,
    title: ev.title,
    start: ev.startStr,
    end: ev.endStr,
    backgroundColor: ev.backgroundColor,
    extendedProps: ev.extendedProps,
  }));

  localStorage.setItem("calendar-events", JSON.stringify(allEvents));
};

const openModal = (info: any, event: any = null) => {
  const api = getCalendarApi();
  if (!api || api.view.type !== "dayGridMonth") return;

  let targetEl: HTMLElement;

  if (event) {
    const el = info.el as HTMLElement;
    targetEl = el;
    editingEvent.value = event;
    form.title = event.title || "";
    form.date = event.startStr?.slice(0, 10) || "";
    form.time = event.startStr?.slice(11, 16) || "";
    form.notes = event.extendedProps?.notes || "";
    form.color = event.backgroundColor || "";
  } else {
    const dayCell = info.dayEl as HTMLElement;
    targetEl = dayCell;
    editingEvent.value = null;
    form.title = "";
    form.date = info.dateStr.slice(0, 10);
    form.time = "";
    form.notes = "";
    form.color = "";
  }

  attachPositionUpdater(targetEl);

  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  formErrors.value = [];
  removePositionUpdater();
};

const saveEvent = handleSubmit(
  (values) => {
    const api = getCalendarApi();
    if (!api) return;

    const startDateTime =
      form.date && form.time ? `${form.date}T${form.time}` : form.date;

    if (editingEvent.value) {
      editingEvent.value.setProp("title", values.title);
      editingEvent.value.setStart(startDateTime);
      editingEvent.value.setExtendedProp("notes", form.notes);
      editingEvent.value.setProp("backgroundColor", form.color);
    } else {
      api.addEvent({
        title: values.title,
        start: startDateTime,
        backgroundColor: form.color,
        extendedProps: { notes: form.notes },
      });
    }

    saveEventsToStorage();
    closeModal();
  },
  (validationErrors) => {
    formErrors.value = validationErrors.errors;
  }
);

const deleteEvent = () => {
  if (editingEvent.value) {
    saveEventsToStorage();
    editingEvent.value.remove();
  }

  closeModal();
};

const updateEvent = (event: any) => {
  console.log("Empty update event function for drag and drop events", event);
  saveEventsToStorage();
};

const syncCalendarTitle = () => {
  const api = getCalendarApi();
  if (!api) return;

  const viewType = api.view.type;
  const start = api.view.currentStart;
  const end = api.view.currentEnd;

  switch (viewType) {
    case "dayGridMonth":
      const month = start.toLocaleString("en-US", { month: "long" });
      const year = start.getFullYear();
      calendarTitle.value = `${month} ${year}`;
      break;

    case "timeGridWeek":
      const startStr = start.toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
      });
      const endStr = end.toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
      });
      calendarTitle.value = `${startStr} - ${endStr}`;
      break;

    case "timeGridDay":
      const dayStr = start.toLocaleString("en-US", {
        weekday: "long",
        month: "short",
        day: "2-digit",
      });
      calendarTitle.value = dayStr;
      break;

    default:
      const fallbackMonth = start.toLocaleString("en-US", { month: "long" });
      const fallbackYear = start.getFullYear();
      calendarTitle.value = `${fallbackMonth} ${fallbackYear}`;
      break;
  }
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

onMounted(() => {
  const api = getCalendarApi();
  if (api) {
    const saved = loadEvents();
    saved.forEach((ev) => api.addEvent(ev));
  }
  syncCalendarTitle();
});

onBeforeUnmount(() => {
  removePositionUpdater();
});
</script>

<style>
@import "../styles/calendar.css";
</style>
