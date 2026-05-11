"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  Send,
  Bot,
  User,
  ArrowLeft,
  Lightbulb,
  RefreshCw,
  Lock,
} from "lucide-react";
import type { ChatMessage, GeminiNegotiationResponse } from "@/types";

// ─── Confidence Meter ─────────────────────────────────────────────────────────

function ConfidenceMeter({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const color =
    score >= 8
      ? "from-emerald-400 to-[#2ECC71]"
      : score >= 5
      ? "from-[#B792F0] to-[#D98BCC]"
      : "from-[#FFB899] to-rose-400";
  const label =
    score >= 8 ? "Strong 💪" : score >= 5 ? "Building 🌱" : "Keep Going 🔥";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Confidence Score
        </span>
        <span className="text-[10px] font-semibold text-muted-foreground">{label}</span>
      </div>
      <div className="relative h-3 w-full rounded-full bg-[#F0EAF8] overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>1</span>
        <span className="text-currency font-bold text-sm text-foreground">{score}/10</span>
        <span>10</span>
      </div>
    </div>
  );
}

// ─── Chat bubble ──────────────────────────────────────────────────────────────

function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  const isError = msg.content.startsWith("Error:");

  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm ${
          isUser
            ? "gradient-brand"
            : isError
            ? "bg-gradient-to-br from-rose-400 to-rose-600"
            : "bg-gradient-to-br from-[#6b7280] to-[#4b5563]"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className={`max-w-[78%] space-y-1 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "gradient-brand text-white rounded-tr-sm shadow-md shadow-[#B792F0]/20"
              : isError
              ? "bg-rose-50 border border-rose-200 text-rose-700 rounded-tl-sm"
              : "bg-white border border-[#E8E0F5] text-foreground rounded-tl-sm card-soft"
          }`}
        >
          {msg.content}
        </div>
        <span className="text-[10px] text-muted-foreground px-1">
          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

// ─── Feedback panel ───────────────────────────────────────────────────────────

function FeedbackPanel({ tips }: { tips: string[] }) {
  if (!tips?.length) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9b6de0]">
        <Lightbulb className="w-3.5 h-3.5" />
        Coach Tips
      </div>
      <ul className="space-y-2">
        {tips.map((tip, i) => (
          <li
            key={i}
            className="flex gap-2 text-xs text-foreground leading-relaxed bg-[#F3EDFF] border border-[#D4B8F8] rounded-xl px-3 py-2.5"
          >
            <span className="gradient-brand-text font-bold shrink-0">{i + 1}.</span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Starter prompts ──────────────────────────────────────────────────────────

const STARTER_PROMPTS = [
  "I was hoping to make $20/hour for this internship.",
  "Based on my Python skills and coursework, I'd like to request $22/hour.",
  "I've done research and found that similar interns in this field earn $18–$24/hour. I'd like to discuss the top of that range.",
];

// ─── Main negotiate page ──────────────────────────────────────────────────────

function NegotiateApp() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      role: "assistant",
      content:
        "Hi! I'm Jordan, your hiring manager today. We're considering you for our summer internship program — congratulations on making it this far! Before we finalize the offer, let's talk compensation. What are you hoping for?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [feedbackTips, setFeedbackTips] = useState<string[]>([]);
  const [sessionScore, setSessionScore] = useState<number[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildHistory = useCallback(() => {
    return messages
      .filter((m) => m.id !== "intro" && !m.content.startsWith("Error:"))
      .map((m) => ({
        role: (m.role === "user" ? "user" : "model") as "user" | "model",
        parts: [{ text: m.content }],
      }));
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            history: buildHistory(),
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || `Server responded with status ${res.status}`);
        }

        const data: GeminiNegotiationResponse & { error?: string } = await res.json();

        if (data.error) throw new Error(data.error);

        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply || "I didn't generate a proper reply, check backend logs.",
          confidence_score: data.confidence_score || 0,
          feedback: data.feedback || [],
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setConfidenceScore(data.confidence_score || 0);
        setFeedbackTips(data.feedback || []);
        setSessionScore((prev) => [...prev, data.confidence_score || 0]);
      } catch (err: any) {
        console.error("Chat Error:", err);
        const actualErrorMessage = err instanceof Error ? err.message : String(err);
        const errMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Error: ${actualErrorMessage}. Please check your VS Code terminal for more details.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [loading, buildHistory]
  );

  const resetSession = () => {
    setMessages([
      {
        id: "intro",
        role: "assistant",
        content:
          "Hi again! Ready for another round? Tell me — what compensation are you looking for this time?",
        timestamp: new Date(),
      },
    ]);
    setConfidenceScore(0);
    setFeedbackTips([]);
    setSessionScore([]);
    setInput("");
  };

  const avgScore =
    sessionScore.length > 0
      ? Math.round(sessionScore.reduce((a, b) => a + b, 0) / sessionScore.length)
      : 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-3 max-w-6xl mx-auto px-4 sm:px-6 py-6 gap-6">
      {/* ── Chat column ──────────────────────────────────────────────── */}
      <div className="lg:col-span-2 flex flex-col rounded-2xl border border-[#E8E0F5] overflow-hidden card-soft bg-white">
        {/* Chat header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E0F5] bg-gradient-to-r from-[#F3EDFF] to-[#FFF0E8]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6b7280] to-[#4b5563] flex items-center justify-center text-white shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <p className="font-heading font-semibold text-sm">Jordan — Hiring Manager</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-muted-foreground">Powered by Gemini 2.5</p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetSession}
            className="gap-1.5 text-xs text-[#9b6de0] hover:bg-[#F3EDFF] hover:text-[#7b4fd0]"
          >
            <RefreshCw className="w-3.5 h-3.5" /> New Session
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-[#FDFAFF] to-white">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} msg={msg} />
          ))}
          {loading && (
            <div className="flex gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6b7280] to-[#4b5563] flex items-center justify-center text-white shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-[#E8E0F5] rounded-2xl rounded-tl-sm px-4 py-3 card-soft">
                <div className="flex gap-1 items-center h-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#B792F0] animate-bounce [animation-delay:0ms]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D98BCC] animate-bounce [animation-delay:150ms]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FFB899] animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Starter prompts */}
        {messages.filter((m) => m.role === "user").length === 0 && (
          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {STARTER_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                className="text-xs px-3 py-1.5 rounded-full border border-[#D4B8F8] bg-[#F3EDFF] text-[#9b6de0] hover:bg-[#EDE0FF] transition-colors"
              >
                {p.length > 52 ? p.slice(0, 52) + "…" : p}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div className="border-t border-[#E8E0F5] p-4 bg-white">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              rows={2}
              className="flex-1 resize-none rounded-xl border border-[#E8E0F5] bg-[#FDFAFF] px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B792F0]/50 focus-visible:border-[#B792F0] disabled:opacity-50 transition-colors"
              placeholder="Type your negotiation message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              disabled={loading}
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              size="icon"
              className="h-10 w-10 shrink-0 gradient-brand border-0 text-white shadow-md hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* ── Side panel ───────────────────────────────────────────────── */}
      <div className="space-y-5">
        {/* Confidence meter card */}
        <div className="rounded-2xl border border-[#E8E0F5] bg-white p-5 card-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold text-sm">Negotiation Score</h3>
            {sessionScore.length > 0 && (
              <Badge className="bg-[#F3EDFF] text-[#9b6de0] border-[#D4B8F8] border text-[10px] font-semibold">
                Avg: {avgScore}/10
              </Badge>
            )}
          </div>

          {confidenceScore > 0 ? (
            <ConfidenceMeter score={confidenceScore} />
          ) : (
            <div className="text-center py-6 text-muted-foreground text-sm space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#F3EDFF] flex items-center justify-center mx-auto">
                <Sparkles className="w-5 h-5 text-[#B792F0]" />
              </div>
              <p className="text-xs">Send your first message to see your score</p>
            </div>
          )}

          <Separator className="bg-[#F0EAF8]" />
          <FeedbackPanel tips={feedbackTips} />
        </div>

        {/* Negotiation Playbook */}
        <div className="rounded-2xl border border-[#D4B8F8] bg-gradient-to-br from-[#F3EDFF] to-[#FFF0E8] p-5 space-y-3">
          <div className="flex items-center gap-2 font-heading font-semibold text-sm text-[#9b6de0]">
            <Lightbulb className="w-4 h-4" />
            Negotiation Playbook
          </div>
          <ul className="space-y-2">
            {[
              "Always anchor with a number first — let them react.",
              "Use market data: \"Glassdoor shows $X for this role.\"",
              "Mention specific skills or coursework that add value.",
              "Be silent after making your ask — don't fill the pause.",
              "Express enthusiasm for the role before pushing on pay.",
            ].map((tip) => (
              <li key={tip} className="flex gap-2 text-xs text-muted-foreground">
                <span className="gradient-brand-text font-bold shrink-0">›</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Session history */}
        {sessionScore.length > 0 && (
          <div className="rounded-2xl border border-[#E8E0F5] bg-white p-5 card-soft space-y-3">
            <h3 className="font-heading font-semibold text-sm">Session Progress</h3>
            <div className="flex gap-1.5 flex-wrap">
              {sessionScore.map((s, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-currency text-white shadow-sm ${
                    s >= 8
                      ? "bg-gradient-to-br from-emerald-400 to-[#2ECC71]"
                      : s >= 5
                      ? "gradient-brand"
                      : "bg-gradient-to-br from-[#FFB899] to-rose-400"
                  }`}
                >
                  {s}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {sessionScore.length} exchange{sessionScore.length !== 1 ? "s" : ""} this session
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function NegotiatePage() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <div className="min-h-screen bg-[#FCFAFA] relative">
      {/* Ambient blobs */}
      <div className="fixed -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#B792F0]/08 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 -left-20 w-[400px] h-[400px] rounded-full bg-[#FFB899]/10 blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-[#E8E0F5] bg-white/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-[#9b6de0] hover:bg-[#F3EDFF]"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-5 bg-[#E8E0F5]" />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center shadow-md">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold tracking-tight">&ldquo;Worth It&rdquo; AI Coach</span>
          </div>
          <Badge className="ml-auto text-[10px] font-semibold text-[#9b6de0] border-[#D4B8F8] bg-[#F3EDFF] border">
            Gemini 2.5
          </Badge>
        </div>
      </header>

      {isLoaded && !isSignedIn && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-5 text-center px-4">
          <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center shadow-xl shadow-[#B792F0]/30 mx-auto">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-bold">Sign in to practice</h2>
            <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
              Create a free account to start your negotiation session and track
              your confidence scores over time.
            </p>
          </div>
          <SignInButton mode="modal">
            <Button className="gap-2 gradient-brand border-0 text-white shadow-lg shadow-[#B792F0]/30 hover:opacity-90 transition-opacity">
              <Lock className="w-3.5 h-3.5" /> Sign In to Continue
            </Button>
          </SignInButton>
        </div>
      )}

      {isLoaded && isSignedIn && <NegotiateApp />}
    </div>
  );
}
