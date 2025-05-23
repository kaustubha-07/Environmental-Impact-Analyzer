"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2,
  Leaf,
  Search,
  AlertCircle,
  Info,
  Database,
  ServerOffIcon as DatabaseOff,
  Sparkles,
} from "lucide-react"
import { ProductAnalysisResult } from "@/components/product-analysis-result"
import { RecentAnalyses } from "@/components/recent-analyses"
import type { Product, Analysis } from "@/types"

// Sample products for quick testing
const sampleProducts = [
  {
    name: "Eco-Friendly Water Bottle",
    description:
      "Made from recycled stainless steel with a bamboo cap. Double-walled insulation keeps drinks hot or cold for hours. No plastic components, fully recyclable, and manufactured using renewable energy. Shipped in minimal, plastic-free packaging.",
    manufacturer: "GreenDrink Co.",
    category: "Kitchenware",
    barcode: "ECO123456789",
  },
  {
    name: "Smartphone XYZ Pro",
    description:
      "Latest flagship smartphone with 6.7-inch OLED display, 5G connectivity, and 128GB storage. Features aluminum and glass construction with lithium-ion battery. Manufactured in multiple countries with global supply chain. Comes with charger and earbuds in plastic packaging.",
    manufacturer: "TechGiant Inc.",
    category: "Electronics",
    barcode: "TECH987654321",
  },
  {
    name: "Cotton T-Shirt",
    description:
      "Basic t-shirt made from 100% conventional cotton. Manufactured in Bangladesh using standard dyeing processes. Machine washable and designed for everyday wear. Shipped in plastic packaging with cardboard tags.",
    manufacturer: "BasicWear",
    category: "Clothing",
    barcode: "SHIRT567891234",
  },
]

export default function HomePage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    manufacturer: "",
    category: "",
    barcode: "",
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<{
    product: Product
    analysis: Analysis
    warning?: string
    mode?: "full" | "partial" | "fallback"
    debug?: any
  } | null>(null)
  const [error, setError] = useState("")
  const [skipDatabase, setSkipDatabase] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.description.trim()) {
      setError("Product name and description are required")
      return
    }

    setIsAnalyzing(true)
    setError("")
    setResult(null)

    try {
      console.log("Submitting analysis request:", formData)

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      if (skipDatabase) {
        headers["x-skip-database"] = "true"
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers,
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      console.log("Analysis response:", data)

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`)
      }

      setResult(data)

      // Clear form after successful analysis
      setFormData({
        name: "",
        description: "",
        manufacturer: "",
        category: "",
        barcode: "",
      })
    } catch (err) {
      console.error("Analysis error:", err)
      setError(err instanceof Error ? err.message : "An error occurred during analysis")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const loadSampleProduct = (index: number) => {
    if (index >= 0 && index < sampleProducts.length) {
      setFormData(sampleProducts[index])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-8 w-8 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-900">Environmental Impact Analyzer</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the environmental footprint of consumer products using AI-powered analysis
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Analysis Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Analyze Product
              </CardTitle>
              <CardDescription>Enter product details to get an environmental impact assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-2">Try a sample product:</div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadSampleProduct(0)}
                    className="flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3" />
                    Water Bottle
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadSampleProduct(1)}
                    className="flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3" />
                    Smartphone
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadSampleProduct(2)}
                    className="flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3" />
                    T-Shirt
                  </Button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., iPhone 15 Pro"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Product Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Detailed description including materials, features, and manufacturing details..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="manufacturer">Manufacturer</Label>
                    <Input
                      id="manufacturer"
                      value={formData.manufacturer}
                      onChange={(e) => handleInputChange("manufacturer", e.target.value)}
                      placeholder="e.g., Apple"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleInputChange("category", e.target.value)}
                      placeholder="e.g., Electronics"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="barcode">Barcode (Optional)</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => handleInputChange("barcode", e.target.value)}
                    placeholder="Product barcode or SKU"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="skipDatabase"
                    checked={skipDatabase}
                    onChange={(e) => setSkipDatabase(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <Label htmlFor="skipDatabase" className="text-sm text-gray-600">
                    Skip database operations (fallback mode)
                  </Label>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Environmental Impact"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {result && (
              <>
                {result.mode === "fallback" && (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <DatabaseOff className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      Running in fallback mode without database persistence. Your analysis will not be saved.
                    </AlertDescription>
                  </Alert>
                )}
                {result.mode === "partial" && (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <Database className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      Product was saved, but analysis could not be stored in the database.
                    </AlertDescription>
                  </Alert>
                )}
                {result.warning && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>{result.warning}</AlertDescription>
                  </Alert>
                )}
                <ProductAnalysisResult result={result} />
              </>
            )}
            <RecentAnalyses skipIfError={true} />
          </div>
        </div>
      </div>
    </div>
  )
}
