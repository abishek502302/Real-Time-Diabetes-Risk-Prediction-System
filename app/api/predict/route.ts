
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { HealthIntakeData, IntakeAnswer } from "@/lib/health-intake"
import type {
  PredictionInput,
  PredictionResult,
} from "@/components/prediction-form"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

function inRange(
  value: unknown,
  min: number,
  max: number,
): value is number {
  return isFiniteNumber(value) && value >= min && value <= max
}

function isAnswer(value: unknown): value is IntakeAnswer {
  return value === "yes" || value === "no" || value === "unknown"
}

function isYesNo(value: unknown): value is "yes" | "no" {
  return value === "yes" || value === "no"
}

function isHealthIntake(value: unknown): value is HealthIntakeData {
  if (!isRecord(value)) return false

  const { personal, symptoms, medicalHistory, measurements, lifestyle } = value

  if (
    !isRecord(personal) ||
    !isRecord(symptoms) ||
    !isRecord(medicalHistory) ||
    !isRecord(measurements) ||
    !isRecord(lifestyle)
  ) return false

  const hba1cKnown = measurements.hba1c !== null
  const glucoseKnown = measurements.bloodGlucose !== null

  const bloodPressureKnown =
    measurements.systolicBloodPressure !== null ||
    measurements.diastolicBloodPressure !== null

  return (
    typeof personal.fullName === "string" &&
    personal.fullName.trim().length > 0 &&
    personal.fullName.length <= 120 &&
    inRange(personal.age, 1, 120) &&
    ["Male", "Female", "Other"].includes(String(personal.gender)) &&
    inRange(personal.heightCm, 50, 250) &&
    inRange(personal.weightKg, 10, 400) &&
    isAnswer(personal.familyHistory) &&
    isYesNo(symptoms.frequentUrination) &&
    isYesNo(symptoms.increasedThirst) &&
    isYesNo(symptoms.increasedHunger) &&
    isYesNo(symptoms.unexplainedWeightLoss) &&
    isYesNo(symptoms.fatigue) &&
    isYesNo(symptoms.blurredVision) &&
    isAnswer(medicalHistory.hypertension) &&
    isAnswer(medicalHistory.heartDisease) &&
    isAnswer(medicalHistory.prediabetes) &&
    isAnswer(medicalHistory.diabetes) &&
    (hba1cKnown
      ? inRange(measurements.hba1c, 3, 20)
      : measurements.hba1c === null) &&
    (glucoseKnown
      ? inRange(measurements.bloodGlucose, 20, 1000)
      : measurements.bloodGlucose === null) &&
    (bloodPressureKnown
      ? inRange(measurements.systolicBloodPressure, 50, 300) &&
        inRange(measurements.diastolicBloodPressure, 30, 200)
      : measurements.systolicBloodPressure === null &&
        measurements.diastolicBloodPressure === null) &&
    ["never_tested", "normal", "prediabetes", "diabetes", "unknown"].includes(
      String(measurements.previousTestHistory),
    ) &&
    ["never", "former", "current", "not current", "No Info"].includes(
      String(lifestyle.smokingHistory),
    ) &&
    ["low", "moderate", "high"].includes(String(lifestyle.physicalActivity)) &&
    ["none", "under_30", "30_60", "over_60"].includes(
      String(lifestyle.walkingDuration),
    ) &&
    ["balanced", "mixed", "unbalanced"].includes(
      String(lifestyle.eatingHabits),
    ) &&
    ["rarely", "weekly", "daily", "multiple_daily"].includes(
      String(lifestyle.sugaryDrinks),
    ) &&
    inRange(lifestyle.sleepDurationHours, 0, 24) &&
    ["good", "fair", "poor"].includes(String(lifestyle.sleepQuality)) &&
    ["under_4", "4_8", "8_12", "over_12"].includes(
      String(lifestyle.sittingTime),
    )
  )
}

