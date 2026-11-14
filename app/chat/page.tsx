import { AiChatbot } from "@/components/ai-chatbot"

export const metadata = {
  title: "AI Health Chat | DiabetesPredict",
  description: "Ask an AI assistant general questions about diabetes and health education.",
}

export default function ChatPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      <AiChatbot />
    </div>
  )
}
