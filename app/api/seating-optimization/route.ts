import { xai } from "@ai-sdk/xai"
import { generateObject } from "ai"
import { z } from "zod"

const seatingOptimizationSchema = z.object({
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
  try {
    console.log("[v0] Starting seating optimization")
    const startTime = Date.now()

    const { students, classroomLayout } = await req.json()

    const studentSummary = students
      .map(
        (s: any, i: number) =>
          `${i + 1}. ${s.student_id}: ${s.personality_type}, ${s.learning_style}, ${s.focus_level}, ${s.social_preference}`,
      )
      .join("\n")

    const prompt = `Create seating chart for ${students.length} students in ${classroomLayout.rows}x${classroomLayout.cols} classroom.

Students:
${studentSummary}

Rules:
- High focus students in front
- Separate disruptive combinations  
- Group compatible learners
- Balance personality types

Assign seats (row/col from 0) with brief reasoning.`

    console.log("[v0] Sending optimization request to AI")

    const { object } = await generateObject({
      model: xai("grok-4", {
        apiKey: process.env.XAI_API_KEY,
      }),
      schema: seatingOptimizationSchema,
      prompt,
      maxTokens: 1200,
    })

    const endTime = Date.now()
    console.log(`[v0] Seating optimization completed in ${endTime - startTime}ms`)

    return Response.json(object)
  } catch (error) {
    console.error("[v0] Error generating seating optimization:", error)
    return new Response("Failed to generate optimized seating chart", { status: 500 })
  }
}
