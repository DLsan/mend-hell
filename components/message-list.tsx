"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  analysis?: string
  isLoading?: boolean
}

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  const [showAnalysis, setShowAnalysis] = useState(false)

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-[80%] rounded-lg p-4 ${
              message.role === "user"
                ? "bg-blue-500 text-white"
                : message.isLoading
                  ? "bg-gray-50 text-gray-500 border border-gray-200"
                  : "bg-gray-100 text-gray-900"
            }`}
          >
            <div className="whitespace-pre-wrap">
              {message.content}
              {message.isLoading && <span className="inline-block ml-1 animate-pulse">...</span>}
            </div>

            {message.analysis && message.role === "assistant" && showAnalysis && !message.isLoading && (
              <div className="mt-2 pt-2 border-t border-gray-300 text-xs text-gray-600">
                <strong>Analysis:</strong> {message.analysis}
              </div>
            )}
          </div>
        </div>
      ))}

      {messages.some((m) => m.analysis && !m.isLoading) && (
        <div className="flex justify-center mt-4">
          <Button variant="outline" size="sm" onClick={() => setShowAnalysis(!showAnalysis)} className="text-xs">
            {showAnalysis ? (
              <>
                <EyeOff className="h-3 w-3 mr-1" /> Hide Analysis
              </>
            ) : (
              <>
                <Eye className="h-3 w-3 mr-1" /> Show Analysis
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

