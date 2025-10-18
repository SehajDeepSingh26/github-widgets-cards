import moment from "moment"
import type { ProfileContribution } from "./profile-details"

export interface StreakInfo {
  currentStreak: number
  currentStreakStart: Date
  currentStreakEnd: Date
  maxStreak: number
  maxStreakStart: Date
  maxStreakEnd: Date
}

/**
 * Calculate current and max streak from contribution data
 * @param contributions Array of contribution data sorted by date
 * @returns StreakInfo object with current and max streak information
 */
export function calculateStreaks(contributions: ProfileContribution[]): StreakInfo {
  if (contributions.length === 0) {
    return {
      currentStreak: 0,
      currentStreakStart: new Date(),
      currentStreakEnd: new Date(),
      maxStreak: 0,
      maxStreakStart: new Date(),
      maxStreakEnd: new Date(),
    }
  }

  // Sort contributions by date ascending
  const sorted = [...contributions].sort((a, b) => a.date.getTime() - b.date.getTime())

  let currentStreak = 0
  let maxStreak = 0
  let currentStreakStart = sorted[0].date
  let currentStreakEnd = sorted[0].date
  let maxStreakStart = sorted[0].date
  let maxStreakEnd = sorted[0].date
  let tempStreakStart = sorted[0].date

  // Iterate through contributions to find streaks
  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i]
    const previous = i > 0 ? sorted[i - 1] : null

    // Check if this is a continuation of streak (has contributions)
    if (current.contributionCount > 0) {
      if (previous && current.contributionCount > 0) {
        const dayDiff = moment(current.date).diff(moment(previous.date), "days")

        // If consecutive days, continue streak
        if (dayDiff === 1) {
          currentStreak++
          currentStreakEnd = current.date
        } else {
          // Streak broken, check if it's the max
          if (currentStreak > maxStreak) {
            maxStreak = currentStreak
            maxStreakStart = tempStreakStart
            maxStreakEnd = sorted[i - 1].date
          }
          currentStreak = 1
          tempStreakStart = current.date
          currentStreakStart = current.date
          currentStreakEnd = current.date
        }
      } else if (!previous) {
        // First day
        currentStreak = 1
        tempStreakStart = current.date
        currentStreakStart = current.date
        currentStreakEnd = current.date
      }
    } else {
      // No contribution on this day, streak broken
      if (currentStreak > 0 && currentStreak > maxStreak) {
        maxStreak = currentStreak
        maxStreakStart = tempStreakStart
        maxStreakEnd = sorted[i - 1].date
      }
      currentStreak = 0
    }
  }

  // Check final streak
  if (currentStreak > maxStreak) {
    maxStreak = currentStreak
    maxStreakStart = tempStreakStart
    maxStreakEnd = sorted[sorted.length - 1].date
  }

  // Calculate current streak from today backwards
  const today = moment().startOf("day")
  let actualCurrentStreak = 0
  let actualCurrentStreakStart = today.toDate()
  const actualCurrentStreakEnd = today.toDate()

  for (let i = sorted.length - 1; i >= 0; i--) {
    const current = sorted[i]
    const currentMoment = moment(current.date).startOf("day")
    const daysDiff = today.diff(currentMoment, "days")

    if (daysDiff === actualCurrentStreak && current.contributionCount > 0) {
      actualCurrentStreak++
      actualCurrentStreakStart = current.date
    } else if (daysDiff > actualCurrentStreak) {
      break
    }
  }

  return {
    currentStreak: actualCurrentStreak,
    currentStreakStart: actualCurrentStreakStart,
    currentStreakEnd: actualCurrentStreakEnd,
    maxStreak: maxStreak,
    maxStreakStart: maxStreakStart,
    maxStreakEnd: maxStreakEnd,
  }
}
