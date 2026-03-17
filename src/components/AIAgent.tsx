"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Loader2,
  Copy,
  Check,
  Sparkles,
  Code2,
  Trash2,
  ChevronDown,
  AlertCircle,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "Add a 'sector/industry' field to leads",
  "Create an email notifications component",
  "Generate the SQL to add a 'proposals' table in Supabase",
  "Add a dashboard with monthly revenue charts",
  "Create a tags/labels system to classify leads",
  "Integrate a calendar to schedule meetings with leads",
  "Add lead export to CSV",
  "Create a live chat widget for the website",
];

export default function AIAgent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  async function handleSend(text?: string) {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: msg,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: `Current CRM view. The user wants to customize or improve the system.`,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages([...newMessages, assistantMessage]);
    } catch (err) {
      setError("Connection error with AI agent");
    }

    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function clearChat() {
    setMessages([]);
    setError("");
  }

  function renderContent(content: string) {
    // Split by code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, i) => {
      const codeMatch = part.match(/```(\w+)?\n?([\s\S]*?)```/);
      if (codeMatch) {
        const lang = codeMatch[1] || "";
        const code = codeMatch[2].trim();
        const blockId = `code-${i}`;
        return (
          <div
            key={i}
            className="my-3 rounded-xl overflow-hidden border border-border"
          >
            <div className="flex items-center justify-between bg-[rgba(255,255,255,0.04)] px-3 py-1.5 border-b border-border">
              <div className="flex items-center gap-2">
                <Code2 size={12} className="text-orange-400" />
                <span className="text-[10px] text-text-tertiary font-mono uppercase">
                  {lang || "code"}
                </span>
              </div>
              <button
                onClick={() => handleCopy(code, blockId)}
                className="flex items-center gap-1 text-[10px] text-text-tertiary hover:text-white transition-colors"
              >
                {copiedId === blockId ? (
                  <>
                    <Check size={10} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={10} />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 overflow-x-auto text-[12px] font-mono leading-relaxed text-text-secondary bg-[#080808]">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Render markdown-like text
      if (!part.trim()) return null;
      return (
        <div key={i} className="text-[13px] leading-relaxed whitespace-pre-wrap">
          {part.split("\n").map((line, j) => {
            // Bold
            const boldProcessed = line.replace(
              /\*\*(.*?)\*\*/g,
              '<strong class="text-white font-semibold">$1</strong>'
            );
            // Inline code
            const codeProcessed = boldProcessed.replace(
              /`([^`]+)`/g,
              '<code class="text-orange-400 bg-orange-400/10 px-1 py-0.5 rounded text-[12px] font-mono">$1</code>'
            );
            // Headers
            if (line.startsWith("### ")) {
              return (
                <p
                  key={j}
                  className="text-white font-semibold text-[14px] mt-3 mb-1"
                  dangerouslySetInnerHTML={{
                    __html: codeProcessed.slice(4),
                  }}
                />
              );
            }
            if (line.startsWith("## ")) {
              return (
                <p
                  key={j}
                  className="text-white font-semibold text-[15px] mt-3 mb-1"
                  dangerouslySetInnerHTML={{
                    __html: codeProcessed.slice(3),
                  }}
                />
              );
            }
            // List items
            if (line.startsWith("- ") || line.startsWith("* ")) {
              return (
                <div key={j} className="flex gap-2 ml-2">
                  <span className="text-orange-400 mt-0.5">•</span>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: codeProcessed.slice(2),
                    }}
                  />
                </div>
              );
            }
            // Numbered list
            const numMatch = line.match(/^(\d+)\.\s(.*)/);
            if (numMatch) {
              return (
                <div key={j} className="flex gap-2 ml-2">
                  <span className="text-orange-400 font-mono text-[11px] mt-0.5 min-w-[16px]">
                    {numMatch[1]}.
                  </span>
                  <span
                    dangerouslySetInnerHTML={{ __html: codeProcessed.replace(/^\d+\.\s/, "") }}
                  />
                </div>
              );
            }

            return (
              <p
                key={j}
                className={line.trim() === "" ? "h-3" : ""}
                dangerouslySetInnerHTML={{ __html: codeProcessed }}
              />
            );
          })}
        </div>
      );
    });
  }

  return (
    <div className="animate-fadeIn flex flex-col h-[calc(100vh-120px)]">
      {/* Empty state */}
      {messages.length === 0 && !loading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center border border-orange-500/15 mb-5">
            <Sparkles size={24} className="text-orange-400" />
          </div>
          <h2 className="text-lg font-semibold mb-1">BlackWolf AI Agent</h2>
          <p className="text-[13px] text-text-tertiary max-w-md text-center mb-8">
            Ask me to customize your CRM. I can generate code, create components,
            design SQL queries, or suggest improvements.
          </p>

          <div className="grid grid-cols-2 gap-2 max-w-xl w-full">
            {SUGGESTIONS.slice(0, 6).map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSend(suggestion)}
                className="text-left p-3 rounded-xl bg-surface border border-border hover:border-border-hover hover:bg-surface-hover transition-all duration-200 group"
              >
                <p className="text-[12px] text-text-secondary group-hover:text-white transition-colors leading-snug">
                  {suggestion}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-1 space-y-4 pb-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center border border-orange-500/10 flex-shrink-0 mt-1">
                    <Bot size={13} className="text-orange-400" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-orange-500/15 border border-orange-500/20 rounded-2xl rounded-tr-md px-4 py-3"
                      : "bg-surface border border-border rounded-2xl rounded-tl-md px-4 py-3"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p className="text-[13px] text-white leading-relaxed">
                      {msg.content}
                    </p>
                  ) : (
                    <div className="text-text-secondary">
                      {renderContent(msg.content)}
                    </div>
                  )}
                  <p className="text-[9px] text-text-tertiary mt-2">
                    {msg.timestamp.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-[10px] font-bold text-white">YOU</span>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center border border-orange-500/10 flex-shrink-0">
                  <Bot size={13} className="text-orange-400" />
                </div>
                <div className="bg-surface border border-border rounded-2xl rounded-tl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 size={14} className="text-orange-400 animate-spin" />
                    <span className="text-[13px] text-text-tertiary">
                      Generating response...
                    </span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 animate-scaleIn">
                <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                <p className="text-[13px] text-red-400">{error}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Clear chat */}
          {messages.length > 0 && (
            <div className="flex justify-center py-1">
              <button
                onClick={clearChat}
                className="flex items-center gap-1.5 text-[11px] text-text-tertiary hover:text-red-400 transition-colors px-3 py-1 rounded-lg hover:bg-surface"
              >
                <Trash2 size={11} />
                Clear chat
              </button>
            </div>
          )}
        </>
      )}

      {/* Input */}
      <div className="border-t border-border pt-4 mt-2">
        <div className="relative bg-surface border border-border rounded-xl focus-within:border-orange-400/30 focus-within:ring-1 focus-within:ring-orange-400/10 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me to add features, generate code, or improve your CRM..."
            rows={1}
            className="w-full bg-transparent py-3 pl-4 pr-12 text-[13px] text-white placeholder:text-text-tertiary focus:outline-none resize-none max-h-[120px]"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="absolute right-2 bottom-2 p-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-[10px] text-text-tertiary mt-2 text-center">
          Powered by Claude — Anthropic AI
        </p>
      </div>
    </div>
  );
}
