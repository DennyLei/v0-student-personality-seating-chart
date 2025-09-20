import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Brain, Plus, Eye, LogOut, Settings, User } from "lucide-react"
import Link from "next/link"
import { AIAnalysisDialog } from "@/components/ai-analysis-dialog"
import { StudentDetailsDialog } from "@/components/student-details-dialog"
import { DeleteStudentButton } from "@/components/delete-student-button"
import { generateUniqueRandomName } from "@/lib/random-names"

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
  created_at: string
  profiles: {
    first_name: string | null
    last_name: string | null
    email: string
  }
}

interface SeatingChart {
  id: string
  chart_name: string
  created_at: string
  student_assignments: any
}

export default async function TeacherDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is a teacher
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "teacher") {
    redirect("/")
  }

  // Fetch student assessments
  const { data: assessments } = await supabase
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

  // Fetch seating charts
  const { data: seatingCharts } = await supabase
    .from("seating_charts")
    .select("*")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false })

  const getPersonalityColor = (type: string) => {
    const colors = {
      analytical: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      creative: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      practical: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      social: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }

  const getLearningStyleColor = (style: string) => {
    const colors = {
      visual: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      auditory: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      kinesthetic: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      reading: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    }
    return colors[style as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }

  const getStudentDisplayName = (assessment: StudentAssessment) => {
    return generateUniqueRandomName(assessment.student_id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Teacher Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage student assessments and create optimal seating arrangements
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
            <form action="/auth/signout" method="post">
              <Button
                variant="ghost"
                size="sm"
                type="submit"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </form>
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Student Assessments
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Seating Charts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Student Assessments</h2>
              <Badge variant="secondary" className="text-sm">
                {assessments?.length || 0} assessments completed
              </Badge>
            </div>

            {assessments && assessments.length > 0 ? (
              <div className="grid gap-6">
                {assessments.map((assessment: StudentAssessment) => (
                  <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{getStudentDisplayName(assessment)}</CardTitle>
                          <CardDescription>
                            Completed on {new Date(assessment.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <StudentDetailsDialog studentData={assessment}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </StudentDetailsDialog>
                          <AIAnalysisDialog studentData={assessment}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-purple-50 hover:bg-purple-100 border-purple-200"
                            >
                              <Brain className="w-4 h-4 mr-2" />
                              AI Analysis
                            </Button>
                          </AIAnalysisDialog>
                          <DeleteStudentButton
                            assessmentId={assessment.id}
                            studentName={getStudentDisplayName(assessment)}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Personality</p>
                          <Badge className={getPersonalityColor(assessment.personality_type)}>
                            {assessment.personality_type}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Learning Style</p>
                          <Badge className={getLearningStyleColor(assessment.learning_style)}>
                            {assessment.learning_style}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Social Preference</p>
                          <Badge variant="outline">{assessment.social_preference}</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Focus Level</p>
                          <Badge variant="outline">{assessment.focus_level}</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600 dark:text-gray-400">Noise Tolerance:</span>{" "}
                          {assessment.noise_tolerance}
                        </div>
                        <div>
                          <span className="font-medium text-gray-600 dark:text-gray-400">Movement Needs:</span>{" "}
                          {assessment.movement_needs}
                        </div>
                        <div>
                          <span className="font-medium text-gray-600 dark:text-gray-400">Peer Interaction:</span>{" "}
                          {assessment.peer_interaction}
                        </div>
                      </div>

                      {assessment.special_needs && (
                        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                            Special Considerations:
                          </p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">{assessment.special_needs}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No assessments yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Students haven't completed their assessments yet. Share the assessment link with your students.
                  </p>
                  <Button variant="outline">Share Assessment Link</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Seating Charts</h2>
              <Link href="/teacher/create-chart">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Chart
                </Button>
              </Link>
            </div>

            {seatingCharts && seatingCharts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {seatingCharts.map((chart: SeatingChart) => (
                  <Card key={chart.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{chart.chart_name}</CardTitle>
                      <CardDescription>Created on {new Date(chart.created_at).toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary">
                          {Object.keys(chart.student_assignments || {}).length} students assigned
                        </Badge>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No seating charts yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Create your first AI-powered seating chart based on student assessments.
                  </p>
                  <Link href="/teacher/create-chart">
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Chart
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
