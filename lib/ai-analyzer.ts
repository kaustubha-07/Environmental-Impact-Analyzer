import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { EnvironmentalScores } from "@/types"

// Add a mock function for fallback when AI fails
function generateMockAnalysis(
  productName: string,
  description: string,
  manufacturer?: string,
  category?: string,
): EnvironmentalScores {
  // Generate somewhat random but reasonable scores
  const getRandomScore = (min: number, max: number) => {
    return Math.round((min + Math.random() * (max - min)) * 10) / 10
  }

  // Base scores on product category if available
  let baseScore = 5
  if (category?.toLowerCase().includes("electronics")) {
    baseScore = 4 // Electronics tend to have lower environmental scores
  } else if (category?.toLowerCase().includes("food") || category?.toLowerCase().includes("organic")) {
    baseScore = 6 // Food/organic products tend to have higher scores
  }

  // Generate individual scores with some variation
  const carbonFootprintScore = getRandomScore(baseScore - 1.5, baseScore + 1.5)
  const waterUsageScore = getRandomScore(baseScore - 1.5, baseScore + 1.5)
  const materialSustainabilityScore = getRandomScore(baseScore - 1.5, baseScore + 1.5)
  const packagingScore = getRandomScore(baseScore - 1.5, baseScore + 1.5)
  const transportationScore = getRandomScore(baseScore - 1.5, baseScore + 1.5)

  // Calculate overall score as weighted average
  const overallScore =
    carbonFootprintScore * 0.25 +
    waterUsageScore * 0.2 +
    materialSustainabilityScore * 0.25 +
    packagingScore * 0.15 +
    transportationScore * 0.15

  return {
    overall_score: Math.round(overallScore * 10) / 10,
    carbon_footprint_score: carbonFootprintScore,
    water_usage_score: waterUsageScore,
    material_sustainability_score: materialSustainabilityScore,
    packaging_score: packagingScore,
    transportation_score: transportationScore,
    analysis_text: `This is a simulated environmental impact analysis for ${productName} by ${
      manufacturer || "unknown manufacturer"
    }. The product appears to have an overall environmental impact score of ${
      Math.round(overallScore * 10) / 10
    }/10. This is a fallback analysis generated when AI analysis is unavailable.`,
  }
}

export async function analyzeProductEnvironmentalImpact(
  productName: string,
  description: string,
  manufacturer?: string,
  category?: string,
): Promise<EnvironmentalScores> {
  // Check if we should use mock data (for testing or when AI is unavailable)
  const useMock = process.env.USE_MOCK_AI === "true"

  if (useMock) {
    console.log("Using mock AI analysis")
    return generateMockAnalysis(productName, description, manufacturer, category)
  }

  const prompt = `
Analyze the environmental impact of this product and provide scores from 0-10 (10 being most environmentally friendly):

Product: ${productName}
Description: ${description}
Manufacturer: ${manufacturer || "Unknown"}
Category: ${category || "Unknown"}

Please evaluate and score the following aspects:
1. Carbon Footprint (manufacturing, energy use, lifecycle emissions)
2. Water Usage (production water consumption and pollution)
3. Material Sustainability (renewable materials, recyclability, biodegradability)
4. Packaging (eco-friendly packaging, minimal waste)
5. Transportation (shipping distance, logistics efficiency)

Provide your response in this exact JSON format:
{
  "carbon_footprint_score": [score],
  "water_usage_score": [score],
  "material_sustainability_score": [score],
  "packaging_score": [score],
  "transportation_score": [score],
  "analysis_text": "[detailed explanation of the environmental impact analysis]"
}

Base your analysis on typical environmental impacts for this type of product, considering industry standards and best practices.
`

  try {
    console.log("Starting AI analysis with OpenAI")

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY is not set, using mock data")
      return generateMockAnalysis(productName, description, manufacturer, category)
    }

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.3,
      maxTokens: 1000,
    })

    console.log("AI response received, parsing JSON")

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error("Invalid AI response format, no JSON found:", text)
      throw new Error("Invalid AI response format")
    }

    try {
      const scores = JSON.parse(jsonMatch[0])

      // Validate the scores
      const requiredFields = [
        "carbon_footprint_score",
        "water_usage_score",
        "material_sustainability_score",
        "packaging_score",
        "transportation_score",
        "analysis_text",
      ]

      for (const field of requiredFields) {
        if (scores[field] === undefined) {
          console.error(`Missing required field in AI response: ${field}`)
          throw new Error(`Missing required field in AI response: ${field}`)
        }
      }

      // Calculate overall score as weighted average
      const overall_score =
        scores.carbon_footprint_score * 0.25 +
        scores.water_usage_score * 0.2 +
        scores.material_sustainability_score * 0.25 +
        scores.packaging_score * 0.15 +
        scores.transportation_score * 0.15

      return {
        overall_score: Math.round(overall_score * 10) / 10,
        ...scores,
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError, "Raw text:", text)
      throw new Error("Failed to parse AI response")
    }
  } catch (error) {
    console.error("AI analysis error:", error)

    // Fall back to mock data if AI fails
    console.log("AI analysis failed, using mock data as fallback")
    return generateMockAnalysis(productName, description, manufacturer, category)
  }
}
