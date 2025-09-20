"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { createClient } from "@/lib/supabase/client"
import { Trash2, Loader2 } from "lucide-react"

interface DeleteStudentButtonProps {
  assessmentId: string
  studentName: string
}

export function DeleteStudentButton({ assessmentId, studentName }: DeleteStudentButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    const supabase = createClient()

    try {
      console.log("[v0] Attempting to delete assessment with ID:", assessmentId)

      const { data, error } = await supabase.from("student_assessments").delete().eq("id", assessmentId).select()

      console.log("[v0] Delete result:", { data, error })

      if (error) {
        console.error("[v0] Delete error:", error)
        throw error
      }

      console.log("[v0] Successfully deleted assessment")
      setIsOpen(false)

      window.location.reload()
    } catch (error) {
      console.error("[v0] Error in handleDelete:", error)
      alert(`Error deleting student assessment: ${error.message || "Unknown error"}. Please try again.`)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950 dark:border-red-800 bg-transparent"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Student Assessment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the assessment for <strong>{studentName}</strong>? This action cannot be
            undone and will remove all assessment data for this student.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Assessment
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
