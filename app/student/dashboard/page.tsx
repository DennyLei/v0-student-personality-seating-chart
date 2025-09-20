"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { BookOpen, CheckCircle, User, Settings, Bell, Calendar, FileText, Users, Plus, LogOut } from "lucide-react"

interface StudentProfile {
  id: string
  full_name: string
  email: string
  role: string
}

interface Assessment {
  id: string
  personality_type: string
  learning_style: string
  social_preference: string
  created_at: string
}

export default function StudentDashboard() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Load profile
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (profileData) {
        setProfile(profileData)
      }

      // Load assessment
      const { data: assessmentData } = await supabase
        .from("student_assessments")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (assessmentData) {
        setAssessment(assessmentData)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Classroom</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Student Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
              >
                <LogOut className="w-4 h-4" />
              </Button>
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {profile?.full_name || "Student"}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Here's what's happening in your classroom today.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Assessment Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Learning Assessment
                  </CardTitle>
                  {assessment && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      Completed
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {assessment ? (
                  <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      Great job! You completed your learning style assessment. Your teacher can now use this information
                      to create optimal seating arrangements.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Personality Type</p>
                        <p className="text-blue-700 dark:text-blue-300 capitalize">{assessment.personality_type}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">Learning Style</p>
                        <p className="text-green-700 dark:text-green-300 capitalize">{assessment.learning_style}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => router.push("/student/assessment")}>
                        Retake Assessment
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      Complete your learning style assessment to help your teacher create the best seating arrangement
                      for you.
                    </p>
                    <Button onClick={() => router.push("/student/assessment")}>Start Assessment</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Classroom Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Today's Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Morning Circle Time</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">9:00 AM - 9:30 AM</p>
                    </div>
                    <Badge variant="outline">Upcoming</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Math Lesson</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">10:00 AM - 11:00 AM</p>
                    </div>
                    <Badge variant="outline">In Progress</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Reading Time</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">11:30 AM - 12:30 PM</p>
                    </div>
                    <Badge variant="secondary">Later</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Work */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Recent Work
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Learning Style Assessment</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Completed today</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Complete
                    </Badge>
                  </div>
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>More assignments will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/student/assessment")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Take Assessment
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Schedule
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Users className="w-4 h-4 mr-2" />
                  Class Directory
                </Button>
              </CardContent>
            </Card>

            {/* Announcements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Announcements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Welcome to Class!</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Complete your learning assessment to help create the perfect classroom environment.
                    </p>
                  </div>
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    <p className="text-sm">No new announcements</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Class Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Class Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Class Size</span>
                  <span className="text-sm font-medium">25 students</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Room</span>
                  <span className="text-sm font-medium">Room 101</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Teacher</span>
                  <span className="text-sm font-medium">Ms. Johnson</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
