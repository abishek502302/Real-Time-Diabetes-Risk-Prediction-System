"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export interface PredictionInput {
  gender: "Male" | "Female" | "Other"
  age: number
  hypertension: 0 | 1
  heart_disease: 0 | 1
  smoking_history: "never" | "former" | "current" | "not current" | "No Info"
  bmi: number
  HbA1c_level: number
  blood_glucose_level: number
}

export interface PredictionResult {
  prediction: 0 | 1
  probability: number
  risk_level: "Low" | "Medium" | "High"
  assessment_id?: string
  shap_explanation?: {
    method: "Tree SHAP" | "Kernel SHAP"
    base_value: number
    output_value: number
    features: {
      feature: string
      feature_key?: string
      value: string | number
      shap_value: number
      impact?: "positive" | "negative" | "neutral"
    }[]
  }
}

interface PredictionFormProps {
  onResult?: (result: PredictionResult, input: PredictionInput) => void
  defaultValues?: Partial<PredictionInput>
  compact?: boolean
}

export function PredictionForm({ onResult, defaultValues, compact = false }: PredictionFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsSignIn, setNeedsSignIn] = useState(false)
  const [formData, setFormData] = useState<PredictionInput>({
    gender: defaultValues?.gender ?? "Male",
    age: defaultValues?.age ?? 45,
    hypertension: defaultValues?.hypertension ?? 0,
    heart_disease: defaultValues?.heart_disease ?? 0,
    smoking_history: defaultValues?.smoking_history ?? "never",
    bmi: defaultValues?.bmi ?? 25,
    HbA1c_level: defaultValues?.HbA1c_level ?? 5.5,
    blood_glucose_level: defaultValues?.blood_glucose_level ?? 100,
  })

  useEffect(() => {
    if (defaultValues) {
      setFormData((previous) => ({ ...previous, ...defaultValues }))
    }
  }, [defaultValues])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setNeedsSignIn(false)

    try {
      const storedIntake = localStorage.getItem("healthIntake")
      if (!storedIntake) {
        throw new Error("Complete the health questionnaire before starting the prediction.")
      }

      let intake: unknown
      try {
        intake = JSON.parse(storedIntake)
      } catch {
        throw new Error("Your saved health questionnaire is invalid. Please complete it again.")
      }

      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ predictionInput: formData, questionnaire: intake }),
      })

      if (!response.ok) {
        const errorData: unknown = await response.json()
        if (response.status === 401) setNeedsSignIn(true)
        if (typeof errorData === "object" && errorData !== null) {
          const payload = errorData as {
            error?: unknown
            databaseErrorCode?: unknown
            databaseErrorMessage?: unknown
          }
          const message =
            typeof payload.error === "string" ? payload.error : "Prediction failed"
          const databaseDiagnostic =
            process.env.NODE_ENV === "development" &&
            typeof payload.databaseErrorCode === "string" &&
            typeof payload.databaseErrorMessage === "string"
              ? ` Supabase error ${payload.databaseErrorCode}: ${payload.databaseErrorMessage}`
              : ""
          throw new Error(`${message}${databaseDiagnostic}`)
        }
        throw new Error("Prediction failed")
      }

      const result: PredictionResult = await response.json()
      localStorage.setItem("lastPrediction", JSON.stringify({ input: formData, result, intake }))
      onResult?.(result, formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const updateField = <K extends keyof PredictionInput>(field: K, value: PredictionInput[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className={compact ? "border-0 shadow-none" : ""}>
      {!compact && (
        <CardHeader>
          <CardTitle>Health Information</CardTitle>
          <CardDescription>Enter your health metrics for diabetes risk assessment</CardDescription>
        </CardHeader>
      )}
      <CardContent className={compact ? "p-0" : ""}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                {needsSignIn && (
                  <> <Link href="/auth/login" className="font-medium underline">Sign in</Link> to save your assessment.</>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value: PredictionInput["gender"]) => updateField("gender", value)}
              >
                <SelectTrigger id="gender"><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age (years)</Label>
              <Input id="age" type="number" min={1} max={120} value={formData.age} onChange={(e) => updateField("age", parseInt(e.target.value) || 0)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bmi">BMI (kg/m²)</Label>
              <Input id="bmi" type="number" step="0.1" min={10} max={60} value={formData.bmi} onChange={(e) => updateField("bmi", parseFloat(e.target.value) || 0)} />
              <p className="text-xs text-muted-foreground">Normal range: 18.5–24.9</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hba1c">HbA1c Level (%)</Label>
              <Input id="hba1c" type="number" step="0.1" min={3} max={15} value={formData.HbA1c_level} onChange={(e) => updateField("HbA1c_level", parseFloat(e.target.value) || 0)} />
              <p className="text-xs text-muted-foreground">Normal: below 5.7%</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="glucose">Blood Glucose (mg/dL)</Label>
              <Input id="glucose" type="number" min={50} max={500} value={formData.blood_glucose_level} onChange={(e) => updateField("blood_glucose_level", parseInt(e.target.value) || 0)} />
              <p className="text-xs text-muted-foreground">Fasting normal: 70–100</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smoking">Smoking History</Label>
              <Select
                value={formData.smoking_history}
                onValueChange={(value: PredictionInput["smoking_history"]) => updateField("smoking_history", value)}
              >
                <SelectTrigger id="smoking"><SelectValue placeholder="Select smoking history" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never Smoked</SelectItem>
                  <SelectItem value="former">Former Smoker</SelectItem>
                  <SelectItem value="current">Current Smoker</SelectItem>
                  <SelectItem value="not current">Not Current</SelectItem>
                  <SelectItem value="No Info">No Information</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Health Conditions</h3>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <Switch id="hypertension" checked={formData.hypertension === 1} onCheckedChange={(checked) => updateField("hypertension", checked ? 1 : 0)} />
                <Label htmlFor="hypertension" className="cursor-pointer">Hypertension</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch id="heart_disease" checked={formData.heart_disease === 1} onCheckedChange={(checked) => updateField("heart_disease", checked ? 1 : 0)} />
                <Label htmlFor="heart_disease" className="cursor-pointer">Heart Disease</Label>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? <><Spinner className="mr-2" />Analyzing...</> : "Get Prediction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
