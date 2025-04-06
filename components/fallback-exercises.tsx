import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Dumbbell } from "lucide-react"

// Default exercises to show if the store fails
const FALLBACK_EXERCISES = [
  {
    id: "fallback-1",
    name: "Deep Breathing",
    description: "Simple breathing exercise for immediate stress relief",
    duration: "3 mins",
    category: "Relaxation",
    steps: [
      "Sit comfortably with your back straight",
      "Breathe in deeply through your nose for 4 counts",
      "Hold your breath for 2 counts",
      "Exhale slowly through your mouth for 6 counts",
      "Repeat 10 times",
    ],
  },
  {
    id: "fallback-2",
    name: "Mindful Walking",
    description: "A walking meditation to clear your mind",
    duration: "10 mins",
    category: "Mindfulness",
    steps: [
      "Find a quiet place to walk",
      "Walk at a natural pace",
      "Focus on the sensation of your feet touching the ground",
      "When your mind wanders, gently bring it back to your walking",
      "Continue for 10 minutes",
    ],
  },
  {
    id: "fallback-3",
    name: "Gratitude Practice",
    description: "Shift focus to positive aspects of your life",
    duration: "5 mins",
    category: "Cognitive",
    steps: [
      "Find a quiet place to sit",
      "Think of three things you're grateful for today",
      "For each item, reflect on why it brings you joy",
      "Write these down if possible",
      "Review your list when feeling low",
    ],
  },
]

export function FallbackExercises() {
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
          <p className="text-gray-500 mt-1">Basic exercises to improve your mental wellbeing</p>
        </div>
      </header>

      <div className="mb-6">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800">
            We're experiencing some technical difficulties loading your personalized exercises. Here are some general
            exercises that can help in the meantime.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {FALLBACK_EXERCISES.map((exercise) => (
          <Card key={exercise.id}>
            <CardHeader>
              <CardTitle>{exercise.name}</CardTitle>
              <CardDescription>{exercise.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Dumbbell className="mr-1 h-4 w-4" />
                  {exercise.category}
                </div>
                <div>{exercise.duration}</div>
              </div>

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
              <Button variant="outline" className="w-full">
                Start Exercise
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  )
}

