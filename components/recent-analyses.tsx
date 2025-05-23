"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, ServerOffIcon as DatabaseOff } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Analysis } from "@/types"

interface RecentAnalysesProps {
  skipIfError?: boolean
}

export function RecentAnalyses({ skipIfError = false }: RecentAnalysesProps) {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecentAnalyses()
  }, [])

  const fetchRecentAnalyses = async () => {
    try {
      setError(null)

      // Try to query the analyses table
      const { data: analysesData, error: analysesError } = await supabase
        .from("analyses")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

      // Handle table not existing error
      if (analysesError) {
        if (analysesError.message?.includes("does not exist") || analysesError.message?.includes("relation")) {
          // Table doesn't exist yet, which is fine for a new app
          console.log("Analyses table doesn't exist yet")
          setAnalyses([])
          setLoading(false)
          return
        }
        throw analysesError
      }

      if (!analysesData || analysesData.length === 0) {
        setAnalyses([])
        setLoading(false)
        return
      }

      // Get all product IDs from the analyses
      const productIds = analysesData.map((analysis) => analysis.product_id)

      // Fetch the products for these IDs
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .in("id", productIds)

      if (productsError) {
        if (productsError.message?.includes("does not exist") || productsError.message?.includes("relation")) {
          // Products table doesn't exist, just show analyses without product details
          console.log("Products table doesn't exist yet")
          setAnalyses(analysesData)
          setLoading(false)
          return
        }
        throw productsError
      }

      // Combine the data
      const analysesWithProducts = analysesData.map((analysis) => {
        const product = productsData?.find((p) => p.id === analysis.product_id)
        return {
          ...analysis,
          product,
        }
      })

      setAnalyses(analysesWithProducts)
    } catch (error) {
      console.error("Error fetching recent analyses:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch recent analyses")
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 7) return "text-green-600"
    if (score >= 4) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 7) return "Good"
    if (score >= 4) return "Fair"
    return "Poor"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    if (skipIfError) {
      return null
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-600">
            <DatabaseOff className="h-5 w-5" />
            Database Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">
            Recent analyses cannot be displayed. The database may not be properly configured.
          </div>
          <button
            onClick={() => {
              setLoading(true)
              fetchRecentAnalyses()
            }}
            className="mt-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors mx-auto block"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Analyses
        </CardTitle>
        <CardDescription>Previously analyzed products</CardDescription>
      </CardHeader>
      <CardContent>
        {analyses.length === 0 ? (
          <div className="text-center text-gray-500 py-4">No analyses yet. Start by analyzing your first product!</div>
        ) : (
          <div className="space-y-3">
            {analyses.map((analysis) => (
              <div
                key={analysis.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{analysis.product?.name || "Unknown Product"}</h4>
                  {analysis.product?.manufacturer && (
                    <p className="text-sm text-gray-500">by {analysis.product.manufacturer}</p>
                  )}
                  <p className="text-xs text-gray-400">{new Date(analysis.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getScoreColor(analysis.overall_score)}`}>
                    {analysis.overall_score}/10
                  </div>
                  <Badge
                    variant={
                      analysis.overall_score >= 7
                        ? "default"
                        : analysis.overall_score >= 4
                          ? "secondary"
                          : "destructive"
                    }
                    className="text-xs"
                  >
                    {getScoreLabel(analysis.overall_score)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
