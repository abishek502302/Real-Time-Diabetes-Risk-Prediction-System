"use client"

import { useEffect, useRef, useState } from "react"
import { Bot, Loader2, MessageCircle, RotateCcw, Send, Sparkles, User } from "lucide-react"
import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type ChatMessage = { role: "user" | "assistant"; content: string }

const starterPrompts = [
  "What is the difference between type 1 and type 2 diabetes?",
  "What does an HbA1c test measure?",
  "What are some heart-healthy meal ideas?",
  "How can I prepare for a doctor’s appointment?",
]

const initialMessage: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I’m your AI health-education assistant. Ask me about diabetes, health measurements, nutrition, or preparing for a conversation with your care team.",
}

const markdownComponents: Components = {
  h1: ({ children }: { children?: React.ReactNode }) => <h1 className="mb-3 text-2xl font-bold tracking-tight">{children}</h1>,
  h2: ({ children }: { children?: React.ReactNode }) => <h2 className="mb-3 mt-5 text-xl font-semibold tracking-tight">{children}</h2>,
  h3: ({ children }: { children?: React.ReactNode }) => <h3 className="mb-2 mt-4 text-lg font-semibold">{children}</h3>,
  p: ({ children }: { children?: React.ReactNode }) => <p className="mb-3 leading-relaxed last:mb-0">{children}</p>,
  ul: ({ children }: { children?: React.ReactNode }) => <ul className="mb-3 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }: { children?: React.ReactNode }) => <ol className="mb-3 list-decimal space-y-1 pl-5">{children}</ol>,
  li: ({ children }: { children?: React.ReactNode }) => <li className="leading-relaxed">{children}</li>,
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-border">
      <table className="min-w-full border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => <thead className="bg-muted/80">{children}</thead>,
  th: ({ children }: { children?: React.ReactNode }) => <th className="border border-border px-3 py-2 font-semibold">{children}</th>,
  td: ({ children }: { children?: React.ReactNode }) => <td className="border border-border px-3 py-2 align-top">{children}</td>,
  a: ({ href, children, ...props }: { href?: string; children?: React.ReactNode }) => (
    <a href={href} {...props} className="text-primary underline underline-offset-4" target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noreferrer" : undefined}>
      {children}
    </a>
  ),
  code: ({ children, className }: { children?: React.ReactNode; className?: string }) => (
    <code className={cn("rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]", className)}>{children}</code>
  ),
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="mb-3 overflow-x-auto rounded-lg bg-muted p-3 text-sm leading-relaxed">{children}</pre>
  ),
}

export function AiChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage])
  const [draft, setDraft] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, loading])

  async function sendMessage(message = draft) {
    const text = message.trim()
    if (!text || loading) return

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }]
    const conversation = nextMessages.slice(-20)
    setDraft("")
    setError(null)
    setMessages(nextMessages)
    setLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation }),
      })
      const data = (await response.json()) as { reply?: unknown; error?: unknown }

      if (!response.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "The AI could not respond. Please try again.")
      }
      if (typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("The AI returned an empty response. Please try again.")
      }

      const reply = data.reply
      setMessages((previous) => [...previous, { role: "assistant", content: reply }])
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "The AI could not respond. Please try again.")
      setMessages((previous) => previous.slice(0, -1))
      setDraft(text)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="flex w-full flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Sparkles className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">AI Health Chat</h1>
            <p className="mt-1 text-sm text-muted-foreground">Diabetes and everyday health education</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setMessages([initialMessage])
            setDraft("")
            setError(null)
          }}
          disabled={loading || messages.length === 1}
          aria-label="Start a new conversation"
        >
          <RotateCcw className="size-4" />
          <span className="hidden sm:inline">New chat</span>
        </Button>
      </div>

      <div className="flex min-h-[calc(100vh-15rem)] flex-1 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div
          className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-6 sm:px-6"
          aria-live="polite"
          aria-label="AI conversation"
        >
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={cn("flex w-full gap-3", message.role === "user" && "justify-end")}
            >
              {message.role === "assistant" && (
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Bot className="size-4" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[80%]",
                  message.role === "user"
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md bg-muted text-foreground",
                )}
              >
                {message.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_table]:w-full [&_thead]:text-left [&_td]:break-words [&_th]:break-words">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
              </div>
              {message.role === "user" && (
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-background text-muted-foreground">
                  <User className="size-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Bot className="size-4" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3">
                <Loader2 className="size-4 animate-spin" />
                Getting an AI response…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 px-4 pb-5 sm:px-6">
            {starterPrompts.map((prompt) => (
              <Button
                key={prompt}
                type="button"
                variant="outline"
                size="sm"
                className="h-auto whitespace-normal py-2 text-left"
                disabled={loading}
                onClick={() => void sendMessage(prompt)}
              >
                <MessageCircle className="size-3.5 shrink-0" />
                {prompt}
              </Button>
            ))}
          </div>
        )}

        <div className="border-t bg-background p-4 sm:px-6">
          {error && (
            <p className="mb-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <div className="flex items-end gap-2 rounded-2xl border bg-background p-2 shadow-sm focus-within:ring-2 focus-within:ring-ring">
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask a health or diabetes question…"
              rows={1}
              maxLength={4000}
              className="max-h-32 min-h-10 resize-none border-0 bg-transparent py-2 shadow-none focus-visible:ring-0"
              disabled={loading}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  void sendMessage()
                }
              }}
              aria-label="Your message"
            />
            <Button
              type="button"
              size="icon"
              className="shrink-0 rounded-xl"
              disabled={loading || !draft.trim()}
              onClick={() => void sendMessage()}
              aria-label="Send message"
            >
              <Send className="size-4" />
            </Button>
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            
          </p>
        </div>
      </div>
    </section>
  )
}
