"use client"

import type React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Brain, Users, Activity, MessageSquare, AlertCircle } from "lucide-react"

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

interface StudentDetailsDialogProps {
  studentData: StudentAssessment
  children: React.ReactNode
}

export function StudentDetailsDialog({ studentData, children }: StudentDetailsDialogProps) {
  const getStudentName = () => {
    if (studentData.profiles?.first_name && studentData.profiles?.last_name) {
      return `${studentData.profiles.first_name} ${studentData.profiles.last_name}`
    }
    return studentData.profiles?.email?.split("@")[0] || "Student"
  }

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

  const getIntensityColor = (level: string) => {
    const colors = {
      high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    }
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Student Profile: {getStudentName()}
          </DialogTitle>
          <DialogDescription>
            Detailed assessment results completed on {new Date(studentData.created_at).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Core Personality & Learning Style */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Brain className="w-5 h-5 text-purple-600" />
                    Personality Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={`${getPersonalityColor(studentData.personality_type)} text-lg px-4 py-2`}>
                    {studentData.personality_type.charAt(0).toUpperCase() + studentData.personality_type.slice(1)}
                  </Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                    {studentData.personality_type === "analytical" &&
                      "Prefers logical thinking and systematic approaches to learning."}
                    {studentData.personality_type === "creative" &&
                      "Enjoys imaginative activities and innovative problem-solving."}
                    {studentData.personality_type === "practical" &&
                      "Learns best through hands-on experiences and real-world applications."}
                    {studentData.personality_type === "social" &&
                      "Thrives in collaborative environments and group activities."}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="w-5 h-5 text-green-600" />
                    Learning Style
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={`${getLearningStyleColor(studentData.learning_style)} text-lg px-4 py-2`}>
                    {studentData.learning_style.charAt(0).toUpperCase() + studentData.learning_style.slice(1)}
                  </Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                    {studentData.learning_style === "visual" && "Learns best with charts, diagrams, and visual aids."}
                    {studentData.learning_style === "auditory" &&
                      "Prefers listening to explanations and verbal instructions."}
                    {studentData.learning_style === "kinesthetic" &&
                      "Needs movement and hands-on activities to learn effectively."}
                    {studentData.learning_style === "reading" && "Learns best through reading and written materials."}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Social & Environmental Preferences */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                  Social & Environmental Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Social Preference</h4>
                      <Badge variant="outline" className="text-sm">
                        {studentData.social_preference.charAt(0).toUpperCase() + studentData.social_preference.slice(1)}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Peer Interaction Style</h4>
                      <Badge variant="outline" className="text-sm">
                        {studentData.peer_interaction.charAt(0).toUpperCase() + studentData.peer_interaction.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Focus Level</h4>
                      <Badge className={getIntensityColor(studentData.focus_level)}>
                        {studentData.focus_level.charAt(0).toUpperCase() + studentData.focus_level.slice(1)}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Noise Tolerance</h4>
                      <Badge className={getIntensityColor(studentData.noise_tolerance)}>
                        {studentData.noise_tolerance.charAt(0).toUpperCase() + studentData.noise_tolerance.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Physical & Behavioral Needs */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="w-5 h-5 text-orange-600" />
                  Physical & Behavioral Needs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Movement Needs</h4>
                  <Badge className={getIntensityColor(studentData.movement_needs)}>
                    {studentData.movement_needs.charAt(0).toUpperCase() + studentData.movement_needs.slice(1)}
                  </Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {studentData.movement_needs === "high" &&
                      "Requires frequent movement breaks and may benefit from standing desk options."}
                    {studentData.movement_needs === "medium" &&
                      "Benefits from occasional movement and flexible seating arrangements."}
                    {studentData.movement_needs === "low" &&
                      "Comfortable with traditional seating for extended periods."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Special Considerations */}
            {studentData.special_needs && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    Special Considerations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                    <p className="text-sm text-amber-800 dark:text-amber-200">{studentData.special_needs}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Assessment Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="w-5 h-5 text-gray-600" />
                  Assessment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <p>
                    <strong>Assessment ID:</strong> {studentData.id}
                  </p>
                  <p>
                    <strong>Student Email:</strong> {studentData.profiles?.email}
                  </p>
                  <p>
                    <strong>Completed:</strong> {new Date(studentData.created_at).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
