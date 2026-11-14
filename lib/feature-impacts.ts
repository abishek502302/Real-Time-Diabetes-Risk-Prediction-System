import type { PredictionInput } from "@/components/prediction-form"

export interface ShapFeatureContribution {
  feature: string
  feature_key?: string
  value: string | number
  shap_value: number
  impact?: "positive" | "negative" | "neutral"
}

export interface FeatureImpact {
  feature: string
  value: string | number
  impact: "positive" | "negative" | "neutral"
  contribution: number
  shapValue?: number
  explanation: string
}

export function buildFeatureImpacts(
  input: PredictionInput,
  shapFeatures?: ShapFeatureContribution[],
): FeatureImpact[] {
  if (shapFeatures && shapFeatures.length > 0) {
    return shapFeatures
      .map((feature) => {
        const shapValue = Number(feature.shap_value) || 0
        const contribution = Math.abs(shapValue)
        const impact =
          feature.impact ??
          (shapValue > 0 ? "positive" : shapValue < 0 ? "negative" : "neutral")

        const explanation =
          shapValue > 0
            ? `${feature.feature} is increasing the estimated diabetes risk. In SHAP terms, a positive contribution means this factor pushes the model output upward and raises the probability of diabetes.`
            : shapValue < 0
              ? `${feature.feature} is reducing the estimated diabetes risk. A negative SHAP value indicates this factor is offsetting risk and moving the prediction downward.`
              : `${feature.feature} is close to neutral in this patient profile. It has minimal effect on the model's final estimate.`

        return {
          feature: feature.feature,
          value: feature.value,
          impact,
          contribution,
          shapValue,
          explanation,
        }
      })
      .sort((a, b) => b.contribution - a.contribution)
  }

  return getFeatureImpacts(input)
}

export function getFeatureImpacts(input: PredictionInput): FeatureImpact[] {
  const impacts: FeatureImpact[] = []

  const glucoseStatus =
    input.blood_glucose_level < 100
      ? "negative"
      : input.blood_glucose_level > 140
        ? "positive"
        : "neutral"
  impacts.push({
    feature: "Blood Glucose Level",
    value: `${input.blood_glucose_level} mg/dL`,
    impact: glucoseStatus,
    contribution: input.blood_glucose_level > 140 ? 25 : input.blood_glucose_level > 100 ? 12 : 5,
    shapValue: input.blood_glucose_level > 140 ? 0.22 : input.blood_glucose_level > 100 ? 0.10 : -0.04,
    explanation:
      input.blood_glucose_level > 140
        ? "Your blood glucose is elevated, which is a significant risk factor for diabetes."
        : input.blood_glucose_level > 100
          ? "Your blood glucose is slightly elevated. Consider monitoring and lifestyle changes."
          : "Your blood glucose is in the normal range, which is protective against diabetes.",
  })

  const hba1cStatus =
    input.HbA1c_level < 5.7 ? "negative" : input.HbA1c_level > 6.5 ? "positive" : "neutral"
  impacts.push({
    feature: "HbA1c Level",
    value: `${input.HbA1c_level}%`,
    impact: hba1cStatus,
    contribution: input.HbA1c_level > 6.5 ? 22 : input.HbA1c_level > 5.7 ? 10 : 4,
    explanation:
      input.HbA1c_level > 6.5
        ? "Your HbA1c indicates poor long-term blood sugar control, significantly increasing risk."
        : input.HbA1c_level > 5.7
          ? "Your HbA1c is in the pre-diabetic range. This is a warning sign to take action."
          : "Your HbA1c shows good long-term blood sugar control.",
  })

  const bmiStatus = input.bmi < 25 ? "negative" : input.bmi > 30 ? "positive" : "neutral"
  impacts.push({
    feature: "BMI",
    value: `${input.bmi.toFixed(1)} kg/m²`,
    impact: bmiStatus,
    contribution: input.bmi > 30 ? 18 : input.bmi > 25 ? 8 : 3,
    explanation:
      input.bmi > 30
        ? "Obesity significantly increases insulin resistance and diabetes risk."
        : input.bmi > 25
          ? "Being overweight moderately increases your risk. Weight loss can help."
          : "Your BMI is in the healthy range, which helps protect against diabetes.",
  })

  const ageStatus = input.age < 45 ? "negative" : input.age > 60 ? "positive" : "neutral"
  impacts.push({
    feature: "Age",
    value: `${input.age} years`,
    impact: ageStatus,
    contribution: input.age > 60 ? 12 : input.age > 45 ? 6 : 2,
    explanation:
      input.age > 60
        ? "Age over 60 is associated with higher diabetes risk due to metabolic changes."
        : input.age > 45
          ? "Middle age brings moderate increase in risk. Regular screening is recommended."
          : "Younger age is generally protective, but lifestyle still matters.",
  })

  impacts.push({
    feature: "Hypertension",
    value: input.hypertension === 1 ? "Yes" : "No",
    impact: input.hypertension === 1 ? "positive" : "negative",
    contribution: input.hypertension === 1 ? 8 : 2,
    explanation:
      input.hypertension === 1
        ? "Hypertension often co-occurs with insulin resistance and increases diabetes risk."
        : "Normal blood pressure is associated with lower diabetes risk.",
  })

  impacts.push({
    feature: "Heart Disease",
    value: input.heart_disease === 1 ? "Yes" : "No",
    impact: input.heart_disease === 1 ? "positive" : "negative",
    contribution: input.heart_disease === 1 ? 6 : 1,
    explanation:
      input.heart_disease === 1
        ? "Heart disease shares risk factors with diabetes and may indicate metabolic issues."
        : "No heart disease is a positive indicator for overall metabolic health.",
  })

  const smokingStatus =
    input.smoking_history === "never"
      ? "negative"
      : input.smoking_history === "current"
        ? "positive"
        : "neutral"
  impacts.push({
    feature: "Smoking History",
    value: input.smoking_history,
    impact: smokingStatus,
    contribution: input.smoking_history === "current" ? 5 : input.smoking_history === "never" ? 1 : 3,
    explanation:
      input.smoking_history === "current"
        ? "Current smoking increases inflammation and insulin resistance."
        : input.smoking_history === "never"
          ? "Never smoking is protective for metabolic health."
          : "Former/past smoking has residual but reduced risk compared to current smoking.",
  })

  return impacts.sort((a, b) => b.contribution - a.contribution)
}
