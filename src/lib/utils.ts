import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getWeeklyProductIndex(totalProducts: number): number {
  if (totalProducts <= 0) return 0

  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000
  const currentWeek = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7)

  return currentWeek % totalProducts
}