import { NextRequest, NextResponse } from 'next/server'
import { ChatProviderError, generateChatReply } from '@/lib/ai-provider'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

const MAX_MESSAGES = 20
const MAX_MESSAGE_LENGTH = 4000

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== 'object' || value === null) return false

  const message = value as Record<string, unknown>
  return (
    (message.role === 'user' || message.role === 'assistant') &&
    typeof message.content === 'string' &&
    message.content.trim().length > 0 &&
    message.content.length <= MAX_MESSAGE_LENGTH
  )
}

export async function POST(request: NextRequest) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
  }

  const messages =
    typeof body === 'object' && body !== null
      ? (body as Record<string, unknown>).messages
      : undefined

  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.length > MAX_MESSAGES ||
    !messages.every(isChatMessage) ||
    messages[messages.length - 1]?.role !== 'user'
  ) {
    return NextResponse.json(
      { error: 'Send up to 20 valid messages, ending with a user message.' },
      { status: 400 },
    )
  }

  try {
    const reply = await generateChatReply(
      [
        'You are a helpful, empathetic health-education assistant focused on diabetes and general wellness.',
        'Answer the user directly in clear, accessible language. Be transparent about uncertainty and never invent facts.',
        'You do not diagnose, interpret a person’s symptoms as a definitive condition, prescribe medicines, or replace a clinician.',
        'For personal medical decisions, encourage the user to speak with a qualified healthcare professional.',
        'For possible emergencies or severe symptoms, advise contacting local emergency services immediately.',
        'Do not claim that lifestyle changes guarantee prevention or cure.',
      ].join(' '),
      messages,
    )
    return NextResponse.json({ reply })
  } catch (error) {
    if (error instanceof ChatProviderError) {
      console.error('AI chat request failed:', error.status, error.code)
      return NextResponse.json({ error: error.message }, { status: error.status === 503 ? 503 : 502 })
    }
    console.error('Chat request failed:', error)
    return NextResponse.json(
      { error: 'The chat request failed unexpectedly. Please try again.' },
      { status: 502 },
    )
  }
}
