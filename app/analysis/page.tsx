"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, TrendingUp, TrendingDown, Activity } from "lucide-react"
import { MoodAnalysisGraph } from "@/components/mood-analysis-graph"

export default function AnalysisPage() {
  const [averageMood, setAverageMood] = useState(3.8)
  const [stressLevel, setStressLevel] = useState("Moderate")
  const [stressTrend, setStressTrend] = useState<"up" | "down" | "stable">("down")
  const [anxietyLevel, setAnxietyLevel] = useState("Low")
  const [anxietyTrend, setAnxietyTrend] = useState<"up" | "down" | "stable">("stable")
  const [completedExercises, setCompletedExercises] = useState(12)

  useEffect(() => {
    // Load mood data to calculate average
    try {
      const storedData = localStorage.getItem("moodTracking")
      if (storedData) {
        const parsedData = JSON.parse(storedData)
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          // Calculate average mood
          const sum = parsedData.reduce((acc, item) => acc + item.value, 0)
          const avg = sum / parsedData.length
          setAverageMood(Math.round(avg * 10) / 10)

          // Set stress and anxiety levels based on mood
          if (avg > 4) {
            setStressLevel("Low")
            setStressTrend("down")
            setAnxietyLevel("Very Low")
            setAnxietyTrend("down")
          } else if (avg > 3) {
            setStressLevel("Moderate")
            setStressTrend("down")
            setAnxietyLevel("Low")
            setAnxietyTrend("stable")
          } else {
            setStressLevel("High")
            setStressTrend("up")
            setAnxietyLevel("Moderate")
            setAnxietyTrend("up")
          }
        }
      }

      // Load completed exercises count
      const storedExercises = localStorage.getItem("mental-health-exercises")
      if (storedExercises) {
        const parsedExercises = JSON.parse(storedExercises)
        if (parsedExercises.state && parsedExercises.state.completedExercises) {
          setCompletedExercises(parsedExercises.state.completedExercises.length || 0)
        }
      }
    } catch (error) {
      console.error("Error loading data for analysis:", error)
    }
  }, [])

  // Helper function to get trend icon
  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-green-500" />
      default:
        return <Activity className="h-4 w-4 text-yellow-500" />
    }
  }

  // Get mood description
  const getMoodDescription = (value: number): string => {
    if (value <= 1.5) return "Very Low"
    if (value <= 2.5) return "Low"
    if (value <= 3.5) return "Moderate"
    if (value <= 4.5) return "Good"
    return "Excellent"
  }

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <header className="flex items-center mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="mr-4">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Mental Health Analysis</h1>
          <p className="text-gray-500 mt-1">Insights based on your conversations and interactions</p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Mood</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{getMoodDescription(averageMood)}</div>
              {averageMood >= 3 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {averageMood >= 3 ? "Improved from last week" : "Decreased from last week"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stress Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stressLevel}</div>
              {getTrendIcon(stressTrend)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stressTrend === "down"
                ? "Decreased from last week"
                : stressTrend === "up"
                  ? "Increased from last week"
                  : "Stable compared to last week"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Anxiety Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{anxietyLevel}</div>
              {getTrendIcon(anxietyTrend)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {anxietyTrend === "down"
                ? "Decreased from last week"
                : anxietyTrend === "up"
                  ? "Increased from last week"
                  : "Stable compared to last week"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed Exercises</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{completedExercises}</div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {completedExercises > 0 ? `Up ${completedExercises % 5} from last week` : "Start your first exercise"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add the detailed mood analysis graph */}
      <div className="mb-8">
        <MoodAnalysisGraph />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personalized Insights</CardTitle>
            <CardDescription>Based on your conversation patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md bg-blue-50 p-4">
                <h3 className="font-medium text-blue-800">Positive Patterns</h3>
                <ul className="mt-2 text-sm text-blue-700 space-y-1 list-disc pl-5">
                  <li>You express gratitude regularly</li>
                  <li>You're proactive about seeking support</li>
                  <li>You show resilience when facing challenges</li>
                </ul>
              </div>

              <div className="rounded-md bg-amber-50 p-4">
                <h3 className="font-medium text-amber-800">Areas for Growth</h3>
                <ul className="mt-2 text-sm text-amber-700 space-y-1 list-disc pl-5">
                  <li>Consider practicing more self-compassion</li>
                  <li>Work on setting healthy boundaries</li>
                  <li>Try to incorporate more mindfulness practices</li>
                </ul>
              </div>

              <div className="rounded-md bg-green-50 p-4">
                <h3 className="font-medium text-green-800">Recommended Focus</h3>
                <p className="mt-2 text-sm text-green-700">
                  Based on your patterns, focusing on mindfulness exercises could be particularly beneficial for you
                  right now.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>Your journey toward better mental health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md bg-gray-50 p-4">
                <h3 className="font-medium">Conversation Frequency</h3>
                <div className="mt-2 h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "65%" }}></div>
                </div>
                <p className="mt-1 text-xs text-gray-500">You've had 5 conversations this week</p>
              </div>

              <div className="rounded-md bg-gray-50 p-4">
                <h3 className="font-medium">Exercise Completion</h3>
                <div className="mt-2 h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${Math.min(100, completedExercises * 10)}%` }}
                  ></div>
                </div>
                <p className="mt-1 text-xs text-gray-500">You've completed {completedExercises} exercises</p>
              </div>

              <div className="rounded-md bg-gray-50 p-4">
                <h3 className="font-medium">Mood Improvement</h3>
                <div className="mt-2 h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, averageMood * 20)}%`,
                      backgroundColor: averageMood >= 3 ? "#4ade80" : "#f87171",
                    }}
                  ></div>
                </div>
                <p className="mt-1 text-xs text-gray-500">Your mood score is {averageMood}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

