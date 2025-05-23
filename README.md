# 🌱 Environmental Impact Analyzer

**An AI-powered web application that evaluates the environmental impact of consumer products.**  
Using advanced AI and sustainable metrics, this tool analyzes product data and generates an environmental footprint score based on key sustainability factors.

![Environmental Impact Analyzer](https://github.com/yourusername/environmental-impact-analyzer/raw/main/public/screenshot.png)

---

## 🚀 Features

- 🔍 **AI-Powered Analysis**: Utilizes OpenAI GPT-4 to assess product impact across 5 core environmental dimensions.
- 📊 **Detailed Scoring System**: Calculates a comprehensive footprint score including:
  - Carbon Emissions
  - Water Usage
  - Material Sustainability
  - Packaging
  - Transportation
- 🧠 **Smart Caching**: Prevents repeated analyses for the same product.
- 🗃️ **Database Integration**: Stores products and analysis results using **Supabase**.
- 🌐 **Responsive UI**: Clean, green-themed design built with **Next.js**, **React**, and **Tailwind CSS**.
- 🧪 **Fallback Mode**: Operates even when AI or database services are offline.
- 🎁 **Preloaded Products**: Includes sample products for quick testing and demos.

---

## ♻️ Environmental Factors and Weights

| Factor                | Weight | Description                                             |
|-----------------------|--------|---------------------------------------------------------|
| **Carbon Footprint**  | 25%    | Emissions from production and energy lifecycle         |
| **Water Usage**       | 20%    | Water consumption and pollution during manufacturing    |
| **Material Sustainability** | 25% | Use of renewable, recyclable, or eco-friendly materials |
| **Packaging**         | 15%    | Packaging type, waste, and recyclability               |
| **Transportation**    | 15%    | Shipping efficiency, modes of transport, and distance  |

---

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, [shadcn/ui](https://ui.shadcn.com)
- **Backend**: Next.js API Routes, Server Actions
- **Database**: [Supabase](https://supabase.io) (PostgreSQL)
- **AI Integration**: OpenAI GPT-4 (via SDK)

---

## 📦 Getting Started

### 🔧 Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn
- [Supabase](https://supabase.io/) account (for database integration)
- [OpenAI](https://platform.openai.com/) API key (for AI analysis)

### 📥 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/environmental-impact-analyzer.git
   cd environmental-impact-analyzer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**:  
   Create a `.env.local` file in the root directory and add the following:
   ```env
   OPENAI_API_KEY=your_openai_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.



---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
