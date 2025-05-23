import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({
    message: "Database initialization",
    instructions: [
      "Please run the following SQL commands in your Supabase SQL editor:",
      "",
      "-- Create products table",
      `CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        description TEXT,
        manufacturer TEXT,
        category TEXT,
        image_url TEXT,
        barcode TEXT UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      "",
      "-- Create analyses table",
      `CREATE TABLE IF NOT EXISTS analyses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        overall_score DECIMAL(3,1) NOT NULL,
        carbon_footprint_score DECIMAL(3,1),
        water_usage_score DECIMAL(3,1),
        material_sustainability_score DECIMAL(3,1),
        packaging_score DECIMAL(3,1),
        transportation_score DECIMAL(3,1),
        analysis_text TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT score_range CHECK (overall_score >= 0 AND overall_score <= 10)
      );`,
      "",
      "-- Create search_history table",
      `CREATE TABLE IF NOT EXISTS search_history (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
    ],
  })
}
