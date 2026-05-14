<template>
  <div class="dp" ref="containerRef">
    <label class="dp__label" for="dp-input">Date Picker</label>
    <input
      id="dp-input"
      class="dp__input"
      type="text"
      :value="state.inputValue"
      placeholder="MM/DD/YYYY"
      readonly
      @click="openCalendar"
      @focus="openCalendar"
      @keydown="onInputKeydown"
    />

    <div v-if="isOpen" class="dp__popover">
      <div class="dp__header">
        <button class="dp__nav" @click="navigate('prevYear')">«</button>
        <button class="dp__nav" @click="navigate('prevMonth')">‹</button>
        <span class="dp__month-label">{{ state.monthLabel }}</span>
        <button class="dp__nav" @click="navigate('nextMonth')">›</button>
        <button class="dp__nav" @click="navigate('nextYear')">»</button>
      </div>

      <div class="dp__weekdays">
        <span v-for="wd in state.weekDays" :key="wd" class="dp__weekday">{{ wd }}</span>
      </div>

      <div class="dp__days">
        <button
          v-for="(cell, i) in state.grid"
          :key="i"
          class="dp__day"
          :class="{
            'dp__day--other-month': !cell.isCurrentMonth,
            'dp__day--today': cell.isToday,
            'dp__day--selected': cell.isSelected,
          }"
          :tabindex="cell.isCurrentMonth ? 0 : -1"
          @click="selectCell(cell)"
          @keydown.enter.prevent="selectCell(cell)"
        >
          {{ cell.date.day }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, onMounted, onUnmounted } from 'vue'
import { createCalendarState } from '../engine/calendar-engine'
import type { CalendarDay, CalendarState } from '../engine/calendar-engine'

const state = shallowRef<CalendarState>(createCalendarState())
const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

function openCalendar() {
  isOpen.value = true
}

function closeCalendar() {
  isOpen.value = false
}

function navigate(action: 'prevMonth' | 'nextMonth' | 'prevYear' | 'nextYear') {
  state.value = state.value[action]()
}

function selectCell(cell: CalendarDay) {
  if (!cell.isCurrentMonth) return
  state.value = state.value.select(cell.date)
  closeCalendar()
}

function onInputKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeCalendar()
  if (e.key === 'Enter' || e.key === ' ') openCalendar()
}

function onDocumentKeydown(e: KeyboardEvent) {
  if (isOpen.value && e.key === 'Escape') closeCalendar()
}

function onDocumentMousedown(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    closeCalendar()
  }
}

onMounted(() => {
  document.addEventListener('keydown', onDocumentKeydown)
  document.addEventListener('mousedown', onDocumentMousedown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onDocumentKeydown)
  document.removeEventListener('mousedown', onDocumentMousedown)
})
</script>

<style scoped>
.dp {
  /* Theme — override these custom properties to reskin the component */
  --dp-bg: #ffffff;
  --dp-bg-hover: #f0f4ff;
  --dp-bg-selected: #1a73e8;
  --dp-bg-today: #e8f0fe;
  --dp-text: #1c1b1f;
  --dp-text-muted: #aaaaaa;
  --dp-text-selected: #ffffff;
  --dp-border: #dadce0;
  --dp-radius: 8px;
  --dp-radius-sm: 4px;
  --dp-font-size: 14px;
  --dp-cell-size: 36px;
  --dp-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);

  position: relative;
  display: inline-block;
  font-size: var(--dp-font-size);
  font-family: inherit;
  color: var(--dp-text);
}

/* Label */

.dp__label {
  display: block;
  margin-bottom: 4px;
  font-size: var(--dp-font-size);
  font-weight: 500;
  color: var(--dp-text);
}

/* Input */

.dp__input {
  width: 160px;
  padding: 8px 12px;
  border: 1px solid var(--dp-border);
  border-radius: var(--dp-radius-sm);
  font-size: var(--dp-font-size);
  font-family: inherit;
  color: var(--dp-text);
  background: var(--dp-bg);
  cursor: pointer;
  outline: none;
}

.dp__input:focus {
  border-color: var(--dp-bg-selected);
}

/* Popover */

.dp__popover {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  background: var(--dp-bg);
  border: 1px solid var(--dp-border);
  border-radius: var(--dp-radius);
  box-shadow: var(--dp-shadow);
  padding: 12px;
  z-index: 100;
}

/* Header */

.dp__header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.dp__month-label {
  flex: 1;
  text-align: center;
  font-weight: 600;
  font-size: var(--dp-font-size);
}

.dp__nav {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--dp-radius-sm);
  font-size: 16px;
  line-height: 1;
  color: var(--dp-text);
}

.dp__nav:hover {
  background: var(--dp-bg-hover);
}

/* Week days row */

.dp__weekdays {
  display: grid;
  grid-template-columns: repeat(7, var(--dp-cell-size));
  margin-bottom: 4px;
}

.dp__weekday {
  width: var(--dp-cell-size);
  height: var(--dp-cell-size);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  color: var(--dp-text-muted);
}

/* Day grid */

.dp__days {
  display: grid;
  grid-template-columns: repeat(7, var(--dp-cell-size));
  gap: 2px;
}

.dp__day {
  width: var(--dp-cell-size);
  height: var(--dp-cell-size);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  border-radius: var(--dp-radius-sm);
  font-size: var(--dp-font-size);
  font-family: inherit;
  color: var(--dp-text);
  cursor: pointer;
}

.dp__day:hover:not(.dp__day--other-month):not(.dp__day--selected) {
  background: var(--dp-bg-hover);
}

.dp__day:focus-visible {
  outline: 2px solid var(--dp-bg-selected);
  outline-offset: -2px;
}

.dp__day--other-month {
  color: var(--dp-text-muted);
  cursor: default;
  pointer-events: none;
}

.dp__day--today {
  background: var(--dp-bg-today);
  font-weight: 600;
}

.dp__day--selected {
  background: var(--dp-bg-selected);
  color: var(--dp-text-selected);
  font-weight: 600;
}

.dp__day--selected:hover {
  background: var(--dp-bg-selected);
}
</style>
