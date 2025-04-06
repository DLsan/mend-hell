"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"

// Define exercise types for better typing
export type Exercise = {
  id: string
  name: string
  description: string
  duration: string
  category: string
  steps: string[]
  mentalHealthTargets: string[] // e.g., ["anxiety", "stress", "depression"]
  priority: number // 1-5, with 5 being highest priority
}

// Default exercise to return if generation fails
const DEFAULT_EXERCISE: Exercise = {
  id: "default-exercise",
  name: "Simple Breathing Exercise",
  description: "A quick breathing technique to reduce stress and anxiety",
  duration: "5 mins",
  category: "Relaxation",
  steps: [
    "Find a comfortable seated position",
    "Breathe in through your nose for 4 counts",
    "Hold for 2 counts",
    "Exhale through your mouth for 6 counts",
    "Repeat for 5 minutes",
  ],
  mentalHealthTargets: ["anxiety", "stress"],
  priority: 3,
}

// Function to analyze mental health based on conversation
export async function analyzeAndRespond(messages: { role: string; content: string }[]) {
  try {
    // Extract the latest user message
    const latestUserMessage = messages
      .filter((msg) => msg.role === "user")
      .map((msg) => msg.content)
      .slice(-3) // Only use the last 3 messages for faster processing
      .join("\n")

    // Safety check - if no user message, return default response
    if (!latestUserMessage) {
      return {
        response: "I'm here to help. How are you feeling today?",
        analysis: "No user message detected",
        recommendedExercises: [DEFAULT_EXERCISE],
      }
    }

    // Initialize the Google Generative AI client
    // Make sure the API key is properly set
    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      console.error("Missing Google API Key")
      return {
        response: "I'm having trouble connecting to my services. Please make sure the API key is configured correctly.",
        analysis: "API key missing",
        recommendedExercises: [DEFAULT_EXERCISE],
      }
    }

    // Initialize the Gemini API with the correct configuration
    const genAI = new GoogleGenerativeAI(apiKey)

    // Use gemini-1.5-flash model which is more reliable for this use case
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    })

    // Simple prompt for faster response
    const simplePrompt = `
      You are a mental health chatbot. Analyze this message briefly and respond supportively:
      "${latestUserMessage}"
      
      Format your response as:
      ANALYSIS: [brief analysis of the user's mental state, including any signs of anxiety, depression, stress, etc.]
      RESPONSE: [supportive response to the user]
    `

    // Set a timeout for the API call
    let result
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out")), 10000) // 10 second timeout
      })

      // Make the API call with timeout
      const resultPromise = model.generateContent(simplePrompt)
      result = (await Promise.race([resultPromise, timeoutPromise])) as any
    } catch (timeoutError) {
      console.error("API call timed out or failed:", timeoutError)
      return {
        response: "I'm thinking about what you said. In the meantime, how has your day been going?",
        analysis: "API timeout or failure",
        recommendedExercises: [DEFAULT_EXERCISE],
      }
    }

    // Get the response text
    let fullText
    try {
      fullText = result.response.text()
    } catch (textError) {
      console.error("Error getting response text:", textError)
      return {
        response: "I'm here to support you. Would you like to talk about what's on your mind?",
        analysis: "Text extraction error",
        recommendedExercises: [DEFAULT_EXERCISE],
      }
    }

    // Parse the response
    let analysis = ""
    let response = ""

    try {
      // Extract analysis
      const analysisMatch = fullText.match(/ANALYSIS:(.*?)RESPONSE:/s)
      if (analysisMatch && analysisMatch[1]) {
        analysis = analysisMatch[1].trim()
      } else {
        analysis = "Analysis not available"
      }

      // Extract response
      const responseMatch = fullText.match(/RESPONSE:(.*)/s)
      if (responseMatch && responseMatch[1]) {
        response = responseMatch[1].trim()
      } else {
        // Fallback if format is not followed
        response = fullText.trim()
      }
    } catch (parseError) {
      console.error("Error parsing response:", parseError)
      analysis = "Parsing error"
      response = "I'm listening. Tell me more about how you're feeling."
    }

    // Create a simple exercise recommendation based on the analysis
    let recommendedExercise: Exercise = {
      ...DEFAULT_EXERCISE,
      id: `rec-${Date.now()}`,
    }

    // Determine exercise type based on keywords in analysis
    if (analysis.toLowerCase().includes("anxiety") || analysis.toLowerCase().includes("worry")) {
      recommendedExercise = {
        id: `rec-${Date.now()}`,
        name: "Grounding Technique",
        description: "A simple exercise to reduce anxiety by connecting with your senses",
        duration: "3 mins",
        category: "Mindfulness",
        steps: [
          "Name 5 things you can see",
          "Name 4 things you can touch",
          "Name 3 things you can hear",
          "Name 2 things you can smell",
          "Name 1 thing you can taste",
        ],
        mentalHealthTargets: ["anxiety", "panic", "stress"],
        priority: 4,
      }
    } else if (analysis.toLowerCase().includes("depress") || analysis.toLowerCase().includes("sad")) {
      recommendedExercise = {
        id: `rec-${Date.now()}`,
        name: "Gratitude Practice",
        description: "Focus on positive aspects to improve mood",
        duration: "5 mins",
        category: "Cognitive",
        steps: [
          "Find a quiet place to sit",
          "Think of three things you're grateful for today",
          "For each item, reflect on why it brings you joy",
          "Write these down if possible",
          "Review your list when feeling low",
        ],
        mentalHealthTargets: ["depression", "negative thinking", "low mood"],
        priority: 4,
      }
    } else if (analysis.toLowerCase().includes("stress") || analysis.toLowerCase().includes("overwhelm")) {
      recommendedExercise = {
        id: `rec-${Date.now()}`,
        name: "Progressive Muscle Relaxation",
        description: "Release physical tension to reduce stress",
        duration: "10 mins",
        category: "Relaxation",
        steps: [
          "Find a comfortable position sitting or lying down",
          "Starting with your feet, tense the muscles for 5 seconds",
          "Release and notice the feeling of relaxation",
          "Move up through each muscle group in your body",
          "Breathe deeply throughout the exercise",
        ],
        mentalHealthTargets: ["stress", "physical tension", "anxiety"],
        priority: 4,
      }
    }

    // Update mood tracking data
    await updateMoodTracking(analysis)

    return {
      response,
      analysis,
      recommendedExercises: [recommendedExercise],
    }
  } catch (error) {
    console.error("Unexpected error in AI processing:", error)
    return {
      response: "I'm here to support you. How can I help today?",
      analysis: "Unexpected error occurred",
      recommendedExercises: [DEFAULT_EXERCISE],
    }
  }
}

