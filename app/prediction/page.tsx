"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PredictionForm, PredictionInput, PredictionResult } from "@/components/prediction-form"
import { RiskGauge } from "@/components/risk-gauge"
import { ArrowRight, FileText, TrendingUp } from "lucide-react"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export default function PredictionPage() {
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [input, setInput] = useState<PredictionInput | null>(null)
  const [intakeDefaults, setIntakeDefaults] = useState<Partial<PredictionInput>>()

  useEffect(() => {
    const stored = localStorage.getItem("healthIntake")
    if (!stored) return

    try {
      const parsed: unknown = JSON.parse(stored)
      if (!isRecord(parsed) || !isRecord(parsed.personal)) return

      const personal = parsed.personal
      const measurements = isRecord(parsed.measurements) ? parsed.measurements : {}
      const medicalHistory = isRecord(parsed.medicalHistory) ? parsed.medicalHistory : {}
      const lifestyle = isRecord(parsed.lifestyle) ? parsed.lifestyle : {}
      const defaults: Partial<PredictionInput> = {}

      if (typeof personal.age === "number" && Number.isFinite(personal.age)) {
        defaults.age = personal.age
      }
      if (personal.gender === "Male" || personal.gender === "Female") {
        defaults.gender = personal.gender
      }
      if (
        typeof personal.heightCm === "number" &&
        Number.isFinite(personal.heightCm) &&
        personal.heightCm > 0 &&
        typeof personal.weightKg === "number" &&
        Number.isFinite(personal.weightKg) &&
        personal.weightKg > 0
      ) {
        const bmi = personal.weightKg / ((personal.heightCm / 100) ** 2)
        if (bmi >= 10 && bmi <= 60) defaults.bmi = Number(bmi.toFixed(1))
      }
      if (medicalHistory.hypertension === "yes") defaults.hypertension = 1
      if (medicalHistory.hypertension === "no") defaults.hypertension = 0
      if (medicalHistory.heartDisease === "yes") defaults.heart_disease = 1
      if (medicalHistory.heartDisease === "no") defaults.heart_disease = 0
      if (
        typeof measurements.hba1c === "number" &&
        Number.isFinite(measurements.hba1c) &&
        measurements.hba1c >= 3 &&
        measurements.hba1c <= 15
      ) {
        defaults.HbA1c_level = measurements.hba1c
      }
      if (
        typeof measurements.bloodGlucose === "number" &&
        Number.isFinite(measurements.bloodGlucose) &&
        measurements.bloodGlucose >= 50 &&
        measurements.bloodGlucose <= 500
      ) {
        defaults.blood_glucose_level = measurements.bloodGlucose
      }
      if (
        lifestyle.smokingHistory === "never" ||
        lifestyle.smokingHistory === "former" ||
        lifestyle.smokingHistory === "current" ||
        lifestyle.smokingHistory === "not current" ||
        lifestyle.smokingHistory === "No Info"
      ) {
        defaults.smoking_history = lifestyle.smokingHistory
      }

      setIntakeDefaults(defaults)
    } catch (error) {
      console.error("Unable to read saved health questionnaire:", error)
    }
  }, [])

  // FIXED: Save values for simulation page
  const handleResult = (apiResponse: PredictionResult, newInput: PredictionInput) => {
    setResult(apiResponse)
    setInput(newInput)

    // Store user health inputs
    localStorage.setItem(
      "healthData",
      JSON.stringify({
        bmi: newInput.bmi,
        hba1c: newInput.HbA1c_level,
        glucose: newInput.blood_glucose_level
      })
    )
  }

  // Resolve risk level
  const resolveLevel = () => {
    if (result?.risk_level) return result.risk_level

    if (result?.probability !== undefined) {
      const risk = result.probability * 100

      if (risk >= 80) return "High"
      if (risk >= 50) return "Medium"
      return "Low"
    }

    return null
  }

  const level = resolveLevel()

  const getRecommendations = (level?: string | null) => {
    if (!level) return []

    const data: Record<string,string[]> = {
      low: [
        "Maintain healthy lifestyle",
        "Regular exercise",
        "Balanced diet"
      ],
      medium: [
        "Consult doctor",
        "Reduce sugar intake",
        "Monitor blood glucose regularly"
      ],
      high: [
        "Immediate medical check required",
        "Strict diet control",
        "Continuous monitoring needed"
      ]
    }

    return data[level.toLowerCase()] || []
  }

  const recommendations = getRecommendations(level)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            Diabetes Risk Prediction
          </h1>

          <p className="text-muted-foreground">
            Enter your details to get prediction
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">

          {/* Prediction Form */}
          <PredictionForm onResult={handleResult} defaultValues={intakeDefaults} />

          {/* Result Section */}
          <div className="space-y-6">

            {result ? (
              <>
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle>Your Risk</CardTitle>
                    <CardDescription>
                      Based on your input
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex flex-col items-center">
                    <RiskGauge data={result} />

                    <p className="mt-4 text-sm">
                      Risk Level:
                      <b> {level || "Unknown"} </b>
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      Recommendations
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-2">
                      {recommendations.length > 0 ? (
                        recommendations.map((rec,i)=>(
                          <li key={i}>
                            • {rec}
                          </li>
                        ))
                      ) : (
                        <li>
                          No recommendation available
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button asChild>
                    <Link href="/simulation">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Simulate
                    </Link>
                  </Button>

                  <Button asChild variant="outline">
                    <Link href="/explain">
                      Explain
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  <Button asChild variant="outline">
                    <Link href="/report">
                      <FileText className="mr-2 h-4 w-4" />
                      Report
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <Card className="h-[300px] flex items-center justify-center">
                <CardContent>
                  <p>No Results Yet</p>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}