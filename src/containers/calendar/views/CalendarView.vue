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
  color: "",
});

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
      html: `<div class="custom-event" style="background-color: ${arg.event.backgroundColor};">
               ${arg.event.title}
             </div>`,
    };
  },
  slotDuration: "1:00",
  slotLabelClassNames: ["my-time-label"],
  slotLabelFormat: { hour: "numeric", minute: "2-digit", hour12: true },

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
  const MODAL_WIDTH = 200;
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
  removePositionUpdater();
};

const saveEvent = () => {
  const api = getCalendarApi();
  if (!api) return;

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
  syncCalendarTitle();
});

onBeforeUnmount(() => {
  removePositionUpdater();
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

.custom-calendar .custom-event {
  width: 100%;
  color: white;
  font-weight: 600;
  font-size: 14px;
  padding: 4px 6px;
  border-radius: 6px;
  box-sizing: border-box;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.fc .fc-timegrid-slot,
.fc .fc-timegrid-axis-frame {
  background: #f5f6fa 0% 0% no-repeat padding-box;
  height: 80px;
}

.fc-timegrid-divider {
  display: none;
}

.fc .fc-scrollgrid-section-header .fc-timegrid-axis {
  display: none;
}

.fc .fc-timegrid-slot-label {
  width: 100px;
}

.fc .fc-timegrid-axis-frame {
  align-items: center;
  display: flex;
  justify-content: center;
  overflow: hidden;
  background-color: #fff;
  border: 1px solid var(--fc-border-color);
}

.custom-calendar .my-time-label {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  height: 100%;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding-left: 8px;
}
</style>
