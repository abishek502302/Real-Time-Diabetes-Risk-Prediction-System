"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"
import { AlertCircle, ArrowLeft, ArrowUp, ArrowDown, Minus, Info, Lightbulb, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PredictionInput, PredictionResult } from "@/components/prediction-form"
import { ExplainChatbot } from "@/components/explain-chatbot"
import { buildFeatureImpacts, type FeatureImpact } from "@/lib/feature-impacts"

// Educational content about health metrics
const healthMetrics = [
  {
    title: "Blood Glucose",
    normal: "< 100 mg/dL (fasting)",
    preDiabetic: "100-125 mg/dL",
    diabetic: ">= 126 mg/dL",
    description: "Measures the amount of sugar in your blood. High levels indicate your body struggles to process glucose effectively.",
  },
  {
    title: "HbA1c",
    normal: "< 5.7%",
    preDiabetic: "5.7-6.4%",
    diabetic: ">= 6.5%",
    description: "Shows average blood sugar over 2-3 months. Unlike glucose tests, it provides a long-term picture of blood sugar control.",
  },
  {
    title: "BMI",
    normal: "18.5-24.9",
    preDiabetic: "25-29.9 (overweight)",
    diabetic: ">= 30 (obese)",
    description: "Body Mass Index relates weight to height. Higher BMI is associated with increased insulin resistance.",
  },
]

function formatShapValue(value: number) {
  return value.toString()
}

