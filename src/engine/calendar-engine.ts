export interface CalendarDay {
  date: Temporal.PlainDate
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
}

export interface CalendarState {
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

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

// Grid always has 42 cells (6 rows × 7 cols) so layout never shifts between months, this is a pattern used in date pickers.
const GRID_SIZE = 42

function buildGrid(cursor: Temporal.PlainDate, selected: Temporal.PlainDate | null): CalendarDay[] {
  const today = Temporal.Now.plainDateISO()
  // Put the cursor at the first day of the month always, because the function needs to know what it's the first day of the month for calculating the leading count and generate the the days.
  const firstOfMonth = cursor.with({ day: 1 })

  // Temporal.dayOfWeek follows ISO 8601: Mon=1… Sun=7.
  // For a Sunday-first grid we need Sun=0, Mon=1….

  const leadingCount = firstOfMonth.dayOfWeek % 7

  const days: CalendarDay[] = []

  // Days from the previous month that fill the first row
  for (let i = leadingCount; i > 0; i--) {
    const date = firstOfMonth.subtract({ days: i })
    days.push({ date, isCurrentMonth: false, isToday: false, isSelected: false })
  }

  // Days of the current month
  for (let d = 1; d <= cursor.daysInMonth; d++) {
    const date = firstOfMonth.with({ day: d })
    days.push({
      date,
      isCurrentMonth: true,
      isToday: Temporal.PlainDate.compare(date, today) === 0,
      isSelected: selected !== null && Temporal.PlainDate.compare(date, selected) === 0,
    })
  }

  // Days from the next month that fill the last row(s)
  const lastOfMonth = firstOfMonth.with({ day: cursor.daysInMonth })
  const trailingCount = GRID_SIZE - days.length
  for (let i = 1; i <= trailingCount; i++) {
    const date = lastOfMonth.add({ days: i })
    days.push({ date, isCurrentMonth: false, isToday: false, isSelected: false })
  }

  return days
}

function buildMonthLabel(cursor: Temporal.PlainDate): string {
  const month = cursor.toLocaleString('en-US', { month: 'long' })
  return `${month} ${cursor.year}`
}

function formatDate(date: Temporal.PlainDate): string {
  const d = String(date.day).padStart(2, '0')
  const m = String(date.month).padStart(2, '0')
  return `${m}/${d}/${date.year}`
}

export function createCalendarState(
  cursor?: Temporal.PlainDate,
  selected?: Temporal.PlainDate | null,
): CalendarState {
  // Normalize cursor to day 1 so the viewed month is always defined.
  const c = (cursor ?? Temporal.Now.plainDateISO()).with({ day: 1 })
  const s = selected !== undefined ? selected : null

  return {
    year: c.year,
    month: c.month,
    monthLabel: buildMonthLabel(c),
    weekDays: WEEK_DAYS,
    grid: buildGrid(c, s),
    selected: s,
    inputValue: s !== null ? formatDate(s) : '',

    prevMonth: () => createCalendarState(c.subtract({ months: 1 }), s),
    nextMonth: () => createCalendarState(c.add({ months: 1 }), s),
    prevYear: () => createCalendarState(c.subtract({ years: 1 }), s),
    nextYear: () => createCalendarState(c.add({ years: 1 }), s),
    select: (date) => createCalendarState(date, date),
  }
}
