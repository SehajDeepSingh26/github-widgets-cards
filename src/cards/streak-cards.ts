import { ThemeMap } from "../const/theme"
import { createStreakCard, type StreakData } from "../templates/streak-card"
import { writeSVG } from "../utils/file-writer"
import { calculateStreaks } from "../github-api/streak-calculator"
import { getContributionByYear } from "../github-api/contributions-by-year"
import { getProfileDetails } from "../github-api/profile-details"

export const createStreakCardForUser = async (username: string) => {
  const streakData = await getStreakCardData(username)
  for (const themeName of ThemeMap.keys()) {
    const title = ``
    const svgString = getStreakCardSVG(title, streakData, themeName)
    // output to folder, use 1- prefix for sort in preview
    writeSVG(themeName, "1-streak-card", svgString)
  }
}

export const getStreakCardSVGWithThemeName = async (username: string, themeName: string): Promise<string> => {
  if (!ThemeMap.has(themeName)) throw new Error("Theme does not exist")
  const streakData = await getStreakCardData(username)
  const title = ``
  return getStreakCardSVG(title, streakData, themeName)
}

const getStreakCardSVG = (title: string, streakData: StreakData, themeName: string): string => {
  const svgString = createStreakCard(title, streakData, ThemeMap.get(themeName)!)
  return svgString
}

const getStreakCardData = async (username: string): Promise<StreakData> => {
  const profileDetails = await getProfileDetails(username)

  // Calculate total contributions
  let totalContributions = 0
  if (process.env.VERCEL_I) {
    profileDetails.contributionYears = profileDetails.contributionYears.slice(0, 1)
    for (const year of profileDetails.contributionYears) {
      totalContributions += (await getContributionByYear(username, year)).totalContributions
    }
  } else {
    for (const year of profileDetails.contributionYears) {
      totalContributions += (await getContributionByYear(username, year)).totalContributions
    }
  }

  // Calculate streaks from contribution data
  const streakInfo = calculateStreaks(profileDetails.contributions)

  const streakData: StreakData = {
    currentStreak: streakInfo.currentStreak,
    currentStreakStart: streakInfo.currentStreakStart,
    currentStreakEnd: streakInfo.currentStreakEnd,
    maxStreak: streakInfo.maxStreak,
    maxStreakStart: streakInfo.maxStreakStart,
    maxStreakEnd: streakInfo.maxStreakEnd,
    totalContributions: totalContributions,
    joinedDate: new Date(profileDetails.createdAt),
  }

  return streakData
}
