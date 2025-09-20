import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Mail } from "lucide-react"
import Link from "next/link"

export default function SignupSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-green-900 dark:text-green-100">Account Created!</CardTitle>
            <CardDescription>Please check your email to verify your account</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">Verification Email Sent</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                We've sent a verification link to your email address. Please click the link to activate your account.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                After verifying your email, you can sign in to access your account.
              </p>
              <Link href="/auth/login">
                <Button variant="outline" className="w-full bg-transparent">
                  Go to Sign In
                </Button>
              </Link>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Didn't receive the email? Check your spam folder or contact support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
