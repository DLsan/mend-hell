"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function ApiSetup() {
  const [apiKey, setApiKey] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!apiKey.trim()) return

    setIsSubmitting(true)

    try {
      // Store the API key in localStorage
      localStorage.setItem("AIzaSyDduaIWWDqwwXmXSLKNeYPoD0UbphoU4HI", apiKey)

      // Also set a flag in sessionStorage to indicate we have the key
      sessionStorage.setItem("HAS_API_KEY", "true")

      setSuccess(true)

      // Reload the page after 1.5 seconds
      setTimeout(() => {
        window.location.href = "/"
      }, 1500)
    } catch (error) {
      console.error("Error saving API key:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <CardTitle>Set Up Google Gemini API</CardTitle>
          <CardDescription>You need to provide a Google Gemini API key to use this application.</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center py-4">
              <p className="text-green-600 mb-2">API key saved successfully!</p>
              <p className="text-sm text-gray-500">Redirecting to the app...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">How to get your API key:</h3>
                  <ol className="list-decimal pl-5 text-sm space-y-1 text-gray-600">
                    <li>
                      Go to{" "}
                      <a
                        href="https://ai.google.dev/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Google AI Studio
                      </a>
                    </li>
                    <li>Sign in or create an account</li>
                    <li>Navigate to the API keys section</li>
                    <li>Create a new API key</li>
                    <li>Copy and paste it below</li>
                  </ol>
                </div>

                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium mb-1">
                    Google Gemini API Key
                  </label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    required
                  />
                </div>
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter>
          {!success && (
            <Button onClick={handleSubmit} disabled={isSubmitting || !apiKey.trim()} className="w-full">
              {isSubmitting ? "Saving..." : "Save API Key"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

