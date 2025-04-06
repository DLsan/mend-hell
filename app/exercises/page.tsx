"use client"

import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Dumbbell, Clock, BookOpen, Check } from "lucide-react"
import { useExerciseStore } from "@/store/exercise-store"
import { FallbackExercises } from "@/components/fallback-exercises"

export default function ExercisesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [filter, setFilter] = useState<string>("all") // "all", "recommended", or a category

  // Fetch store values using useCallback to prevent unnecessary re-renders
  const allExercises = useExerciseStore(useCallback((state) => state.allExercises, []))
  const recommendedExercises = useExerciseStore(useCallback((state) => state.recommendedExercises, []))
  const completedExercises = useExerciseStore(useCallback((state) => state.completedExercises, []))
  const markExerciseCompleted = useExerciseStore(useCallback((state) => state.markExerciseCompleted, []))

  useEffect(() => {
    // Simulate loading and check for errors
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // If there's an error or still loading, show appropriate UI
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4">Loading exercises...</p>
        </div>
      </div>
    )
  }

  if (hasError || allExercises.length === 0) {
    return <FallbackExercises />
  }

  // Get unique categories
  const categories = Array.from(new Set(allExercises.map((ex) => ex.category)))

  // Filter exercises based on selected filter
  const filteredExercises = allExercises.filter((exercise) => {
    if (filter === "all") return true
    if (filter === "recommended") {
      return recommendedExercises.some((rec) => rec.id === exercise.id)
    }
    return exercise.category === filter
  })

  // Sort exercises: recommended first, then by priority
  const sortedExercises = [...filteredExercises].sort((a, b) => {
    const aIsRecommended = recommendedExercises.some((rec) => rec.id === a.id)
    const bIsRecommended = recommendedExercises.some((rec) => rec.id === b.id)

    if (aIsRecommended && !bIsRecommended) return -1
    if (!aIsRecommended && bIsRecommended) return 1

    return (b.priority || 0) - (a.priority || 0)
  })

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
          <h1 className="text-3xl font-bold">Mental Wellness Exercises</h1>
          <p className="text-gray-500 mt-1">Explore exercises designed to improve your mental wellbeing</p>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
          All Exercises
        </Button>
        <Button
          variant={filter === "recommended" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("recommended")}
          className={recommendedExercises.length > 0 ? "bg-green-600 hover:bg-green-700" : ""}
        >
          Recommended For You
          {recommendedExercises.length > 0 && (
            <span className="ml-2 rounded-full bg-white text-green-600 w-5 h-5 flex items-center justify-center text-xs">
              {recommendedExercises.length}
            </span>
          )}
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={filter === category ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedExercises.map((exercise) => {
          const isRecommended = recommendedExercises.some((rec) => rec.id === exercise.id)
          const isCompleted = completedExercises.has(exercise.id)

          return (
            <Card key={exercise.id} className={isRecommended ? "border-green-300 shadow-md" : ""}>
              <CardHeader className="relative">
                {isRecommended && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Recommended
                  </div>
                )}
                <CardTitle>{exercise.name}</CardTitle>
                <CardDescription>{exercise.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {exercise.duration}
                  </div>
                  <div className="flex items-center">
                    <Dumbbell className="mr-1 h-4 w-4" />
                    {exercise.category}
                  </div>
                </div>

                {exercise.mentalHealthTargets && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Targets:</h4>
                    <div className="flex flex-wrap gap-1">
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
                )}

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Steps:</h4>
                  <ol className="list-decimal pl-5 text-sm space-y-1">
                    {exercise.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant={isCompleted ? "outline" : "default"}
                  className={`w-full ${isCompleted ? "bg-green-50 text-green-700 border-green-300" : ""}`}
                  onClick={() => markExerciseCompleted(exercise.id)}
                >
                  {isCompleted ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Completed
                    </>
                  ) : (
                    <>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Start Exercise
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </main>
  )
}

