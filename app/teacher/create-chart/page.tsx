"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Brain, Users, ArrowLeft, Sparkles, Save, Loader2 } from "lucide-react"
import Link from "next/link"

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

interface SeatingPosition {
  row: number
  col: number
  student_id?: string
  student_name?: string
}

export default function CreateChartPage() {
  const [chartName, setChartName] = useState("")
  const [rows, setRows] = useState(4)
  const [cols, setCols] = useState(6)
  const [assessments, setAssessments] = useState<StudentAssessment[]>([])
  const [seatingChart, setSeatingChart] = useState<SeatingPosition[]>([])
  const [aiReasoning, setAiReasoning] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchAssessments()
    initializeChart()
  }, [rows, cols])

  const fetchAssessments = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("student_assessments")
      .select(
        `
        *,
        profiles!student_assessments_student_id_fkey (
          first_name,
          last_name,
          email
        )
      `,
      )
      .order("created_at", { ascending: false })

    if (data) {
      setAssessments(data)
    }
  }

  const initializeChart = () => {
    const positions: SeatingPosition[] = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        positions.push({ row, col })
      }
    }
    setSeatingChart(positions)
  }

  const generateAISeatingChart = async () => {
    if (assessments.length === 0) {
      alert("No student assessments available to generate seating chart.")
      return
    }

    setIsGenerating(true)
    console.log("[v0] Starting seating chart generation")

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 45000) // 45 second timeout

      const response = await fetch("/api/seating-optimization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          students: assessments,
          classroomLayout: { rows, cols },
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error("Failed to generate optimized seating chart")
      }

      const optimization = await response.json()
      console.log("[v0] Seating optimization completed")

      // Clear existing assignments
      const newChart = [...seatingChart]
      newChart.forEach((pos) => {
        delete pos.student_id
        delete pos.student_name
      })

      // Apply AI-optimized assignments
      optimization.assignments.forEach((assignment: any) => {
        const position = newChart.find((p) => p.row === assignment.row && p.col === assignment.col)
        if (position) {
          const student = assessments.find((s) => s.student_id === assignment.student_id)
          if (student) {
            position.student_id = assignment.student_id
            position.student_name = getStudentName(student)
          }
        }
      })

      let reasoning = "🧠 AI Seating Optimization Results\n\n"
      reasoning += `📊 Strategy: ${optimization.overall_strategy}\n\n`

      reasoning += "🎯 Key Points:\n"
      optimization.considerations.forEach((consideration: string, index: number) => {
        reasoning += `${index + 1}. ${consideration}\n`
      })

      reasoning += "\n📍 Student Placements:\n"
      optimization.assignments.forEach((assignment: any) => {
        const student = assessments.find((s) => s.student_id === assignment.student_id)
        const studentName = student ? getStudentName(student) : "Unknown"
        reasoning += `• ${studentName} (Row ${assignment.row + 1}, Col ${assignment.col + 1}): ${assignment.reasoning}\n`
      })

      if (optimization.potential_issues.length > 0) {
        reasoning += "\n⚠️ Watch For:\n"
        optimization.potential_issues.forEach((issue: string, index: number) => {
          reasoning += `${index + 1}. ${issue}\n`
        })
      }

      reasoning += "\n💡 Teaching Tips:\n"
      optimization.recommendations.forEach((rec: string, index: number) => {
        reasoning += `${index + 1}. ${rec}\n`
      })

      reasoning += `\n✅ Placed ${optimization.assignments.length}/${assessments.length} students`

      setSeatingChart(newChart)
      setAiReasoning(reasoning)
    } catch (error) {
      console.error("[v0] Error generating seating chart:", error)
      if (error.name === "AbortError") {
        alert("Request timed out. The seating chart generation is taking longer than expected. Please try again.")
      } else {
        alert("Error generating seating chart. Please try again.")
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const getStudentName = (student: StudentAssessment) => {
    // Try first name + last name
    if (student.profiles?.first_name && student.profiles?.last_name) {
      return `${student.profiles.first_name} ${student.profiles.last_name}`
    }

    // Try just first name
    if (student.profiles?.first_name) {
      return student.profiles.first_name
    }

    // Use email username (part before @)
    if (student.profiles?.email) {
      const emailUsername = student.profiles.email.split("@")[0]
      // Capitalize first letter and replace dots/underscores with spaces
      return emailUsername
        .replace(/[._]/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    }

    return "Student"
  }

  const saveSeatingChart = async () => {
    if (!chartName.trim()) {
      alert("Please enter a chart name.")
      return
    }

    setIsSaving(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const studentAssignments = seatingChart.reduce(
        (acc, pos) => {
          if (pos.student_id) {
            acc[pos.student_id] = { row: pos.row, col: pos.col, name: pos.student_name }
          }
          return acc
        },
        {} as Record<string, any>,
      )

      const { error } = await supabase.from("seating_charts").insert({
        teacher_id: user.id,
        chart_name: chartName,
        classroom_layout: { rows, cols },
        student_assignments: studentAssignments,
        ai_reasoning: aiReasoning,
      })

      if (error) throw error

      router.push("/teacher/dashboard")
    } catch (error) {
      console.error("Error saving seating chart:", error)
      alert("Error saving seating chart. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const getPersonalityColor = (type: string) => {
    const colors = {
      analytical: "bg-blue-500",
      creative: "bg-purple-500",
      practical: "bg-green-500",
      social: "bg-orange-500",
    }
    return colors[type as keyof typeof colors] || "bg-gray-500"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/teacher/dashboard">
            <Button variant="outline" className="mb-4 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Seating Chart</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate an AI-optimized seating arrangement based on student assessments
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Chart Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="chartName">Chart Name</Label>
                  <Input
                    id="chartName"
                    placeholder="e.g., Math Class - Period 1"
                    value={chartName}
                    onChange={(e) => setChartName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rows">Rows</Label>
                    <Select value={rows.toString()} onValueChange={(value) => setRows(Number.parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[3, 4, 5, 6, 7, 8].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cols">Columns</Label>
                    <Select value={cols.toString()} onValueChange={(value) => setCols(Number.parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[4, 5, 6, 7, 8].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={generateAISeatingChart}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Smart Layout...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate AI Seating Chart
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Available Students
                </CardTitle>
                <CardDescription>{assessments.length} students with completed assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {assessments.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                    >
                      <span className="text-sm font-medium">{getStudentName(student)}</span>
                      <div className="flex gap-1">
                        <div className={`w-3 h-3 rounded-full ${getPersonalityColor(student.personality_type)}`} />
                        <Badge variant="outline" className="text-xs">
                          {student.learning_style}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seating Chart Visualization */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Classroom Layout</CardTitle>
                <CardDescription>
                  {seatingChart.filter((p) => p.student_id).length} of {assessments.length} students assigned
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 text-center">
                  <div className="inline-block bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg">
                    <span className="text-sm font-medium">Teacher's Desk</span>
                  </div>
                </div>

                <div
                  className="grid gap-2 mx-auto"
                  style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                    maxWidth: `${cols * 80}px`,
                  }}
                >
                  {seatingChart.map((position, index) => (
                    <div
                      key={index}
                      className={`
                        aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg
                        flex flex-col items-center justify-center p-2 text-xs
                        ${
                          position.student_id
                            ? "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600"
                            : "bg-gray-50 dark:bg-gray-800"
                        }
                      `}
                    >
                      {position.student_id ? (
                        <>
                          <div className="font-medium text-center leading-tight">{position.student_name}</div>
                          <div className="text-gray-500 dark:text-gray-400 mt-1">
                            {position.row + 1},{position.col + 1}
                          </div>
                        </>
                      ) : (
                        <div className="text-gray-400 dark:text-gray-500">Empty</div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {aiReasoning && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI Analysis & Reasoning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea value={aiReasoning} readOnly rows={12} className="font-mono text-sm" />
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => router.push("/teacher/dashboard")}>
                Cancel
              </Button>
              <Button onClick={saveSeatingChart} disabled={isSaving || !chartName.trim()}>
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Seating Chart
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
