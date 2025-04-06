"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Exercise } from "@/app/actions/chat"

interface ExerciseState {
  recommendedExercises: Exercise[]
  allExercises: Exercise[]
  setRecommendedExercises: (exercises: Exercise[]) => void
  addExercise: (exercise: Exercise) => void
  markExerciseCompleted: (id: string) => void
  completedExercises: Set<string>
  resetStore: () => void
}

// Default exercises that will always be available
const DEFAULT_EXERCISES: Exercise[] = [
  {
    id: "default-1",
    name: "5-Minute Breathing",
    description: "Deep breathing exercise for stress relief",
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
  },
  {
    id: "default-2",
    name: "Gratitude Journal",
    description: "Write down three things you're grateful for",
    duration: "10 mins",
    category: "Mindfulness",
    steps: [
      "Find a quiet space with minimal distractions",
      "Reflect on your day or week",
      "Write down three specific things you're grateful for",
      "For each item, write why you're grateful for it",
      "Review your entries regularly",
    ],
    mentalHealthTargets: ["depression", "negative thinking"],
    priority: 4,
  },
  {
    id: "default-3",
    name: "Progressive Relaxation",
    description: "Tense and relax each muscle group",
    duration: "15 mins",
    category: "Relaxation",
    steps: [
      "Lie down in a comfortable position",
      "Starting with your feet, tense the muscles for 5 seconds",
      "Release and notice the feeling of relaxation",
      "Move up to your calves, thighs, and so on",
      "Continue until you've relaxed your entire body",
    ],
    mentalHealthTargets: ["anxiety", "physical tension", "stress"],
    priority: 3,
  },
]

// Helper function to safely parse JSON
const safeJSONParse = (value: string) => {
  try {
    return JSON.parse(value)
  } catch (e) {
    console.error("Error parsing JSON from storage:", e)
    return null
  }
}

export const useExerciseStore = create<ExerciseState>()(
  persist(
    (set) => ({
      recommendedExercises: [],
      allExercises: [...DEFAULT_EXERCISES],
      completedExercises: new Set<string>(),

      setRecommendedExercises: (exercises) => {
        try {
          set((state) => {
            // Validate exercises
            const validExercises = exercises.filter(
              (e) => e && typeof e === "object" && e.name && e.description && e.steps && Array.isArray(e.steps),
            )

            if (validExercises.length === 0) return state

            // Merge with existing exercises, avoiding duplicates by name
            const existingNames = new Set(state.allExercises.map((e) => e.name.toLowerCase()))
            const newExercises = validExercises.filter((e) => !existingNames.has(e.name.toLowerCase()))

            return {
              recommendedExercises: validExercises,
              allExercises: [...state.allExercises, ...newExercises],
            }
          })
        } catch (error) {
          console.error("Error in setRecommendedExercises:", error)
        }
      },

      addExercise: (exercise) => {
        try {
          if (!exercise || !exercise.name || !exercise.steps) return

          set((state) => ({
            allExercises: [...state.allExercises, exercise],
          }))
        } catch (error) {
          console.error("Error in addExercise:", error)
        }
      },

      markExerciseCompleted: (id) => {
        try {
          set((state) => {
            const newCompleted = new Set(state.completedExercises)
            newCompleted.add(id)
            return { completedExercises: newCompleted }
          })
        } catch (error) {
          console.error("Error in markExerciseCompleted:", error)
        }
      },

      resetStore: () => {
        set({
          recommendedExercises: [],
          allExercises: [...DEFAULT_EXERCISES],
          completedExercises: new Set<string>(),
        })
      },
    }),
    {
      name: "mental-health-exercises",
      storage: createJSONStorage(() => {
        return {
          getItem: (name) => {
            try {
              const value = localStorage.getItem(name)
              return value ? safeJSONParse(value) : null
            } catch (e) {
              console.error("Error accessing localStorage:", e)
              return null
            }
          },
          setItem: (name, value) => {
            try {
              localStorage.setItem(name, JSON.stringify(value))
            } catch (e) {
              console.error("Error writing to localStorage:", e)
            }
          },
          removeItem: (name) => {
            try {
              localStorage.removeItem(name)
            } catch (e) {
              console.error("Error removing from localStorage:", e)
            }
          },
        }
      }),
      partialize: (state) => ({
        allExercises: state.allExercises,
        recommendedExercises: state.recommendedExercises,
        completedExercises: Array.from(state.completedExercises),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert completedExercises back to a Set
          try {
            const completedArray = state.completedExercises
            if (Array.isArray(completedArray)) {
              state.completedExercises = new Set(completedArray)
            } else {
              state.completedExercises = new Set()
            }
          } catch (e) {
            console.error("Error rehydrating storage:", e)
            state.completedExercises = new Set()
          }
        }
      },
    },
  ),
)

