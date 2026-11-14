export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export class ChatProviderError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message)
    this.name = 'ChatProviderError'
  }
}

type GeminiResponse = {
  candidates?: {
    content?: {
      parts?: { text?: string }[]
    }
    finishReason?: string
  }[]
  promptFeedback?: {
    blockReason?: string
  }
}

type ChatCompletionResponse = {
  choices?: {
    message?: {
      content?: string | null
    }
  }[]
}

function getErrorDetails(responseBody: string): { code: string; message: string } {
  try {
    const payload: unknown = JSON.parse(responseBody)
    if (typeof payload === 'object' && payload !== null && 'error' in payload) {
      const error = payload.error
      if (typeof error === 'object' && error !== null) {
        const details = error as { status?: unknown; code?: unknown; message?: unknown }
        return {
          code:
            typeof details.status === 'string'
              ? details.status
              : typeof details.code === 'string'
                ? details.code
                : 'UNKNOWN',
          message: typeof details.message === 'string' ? details.message : 'AI provider request failed.',
        }
      }
    }
  } catch {
    // Use the HTTP status if the provider did not return a JSON error.
  }

  return { code: 'UNKNOWN', message: 'AI provider request failed.' }
}

function getGeminiError(status: number, code: string): string {
  if (code === 'API_KEY_INVALID' || status === 401) {
    return 'Gemini rejected the API key. Check that GEMINI_API_KEY is valid and active.'
  }
  if (code === 'PERMISSION_DENIED' || status === 403) {
    return 'Google denied this Gemini project access to generate content. Confirm this key belongs to the intended project and contact Google AI support if access remains blocked.'
  }
  if (code === 'RESOURCE_EXHAUSTED' || status === 429) {
    return 'The Gemini API quota has been exceeded. Check the API key’s project and Gemini API limits, then try again later.'
  }
  if (status === 404) {
    return 'The configured Gemini model is unavailable to this API key. Check GEMINI_MODEL or use a model enabled for your Gemini project.'
  }
  return 'The Gemini API could not respond. Please try again later.'
}

function getGroqError(status: number): string {
  if (status === 401) return 'Groq rejected the API key. Check that GROQ_API_KEY is valid and active.'
  if (status === 403) return 'This Groq key does not have permission to use the selected model.'
  if (status === 404) return 'The configured Groq model was not found. Check GROQ_MODEL.'
  if (status === 429) return 'The Groq API rate or usage limit has been reached. Check the Groq account limits, then try again.'
  return 'The Groq API could not respond. Please try again later.'
}

async function generateGroqReply(
  apiKey: string,
  systemInstruction: string,
  messages: ChatMessage[],
): Promise<string> {
  let response: Response
  try {
    response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL ?? 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: systemInstruction },
          ...messages,
        ],
        max_completion_tokens: 1200,
        temperature: 0.5,
      }),
      signal: AbortSignal.timeout(30000),
    })
  } catch (error) {
    throw new ChatProviderError(
      error instanceof Error && error.name === 'TimeoutError'
        ? 'Groq took too long to respond. Please try again.'
        : 'Could not reach the Groq API. Check your network and try again.',
      502,
      'NETWORK_ERROR',
    )
  }

  if (!response.ok) {
    const details = getErrorDetails(await response.text())
    throw new ChatProviderError(getGroqError(response.status), response.status, details.code)
  }

  const data = (await response.json()) as ChatCompletionResponse
  const reply = data.choices?.[0]?.message?.content?.trim()
  if (!reply) {
    throw new ChatProviderError('Groq returned an empty response. Please try again.', 502, 'EMPTY_RESPONSE')
  }
  return reply
}

async function generateGeminiReply(
  apiKey: string,
  systemInstruction: string,
  messages: ChatMessage[],
): Promise<string> {
  const model = process.env.GEMINI_MODEL ?? 'gemini-3.8-flash'
  const url = new URL(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
  )
  url.searchParams.set('key', apiKey)

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: messages.map((message) => ({
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: message.content }],
        })),
        generationConfig: { temperature: 0.5, maxOutputTokens: 900 },
      }),
      signal: AbortSignal.timeout(30000),
    })
  } catch (error) {
    throw new ChatProviderError(
      error instanceof Error && error.name === 'TimeoutError'
        ? 'Gemini took too long to respond. Please try again.'
        : 'Could not reach the Gemini API. Check your network and try again.',
      502,
      'NETWORK_ERROR',
    )
  }

  if (!response.ok) {
    const details = getErrorDetails(await response.text())
    throw new ChatProviderError(getGeminiError(response.status, details.code), response.status, details.code)
  }

  const data = (await response.json()) as GeminiResponse
  const reply = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? '')
    .join('')
    .trim()
  if (!reply) {
    const reason = data.promptFeedback?.blockReason ?? data.candidates?.[0]?.finishReason ?? 'EMPTY_RESPONSE'
    throw new ChatProviderError('Gemini could not provide a response. Please rephrase and try again.', 502, reason)
  }
  return reply
}

export async function generateChatReply(
  systemInstruction: string,
  messages: ChatMessage[],
): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY
  if (groqApiKey) return generateGroqReply(groqApiKey, systemInstruction, messages)

  const geminiApiKey = process.env.GEMINI_API_KEY
  if (geminiApiKey) return generateGeminiReply(geminiApiKey, systemInstruction, messages)

  throw new ChatProviderError(
    'AI chat is not configured. Set GROQ_API_KEY or GEMINI_API_KEY on the server.',
    503,
    'MISSING_API_KEY',
  )
}
