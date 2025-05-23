import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Leaf, Droplets, Recycle, Package, Truck } from "lucide-react"
import type { Product, Analysis } from "@/types"

interface ProductAnalysisResultProps {
  result: {
    product: Product
    analysis: Analysis
  }
}

export function ProductAnalysisResult({ result }: ProductAnalysisResultProps) {
  const { product, analysis } = result

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

  const scoreItems = [
    {
      label: "Carbon Footprint",
      score: analysis.carbon_footprint_score || 0,
      icon: Leaf,
      description: "Manufacturing and lifecycle emissions",
    },
    {
      label: "Water Usage",
      score: analysis.water_usage_score || 0,
      icon: Droplets,
      description: "Production water consumption",
    },
    {
      label: "Material Sustainability",
      score: analysis.material_sustainability_score || 0,
      icon: Recycle,
      description: "Renewable and recyclable materials",
    },
    {
      label: "Packaging",
      score: analysis.packaging_score || 0,
      icon: Package,
      description: "Eco-friendly packaging design",
    },
    {
      label: "Transportation",
      score: analysis.transportation_score || 0,
      icon: Truck,
      description: "Shipping and logistics efficiency",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{product.name}</CardTitle>
            <CardDescription>{product.manufacturer && `by ${product.manufacturer}`}</CardDescription>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(analysis.overall_score)}`}>
              {analysis.overall_score}/10
            </div>
            <Badge
              variant={
                analysis.overall_score >= 7 ? "default" : analysis.overall_score >= 4 ? "secondary" : "destructive"
              }
            >
              {getScoreLabel(analysis.overall_score)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Overall Environmental Score</span>
            <span className="text-sm text-gray-500">{analysis.overall_score}/10</span>
          </div>
          <Progress value={analysis.overall_score * 10} className="h-3" />
        </div>

        {/* Detailed Scores */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Detailed Analysis</h4>
          {scoreItems.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-gray-500" />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className={`text-sm font-semibold ${getScoreColor(item.score)}`}>{item.score}/10</span>
                  </div>
                  <Progress value={item.score * 10} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* AI Analysis Text */}
        {analysis.analysis_text && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">AI Analysis</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 leading-relaxed">{analysis.analysis_text}</p>
            </div>
          </div>
        )}

        {/* Product Details */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-900 mb-2">Product Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {product.category && (
              <div>
                <span className="text-gray-500">Category:</span>
                <span className="ml-2 font-medium">{product.category}</span>
              </div>
            )}
            {product.barcode && (
              <div>
                <span className="text-gray-500">Barcode:</span>
                <span className="ml-2 font-medium">{product.barcode}</span>
              </div>
            )}
          </div>
          {product.description && (
            <div className="mt-2">
              <span className="text-gray-500">Description:</span>
              <p className="text-sm text-gray-700 mt-1">{product.description}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
