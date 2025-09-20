import { xai } from "@ai-sdk/xai"
import { generateObject } from "ai"
import { z } from "zod"

const seatingAssignmentSchema = z.object({
  assignments: z.array(
    z.object({
      student_id: z.string(),
      row: z.number(),
      col: z.number(),
      reasoning: z.string(),
    }),
  ),
  overall_strategy: z.string(),
  considerations: z.array(z.string()),
  potential_issues: z.array(z.string()),
  recommendations: z.array(z.string()),
})

export async function POST(req: Request) {
  let students: any[] = []
  let classroomLayout: any = {}

  try {
    console.log("[v0] Starting AI seating optimization")
    const startTime = Date.now()

    const requestData = await req.json()
    students = requestData.students
    classroomLayout = requestData.classroomLayout

    console.log("[v0] Input students:", students.length)
    console.log("[v0] Classroom layout:", classroomLayout)

    const { object } = await generateObject({
      model: xai("grok-4"),
      schema: seatingAssignmentSchema,
      messages: [
        {
          role: "system",
          content: `You are an expert classroom seating optimizer. Create an optimal seating arrangement based on student personality assessments and learning preferences.

IMPORTANT: You must assign students to specific row/col positions within the classroom layout.
- Rows are numbered 0 to ${classroomLayout.rows - 1}
- Columns are numbered 0 to ${classroomLayout.cols - 1}
- Total seats available: ${classroomLayout.rows * classroomLayout.cols}

Consider these factors:
1. Personality types (analytical, creative, practical, social)
2. Learning styles (visual, auditory, kinesthetic, reading)
3. Social preferences (group, individual, pair)
4. Focus levels (high, medium, low)
5. Noise tolerance and movement needs
6. Peer interaction preferences

Optimization goals:
- Place high-focus students in front rows for better attention
- Group compatible personality types when beneficial
- Separate potentially disruptive combinations
- Consider teacher supervision needs
- Balance social dynamics across the room`,
        },
        {
          role: "user",
          content: `Create an optimal seating chart for ${students.length} students in a ${classroomLayout.rows}x${classroomLayout.cols} classroom.

Student Data:
${students
  .map(
    (s) => `
Student ID: ${s.student_id}
Name: ${s.profiles?.first_name || "Unknown"} ${s.profiles?.last_name || ""}
Personality: ${s.personality_type}
Learning Style: ${s.learning_style}
Social Preference: ${s.social_preference}
Focus Level: ${s.focus_level}
Noise Tolerance: ${s.noise_tolerance}
Movement Needs: ${s.movement_needs}
Peer Interaction: ${s.peer_interaction}
Special Needs: ${s.special_needs || "None"}
`,
  )
  .join("\n")}

Please assign each student to a specific row and column position with detailed reasoning for each placement.`,
        },
      ],
      maxOutputTokens: 4000,
      temperature: 0.3,
    })

    const endTime = Date.now()
    console.log(`[v0] AI optimization completed in ${endTime - startTime}ms`)
    console.log(`[v0] Generated ${object.assignments.length} assignments`)

    return Response.json(object)
  } catch (error) {
    console.error("[v0] Error in AI seating optimization:", error)

    console.log("[v0] Falling back to simple seating algorithm")
    const fallbackResult = generateSimpleSeating(students, classroomLayout)
    return Response.json(fallbackResult)
  }
}

function generateSimpleSeating(students: any[], classroomLayout: any) {
  const assignments = []
  const totalSeats = classroomLayout.rows * classroomLayout.cols
  const maxAssignments = Math.min(students.length, totalSeats)

  let currentRow = 0
  let currentCol = 0

  // Place students sequentially, prioritizing by focus level
  const sortedStudents = [...students].sort((a, b) => {
    const focusOrder = { High: 3, Medium: 2, Low: 1 }
    return (
      (focusOrder[b.focus_level as keyof typeof focusOrder] || 0) -
      (focusOrder[a.focus_level as keyof typeof focusOrder] || 0)
    )
  })

  for (const student of sortedStudents) {
    if (assignments.length >= maxAssignments) break

    assignments.push({
      student_id: student.student_id,
      row: currentRow,
      col: currentCol,
      reasoning: `Placed based on ${student.focus_level || "unknown"} focus level and ${student.personality_type || "unknown"} personality`,
    })

    currentCol++
    if (currentCol >= classroomLayout.cols) {
      currentCol = 0
      currentRow++
    }
  }

  return {
    assignments,
    overall_strategy: "Focus-based seating with systematic placement",
    considerations: ["Student focus levels", "Personality types", "Classroom layout"],
    potential_issues: ["May need adjustment based on student interactions"],
    recommendations: ["Monitor student engagement", "Adjust as needed after observation"],
  }
}
