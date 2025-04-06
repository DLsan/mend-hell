import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Dumbbell, BarChart2 } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { MoodTracker } from "@/components/mood-tracker"
import { RecentExercises } from "@/components/recent-exercises"
import { MoodAnalysisGraph } from "@/components/mood-analysis-graph"

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <DashboardHeader />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Mental Wellness</CardTitle>
            <CardDescription>Your recent mood patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <MoodTracker />
            <div className="mt-4 flex justify-end">
              <Link href="/analysis">
                <Button variant="outline" size="sm">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  View Full Analysis
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Talk to Someone</CardTitle>
            <CardDescription>Chat with your AI wellness companion</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 pt-6">
            <MessageCircle className="h-12 w-12 text-blue-500" />
            <p className="text-center text-sm text-gray-500">
              Sometimes it helps to talk through what you're feeling. Your AI friend is here to listen.
            </p>
            <Link href="/" className="w-full">
              <Button className="w-full">
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat Now
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Wellness Exercises</CardTitle>
            <CardDescription>Recommended activities for you</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentExercises />
            <div className="mt-4 flex justify-end">
              <Link href="/exercises">
                <Button variant="outline" size="sm">
                  <Dumbbell className="mr-2 h-4 w-4" />
                  View All Exercises
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add the new Mood Analysis Graph section */}
      <div className="mt-8">
        <MoodAnalysisGraph />
      </div>
    </main>
  )
}

