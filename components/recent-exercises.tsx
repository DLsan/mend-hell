"use client"

import { useExerciseStore } from "@/store/exercise-store"
import { Check } from "lucide-react"
import Link from "next/link"

export function RecentExercises() {
  const { recommendedExercises, completedExercises, markExerciseCompleted } = useExerciseStore()

  // Get top 3 recommended exercises by priority
  const topExercises = [...recommendedExercises].sort((a, b) => b.priority - a.priority).slice(0, 3)

  // If no recommended exercises yet, show a message
  if (topExercises.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-gray-500">
        <p>Chat with your AI companion to get personalized exercise recommendations.</p>
        <Link href="/" className="text-blue-500 hover:underline mt-2 inline-block">
          Start a conversation
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {topExercises.map((exercise) => {
        const isCompleted = completedExercises.has(exercise.id)

        return (
          <div key={exercise.id} className="flex items-start space-x-3 rounded-md border p-3">
            <button
              onClick={() => markExerciseCompleted(exercise.id)}
              className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${
                isCompleted ? "bg-green-500" : "border border-gray-300"
              }`}
            >
              {isCompleted && <Check className="h-3 w-3 text-white" />}
            </button>
            <div>
              <h4 className="text-sm font-medium">{exercise.name}</h4>
              <p className="text-xs text-gray-500">{exercise.description}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {exercise.mentalHealthTargets.map((target, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
                  >
                    {target}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