export default function ExplainPage() {
  const [input, setInput] = useState<PredictionInput | null>(null)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [impacts, setImpacts] = useState<FeatureImpact[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('lastPrediction')
    if (stored) {
      try {
        const { input: storedInput, result: storedResult } = JSON.parse(stored)
        setInput(storedInput)
        setResult(storedResult)
        setImpacts(buildFeatureImpacts(storedInput, storedResult?.shap_explanation?.features))
      } catch {
        // Invalid stored data
      }
    }
  }, [])

  const visibleImpacts = input && result ? buildFeatureImpacts(input, result.shap_explanation?.features) : impacts

  const chartData = visibleImpacts
    .map((impact) => ({
      feature: impact.feature,
      contribution: Number(impact.shapValue ?? impact.contribution ?? 0),
      fill: impact.impact === "positive" ? "#ef4444" : impact.impact === "negative" ? "#22c55e" : "#94a3b8",
    }))

  if (!input || !result) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl text-center">
          <Card>
            <CardContent className="py-12">
              <div className="mb-4 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-muted">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No Prediction Data</h2>
              <p className="text-muted-foreground mb-6">
                Please complete a prediction first to see AI explanations.
              </p>
              <Button asChild>
                <Link href="/prediction">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go to Prediction
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            AI Explanation
          </h1>
          <p className="mt-2 text-muted-foreground">
            Understand how each factor contributed to your diabetes risk prediction
          </p>
        </div>

        {/* Risk Summary */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Your Predicted Risk</p>
                <p className="text-3xl font-bold">{Math.round(result.probability * 100)}%</p>
              </div>
              <div className={cn(
                "px-4 py-2 rounded-full font-semibold",
                result.risk_level === "Low" && "bg-risk-low/10 text-risk-low",
                result.risk_level === "Medium" && "bg-risk-medium/10 text-risk-medium",
                result.risk_level === "High" && "bg-risk-high/10 text-risk-high"
              )}>
                {result.risk_level} Risk
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="impact" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="impact">Feature Impact</TabsTrigger>
            <TabsTrigger value="whatif">What-If Scenarios</TabsTrigger>
            <TabsTrigger value="learn">Learn More</TabsTrigger>
          </TabsList>

          {/* Feature Impact Tab */}
          <TabsContent value="impact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  SHAP Feature Impact
                </CardTitle>
                <CardDescription>
                  Positive values increase the predicted risk; negative values reduce it. SHAP values are model-score contributions, not percentage points.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="h-[260px] w-full rounded-lg border bg-muted/20 p-3">
                  <ChartContainer
                    config={{
                      contribution: {
                        label: "SHAP contribution",
                        color: "#0f172a",
                      },
                    }}
                    className="h-full w-full"
                  >
                    <BarChart data={chartData} barSize={28} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="feature"
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11 }}
                        width={48}
                      />
                      <ChartTooltip
                        cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
                        formatter={(value: number) => [formatShapValue(Number(value)), "SHAP"]}
                        content={<ChartTooltipContent nameKey="feature" />}
                      />
                      <Bar dataKey="contribution" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry) => (
                          <Cell key={entry.feature} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </div>

                {(visibleImpacts.length > 0 ? visibleImpacts : impacts).map((impact) => (
                  <div key={impact.feature} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {impact.impact === "positive" ? (
                          <ArrowUp className="h-4 w-4 text-risk-high" />
                        ) : impact.impact === "negative" ? (
                          <ArrowDown className="h-4 w-4 text-risk-low" />
                        ) : (
                          <Minus className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-medium">{impact.feature}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{impact.value}</span>
                        <span className="font-medium text-foreground">
                          SHAP {formatShapValue(Number(impact.shapValue ?? impact.contribution ?? 0))}
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={Math.min(100, Math.abs(impact.shapValue ?? impact.contribution ?? 0) * 60)}
                      className={cn(
                        "h-2",
                        impact.impact === "positive" && "[&>div]:bg-risk-high",
                        impact.impact === "negative" && "[&>div]:bg-risk-low",
                        impact.impact === "neutral" && "[&>div]:bg-risk-medium"
                      )}
                    />
                    <p className="text-sm text-muted-foreground">{impact.explanation}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Understanding the Chart</p>
                    <p className="text-sm text-muted-foreground">
                      Factors with <span className="text-risk-high">upward arrows</span> increase the model&apos;s risk estimate, while those with <span className="text-risk-low">downward arrows</span> reduce it. The numeric SHAP value shows the magnitude and direction of each factor&apos;s contribution to the final prediction.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* What-If Scenarios Tab */}
          <TabsContent value="whatif" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>What-If Scenarios</CardTitle>
                <CardDescription>
                  See how changing specific factors could affect your risk
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {input.bmi > 25 && (
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium mb-2">If you reduced your BMI to 24...</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Losing weight to achieve a healthy BMI could reduce your diabetes risk by approximately 10-15%.
                    </p>
                    <p className="text-sm text-risk-low font-medium">
                      Estimated new risk: {Math.max(5, Math.round(result.probability * 100) - 12)}%
                    </p>
                  </div>
                )}

                {input.blood_glucose_level > 100 && (
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium mb-2">If your blood glucose was below 100 mg/dL...</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Normalizing blood glucose through diet and exercise could significantly reduce risk.
                    </p>
                    <p className="text-sm text-risk-low font-medium">
                      Estimated new risk: {Math.max(5, Math.round(result.probability * 100) - 18)}%
                    </p>
                  </div>
                )}

                {input.HbA1c_level > 5.7 && (
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium mb-2">If your HbA1c was below 5.7%...</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Improving long-term blood sugar control would show meaningful risk reduction.
                    </p>
                    <p className="text-sm text-risk-low font-medium">
                      Estimated new risk: {Math.max(5, Math.round(result.probability * 100) - 15)}%
                    </p>
                  </div>
                )}

                {input.smoking_history === "current" && (
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium mb-2">If you quit smoking...</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Quitting smoking improves insulin sensitivity and overall metabolic health.
                    </p>
                    <p className="text-sm text-risk-low font-medium">
                      Estimated new risk: {Math.max(5, Math.round(result.probability * 100) - 5)}%
                    </p>
                  </div>
                )}

                <Button asChild className="w-full">
                  <Link href="/simulation">
                    Try Interactive Simulation
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learn More Tab */}
          <TabsContent value="learn" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Health Metric Reference
                </CardTitle>
                <CardDescription>
                  Understanding the key metrics used in diabetes risk assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {healthMetrics.map((metric) => (
                  <div key={metric.title} className="space-y-3">
                    <h4 className="font-semibold text-lg">{metric.title}</h4>
                    <p className="text-sm text-muted-foreground">{metric.description}</p>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="rounded-md bg-risk-low/10 p-2 text-center">
                        <p className="font-medium text-risk-low">Normal</p>
                        <p className="text-xs text-muted-foreground">{metric.normal}</p>
                      </div>
                      <div className="rounded-md bg-risk-medium/10 p-2 text-center">
                        <p className="font-medium text-risk-medium">Pre-Diabetic</p>
                        <p className="text-xs text-muted-foreground">{metric.preDiabetic}</p>
                      </div>
                      <div className="rounded-md bg-risk-high/10 p-2 text-center">
                        <p className="font-medium text-risk-high">Diabetic</p>
                        <p className="text-xs text-muted-foreground">{metric.diabetic}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-primary/5">
              <CardContent className="py-6">
                <h4 className="font-semibold mb-2">Prevention Tips</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Maintain a healthy weight (BMI 18.5-24.9)</li>
                  <li>• Exercise at least 150 minutes per week</li>
                  <li>• Eat a balanced diet rich in fiber and low in processed sugars</li>
                  <li>• Get regular health screenings, especially after age 45</li>
                  <li>• Manage stress and get adequate sleep</li>
                  <li>• Avoid smoking and limit alcohol consumption</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <ExplainChatbot input={input} result={result} impacts={impacts} />
      </div>
    </div>
  )
}
