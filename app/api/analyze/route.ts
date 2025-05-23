import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { analyzeProductEnvironmentalImpact } from "@/lib/ai-analyzer"

// Add a debug flag to enable detailed error reporting
const DEBUG_MODE = true

export async function POST(request: NextRequest) {
  try {
    const { name, description, manufacturer, category, barcode } = await request.json()

    if (!name || !description) {
      return NextResponse.json({ error: "Product name and description are required" }, { status: 400 })
    }

    // Check if we should skip database operations (fallback mode)
    const skipDatabase = request.headers.get("x-skip-database") === "true"

    // First, perform the AI analysis to avoid database operations if AI fails
    console.log("Starting AI analysis for product:", name)
    let scores
    try {
      scores = await analyzeProductEnvironmentalImpact(name, description, manufacturer, category)
      console.log("AI analysis completed successfully")
    } catch (aiError) {
      console.error("AI analysis failed:", aiError)
      return NextResponse.json(
        {
          error: "Failed to analyze product environmental impact",
          details: DEBUG_MODE ? String(aiError) : undefined,
        },
        { status: 500 },
      )
    }

    // If we're skipping database operations, just return the analysis
    if (skipDatabase) {
      console.log("Running in fallback mode (skipping database operations)")
      return NextResponse.json({
        product: {
          id: `temp-product-${Date.now()}`,
          name,
          description,
          manufacturer,
          category,
          barcode,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        analysis: {
          id: `temp-analysis-${Date.now()}`,
          product_id: `temp-product-${Date.now()}`,
          created_at: new Date().toISOString(),
          ...scores,
        },
        mode: "fallback",
        message: "Analysis performed without database persistence",
      })
    }

    // Normal mode with database operations
    console.log("Starting database operations")
    const supabase = createServerClient()

    // Debug: Log Supabase client configuration
    if (DEBUG_MODE) {
      console.log("Supabase client configuration:", {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Not set",
      })
    }

    // Try to create a product
    console.log("Attempting to create product:", { name, description })

    let product
    try {
      // Try to insert the product
      const { data: newProduct, error: insertError } = await supabase
        .from("products")
        .insert({
          name: name.trim(),
          description: description.trim(),
          manufacturer: manufacturer?.trim() || null,
          category: category?.trim() || null,
          barcode: barcode?.trim() || null,
        })
        .select()
        .single()

      if (insertError) {
        // Log the full error details
        console.error("Product insertion error:", JSON.stringify(insertError, null, 2))

        // Try fallback mode
        throw new Error(`Database error: ${insertError.message || insertError.code || "Unknown error"}`)
      }

      product = newProduct
      console.log("Product created successfully:", product.id)
    } catch (dbError) {
      console.error("Database operation failed:", dbError)

      // Fall back to non-database mode
      console.log("Falling back to non-database mode")
      return NextResponse.json({
        product: {
          id: `temp-product-${Date.now()}`,
          name,
          description,
          manufacturer,
          category,
          barcode,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        analysis: {
          id: `temp-analysis-${Date.now()}`,
          product_id: `temp-product-${Date.now()}`,
          created_at: new Date().toISOString(),
          ...scores,
        },
        mode: "fallback",
        error: DEBUG_MODE ? String(dbError) : "Database operations failed, using fallback mode",
        debug: DEBUG_MODE
          ? {
              error:
                dbError instanceof Error
                  ? {
                      message: dbError.message,
                      stack: dbError.stack,
                    }
                  : String(dbError),
              env: {
                supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
                supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
                supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Not set",
              },
            }
          : undefined,
      })
    }

    // Try to save the analysis
    let analysis
    try {
      const { data: newAnalysis, error: analysisError } = await supabase
        .from("analyses")
        .insert({
          product_id: product.id,
          overall_score: scores.overall_score,
          carbon_footprint_score: scores.carbon_footprint_score,
          water_usage_score: scores.water_usage_score,
          material_sustainability_score: scores.material_sustainability_score,
          packaging_score: scores.packaging_score,
          transportation_score: scores.transportation_score,
          analysis_text: scores.analysis_text,
        })
        .select()
        .single()

      if (analysisError) {
        console.error("Analysis insertion error:", JSON.stringify(analysisError, null, 2))

        // Use a temporary analysis object
        analysis = {
          id: `temp-analysis-${Date.now()}`,
          product_id: product.id,
          created_at: new Date().toISOString(),
          ...scores,
        }

        return NextResponse.json({
          product,
          analysis,
          mode: "partial",
          warning: "Analysis could not be saved to database",
          debug: DEBUG_MODE
            ? {
                error: analysisError,
              }
            : undefined,
        })
      }

      analysis = newAnalysis
      console.log("Analysis saved successfully:", analysis.id)
    } catch (analysisError) {
      console.error("Analysis insertion failed:", analysisError)

      // Use a temporary analysis object
      analysis = {
        id: `temp-analysis-${Date.now()}`,
        product_id: product.id,
        created_at: new Date().toISOString(),
        ...scores,
      }

      return NextResponse.json({
        product,
        analysis,
        mode: "partial",
        warning: "Analysis could not be saved to database",
        debug: DEBUG_MODE
          ? {
              error:
                analysisError instanceof Error
                  ? {
                      message: analysisError.message,
                      stack: analysisError.stack,
                    }
                  : String(analysisError),
            }
          : undefined,
      })
    }

    // Success!
    return NextResponse.json({
      product,
      analysis,
      mode: "full",
    })
  } catch (error) {
    console.error("Analysis API error:", error)

    // Return a more user-friendly error message
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"

    return NextResponse.json(
      {
        error: errorMessage,
        debug: DEBUG_MODE
          ? {
              error:
                error instanceof Error
                  ? {
                      message: error.message,
                      stack: error.stack,
                    }
                  : String(error),
              env: {
                supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
                supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
                supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Not set",
                openaiApiKey: process.env.OPENAI_API_KEY ? "Set" : "Not set",
              },
            }
          : undefined,
      },
      { status: 500 },
    )
  }
}
