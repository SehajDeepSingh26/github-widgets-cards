import { Card } from "./card"
import moment from "moment"
import type { Theme } from "../const/theme"

export interface StreakData {
  currentStreak: number
  currentStreakStart: Date
  currentStreakEnd: Date
  maxStreak: number
  maxStreakStart: Date
  maxStreakEnd: Date
  totalContributions: number
  joinedDate: Date
}

export function createStreakCard(title: string, streakData: StreakData, theme: Theme): string {
  const width = 550
  const height = 200
  const card = new Card(title, width, height, theme)
  const svg = card.getSVG()

  // layout math for three equal panels, centered content
  const padding = 30
  const panelWidth = (width - padding * 2) / 3
  const leftCenterX = padding + panelWidth / 2 - 20
  const centerCenterX = padding + panelWidth * 1.5
  const rightCenterX = padding + panelWidth * 2.5 + 10

  const leftTopY = 50
  const centerGroupY = 40
  const rightTopY = 50

  // Left section - Total Contributions (centered)
  const leftPanel = svg.append("g").attr("transform", `translate(${leftCenterX}, ${leftTopY})`)

  leftPanel
    .append("text")
    .text(streakData.totalContributions.toString())
    .attr("x", 0)
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .style("font-size", "34px")
    .style("font-weight", "800")
    .style("fill", theme.title)

  leftPanel
    .append("text")
    .text("Total Contributions")
    .attr("x", 0)
    .attr("y", 36)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "500")
    .style("fill", theme.title)

  const joinedDateStr = moment(streakData.joinedDate).format("MMM DD, YYYY")
  leftPanel
    .append("text")
    .text(`${joinedDateStr} - Present`)
    .attr("x", 0)
    .attr("y", 62)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", theme.text)
    .attr("opacity", 1)

  // vertical separators (between panels) - positioned using panel widths
  const leftSepX = Math.round(padding + panelWidth)
  const rightSepX = Math.round(padding + panelWidth * 2)

  svg
    .append("line")
    .attr("x1", leftSepX)
    .attr("y1", -10)
    .attr("x2", leftSepX)
    .attr("y2", 136)
    .attr("stroke", theme.text)
    .attr("stroke-width", 1)
    .attr("opacity", 1)

  svg
    .append("line")
    .attr("x1", rightSepX)
    .attr("y1", -10)
    .attr("x2", rightSepX)
    .attr("y2", 136)
    .attr("stroke", theme.text)
    .attr("stroke-width", 1)
    .attr("opacity", 1)

  // Center section - Current Streak with circular progress (fully centered)
  const centerPanel = svg.append("g").attr("transform", `translate(${centerCenterX}, ${centerGroupY})`)

  const circleRadius = 40
  const circleX = 0
  const circleY = 0

  // Background circle (subtle)
  centerPanel
    .append("circle")
    .attr("cx", circleX)
    .attr("cy", circleY)
    .attr("r", circleRadius)
    .attr("fill", "none")
    .attr("stroke", theme.text)
    .attr("stroke-width", 2.5)
    .attr("opacity", 0.12)

  // Progress circle (orange for streak) - draw full circle then offset
  const circumference = 2 * Math.PI * circleRadius
  const strokeDashoffset = 0

  centerPanel
    .append("circle")
    .attr("cx", circleX)
    .attr("cy", circleY)
    .attr("r", circleRadius)
    .attr("fill", "none")
    .attr("stroke", theme.title)
    .attr("stroke-width", 4)
    .attr("stroke-dasharray", circumference)
    .attr("stroke-dashoffset", strokeDashoffset)
    .attr("stroke-linecap", "round")
    // rotate so stroke starts at 12 o'clock
    .attr("transform", `rotate(-90 ${circleX} ${circleY})`)

  // Flame emoji at 12 o'clock 
  centerPanel
    .append("text")
    .text(" 🔥 ")
    .attr("x", 0)
    .attr("y", -circleRadius)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .style("font-size", "22px")
    .style("stroke", theme.title)
    .style("pointer-events", "none")

  // Current streak number (centered)
  centerPanel
    .append("text")
    .text(streakData.currentStreak.toString())
    .attr("x", 0)
    .attr("y", 5.5)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .style("font-size", "32px")
    .style("font-weight", "800")
    .style("fill", theme.text)

  // Current Streak label (below)
  centerPanel
    .append("text")
    .text("Current Streak")
    .attr("x", 0)
    .attr("y", circleRadius + 28)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "600")
    .style("fill", "#FFA500")

  // Current streak date range (below the label)
  const currentStreakStart = moment(streakData.currentStreakStart).format("MMM D")
  const currentStreakEnd = moment(streakData.currentStreakEnd).format("MMM D")
  centerPanel
    .append("text")
    .text(`${currentStreakStart} - ${currentStreakEnd}`)
    .attr("x", 0)
    .attr("y", circleRadius + 50)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", theme.text)
    .attr("opacity", 1)

  // Right section - Max Streak (centered)
  const rightPanel = svg.append("g").attr("transform", `translate(${rightCenterX}, ${rightTopY})`)

  rightPanel
    .append("text")
    .text(streakData.maxStreak.toString())
    .attr("x", 0)
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .style("font-size", "34px")
    .style("font-weight", "800")
    .style("fill", theme.title)

  rightPanel
    .append("text")
    .text("Longest Streak")
    .attr("x", 0)
    .attr("y", 36)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "500")
    .style("fill", theme.title)

  const maxStreakStart = moment(streakData.maxStreakStart).format("MMM DD, YYYY")
  const maxStreakEnd = moment(streakData.maxStreakEnd).format("MMM DD, YYYY")
  rightPanel
    .append("text")
    .text(`${maxStreakStart} - ${maxStreakEnd}`)
    .attr("x", 0)
    .attr("y", 62)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", theme.text)
    .attr("opacity", 1)

  return card.toString()
}
