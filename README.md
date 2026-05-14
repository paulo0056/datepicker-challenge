# Date Picker Challenge

## How to run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

---

## Architecture

The project is split into two layers with completely separate responsibilities.

### 1. The Engine (`src/engine/calendar-engine.ts`)

A pure TypeScript module with no framework imports or third-party date libraries. It uses the `Temporal` API as a global (available because the polyfill is injected into `main.ts` before any other code runs).

**Exported interfaces:**

```ts
interface CalendarDay {
  date: Temporal.PlainDate
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
}

interface CalendarState {
  readonly year: number
  readonly month: number
  readonly monthLabel: string
  readonly weekDays: readonly string[]
  readonly grid: readonly CalendarDay[]
  readonly selected: Temporal.PlainDate | null
  readonly inputValue: string
  prevMonth(): CalendarState
  nextMonth(): CalendarState
  prevYear(): CalendarState
  nextYear(): CalendarState
  select(date: Temporal.PlainDate): CalendarState
}
```

**`createCalendarState(cursor?, selected?)`** is the main function. It receives the month being viewed and the selected date, and returns a `CalendarState` object with all state already computed.

The design is **immutable**: no method modifies the existing object. Each navigation call (e.g. `state.nextMonth()`) returns a new `CalendarState`. This makes the engine fully predictable and easy to test — given the same input, it always produces the same output.

**Grid generation:**

The grid always has 42 cells (6 rows × 7 columns) so the layout never shifts in height between months. The week starts on Sunday.

The `Temporal` API follows ISO 8601 where `dayOfWeek` goes from 1 (Monday) to 7 (Sunday). To convert to a Sunday-first grid (columns 0–6), `dayOfWeek % 7` is all it takes.

### 2. The Component (`src/components/DatePicker.vue`)

The Vue 3 wrapper that consumes the engine. All calendar logic lives in the engine, the component is only responsible for:

- Displaying the current state (grid, month label, input value)
- Delegating user actions to the engine and updating the state

**Bridging the engine with Vue's reactivity:**

The engine state is held in a `shallowRef<CalendarState>`. `shallowRef` (instead of `ref`) is used because the `CalendarState` object is immutable — we never need to track internal changes, only the full replacement of the value. Each user action replaces the entire `shallowRef`:

```ts
// Navigate to the next month
state.value = state.value.nextMonth()

// Select a date
state.value = state.value.select(cell.date)
```

Vue detects the change in the `shallowRef` and re-renders the component with the new state.

**Accessibility (a11y):**

- `Esc` closes the calendar (listener on `document` to capture it even when focus is inside the grid)
- `Enter` selects the focused day
- `Tab` to the input and `focus` event opens the calendar automatically
- Days from adjacent months have `tabindex="-1"` so they are skipped during keyboard navigation

**Theming via CSS Custom Properties:**

All colors, sizes, and borders are CSS custom properties defined on the `.dp` block. To retheme the component, simply override the variables from outside:

```css
.dp {
  --dp-bg-selected: #d32f2f;  /* change selection color to red */
  --dp-radius: 50%;            /* round day cells */
}
```

---

## Notes on the Temporal API

- **`Temporal.PlainDate`** is the ideal type for timezone-free dates, which is exactly what a date picker represents. With the legacy `Date` object, UTC vs. local time is a constant source of bugs — Temporal eliminates this by design.

- **`Temporal.Now.plainDateISO()`** returns today's date in the local timezone as a `PlainDate`, without any ambiguity.

- **`Temporal.PlainDate.compare(a, b)`** returns `-1`, `0`, or `1`, making date comparisons explicit and without any timestamp conversion.

- **`PlainDate.with({ day: 1 })`**, **`.add()`**, and **`.subtract()`** are immutable methods that return new instances. This pairs naturally with the engine's immutable design.

- **`daysInMonth`** is a `PlainDate` property that automatically returns the correct number of days for any given month and year (leap years included), with no manual logic required.

- The `@js-temporal/polyfill` is loaded once in `main.ts` and registered on `globalThis`. The engine imports nothing — it uses `Temporal` as a global, the same way it would use the native API once it becomes universally available.
