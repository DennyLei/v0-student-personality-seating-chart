"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface AssessmentData {
  personalityType: string
  learningStyle: string
  socialPreference: string
  focusLevel: string
  noiseTolerance: string
  movementNeeds: string
  peerInteraction: string
  specialNeeds: string
}

const questions = [
  {
    id: "personalityType",
    title: "What describes you best?",
    options: [
      { value: "analytical", label: "Analytical - I like to think things through carefully" },
      { value: "creative", label: "Creative - I enjoy coming up with new ideas" },
      { value: "practical", label: "Practical - I prefer hands-on activities" },
      { value: "social", label: "Social - I learn best when working with others" },
    ],
  },
  {
    id: "learningStyle",
    title: "How do you learn best?",
    options: [
      { value: "visual", label: "Visual - I understand better with pictures and diagrams" },
      { value: "auditory", label: "Auditory - I learn by listening and discussing" },
      { value: "kinesthetic", label: "Kinesthetic - I need to move and touch things to learn" },
      { value: "reading", label: "Reading/Writing - I prefer text and written materials" },
    ],
  },
  {
    id: "socialPreference",
    title: "When working on projects, you prefer to:",
    options: [
      { value: "collaborative", label: "Work in groups and share ideas" },
      { value: "independent", label: "Work alone and focus independently" },
      { value: "mixed", label: "Mix of both depending on the task" },
    ],
  },
  {
    id: "focusLevel",
    title: "How would you rate your ability to focus?",
    options: [
      { value: "high", label: "High - I can concentrate for long periods" },
      { value: "medium", label: "Medium - I focus well with occasional breaks" },
      { value: "low", label: "Low - I need frequent breaks and variety" },
    ],
  },
  {
    id: "noiseTolerance",
    title: "How do you handle noise while learning?",
    options: [
      { value: "high", label: "High - Background noise doesn't bother me" },
      { value: "medium", label: "Medium - Some noise is okay, but not too much" },
      { value: "low", label: "Low - I need quiet environments to concentrate" },
    ],
  },
  {
    id: "movementNeeds",
    title: "Do you need to move while learning?",
    options: [
      { value: "high", label: "High - I need to move around frequently" },
      { value: "medium", label: "Medium - Occasional movement helps me focus" },
      { value: "low", label: "Low - I prefer to sit still while learning" },
    ],
  },
  {
    id: "peerInteraction",
    title: "In social situations, you tend to be:",
    options: [
      { value: "extroverted", label: "Extroverted - I enjoy meeting new people and being social" },
      { value: "introverted", label: "Introverted - I prefer smaller groups and quiet activities" },
      { value: "balanced", label: "Balanced - I adapt to different social situations" },
    ],
  },
]

export default function AssessmentPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Partial<AssessmentData>>({})
  const [specialNeeds, setSpecialNeeds] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const totalSteps = questions.length + 1 // +1 for special needs step
  const progress = ((currentQuestion + 1) / totalSteps) * 100

  const handleAnswer = (value: string) => {
    const questionId = questions[currentQuestion].id as keyof AssessmentData
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length) {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const submitAssessment = async () => {
    setIsSubmitting(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const assessmentData = {
        student_id: user.id,
        personality_type: answers.personalityType || "",
        learning_style: answers.learningStyle || "",
        social_preference: answers.socialPreference || "",
        focus_level: answers.focusLevel || "",
        noise_tolerance: answers.noiseTolerance || "",
        movement_needs: answers.movementNeeds || "",
        peer_interaction: answers.peerInteraction || "",
        special_needs: specialNeeds,
        assessment_data: answers,
      }

      const { error } = await supabase.from("student_assessments").insert(assessmentData)

      if (error) throw error

      router.push("/student/assessment/success")
    } catch (error) {
      console.error("Error submitting assessment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isSpecialNeedsStep = currentQuestion === questions.length
  const currentQ = questions[currentQuestion]
  const currentAnswer = currentQ ? answers[currentQ.id as keyof AssessmentData] : ""

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Learning Style Assessment</h1>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentQuestion + 1} of {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {!isSpecialNeedsStep ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{currentQ.title}</CardTitle>
              <CardDescription>Choose the option that best describes you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={currentAnswer || ""} onValueChange={handleAnswer}>
                {currentQ.options.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer leading-relaxed">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={prevQuestion} disabled={currentQuestion === 0}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button onClick={nextQuestion} disabled={!currentAnswer}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Is there anything else your teacher should know about your learning needs?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Textarea
                placeholder="Any special accommodations, preferences, or additional information..."
                value={specialNeeds}
                onChange={(e) => setSpecialNeeds(e.target.value)}
                rows={4}
              />

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevQuestion}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button onClick={submitAssessment} disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Complete Assessment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
