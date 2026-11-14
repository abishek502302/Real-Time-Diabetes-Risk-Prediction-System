"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Activity,
  ArrowLeft,
  Download,
  FileText,
  HeartPulse,
  ShieldAlert,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { PredictionInput, PredictionResult } from "@/components/prediction-form"
import type { HealthIntakeData, IntakeAnswer } from "@/lib/health-intake"
import { cn } from "@/lib/utils"

interface ReportData {
  input: ReportInput | null
  result: PredictionResult | null
  intake: HealthIntakeData | null
}

type ReportInput = Omit<
  PredictionInput,
  "hypertension" | "heart_disease" | "HbA1c_level" | "blood_glucose_level"
> & {
  hypertension: 0 | 1 | null
  heart_disease: 0 | 1 | null
  HbA1c_level: number | null
  blood_glucose_level: number | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isString(value: unknown): value is string {
  return typeof value === "string"
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

function isIntakeAnswer(value: unknown): value is IntakeAnswer {
  return value === "yes" || value === "no" || value === "unknown"
}

function isHealthIntake(value: unknown): value is HealthIntakeData {
  if (!isRecord(value)) return false
  const personal = isRecord(value.personal) ? value.personal : value
  const { symptoms, medicalHistory, measurements, lifestyle } = value
  if (
    !isRecord(personal) ||
    !isRecord(symptoms) ||
    !isRecord(medicalHistory) ||
    !isRecord(measurements) ||
    !isRecord(lifestyle)
  ) return false

  return (
    isString(personal.fullName) &&
    isFiniteNumber(personal.age) &&
    (personal.gender === "Male" || personal.gender === "Female" || personal.gender === "Other") &&
    isFiniteNumber(personal.heightCm) &&
    isFiniteNumber(personal.weightKg) &&
    isIntakeAnswer(personal.familyHistory) &&
    isIntakeAnswer(symptoms.frequentUrination) &&
    isIntakeAnswer(symptoms.increasedThirst) &&
    isIntakeAnswer(symptoms.increasedHunger) &&
    isIntakeAnswer(symptoms.unexplainedWeightLoss) &&
    isIntakeAnswer(symptoms.fatigue) &&
    isIntakeAnswer(symptoms.blurredVision) &&
    isIntakeAnswer(medicalHistory.hypertension) &&
    isIntakeAnswer(medicalHistory.heartDisease) &&
    isIntakeAnswer(medicalHistory.prediabetes) &&
    isIntakeAnswer(medicalHistory.diabetes) &&
    (measurements.hba1c === null || isFiniteNumber(measurements.hba1c)) &&
    (measurements.bloodGlucose === null || isFiniteNumber(measurements.bloodGlucose)) &&
    (measurements.systolicBloodPressure === null ||
      isFiniteNumber(measurements.systolicBloodPressure)) &&
    (measurements.diastolicBloodPressure === null ||
      isFiniteNumber(measurements.diastolicBloodPressure)) &&
    isString(measurements.previousTestHistory) &&
    isString(lifestyle.smokingHistory) &&
    isString(lifestyle.physicalActivity) &&
    isString(lifestyle.walkingDuration) &&
    isString(lifestyle.eatingHabits) &&
    isString(lifestyle.sugaryDrinks) &&
    isFiniteNumber(lifestyle.sleepDurationHours) &&
    isString(lifestyle.sleepQuality) &&
    isString(lifestyle.sittingTime)
  )
}

function formatAnswer(value: string) {
  if (value === "yes") return "Yes"
  if (value === "no") return "No"
  if (value === "unknown") return "I don't know"

  const labels: Record<string, string> = {
    never_tested: "Never tested",
    normal: "Previously normal result",
    prediabetes: "Previously indicated prediabetes",
    diabetes: "Previously indicated diabetes",
    never: "Never smoked",
    former: "Former smoker",
    current: "Current smoker",
    "not current": "Not currently smoking",
    "No Info": "Prefer not to say",
    low: "Low",
    moderate: "Moderate",
    high: "High",
    none: "None",
    under_30: "1–29 minutes",
    "30_60": "30–60 minutes",
    over_60: "More than 60 minutes",
    balanced: "Mostly balanced",
    mixed: "A mix of healthy and less healthy foods",
    unbalanced: "Often unbalanced",
    rarely: "Never or rarely",
    weekly: "A few times a week",
    daily: "About once a day",
    multiple_daily: "More than once a day",
    good: "Good",
    fair: "Fair",
    poor: "Poor",
    under_4: "Less than 4 hours",
    "4_8": "4–8 hours",
    "8_12": "8–12 hours",
    over_12: "More than 12 hours",
  }

  return labels[value] ?? value
}

function isPredictionInput(value: unknown): value is ReportInput {
  if (!value || typeof value !== "object") return false
  const input = value as Record<string, unknown>
  const smokingHistory = ["never", "former", "current", "not current", "No Info"]

  return (
    (input.gender === "Male" || input.gender === "Female" || input.gender === "Other") &&
    typeof input.age === "number" &&
    Number.isFinite(input.age) &&
    typeof input.bmi === "number" &&
    Number.isFinite(input.bmi) &&
    (input.HbA1c_level === null ||
      (typeof input.HbA1c_level === "number" && Number.isFinite(input.HbA1c_level))) &&
    (input.blood_glucose_level === null ||
      (typeof input.blood_glucose_level === "number" &&
        Number.isFinite(input.blood_glucose_level))) &&
    (input.hypertension === null || input.hypertension === 0 || input.hypertension === 1) &&
    (input.heart_disease === null || input.heart_disease === 0 || input.heart_disease === 1) &&
    typeof input.smoking_history === "string" &&
    smokingHistory.includes(input.smoking_history)
  )
}

function isPredictionResult(value: unknown): value is PredictionResult {
  if (!value || typeof value !== "object") return false
  const result = value as Record<string, unknown>

  return (
    (result.prediction === 0 || result.prediction === 1) &&
    typeof result.probability === "number" &&
    Number.isFinite(result.probability) &&
    result.probability >= 0 &&
    result.probability <= 1 &&
    (result.risk_level === "Low" ||
      result.risk_level === "Medium" ||
      result.risk_level === "High")
  )
}

function isShapExplanation(value: unknown): value is NonNullable<PredictionResult["shap_explanation"]> {
  if (!value || typeof value !== "object") return false
  const explanation = value as Record<string, unknown>
  if (
    explanation.method !== "Kernel SHAP" ||
    typeof explanation.base_value !== "number" ||
    !Number.isFinite(explanation.base_value) ||
    typeof explanation.output_value !== "number" ||
    !Number.isFinite(explanation.output_value) ||
    !Array.isArray(explanation.features)
  ) {
    return false
  }
  return explanation.features.every((feature: unknown) => {
    if (!feature || typeof feature !== "object") return false
    const item = feature as Record<string, unknown>
    return (
      typeof item.feature === "string" &&
      (typeof item.value === "string" ||
        (typeof item.value === "number" && Number.isFinite(item.value))) &&
      typeof item.shap_value === "number" &&
      Number.isFinite(item.shap_value)
    )
  })
}

function getFactorRisk(shapValue: number) {
  if (shapValue > 0.01) {
    return {
      label: "Raises risk",
      className: "bg-risk-high/10 text-risk-high",
    }
  }
  if (shapValue < -0.01) {
    return {
      label: "Lowers risk",
      className: "bg-risk-low/10 text-risk-low",
    }
  }
  return {
    label: "Limited effect",
    className: "bg-risk-medium/15 text-foreground",
  }
}

const reportFeatures = [
  { label: "Age", value: (input: ReportInput) => `${input.age} years` },
  { label: "Gender", value: (input: ReportInput) => input.gender },
  { label: "BMI", value: (input: ReportInput) => `${input.bmi.toFixed(1)} kg/m²` },
  {
    label: "Blood glucose",
    value: (input: ReportInput) =>
      input.blood_glucose_level === null
        ? "Not provided"
        : `${input.blood_glucose_level} mg/dL`,
  },
  {
    label: "HbA1c",
    value: (input: ReportInput) =>
      input.HbA1c_level === null ? "Not provided" : `${input.HbA1c_level}%`,
  },
  {
    label: "Hypertension",
    value: (input: ReportInput) =>
      input.hypertension === null ? "Not provided" : input.hypertension ? "Yes" : "No",
  },
  {
    label: "Heart disease",
    value: (input: ReportInput) =>
      input.heart_disease === null ? "Not provided" : input.heart_disease ? "Yes" : "No",
  },
  {
    label: "Smoking history",
    value: (input: ReportInput) =>
      input.smoking_history === "No Info" ? "No information" : input.smoking_history,
  },
]

export default function ReportPage() {
  const [report, setReport] = useState<ReportData | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("lastPrediction")
    try {
      let intake: HealthIntakeData | null = null
      let storedPrediction: Record<string, unknown> | null = null

      if (stored) {
        try {
          const parsedPrediction: unknown = JSON.parse(stored)
          if (isRecord(parsedPrediction)) storedPrediction = parsedPrediction
          else console.error("Saved prediction data is invalid.")
        } catch (predictionError) {
          console.error("Unable to read saved prediction data:", predictionError)
        }
      }

      const savedIntake = storedPrediction?.intake
      if (isHealthIntake(savedIntake)) intake = savedIntake

      if (!intake) {
        const storedIntake = localStorage.getItem("healthIntake")
        if (storedIntake) {
          try {
            const parsedIntake: unknown = JSON.parse(storedIntake)
            if (isHealthIntake(parsedIntake)) intake = parsedIntake
            else console.error("Saved health questionnaire data is incomplete or invalid.")
          } catch (intakeError) {
            console.error("Unable to read saved health questionnaire data:", intakeError)
          }
        }
      }

      const input = isPredictionInput(storedPrediction?.input)
        ? storedPrediction.input
        : null
      const savedResult = isPredictionResult(storedPrediction?.result)
        ? storedPrediction.result
        : null
      const result = savedResult
        ? {
            ...savedResult,
            shap_explanation: isShapExplanation(savedResult.shap_explanation)
              ? savedResult.shap_explanation
              : undefined,
          }
        : null

      if (!input && !result && !intake && !storedPrediction) {
        setLoadError("No saved prediction or health questionnaire was found. Complete the assessment to generate your report.")
        return
      }

      setReport({ input, result, intake })
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to read the saved prediction. Please run a new prediction.",
      )
    }
  }, [])

  if (loadError) {
    return (
      <div className="container mx-auto flex min-h-[65vh] max-w-2xl items-center justify-center px-4 py-12">
        <Card className="w-full">
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <FileText className="h-7 w-7 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-semibold">Report not available</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{loadError}</p>
            <Button asChild className="mt-6">
              <Link href="/prediction">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go to prediction
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
      </div>
    )
  }

  const shapExplanation = report.result?.shap_explanation
  const topFactors = shapExplanation
    ? [...shapExplanation.features]
        .sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
        .slice(0, 5)
    : []
  const intake = report.intake
  const predictionInput = report.input
  const questionnaireSections = [
    {
      title: "1. Personal details",
      fields: [
        ["Full name", intake?.personal.fullName || "Not saved"],
        ["Age (range: 1–120 years)", intake ? `${intake.personal.age} years` : "Not saved"],
        ["Gender", intake?.personal.gender ?? "Not saved"],
        ["Height (range: 50–250 cm)", intake ? `${intake.personal.heightCm} cm` : "Not saved"],
        ["Weight (range: 10–400 kg)", intake ? `${intake.personal.weightKg} kg` : "Not saved"],
        [
          "Family history of diabetes",
          intake ? formatAnswer(intake.personal.familyHistory) : "Not saved",
        ],
      ],
    },
    {
      title: "2. Diabetes symptoms",
      fields: [
        ["Frequent urination", intake ? formatAnswer(intake.symptoms.frequentUrination) : "Not saved"],
        ["Increased thirst", intake ? formatAnswer(intake.symptoms.increasedThirst) : "Not saved"],
        ["Increased hunger", intake ? formatAnswer(intake.symptoms.increasedHunger) : "Not saved"],
        [
          "Unexplained weight loss",
          intake ? formatAnswer(intake.symptoms.unexplainedWeightLoss) : "Not saved",
        ],
        ["Fatigue or tiredness", intake ? formatAnswer(intake.symptoms.fatigue) : "Not saved"],
        ["Blurred vision", intake ? formatAnswer(intake.symptoms.blurredVision) : "Not saved"],
      ],
    },
    {
      title: "3. Medical history",
      fields: [
        ["Hypertension", intake ? formatAnswer(intake.medicalHistory.hypertension) : "Not saved"],
        ["Heart disease", intake ? formatAnswer(intake.medicalHistory.heartDisease) : "Not saved"],
        [
          "Previous prediabetes diagnosis",
          intake ? formatAnswer(intake.medicalHistory.prediabetes) : "Not saved",
        ],
        [
          "Previous diabetes diagnosis",
          intake ? formatAnswer(intake.medicalHistory.diabetes) : "Not saved",
        ],
      ],
    },
    {
      title: "4. Health measurements",
      fields: [
        [
          "HbA1c (range: 3–20%)",
          !intake
            ? "Not saved"
            : intake.measurements.hba1c === null
              ? "I don't know"
              : `${intake.measurements.hba1c}%`,
        ],
        [
          "Blood glucose (range: 20–1000 mg/dL)",
          !intake
            ? "Not saved"
            : intake.measurements.bloodGlucose === null
              ? "I don't know"
              : `${intake.measurements.bloodGlucose} mg/dL`,
        ],
        [
          "Systolic blood pressure (range: 50–300 mmHg)",
          !intake
            ? "Not saved"
            : intake.measurements.systolicBloodPressure === null
              ? "I don't know"
              : `${intake.measurements.systolicBloodPressure} mmHg`,
        ],
        [
          "Diastolic blood pressure (range: 30–200 mmHg)",
          !intake
            ? "Not saved"
            : intake.measurements.diastolicBloodPressure === null
              ? "I don't know"
              : `${intake.measurements.diastolicBloodPressure} mmHg`,
        ],
        [
          "Previous diabetes test history",
          intake ? formatAnswer(intake.measurements.previousTestHistory) : "Not saved",
        ],
      ],
    },
    {
      title: "5. Lifestyle information",
      fields: [
        ["Smoking history", intake ? formatAnswer(intake.lifestyle.smokingHistory) : "Not saved"],
        [
          "Physical activity level",
          intake ? formatAnswer(intake.lifestyle.physicalActivity) : "Not saved",
        ],
        [
          "Daily walking duration",
          intake ? formatAnswer(intake.lifestyle.walkingDuration) : "Not saved",
        ],
        ["Eating habits", intake ? formatAnswer(intake.lifestyle.eatingHabits) : "Not saved"],
        [
          "Sugary drink consumption",
          intake ? formatAnswer(intake.lifestyle.sugaryDrinks) : "Not saved",
        ],
        [
          "Sleep duration (range: 0–24 hours/night)",
          intake ? `${intake.lifestyle.sleepDurationHours} hours/night` : "Not saved",
        ],
        ["Sleep quality", intake ? formatAnswer(intake.lifestyle.sleepQuality) : "Not saved"],
        ["Daily sitting time", intake ? formatAnswer(intake.lifestyle.sittingTime) : "Not saved"],
      ],
    },
  ]

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary">
            DiabetesPredict
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Health risk report
          </h1>
          <p className="mt-2 text-muted-foreground">
            A summary of the health information used in your latest prediction.
          </p>
        </div>
        <Button onClick={() => window.print()} className="print:hidden">
          <Download className="mr-2 h-4 w-4" />
          Print / Save as PDF
        </Button>
      </div>

      <div className="space-y-6">
        {report.result ? <Card className="overflow-hidden">
          <div className="grid md:grid-cols-[1fr_auto]">
            <CardContent className="flex items-center gap-4 p-6 sm:p-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Predicted diabetes risk</p>
                <p className="mt-1 text-3xl font-semibold">
                  {Math.round(report.result.probability * 100)}%
                </p>
              </div>
            </CardContent>
            <div className="flex items-center border-t bg-muted/30 px-6 py-4 md:border-l md:border-t-0 md:px-8">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Risk category
                </p>
                <span
                  className={cn(
                    "mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold",
                    report.result.risk_level === "Low" && "bg-risk-low/10 text-risk-low",
                    report.result.risk_level === "Medium" &&
                      "bg-risk-medium/15 text-foreground",
                    report.result.risk_level === "High" && "bg-risk-high/10 text-risk-high",
                  )}
                >
                  {report.result.risk_level} risk
                </span>
              </div>
            </div>
          </div>
        </Card> : (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Prediction result is not available in the saved data. The saved questionnaire
              responses are shown below.
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-primary" />
              Input features
            </CardTitle>
            <CardDescription>All health features submitted for this prediction.</CardDescription>
          </CardHeader>
          <CardContent>
            {predictionInput ? (
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {reportFeatures.map((feature) => (
                <div
                  key={feature.label}
                  className="rounded-xl border border-border/70 bg-muted/20 p-4"
                >
                  <dt className="text-sm text-muted-foreground">{feature.label}</dt>
                  <dd className="mt-1 font-semibold">{feature.value(predictionInput)}</dd>
                </div>
              ))}
            </dl>
            ) : (
              <p className="text-sm text-muted-foreground">
                Prediction inputs are unavailable. The complete questionnaire responses are
                listed in the next section.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Health questionnaire responses</CardTitle>
            <CardDescription>
              All questionnaire fields and the saved answers. “Not saved” means this report was
              created without a saved answer for that field.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!intake && (
              <div className="mb-6 rounded-xl border border-dashed p-5 text-sm">
                <p className="font-medium">No questionnaire answers were saved with this report.</p>
                <p className="mt-1 text-muted-foreground">
                  The full list of fields is shown below. Complete the questionnaire before your
                  next prediction to save your answers here.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-4 print:hidden">
                  <Link href="/health-intake">Complete health questionnaire</Link>
                </Button>
              </div>
            )}
            <div className="space-y-8">
              {questionnaireSections.map((section) => (
                <section key={section.title}>
                  <h3 className="mb-3 font-semibold">{section.title}</h3>
                  <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {section.fields.map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-border/70 bg-muted/20 p-4">
                        <dt className="text-sm text-muted-foreground">{label}</dt>
                        <dd className="mt-1 font-semibold">{value || "Not saved"}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              Top 5 SHAP factors
            </CardTitle>
            <CardDescription>
              Kernel SHAP values for this prediction, ranked by absolute contribution to the
              predicted probability.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {shapExplanation ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-muted/40 p-4">
                    <p className="text-sm text-muted-foreground">Background expectation</p>
                    <p className="mt-1 text-xl font-semibold">
                      {(shapExplanation.base_value * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div className="rounded-xl bg-primary/[0.06] p-4">
                    <p className="text-sm text-muted-foreground">Explained prediction output</p>
                    <p className="mt-1 text-xl font-semibold">
                      {(shapExplanation.output_value * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Each SHAP value shows how much that feature moves the prediction from the
                  background expectation, in percentage points.
                </p>
                {topFactors.map((factor, index) => {
                  const factorRisk = getFactorRisk(factor.shap_value)
                  const signedValue = factor.shap_value * 100

                  return (
                    <article
                      key={factor.feature}
                      className="grid gap-3 rounded-xl border border-border/70 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{factor.feature}</h3>
                          <span className="text-sm text-muted-foreground">{factor.value}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <span className="font-mono text-sm font-semibold">
                          {signedValue > 0 ? "+" : ""}
                          {signedValue.toFixed(2)} pp
                        </span>
                        <span
                          className={cn(
                            "w-fit rounded-full px-3 py-1 text-xs font-semibold",
                            factorRisk.className,
                          )}
                        >
                          {factorRisk.label}
                        </span>
                      </div>
                    </article>
                  )
                })}
              </>
            ) : (
              <div className="rounded-xl border border-dashed p-5 text-sm">
                <p className="font-medium">SHAP values aren&apos;t available for this saved prediction.</p>
                <p className="mt-1 text-muted-foreground">
                  Run a new prediction to calculate a model explanation.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-4 print:hidden">
                  <Link href="/prediction">Run a new prediction</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            These Kernel SHAP values explain this application&apos;s prediction output, including
            its post-prediction risk adjustments, relative to the report&apos;s background dataset.
            They describe model behavior, not a medical diagnosis or an individual clinical
            assessment. Discuss health concerns with a qualified healthcare professional.
          </p>
        </div>
      </div>
    </div>
  )
}
