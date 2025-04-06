"use client"

import { useState, useEffect } from "react"
import { loadMoodData, getMoodColor, type MoodData } from "@/lib/mood-utils"

export function MoodTracker() {
  const [moodData, setMoodData] = useState<MoodData[]>([])

  useEffect(() => {
    // Load mood data
    const data = loadMoodData()

    // Only use the last 7 days for the simple tracker
    setMoodData(data.slice(-7))
  }, [])

  // Calculate max value for scaling
  const maxValue = 5

  return (
    <div className="space-y-4">
      <div className="flex h-[120px] items-end gap-2">
        {moodData.map((item, index) => (
          <div key={index} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-md transition-all duration-500"
              style={{
                height: `${(item.value / maxValue) * 100}%`,
                backgroundColor: getMoodColor(item.value),
                opacity: 0.7 + (item.value / maxValue) * 0.3,
              }}
            />
            <span className="text-xs font-medium">{item.day}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-center space-x-3">
        <div className="flex items-center">
          <span className="mr-1 h-2 w-2 rounded-full bg-red-400"></span>
          <span className="text-xs">Low</span>
        </div>
        <div className="flex items-center">
          <span className="mr-1 h-2 w-2 rounded-full bg-yellow-400"></span>
          <span className="text-xs">Medium</span>
        </div>
        <div className="flex items-center">
          <span className="mr-1 h-2 w-2 rounded-full bg-green-400"></span>
          <span className="text-xs">High</span>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500">Based on your recent conversations</div>
    </div>
  )
}

