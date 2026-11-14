"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { HealthIntakeData, IntakeAnswer } from "@/lib/health-intake"

const answerOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unknown", label: "I don't know" },
]

const selectClassName =
  "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"

function Section({ title, description, children }: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  )
}

function ChoiceField({ id, label, value, options = answerOptions, onChange }: {
  id: string
  label: string
  value: string
  options?: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        className={selectClassName}
        value={value}
        required
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="" disabled>Select an answer</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  )
}

function NumberField({ id, label, value, min, max, step = "1", unit, onChange }: {
  id: string
  label: string
  value: string
  min: number
  max: number
  step?: string
  unit: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        step={step}
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <p className="text-xs text-muted-foreground">Range: {min}–{max} {unit}</p>
    </div>
  )
}

function emptyAnswers<T extends Record<string, string>>(fields: T): T {
  return Object.fromEntries(Object.keys(fields).map((key) => [key, ""])) as T
}

export default function HealthIntakePage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [personal, setPersonal] = useState({
    fullName: "",
    age: "",
    gender: "",
    heightCm: "",
    weightKg: "",
    familyHistory: "",
  })
  const [symptoms, setSymptoms] = useState(emptyAnswers({
    frequentUrination: "",
    increasedThirst: "",
    increasedHunger: "",
    unexplainedWeightLoss: "",
    fatigue: "",
    blurredVision: "",
  }))
  const [medicalHistory, setMedicalHistory] = useState(emptyAnswers({
    hypertension: "",
    heartDisease: "",
    prediabetes: "",
    diabetes: "",
  }))
  const [measurements, setMeasurements] = useState({
    hba1cKnown: "",
    hba1c: "",
    glucoseKnown: "",
    bloodGlucose: "",
    bloodPressureKnown: "",
    systolicBloodPressure: "",
    diastolicBloodPressure: "",
    previousTestHistory: "",
  })
  const [lifestyle, setLifestyle] = useState({
    smokingHistory: "",
    physicalActivity: "",
    walkingDuration: "",
    eatingHabits: "",
    sugaryDrinks: "",
    sleepDurationHours: "",
    sleepQuality: "",
    sittingTime: "",
  })

  const setPersonalField = (field: keyof typeof personal, value: string) => {
    setPersonal((previous) => ({ ...previous, [field]: value }))
  }

  const setSymptom = (field: keyof typeof symptoms, value: string) => {
    setSymptoms((previous) => ({ ...previous, [field]: value }))
  }

  const setHistory = (field: keyof typeof medicalHistory, value: string) => {
    setMedicalHistory((previous) => ({ ...previous, [field]: value }))
  }

  const setMeasurement = (field: keyof typeof measurements, value: string) => {
    setMeasurements((previous) => ({ ...previous, [field]: value }))
  }

  const setLifestyleField = (field: keyof typeof lifestyle, value: string) => {
    setLifestyle((previous) => ({ ...previous, [field]: value }))
  }

  const submitIntake = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const height = Number(personal.heightCm)
    const weight = Number(personal.weightKg)
    const hba1c = measurements.hba1cKnown === "yes" ? Number(measurements.hba1c) : null
    const glucose = measurements.glucoseKnown === "yes" ? Number(measurements.bloodGlucose) : null
    const systolic = measurements.bloodPressureKnown === "yes"
      ? Number(measurements.systolicBloodPressure)
      : null
    const diastolic = measurements.bloodPressureKnown === "yes"
      ? Number(measurements.diastolicBloodPressure)
      : null

    if (personal.gender !== "Male" && personal.gender !== "Female" && personal.gender !== "Other") {
      setError("Please select a gender.")
      return
    }

    const intake: HealthIntakeData = {
      personal: {
        fullName: personal.fullName.trim(),
        age: Number(personal.age),
        gender: personal.gender,
        heightCm: height,
        weightKg: weight,
        familyHistory: personal.familyHistory as IntakeAnswer,
      },
      symptoms: symptoms as HealthIntakeData["symptoms"],
      medicalHistory: medicalHistory as HealthIntakeData["medicalHistory"],
      measurements: {
        hba1c,
        bloodGlucose: glucose,
        systolicBloodPressure: systolic,
        diastolicBloodPressure: diastolic,
        previousTestHistory: measurements.previousTestHistory,
      },
      lifestyle: {
        smokingHistory: lifestyle.smokingHistory,
        physicalActivity: lifestyle.physicalActivity,
        walkingDuration: lifestyle.walkingDuration,
        eatingHabits: lifestyle.eatingHabits,
        sugaryDrinks: lifestyle.sugaryDrinks,
        sleepDurationHours: Number(lifestyle.sleepDurationHours),
        sleepQuality: lifestyle.sleepQuality,
        sittingTime: lifestyle.sittingTime,
      },
    }

    try {
      localStorage.setItem("healthIntake", JSON.stringify(intake))
      router.push("/prediction")
    } catch {
      setError("Unable to save your answers in this browser. Please check browser storage settings and try again.")
    }
  }

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <div className="mb-8">
        <Button asChild variant="ghost" className="-ml-3 mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Home
          </Link>
        </Button>
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary">Step 1 of 2</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Health questionnaire</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Enter your details below. The next page will ask for the 8 measurements used by the
          prediction model. You can choose “I don't know” for test measurements you haven't taken.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your health information</CardTitle>
          <CardDescription>Fields marked required need an answer before continuing.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitIntake} className="space-y-10">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Section title="1. Personal details" description="Personal information and family history.">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="full-name">Full name</Label>
                <Input id="full-name" autoComplete="name" maxLength={120} required value={personal.fullName} onChange={(event) => setPersonalField("fullName", event.target.value)} />
              </div>
              <NumberField id="age" label="Age" value={personal.age} min={1} max={120} unit="years" onChange={(value) => setPersonalField("age", value)} />
              <ChoiceField
                id="gender"
                label="Gender"
                value={personal.gender}
                options={[
                  { value: "Female", label: "Female" },
                  { value: "Male", label: "Male" },
                  { value: "Other", label: "Other" },
                ]}
                onChange={(value) => setPersonalField("gender", value)}
              />
              <NumberField id="height" label="Height" value={personal.heightCm} min={50} max={250} step="0.1" unit="cm" onChange={(value) => setPersonalField("heightCm", value)} />
              <NumberField id="weight" label="Weight" value={personal.weightKg} min={10} max={400} step="0.1" unit="kg" onChange={(value) => setPersonalField("weightKg", value)} />
              <ChoiceField id="family-history" label="Family history of diabetes" value={personal.familyHistory} onChange={(value) => setPersonalField("familyHistory", value)} />
            </Section>

            <Section title="2. Diabetes symptoms" description="Have you experienced these symptoms?">
              {([
                ["frequentUrination", "Frequent urination"],
                ["increasedThirst", "Increased thirst"],
                ["increasedHunger", "Increased hunger"],
                ["unexplainedWeightLoss", "Unexplained weight loss"],
                ["fatigue", "Fatigue or tiredness"],
                ["blurredVision", "Blurred vision"],
              ] as const).map(([field, label]) => (
                <ChoiceField key={field} id={`symptom-${field}`} label={label} value={symptoms[field]} onChange={(value) => setSymptom(field, value)} options={answerOptions.filter((option) => option.value !== "unknown")} />
              ))}
            </Section>

            <Section title="3. Medical history" description="Choose “I don't know” if you are unsure.">
              {([
                ["hypertension", "History of hypertension (high blood pressure)"],
                ["heartDisease", "History of heart disease"],
                ["prediabetes", "Previously diagnosed with prediabetes"],
                ["diabetes", "Previously diagnosed with diabetes"],
              ] as const).map(([field, label]) => (
                <ChoiceField key={field} id={`history-${field}`} label={label} value={medicalHistory[field]} onChange={(value) => setHistory(field, value)} />
              ))}
            </Section>

            <Section title="4. Health measurements" description="Use “I don't know” if you have not obtained a measurement.">
              <ChoiceField id="hba1c-known" label="Do you know your HbA1c result?" value={measurements.hba1cKnown} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "I don't know" }]} onChange={(value) => setMeasurement("hba1cKnown", value)} />
              {measurements.hba1cKnown === "yes" && (
                <NumberField id="hba1c" label="HbA1c" value={measurements.hba1c} min={3} max={20} step="0.1" unit="%" onChange={(value) => setMeasurement("hba1c", value)} />
              )}
              <ChoiceField id="glucose-known" label="Do you know your blood glucose result?" value={measurements.glucoseKnown} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "I don't know" }]} onChange={(value) => setMeasurement("glucoseKnown", value)} />
              {measurements.glucoseKnown === "yes" && (
                <NumberField id="glucose" label="Blood glucose" value={measurements.bloodGlucose} min={20} max={1000} unit="mg/dL" onChange={(value) => setMeasurement("bloodGlucose", value)} />
              )}
              <ChoiceField id="blood-pressure-known" label="Do you know your blood pressure?" value={measurements.bloodPressureKnown} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "I don't know" }]} onChange={(value) => setMeasurement("bloodPressureKnown", value)} />
              {measurements.bloodPressureKnown === "yes" && (
                <>
                  <NumberField id="systolic" label="Systolic (top number)" value={measurements.systolicBloodPressure} min={50} max={300} unit="mmHg" onChange={(value) => setMeasurement("systolicBloodPressure", value)} />
                  <NumberField id="diastolic" label="Diastolic (bottom number)" value={measurements.diastolicBloodPressure} min={30} max={200} unit="mmHg" onChange={(value) => setMeasurement("diastolicBloodPressure", value)} />
                </>
              )}
              <ChoiceField
                id="previous-test"
                label="Previous diabetes test history"
                value={measurements.previousTestHistory}
                options={[
                  { value: "never_tested", label: "Never tested" },
                  { value: "normal", label: "Previously normal result" },
                  { value: "prediabetes", label: "Previously indicated prediabetes" },
                  { value: "diabetes", label: "Previously indicated diabetes" },
                  { value: "unknown", label: "I don't know" },
                ]}
                onChange={(value) => setMeasurement("previousTestHistory", value)}
              />
            </Section>

            <Section title="5. Lifestyle information" description="Choose the option that best matches your usual routine.">
              <ChoiceField id="smoking" label="Smoking history" value={lifestyle.smokingHistory} options={[
                { value: "never", label: "Never smoked" },
                { value: "former", label: "Former smoker" },
                { value: "current", label: "Current smoker" },
                { value: "not current", label: "Not currently smoking" },
                { value: "No Info", label: "Prefer not to say" },
              ]} onChange={(value) => setLifestyleField("smokingHistory", value)} />
              <ChoiceField id="activity" label="Physical activity level" value={lifestyle.physicalActivity} options={[
                { value: "low", label: "Low — little planned activity" },
                { value: "moderate", label: "Moderate — some activity most weeks" },
                { value: "high", label: "High — frequent activity" },
              ]} onChange={(value) => setLifestyleField("physicalActivity", value)} />
              <ChoiceField id="walking" label="Daily walking duration" value={lifestyle.walkingDuration} options={[
                { value: "none", label: "None" },
                { value: "under_30", label: "1–29 minutes" },
                { value: "30_60", label: "30–60 minutes" },
                { value: "over_60", label: "More than 60 minutes" },
              ]} onChange={(value) => setLifestyleField("walkingDuration", value)} />
              <ChoiceField id="eating" label="Eating habits" value={lifestyle.eatingHabits} options={[
                { value: "balanced", label: "Mostly balanced" },
                { value: "mixed", label: "A mix of healthy and less healthy foods" },
                { value: "unbalanced", label: "Often unbalanced" },
              ]} onChange={(value) => setLifestyleField("eatingHabits", value)} />
              <ChoiceField id="sugary-drinks" label="Sugary drink consumption" value={lifestyle.sugaryDrinks} options={[
                { value: "rarely", label: "Never or rarely" },
                { value: "weekly", label: "A few times a week" },
                { value: "daily", label: "About once a day" },
                { value: "multiple_daily", label: "More than once a day" },
              ]} onChange={(value) => setLifestyleField("sugaryDrinks", value)} />
              <NumberField id="sleep-duration" label="Sleep duration" value={lifestyle.sleepDurationHours} min={0} max={24} step="0.5" unit="hours/night" onChange={(value) => setLifestyleField("sleepDurationHours", value)} />
              <ChoiceField id="sleep-quality" label="Sleep quality" value={lifestyle.sleepQuality} options={[
                { value: "good", label: "Good" },
                { value: "fair", label: "Fair" },
                { value: "poor", label: "Poor" },
              ]} onChange={(value) => setLifestyleField("sleepQuality", value)} />
              <ChoiceField id="sitting-time" label="Daily sitting time" value={lifestyle.sittingTime} options={[
                { value: "under_4", label: "Less than 4 hours" },
                { value: "4_8", label: "4–8 hours" },
                { value: "8_12", label: "8–12 hours" },
                { value: "over_12", label: "More than 12 hours" },
              ]} onChange={(value) => setLifestyleField("sittingTime", value)} />
            </Section>

            <div className="space-y-4 border-t pt-6">
              <p className="text-sm text-muted-foreground">
                Answers are saved in this browser first. When you submit a prediction while signed
                in, your questionnaire, prediction inputs, and result are saved to your account.
                Questionnaire answers are not sent to the prediction model.
              </p>
              <Button type="submit" size="lg" className="w-full">
                Continue to Diabetes Risk Prediction
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
