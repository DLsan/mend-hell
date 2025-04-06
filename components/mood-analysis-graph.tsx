"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react"
import { loadMoodData, getMoodDescription, FULL_DAY_NAMES, getMoodColor, type MoodData } from "@/lib/mood-utils"
import { useExerciseStore } from "@/store/exercise-store"

export function MoodAnalysisGraph() {
  const [moodData, setMoodData] = useState<MoodData[]>([])
  const [averageMood, setAverageMood] = useState<number>(0)
  const [moodTrend, setMoodTrend] = useState<"up" | "down" | "stable">("stable")
  const [highestDay, setHighestDay] = useState<string>("")
  const [lowestDay, setLowestDay] = useState<string>("")
  const setRecommendedExercises = useExerciseStore((state) => state.setRecommendedExercises)
  const allExercises = useExerciseStore((state) => state.allExercises)

  useEffect(() => {
    // Load mood data
    const data = loadMoodData()

    // Sort by date
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    setMoodData(sortedData)
    analyzeData(sortedData)
  }, [])

  // Analyze the mood data to extract insights
  const analyzeData = (data: MoodData[]) => {
    if (data.length === 0) return

    // Calculate average mood
    const sum = data.reduce((acc, item) => acc + item.value, 0)
    const avg = sum / data.length
    setAverageMood(Math.round(avg * 10) / 10)

    // Determine trend (comparing first half to second half)
    const midpoint = Math.floor(data.length / 2)
    const firstHalf = data.slice(0, midpoint)
    const secondHalf = data.slice(midpoint)

    const firstHalfAvg = firstHalf.reduce((acc, item) => acc + item.value, 0) / firstHalf.length
    const secondHalfAvg = secondHalf.reduce((acc, item) => acc + item.value, 0) / secondHalf.length

    if (secondHalfAvg - firstHalfAvg > 0.3) setMoodTrend("up")
    else if (firstHalfAvg - secondHalfAvg > 0.3) setMoodTrend("down")
    else setMoodTrend("stable")

    // Find highest and lowest days
    let highest = data[0]
    let lowest = data[0]

    data.forEach((item) => {
      if (item.value > highest.value) highest = item
      if (item.value < lowest.value) lowest = item
    })

    setHighestDay(highest.day)
    setLowestDay(lowest.day)

    // Recommend exercises based on mood trend
    recommendExercisesBasedOnMood(avg, moodTrend)
  }

  // Recommend exercises based on mood
  const recommendExercisesBasedOnMood = (avgMood: number, trend: string) => {
    if (!allExercises || allExercises.length === 0) return

    // Filter exercises based on mood
    let targetTypes: string[] = []
    let priority = 4

    if (avgMood <= 2) {
      // Low mood - focus on depression, negative thinking
      targetTypes = ["depression", "negative thinking", "low mood"]
      priority = 5
    } else if (avgMood <= 3) {
      // Moderate mood - focus on anxiety, stress
      targetTypes = ["anxiety", "stress", "physical tension"]
      priority = 4
    } else {
      // Good mood - focus on mindfulness, gratitude
      targetTypes = ["mindfulness", "gratitude", "positive thinking"]
      priority = 3
    }

    // Find matching exercises
    const recommendedExercises = allExercises
      .filter((exercise) => {
        // Check if any of the exercise's targets match our target types
        return (
          exercise.mentalHealthTargets &&
          exercise.mentalHealthTargets.some((target) =>
            targetTypes.some((type) => target.toLowerCase().includes(type.toLowerCase())),
          )
        )
      })
      .map((exercise) => ({
        ...exercise,
        priority: priority,
      }))
      .slice(0, 3) // Take top 3

    if (recommendedExercises.length > 0) {
      setRecommendedExercises(recommendedExercises)
    }
  }

  // Calculate the maximum value for scaling
  const maxValue = 5

  // Get trend description
  const getTrendDescription = (): string => {
    switch (moodTrend) {
      case "up":
        return "Your mood has been improving recently"
      case "down":
        return "Your mood has been declining recently"
      default:
        return "Your mood has been relatively stable"
    }
  }

  // Get trend icon
  const getTrendIcon = () => {
    switch (moodTrend) {
      case "up":
        return <TrendingUp className="h-5 w-5 text-green-500" />
      case "down":
        return <TrendingDown className="h-5 w-5 text-red-500" />
      default:
        return <ArrowRight className="h-5 w-5 text-yellow-500" />
    }
  }

  // Generate recommendation based on mood
  const getMoodRecommendation = (): string => {
    if (averageMood <= 2) {
      return "Consider practicing gratitude exercises and reaching out for support."
    } else if (averageMood <= 3) {
      return "Breathing exercises and physical activity could help improve your mood."
    } else if (moodTrend === "down") {
      return "Your mood is good but declining. Mindfulness practices can help maintain it."
    } else {
      return "Continue with your current practices to maintain your positive mood."
    }
  }

  return (
    <Card className="bg-slate-50 border-slate-100">
      <CardHeader className="pb-2">
        <CardTitle>Mood Analysis</CardTitle>
        <CardDescription>Detailed view of your mood patterns over time</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Mood Graph */}
        <div className="mb-6 p-4 bg-white rounded-md shadow-sm">
          <div className="relative h-[200px] w-full">
            {/* Y-axis labels */}
            <div className="absolute -left-6 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
              <span>Excellent</span>
              <span>Good</span>
              <span>Moderate</span>
              <span>Low</span>
              <span>Very Low</span>
            </div>

            {/* Graph container */}
            <div className="absolute left-10 right-2 top-0 h-full border-l border-b border-gray-200">
              {/* Horizontal grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="absolute w-full border-t border-gray-100" style={{ bottom: `${i * 25}%` }} />
              ))}

              {/* Data line */}
              {moodData.length > 1 && (
                <svg className="absolute inset-0 overflow-visible">
                  <polyline
                    points={moodData
                      .map((item, index) => {
                        const x = `${(index / (moodData.length - 1)) * 100}%`
                        const y = `${100 - (item.value / maxValue) * 100}%`
                        return `${x},${y}`
                      })
                      .join(" ")}
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              )}

              {/* Data points */}
              <div className="absolute inset-0">
                {moodData.map((item, index) => (
                  <div
                    key={index}
                    className="absolute w-3 h-3 rounded-full bg-blue-500 z-10"
                    style={{
                      bottom: `${(item.value / maxValue) * 100}%`,
                      left: `${(index / (moodData.length - 1)) * 100}%`,
                      transform: "translate(-50%, 50%)",
                    }}
                  />
                ))}
              </div>

              {/* X-axis labels */}
              <div className="absolute w-full bottom-0 translate-y-6">
                {moodData.map((item, index) => {
                  // Show fewer labels on small screens
                  const shouldShow = moodData.length <= 8 || index % 2 === 0

                  return shouldShow ? (
                    <div
                      key={index}
                      className="absolute text-xs text-gray-500 transform -translate-x-1/2"
                      style={{
                        left: `${(index / (moodData.length - 1)) * 100}%`,
                      }}
                    >
                      {item.day}
                    </div>
                  ) : null
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Mood Insights */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Average Mood</h3>
              <div className="flex items-center mt-1">
                <span className="text-2xl font-bold" style={{ color: getMoodColor(averageMood) }}>
                  {getMoodDescription(averageMood)}
                </span>
                <span className="ml-2 text-sm text-gray-500">({averageMood}/5)</span>
              </div>
            </div>
            <div className="flex items-center">
              {getTrendIcon()}
              <span className="ml-1 text-sm">
                {moodTrend === "up" ? "Improving" : moodTrend === "down" ? "Declining" : "Stable"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-md">
              <h4 className="font-medium text-blue-800">Mood Patterns</h4>
              <p className="mt-1 text-sm text-blue-700">
                {getTrendDescription()}.{" "}
                {highestDay &&
                  `Your highest mood tends to be on ${FULL_DAY_NAMES[highestDay as keyof typeof FULL_DAY_NAMES]}.`}
              </p>
            </div>

            <div className="p-3 bg-green-50 rounded-md">
              <h4 className="font-medium text-green-800">Recommendations</h4>
              <p className="mt-1 text-sm text-green-700">{getMoodRecommendation()}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

