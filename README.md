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
  --dp-bg-selected: #d32f2f; /* change selection color to red */
  --dp-radius: 50%; /* round day cells */
}
```

---

## Notes on the Temporal API

Working with dates in JavaScript has always been a bit painful. The legacy `Date` object conflates timezone handling with date representation, which leads to bugs, especially around UTC vs. local time. Temporal fixes this by separating concerns into distinct types.

For a date picker, `Temporal.PlainDate` is the right fit. It represents a calendar date with no time, no timezone, just year, month, day. No surprises.

A few things that made the implementation cleaner:

- **`Temporal.Now.plainDateISO()`** gives today's date in the local timezone directly as a `PlainDate`. No conversion needed.

- **`PlainDate.compare(a, b)`** returns `-1`, `0`, or `1`. Comparing dates without converting to timestamps feels much more intentional.

- **`.with()`, `.add()`, `.subtract()`** all return new instances instead of mutating. This made the immutable engine design feel natural — the API and the architecture pull in the same direction.

- **`daysInMonth`** just works. February in a leap year, 31-day months — all handled automatically without any lookup table or manual logic.

The polyfill is loaded once in `main.ts` and assigned to `globalThis`, so the engine can use `Temporal` as if it were already a native browser API. When it eventually ships universally, removing the polyfill is the only change needed.
