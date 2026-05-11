"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ChatRole = "ai" | "user";
type HistoryRole = "assistant" | "user";

const quickActions = [
  { label: "Explain from basics", icon: "school" },
  { label: "Give me NEET PYQs", icon: "quiz" },
  { label: "Create a mnemonic", icon: "lightbulb" },
  { label: "Ask me 5 MCQs", icon: "checklist" },
];

interface ChatMessage {
  role: ChatRole;
  text: string;
}

interface TeachResponse {
  answer: string;
  citations: string[];
}

const fallbackBackendUrl = "http://127.0.0.1:8000";

export default function PrepAIPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "General";
  const topic = searchParams.get("topic") ?? "NEET topic";
  const sourcePath = searchParams.get("source") ?? "";
  const autoStartedFor = useRef<string | null>(null);

  const introMessage = useMemo<ChatMessage>(() => {
    return {
      role: "ai",
      text: `You're now learning ${topic} (${category}). Ask any doubt, and I will teach using your uploaded NEET 2026 material with exam-focused explanations.`,
    };
  }, [category, topic]);

  const [messages, setMessages] = useState<ChatMessage[]>([introMessage]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const sendPrompt = async (promptText: string, historyMessages: ChatMessage[]) => {
    if (!promptText.trim()) return;
    setIsSending(true);

    try {
      const history = historyMessages.slice(-8).map((msg) => ({
        role: (msg.role === "ai" ? "assistant" : "user") as HistoryRole,
        content: msg.text,
      }));

      const response = await fetch(`${process.env.NEXT_PUBLIC_AI_BACKEND_URL ?? fallbackBackendUrl}/teach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: promptText,
          category,
          topic,
          source_path: sourcePath,
          history,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.detail ?? "AI tutor is unavailable. Please check backend service.");
      }

      const payload = (await response.json()) as TeachResponse;
      const citationText = payload.citations.length > 0 ? `\n\nSources:\n- ${payload.citations.join("\n- ")}` : "";
      setMessages((prev) => [...prev, { role: "ai", text: `${payload.answer}${citationText}` }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch tutor response.";
      setMessages((prev) => [...prev, { role: "ai", text: `I couldn't respond right now: ${message}` }]);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    const autoStartKey = `${category}:${topic}:${sourcePath}`;
    if (autoStartedFor.current === autoStartKey) return;
    autoStartedFor.current = autoStartKey;
    const startPrompt = `Teach me ${topic} from basics and include NEET-focused memory tricks.`;
    setMessages((prev) => {
      const withUser = [...prev, { role: "user", text: startPrompt } as ChatMessage];
      void sendPrompt(startPrompt, withUser);
      return withUser;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, topic, sourcePath]);

  const handleSubmit = async () => {
    if (isSending) return;
    const promptText = input.trim();
    if (!promptText) return;
    setInput("");
    setMessages((prev) => {
      const withUser = [...prev, { role: "user", text: promptText } as ChatMessage];
      void sendPrompt(promptText, withUser);
      return withUser;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex items-center gap-sm pb-md border-b border-outline-variant/30">
        <Link href="/dashboard" className="text-on-surface-variant hover:text-on-surface transition-colors md:hidden">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
          <span className="material-symbols-outlined text-on-secondary text-[20px]">smart_toy</span>
        </div>
        <div>
          <h1 className="font-[family-name:var(--font-lexend)] text-[24px] font-semibold leading-[1.3] text-on-surface">PrepAI Tutor</h1>
          <p className="text-[12px] text-on-surface-variant">Context: {category} • {topic}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-md space-y-md min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-sm ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "ai" && (
              <div className="w-8 h-8 rounded-full bg-secondary shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary text-[16px]">smart_toy</span>
              </div>
            )}
            <div className={`max-w-[80%] p-sm rounded-xl ${
              msg.role === "ai"
                ? "bg-surface-container rounded-tl-none"
                : "bg-primary-container text-white rounded-tr-none"
            }`}>
              {msg.role === "ai" ? (
                <div className="text-[14px] text-on-surface leading-relaxed prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-headings:my-2 prose-strong:text-on-surface prose-code:text-on-surface">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-[14px] whitespace-pre-line text-white">{msg.text}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions + Input */}
      <div className="pt-md border-t border-outline-variant/30 mt-auto shrink-0 bg-background">
        <div className="flex flex-wrap gap-2 mb-sm">
          {quickActions.map((action) => (
            <button
              key={action.label}
              disabled={isSending}
              onClick={() => {
                setMessages((prev) => {
                  const withUser = [...prev, { role: "user", text: action.label } as ChatMessage];
                  void sendPrompt(action.label, withUser);
                  return withUser;
                });
              }}
              className="bg-surface-container-low text-on-surface px-3 py-1.5 rounded-full text-[12px] font-medium border border-outline-variant/30 hover:bg-surface-container-high transition-colors flex items-center gap-xs"
            >
              <span className="material-symbols-outlined text-[14px]">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <input
            className="w-full bg-surface-container text-on-surface text-[16px] rounded-xl py-4 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-secondary border-none placeholder-on-surface-variant/50"
            placeholder="Ask anything about NEET preparation..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleSubmit();
              }
            }}
          />
          <button
            onClick={() => void handleSubmit()}
            disabled={isSending}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-secondary text-on-secondary flex items-center justify-center hover:bg-on-secondary-fixed-variant transition-colors shadow-sm disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
