import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Brain } from "lucide-react"
import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export default async function HomePage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role === "teacher") {
      redirect("/teacher/dashboard")
    } else if (profile?.role === "student") {
      redirect("/student/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 text-balance">
            Smart Seating Solutions
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-pretty">
            Revolutionize your classroom with AI-powered seating charts that optimize learning based on student
            personalities and needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          <Card className="border-2 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl text-blue-900 dark:text-blue-100">For Students</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Take our personality assessment to help your teacher create the perfect learning environment
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/auth/login?role=student">
                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Start Assessment
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-2xl text-emerald-900 dark:text-emerald-100">For Teachers</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Access student insights and generate optimal seating arrangements with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/auth/login?role=teacher">
                <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                  Teacher Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-md">
            <Brain className="w-5 h-5 text-purple-600" />
            <span className="text-gray-700 dark:text-gray-300 font-medium">Powered by AI Intelligence</span>
          </div>
        </div>
      </div>
    </div>
  )
}
