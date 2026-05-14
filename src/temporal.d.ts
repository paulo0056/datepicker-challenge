import type { Temporal as TemporalAPI } from '@js-temporal/polyfill'

declare global {
  namespace Temporal {
    type PlainDate = TemporalAPI.PlainDate
    type PlainDateTime = TemporalAPI.PlainDateTime
    type PlainTime = TemporalAPI.PlainTime
    type PlainYearMonth = TemporalAPI.PlainYearMonth
    type PlainMonthDay = TemporalAPI.PlainMonthDay
    type ZonedDateTime = TemporalAPI.ZonedDateTime
    type Instant = TemporalAPI.Instant
    type Duration = TemporalAPI.Duration
    type Now = TemporalAPI.Now
    type ComparisonResult = TemporalAPI.ComparisonResult
    type DurationLike = TemporalAPI.DurationLike
    type PlainDateLike = TemporalAPI.PlainDateLike
    type PlainTimeLike = TemporalAPI.PlainTimeLike
    type PlainDateTimeLike = TemporalAPI.PlainDateTimeLike
    type DurationOptions = TemporalAPI.DurationOptions
    type ArithmeticOptions = TemporalAPI.ArithmeticOptions
    type AssignmentOptions = TemporalAPI.AssignmentOptions
  }

  const Temporal: typeof TemporalAPI
}
