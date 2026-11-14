export type IntakeAnswer = "yes" | "no" | "unknown"

export interface HealthIntakeData {
  personal: {
    fullName: string
    age: number
    gender: "Male" | "Female" | "Other"
    heightCm: number
    weightKg: number
    familyHistory: IntakeAnswer
  }
  symptoms: {
    frequentUrination: IntakeAnswer
    increasedThirst: IntakeAnswer
    increasedHunger: IntakeAnswer
    unexplainedWeightLoss: IntakeAnswer
    fatigue: IntakeAnswer
    blurredVision: IntakeAnswer
  }
  medicalHistory: {
    hypertension: IntakeAnswer
    heartDisease: IntakeAnswer
    prediabetes: IntakeAnswer
    diabetes: IntakeAnswer
  }
  measurements: {
    hba1c: number | null
    bloodGlucose: number | null
    systolicBloodPressure: number | null
    diastolicBloodPressure: number | null
    previousTestHistory: string
  }
  lifestyle: {
    smokingHistory: string
    physicalActivity: string
    walkingDuration: string
    eatingHabits: string
    sugaryDrinks: string
    sleepDurationHours: number
    sleepQuality: string
    sittingTime: string
  }
}