// Function to update mood tracking data
async function updateMoodTracking(analysis: string) {
  try {
    // Determine mood score based on analysis (1-5 scale)
    let moodScore = 3 // Default neutral mood

    const lowerAnalysis = analysis.toLowerCase()

    // Very negative indicators
    if (
      lowerAnalysis.includes("severe depression") ||
      lowerAnalysis.includes("suicidal") ||
      lowerAnalysis.includes("extremely anxious")
    ) {
      moodScore = 1
    }
    // Negative indicators
    else if (
      lowerAnalysis.includes("depression") ||
      lowerAnalysis.includes("anxiety") ||
      lowerAnalysis.includes("stressed") ||
      lowerAnalysis.includes("sad") ||
      lowerAnalysis.includes("upset")
    ) {
      moodScore = 2
    }
    // Positive indicators
    else if (
      lowerAnalysis.includes("happy") ||
      lowerAnalysis.includes("good mood") ||
      lowerAnalysis.includes("positive") ||
      lowerAnalysis.includes("content")
    ) {
      moodScore = 4
    }
    // Very positive indicators
    else if (
      lowerAnalysis.includes("very happy") ||
      lowerAnalysis.includes("excellent") ||
      lowerAnalysis.includes("great mood") ||
      lowerAnalysis.includes("joyful")
    ) {
      moodScore = 5
    }

    // In a production app, you would save this to a database
    // For now, we'll use localStorage in the client component

    return moodScore
  } catch (error) {
    console.error("Error updating mood tracking:", error)
    return 3 // Default neutral mood
  }
}

