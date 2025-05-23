import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Simple approach: just try to query each table and handle errors gracefully
    // If tables don't exist, Supabase will create them when we first insert data

    // Test if we can query the users table
    const { error: usersError } = await supabase.from("users").select("id").limit(1)

    // Test if we can query the products table
    const { error: productsError } = await supabase.from("products").select("id").limit(1)

    // Test if we can query the analyses table
    const { error: analysesError } = await supabase.from("analyses").select("id").limit(1)

    // Test if we can query the search_history table
    const { error: searchHistoryError } = await supabase.from("search_history").select("id").limit(1)

    const tableStatus = {
      users: !usersError,
      products: !productsError,
      analyses: !analysesError,
      search_history: !searchHistoryError,
    }

    return NextResponse.json({
      success: true,
      message: "Database connectivity check completed",
      tableStatus,
    })
  } catch (error) {
    console.error("Database setup error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An error occurred during database setup",
      },
      { status: 500 },
    )
  }
}
