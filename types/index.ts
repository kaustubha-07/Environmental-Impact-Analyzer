export interface Product {
  id: string
  name: string
  description?: string
  manufacturer?: string
  category?: string
  image_url?: string
  barcode?: string
  created_at: string
  updated_at: string
}

export interface Analysis {
  id: string
  product_id: string
  user_id?: string
  overall_score: number
  carbon_footprint_score?: number
  water_usage_score?: number
  material_sustainability_score?: number
  packaging_score?: number
  transportation_score?: number
  analysis_text?: string
  created_at: string
  product?: Product
}

export interface EnvironmentalScores {
  overall_score: number
  carbon_footprint_score: number
  water_usage_score: number
  material_sustainability_score: number
  packaging_score: number
  transportation_score: number
  analysis_text: string
}
