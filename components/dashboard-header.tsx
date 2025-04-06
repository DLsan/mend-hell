import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Mental Wellness Dashboard</h1>
        <p className="text-gray-500 mt-1">Track your progress and find resources to support your mental health</p>
      </div>
      <Link href="/">
        <Button variant="ghost" size="icon">
          <Home className="h-5 w-5" />
          <span className="sr-only">Home</span>
        </Button>
      </Link>
    </header>
  )
}

