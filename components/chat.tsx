"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageList } from "@/components/message-list"
import { analyzeAndRespond } from "@/app/actions/chat"
import { Send } from 'lucide-react'
import { useExerciseStore } from "@/store/exercise-store"
import { updateMoodData } from "@/lib/mood-utils"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  analysis?: string
  isLoading?: boolean
}

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi there! I'm your mental wellness assistant. How are you feeling today? We can chat about anything that's on your mind, and I can suggest some exercises that might help you feel better.",
}

// Quick responses to show while waiting for the full AI response
const QUICK_RESPONSES = [
  "I'm listening...",
  "I'm here with you...",
  "I understand...",
  "I'm here to help...",
  "Let me think about that..."
];

// Function to analyze text and determine mood score
function analyzeMoodFromText(analysis: string): number {
  try {
    // Determine mood score based on analysis (1-5 scale)
    let moodScore = 3; // Default neutral mood
    
    const lowerAnalysis = analysis.toLowerCase();
    
    // Very negative indicators
    if (
      lowerAnalysis.includes("severe depression") || 
      lowerAnalysis.includes("suicidal") || 
      lowerAnalysis.includes("extremely anxious")
    ) {
      moodScore = 1;
    } 
    // Negative indicators
    else if (
      lowerAnalysis.includes("depression") || 
      lowerAnalysis.includes("anxiety") || 
      lowerAnalysis.includes("stressed") ||
      lowerAnalysis.includes("sad") ||
      lowerAnalysis.includes("upset")
    ) {
      moodScore = 2;
    } 
    // Positive indicators
    else if (
      lowerAnalysis.includes("happy") || 
      lowerAnalysis.includes("good mood") || 
      lowerAnalysis.includes("positive") ||
      lowerAnalysis.includes("content")
    ) {
      moodScore = 4;
    } 
    // Very positive indicators
    else if (
      lowerAnalysis.includes("very happy") || 
      lowerAnalysis.includes("excellent") || 
      lowerAnalysis.includes("great mood") ||
      lowerAnalysis.includes("joyful")
    ) {
      moodScore = 5;
    }
    
    return moodScore;
  } catch (error) {
    console.error("Error analyzing mood:", error);
    return 3; // Default neutral mood
  }
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const setRecommendedExercises = useExerciseStore(state => state.setRecommendedExercises)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    setError(null)

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    // Add a temporary loading message from the assistant
    const loadingMessage: Message = {
      id: `loading-${Date.now()}`,
      role: "assistant",
      content: QUICK_RESPONSES[Math.floor(Math.random() * QUICK_RESPONSES.length)],
      isLoading: true
    }

    setMessages((prev) => [...prev, userMessage, loadingMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Format messages for the AI (excluding the loading message)
      const messageHistory = messages
        .filter(msg => !msg.isLoading)
        .concat(userMessage)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      // Get API key from localStorage
      const apiKey = localStorage.getItem("GOOGLE_API_KEY");
      if (!apiKey) {
        throw new Error("API key not found");
      }

      // Get AI response with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const { response, analysis, recommendedExercises } = await analyzeAndRespond(messageHistory);
      clearTimeout(timeoutId);

      // Update mood tracking based on analysis
      if (analysis) {
        const moodScore = analyzeMoodFromText(analysis);
        updateMoodData(moodScore);
      }

      // Store recommended exercises if available
      if (recommendedExercises && recommendedExercises.length > 0) {
        try {
          setRecommendedExercises(recommendedExercises);
        } catch (storeError) {
          console.error("Error storing exercises:", storeError);
        }
      }

      // Replace loading message with actual response
      setMessages((prev) => {
        const filtered = prev.filter(msg => msg.id !== loadingMessage.id);
        return [...filtered, {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response || "I'm here to help. What's on your mind?",
          analysis: analysis || "Analysis not available",
        }];
      });
    } catch (error) {
      console.error("Error getting response:", error);
      setError("Something went wrong. Please try again.");

      // Replace loading message with error message
      setMessages((prev) => {
        const filtered = prev.filter(msg => msg.id !== loadingMessage.id);
        return [...filtered, {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I'm having trouble connecting right now. Could you try again in a moment?",
        }];
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="flex flex-col h-[600px] w-full">
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={messages} />
        {error && (
          <div className="text-center mt-2">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  )
}

