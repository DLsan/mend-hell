"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Chat } from "@/components/chat"
import { Button } from "@/components/ui/button"
import { LayoutDashboard } from "lucide-react"
import ApiSetup from "./api-setup"

export default function Home() {
  const [hasApiKey, setHasApiKey] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if API key exists in localStorage or session
    const checkApiKey = () => {
      // First check localStorage
      const apiKey = localStorage.getItem("GOOGLE_API_KEY")
      if (apiKey) {
        setHasApiKey(true)
        // Also store in session to avoid repeated localStorage checks
        sessionStorage.setItem("HAS_API_KEY", "true")
        return
      }

      // Then check session storage
      const hasKeyInSession = sessionStorage.getItem("HAS_API_KEY") === "true"
      if (hasKeyInSession) {
        setHasApiKey(true)
        return
      }

      // If neither exists, we need the API key
      setHasApiKey(false)
    }

    checkApiKey()
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent" />
      </div>
    )
  }

  if (!hasApiKey) {
    return <ApiSetup />
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 w-full max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Mental Wellness Assistant</h1>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>
        <p className="text-center mb-8 text-gray-600">
          Chat with our AI assistant for support and mental wellness exercises
        </p>
        <Chat />
      </div>
    </main>
  )
}