function isPredictionInput(value: unknown): value is PredictionInput {
  if (!isRecord(value)) return false

  return (
    ["Female", "Male", "Other"].includes(String(value.gender)) &&
    inRange(value.age, 1, 120) &&
    inRange(value.bmi, 10, 60) &&
    (value.hypertension === 0 || value.hypertension === 1) &&
    (value.heart_disease === 0 || value.heart_disease === 1) &&
    ["never", "former", "current", "not current", "No Info"].includes(
      String(value.smoking_history),
    ) &&
    inRange(value.HbA1c_level, 3, 15) &&
    inRange(value.blood_glucose_level, 50, 500)
  )
}

function isPredictionResult(value: unknown): value is PredictionResult {
  if (!isRecord(value)) return false

  return (
    (value.prediction === 0 || value.prediction === 1) &&
    inRange(value.probability, 0, 1) &&
    ["Low", "Medium", "High"].includes(String(value.risk_level))
  )
}

export async function POST(request: NextRequest) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    )
  }

  if (
    !isRecord(body) ||
    !isPredictionInput(body.predictionInput) ||
    !isHealthIntake(body.questionnaire)
  ) {
    return NextResponse.json(
      {
        error:
          "Valid prediction inputs and the completed health questionnaire are required.",
      },
      { status: 400 },
    )
  }

  let supabase

  try {
    supabase = await createClient()
  } catch (error) {
    console.error("Unable to initialize Supabase:", error)

    return NextResponse.json(
      { error: "Unable to connect to the database service." },
      { status: 500 },
    )
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: "Sign in before running and saving an assessment." },
      { status: 401 },
    )
  }

  const predictionInput = body.predictionInput
  const questionnaire = body.questionnaire

  let mlResponse: Response

  try {
    mlResponse = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(predictionInput),
    })
  } catch (error) {
    console.error("Unable to connect to the ML backend:", error)

    return NextResponse.json(
      {
        error:
          "Failed to connect to the ML backend. Make sure the server is running at http://127.0.0.1:8000",
      },
      { status: 503 },
    )
  }

  if (!mlResponse.ok) {
    const errorText = await mlResponse.text()

    return NextResponse.json(
      { error: `ML API error: ${errorText}` },
      { status: mlResponse.status },
    )
  }

  let result: PredictionResult

  try {
    const parsedResult: unknown = await mlResponse.json()

    if (!isPredictionResult(parsedResult)) {
      console.error("ML backend returned an invalid prediction result.")

      return NextResponse.json(
        { error: "ML backend returned an invalid prediction result." },
        { status: 502 },
      )
    }

    result = parsedResult
  } catch (error) {
    console.error("Unable to parse the ML backend response:", error)

    return NextResponse.json(
      { error: "ML backend returned invalid JSON." },
      { status: 502 },
    )
  }

  try {
    const { error: saveError } = await supabase
      .from("prediction_history")
      .insert({
        // Do not supply id; PostgreSQL generates it automatically.
        user_id: user.id,
        full_name: questionnaire.personal.fullName.trim(),
        age: predictionInput.age,
        gender: predictionInput.gender,
        bmi: predictionInput.bmi,
        hba1c: predictionInput.HbA1c_level,
        blood_glucose: predictionInput.blood_glucose_level,
        hypertension: predictionInput.hypertension,
        heart_disease: predictionInput.heart_disease,
        smoking_history: predictionInput.smoking_history,
        prediction: result.prediction,
        prediction_label:
          result.prediction === 1 ? "Diabetes" : "No Diabetes",
        risk_probability: result.probability,
      })

    if (saveError) {
      console.error("Unable to save prediction history:", {
        code: saveError.code,
        message: saveError.message,
        details: saveError.details,
        hint: saveError.hint,
      })

      return NextResponse.json(
        process.env.NODE_ENV === "development"
          ? {
              error: "Prediction completed, but saving failed.",
              databaseErrorCode: saveError.code,
              databaseErrorMessage: saveError.message,
              databaseErrorDetails: saveError.details,
              databaseErrorHint: saveError.hint,
            }
          : { error: "Prediction completed, but saving failed." },
        { status: 500 },
      )
    }

    return NextResponse.json({
      ...result,
      saved: true,
    })
  } catch (error) {
    console.error("Unable to persist prediction history:", error)

    return NextResponse.json(
      { error: "Prediction completed, but saving it to the database failed." },
      { status: 500 },
    )
  }
}
