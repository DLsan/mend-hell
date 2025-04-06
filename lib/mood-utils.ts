// Type for mood data
export type MoodData = {
  day: string
  value: number
  date: string
}

// Day abbreviations
export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// Full day names for display
export const FULL_DAY_NAMES = {
  Sun: "Sunday",
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
}

// Get mood description based on value
export function getMoodDescription(value: number): string {
  if (value <= 1.5) return "Very Low"
  if (value <= 2.5) return "Low"
  if (value <= 3.5) return "Moderate"
  if (value <= 4.5) return "Good"
  return "Excellent"
}

// Get color based on mood value
export function getMoodColor(value: number): string {
  if (value <= 2) return "#f87171" // red-400
  if (value === 3) return "#facc15" // yellow-400
  return "#4ade80" // green-400
}

// Load mood data from localStorage
export function loadMoodData(): MoodData[] {
  try {
    const storedData = localStorage.getItem("moodTracking")
    if (storedData) {
      const parsedData = JSON.parse(storedData)
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        return parsedData
      }
    }

    // If no data or invalid data, generate sample data
    return generateSampleMoodData()
  } catch (error) {
    console.error("Error loading mood data:", error)
    return generateSampleMoodData()
  }
}

// Generate sample mood data
export function generateSampleMoodData(days = 7): MoodData[] {
  const newData: MoodData[] = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(today.getDate() - i)

    newData.push({
      day: DAYS[date.getDay()],
      value: Math.floor(Math.random() * 3) + 3, // Random value between 3-5
      date: date.toISOString().split("T")[0],
    })
  }

  localStorage.setItem("moodTracking", JSON.stringify(newData))
  return newData
}

// Update mood data with a new entry
export function updateMoodData(value: number): MoodData[] {
  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]
  const dayStr = DAYS[today.getDay()]

  // Get current mood data
  let moodData = loadMoodData()

  // Check if we already have an entry for today
  const todayIndex = moodData.findIndex((item) => item.date === todayStr)

  if (todayIndex >= 0) {
    // Update today's entry
    moodData[todayIndex].value = value
  } else {
    // Add new entry for today
    moodData.push({
      day: dayStr,
      value,
      date: todayStr,
    })

    // Keep only the last 14 days
    if (moodData.length > 14) {
      moodData = moodData.slice(moodData.length - 14)
    }
  }

  localStorage.setItem("moodTracking", JSON.stringify(moodData))
  return moodData
}

