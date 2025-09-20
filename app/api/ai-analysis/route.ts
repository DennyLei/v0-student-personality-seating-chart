import { xai } from "@ai-sdk/xai"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    console.log("[v0] Starting AI analysis generation")
    const startTime = Date.now()

    const { studentData } = await req.json()

    const prompt = `Analyze this student for teaching strategies:

Personality: ${studentData.personality_type}
Learning: ${studentData.learning_style}  
Social: ${studentData.social_preference}
Focus: ${studentData.focus_level}
Noise: ${studentData.noise_tolerance}
Movement: ${studentData.movement_needs}
${studentData.special_needs ? `Special Needs: ${studentData.special_needs}` : ""}

Provide 5 key sections:
1. Teaching Strategies: Best methods for this student
2. Classroom Setup: Seating and environment needs  
3. Learning Activities: Engaging activity types
4. Challenges: Potential difficulties to watch for
5. Motivation: What drives this learner

Keep each section concise and actionable.`

    console.log("[v0] Sending request to AI model")

    const { text } = await generateText({
      model: xai("grok-4", {
        apiKey: process.env.XAI_API_KEY,
      }),
      prompt,
      maxTokens: 800,
      temperature: 0.7,
    })

    const endTime = Date.now()
    console.log(`[v0] AI analysis completed in ${endTime - startTime}ms`)

    return Response.json({ analysis: text })
  } catch (error) {
    console.error("[v0] Error generating analysis:", error)
    return new Response("Failed to generate analysis", { status: 500 })
  }
}
