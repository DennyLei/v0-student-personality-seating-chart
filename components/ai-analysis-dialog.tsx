"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Brain, BookOpen, Users, Target, AlertCircle, TrendingUp, Award } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StudentAssessment {
  id: string
  student_id: string
  personality_type: string
  learning_style: string
  social_preference: string
  focus_level: string
  noise_tolerance: string
  movement_needs: string
  peer_interaction: string
  special_needs: string | null
  profiles: {
    first_name: string | null
    last_name: string | null
    email: string
  }
}

interface AIAnalysisDialogProps {
  studentData: StudentAssessment
  children: React.ReactNode
}

export function AIAnalysisDialog({ studentData, children }: AIAnalysisDialogProps) {
  const [analysis, setAnalysis] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)

  const getStudentName = () => {
    if (studentData.profiles?.first_name && studentData.profiles?.last_name) {
      return `${studentData.profiles.first_name} ${studentData.profiles.last_name}`
    }
    return studentData.profiles?.email?.split("@")[0] || "Student"
  }

  const generateAnalysis = async () => {
    setIsLoading(true)
    setLoadingProgress(0)

    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => Math.min(prev + 10, 90))
    }, 200)

    try {
      console.log("[v0] Starting AI analysis request")

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch("/api/ai-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentData }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      clearInterval(progressInterval)
      setLoadingProgress(100)

      if (!response.ok) {
        throw new Error("Failed to generate analysis")
      }

      const data = await response.json()
      setAnalysis(data.analysis)
      console.log("[v0] AI analysis completed successfully")
    } catch (error) {
      clearInterval(progressInterval)
      console.error("[v0] Error generating analysis:", error)
      if (error.name === "AbortError") {
        setAnalysis("Request timed out. The AI analysis is taking longer than expected. Please try again.")
      } else {
        setAnalysis("Sorry, there was an error generating the analysis. Please try again.")
      }
    } finally {
      setIsLoading(false)
      setLoadingProgress(0)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open && !analysis && !isLoading) {
      generateAnalysis()
    }
  }

  const formatAnalysis = (text: string) => {
    const sections = text.split(/\d+\.\s+/).filter(Boolean)
    const icons = [BookOpen, Target, Users, AlertCircle, Users, TrendingUp, Award]

    return sections.map((section, index) => {
      const [title, ...content] = section.split(":")
      const Icon = icons[index] || BookOpen

      return (
        <Card key={index} className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Icon className="w-5 h-5 text-purple-600" />
              {title.trim()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {content.join(":").trim()}
            </div>
          </CardContent>
        </Card>
      )
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Teaching Analysis for {getStudentName()}
          </DialogTitle>
          <DialogDescription>
            Personalized teaching strategies and recommendations based on assessment data
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Analyzing student profile and generating recommendations...
                </p>
                <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">{loadingProgress}% complete</p>
              </div>
            </div>
          ) : analysis ? (
            <div className="space-y-4">{formatAnalysis(analysis)}</div>
          ) : (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Click to generate AI analysis for this student</p>
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
          {analysis && (
            <Button onClick={generateAnalysis} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Regenerate Analysis
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
