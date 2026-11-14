import { NextRequest, NextResponse } from 'next/server'
import { ChatProviderError, generateChatReply, type ChatMessage } from '@/lib/ai-provider'

type PredictionInput = {
  gender: string
  age: number
  hypertension: number
  heart_disease: number
  smoking_history: string
  bmi: number
  HbA1c_level: number
  blood_glucose_level: number
}

type PredictionResult = {
  prediction: number
  probability: number
  risk_level: string
}

type ImpactRow = {
  feature: string
  value: string | number
  explanation: string
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== 'object' || value === null) return false

  const message = value as Record<string, unknown>
  return (
    (message.role === 'user' || message.role === 'assistant') &&
    typeof message.content === 'string' &&
    message.content.trim().length > 0 &&
    message.content.length <= 4000
  )
}

function buildContextBlock(input: PredictionInput, result: PredictionResult, impacts: ImpactRow[]) {
  const lines = [
    `Predicted diabetes probability: ${Math.round(result.probability * 100)}%. Risk band: ${result.risk_level}.`,
    `Inputs: age ${input.age}, gender ${input.gender}, BMI ${input.bmi}, HbA1c ${input.HbA1c_level}%, blood glucose ${input.blood_glucose_level} mg/dL, hypertension ${input.hypertension}, heart disease ${input.heart_disease}, smoking: ${input.smoking_history}.`,
    'Feature notes:',
    ...impacts.map((impact) => `- ${impact.feature} (${impact.value}): ${impact.explanation}`),
  ]
  return lines.join('\n')
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid chat request.' }, { status: 400 })
  }

  const data = body as Record<string, unknown>
  const messages = data.messages
  const input = data.input
  const result = data.result
  const impacts = data.impacts ?? []

  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.length > 20 ||
    !messages.every(isChatMessage) ||
    messages[messages.length - 1]?.role !== 'user' ||
    typeof input !== 'object' ||
    input === null ||
    typeof result !== 'object' ||
    result === null ||
    !Array.isArray(impacts)
  ) {
    return NextResponse.json({ error: 'Missing or invalid messages, input, or result.' }, { status: 400 })
  }

  const predictionInput = input as PredictionInput
  const predictionResult = result as PredictionResult
  const featureImpacts = impacts as ImpactRow[]
  const systemInstruction = [
    'You are a supportive health literacy assistant helping users understand a diabetes risk screening result.',
    'Use clear, plain language. Do not diagnose or prescribe; encourage consulting healthcare professionals for medical decisions.',
    'Ground answers in the user context below when relevant.',
    '',
    'User prediction context:',
    buildContextBlock(predictionInput, predictionResult, featureImpacts),
  ].join('\n')

  try {
    const reply = await generateChatReply(systemInstruction, messages)
    return NextResponse.json({ reply, mode: 'ai' as const })
  } catch (error) {
    if (error instanceof ChatProviderError) {
      console.error('AI explanation chat failed:', error.status, error.code)
      return NextResponse.json({ error: error.message }, { status: error.status === 503 ? 503 : 502 })
    }
    console.error('explain-chat:', error)
    return NextResponse.json({ error: 'Chat request failed.' }, { status: 500 })
  }
}
