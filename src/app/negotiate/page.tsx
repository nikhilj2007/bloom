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
      ? "from-emerald-500 to-green-400"
      : score >= 5
      ? "from-violet-500 to-indigo-400"
      : "from-rose-500 to-orange-400";
  const label =
    score >= 8 ? "Strong 💪" : score >= 5 ? "Building 🌱" : "Keep Going 🔥";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Confidence Score
        </span>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="relative h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>1</span>
        <span className="font-bold text-sm text-foreground">{score}/10</span>
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
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
          isUser
            ? "bg-gradient-to-br from-violet-500 to-indigo-500"
            : isError
            ? "bg-gradient-to-br from-rose-500 to-rose-700"
            : "bg-gradient-to-br from-slate-600 to-slate-700"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className={`max-w-[78%] space-y-1 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-sm"
              : isError
              ? "bg-rose-50 border border-rose-200 text-rose-700 rounded-tl-sm shadow-sm"
              : "bg-white dark:bg-slate-800 border text-foreground rounded-tl-sm shadow-sm"
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
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
        <Lightbulb className="w-3.5 h-3.5" />
        Coach Tips
      </div>
      <ul className="space-y-2">
        {tips.map((tip, i) => (
          <li
            key={i}
            className="flex gap-2 text-xs text-foreground leading-relaxed bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-lg px-3 py-2"
          >
            <span className="text-amber-500 font-bold shrink-0">{i + 1}.</span>
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

  // Build Gemini-compatible history from existing messages (exclude intro)
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

        // If the server returns a 500, throw the text to the catch block
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
        // This is the fix! Now we extract the REAL error message instead of the hardcoded key error.
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
      <div className="lg:col-span-2 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border shadow-sm overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Jordan — Hiring Manager</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-muted-foreground">Powered by Gemini</p>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={resetSession} className="gap-1.5 text-xs">
            <RefreshCw className="w-3.5 h-3.5" /> New Session
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-slate-50/50 dark:from-slate-900/50 to-white dark:to-slate-900">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} msg={msg} />
          ))}
          {loading && (
            <div className="flex gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-slate-800 border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Starter prompts — show before first user message */}
        {messages.filter((m) => m.role === "user").length === 0 && (
          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {STARTER_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                className="text-xs px-3 py-1.5 rounded-full border border-violet-200 bg-violet-50 dark:bg-violet-950/30 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors"
              >
                {p.length > 52 ? p.slice(0, 52) + "…" : p}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div className="border-t p-4 bg-white dark:bg-slate-900">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              rows={2}
              className="flex-1 resize-none rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
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
              className="h-10 w-10 shrink-0 bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* ── Side panel ───────────────────────────────────────────────── */}
      <div className="space-y-5">
        {/* Confidence meter */}
        <div className="rounded-2xl border bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Negotiation Score</h3>
            {sessionScore.length > 0 && (
              <Badge variant="outline" className="text-xs">
                Avg: {avgScore}/10
              </Badge>
            )}
          </div>

          {confidenceScore > 0 ? (
            <ConfidenceMeter score={confidenceScore} />
          ) : (
            <div className="text-center py-6 text-muted-foreground text-sm space-y-1">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-5 h-5 text-muted-foreground/60" />
              </div>
              <p>Send your first message to see your score</p>
            </div>
          )}

          <Separator />
          <FeedbackPanel tips={feedbackTips} />
        </div>

        {/* Tips card */}
        <div className="rounded-2xl border bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20 p-5 space-y-3">
          <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-semibold text-sm">
            <Lightbulb className="w-4 h-4" />
            Negotiation Playbook
          </div>
          <ul className="space-y-2 text-xs text-muted-foreground">
            {[
              "Always anchor with a number first — let them react.",
              "Use market data: \"Glassdoor shows $X for this role.\"",
              "Mention specific skills or coursework that add value.",
              "Be silent after making your ask — don't fill the pause.",
              "Express enthusiasm for the role before pushing on pay.",
            ].map((tip) => (
              <li key={tip} className="flex gap-2">
                <span className="text-violet-400 shrink-0">›</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Session history summary */}
        {sessionScore.length > 0 && (
          <div className="rounded-2xl border bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold">Session Progress</h3>
            <div className="flex gap-1.5 flex-wrap">
              {sessionScore.map((s, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    s >= 8
                      ? "bg-emerald-500"
                      : s >= 5
                      ? "bg-violet-500"
                      : "bg-rose-500"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-indigo-50/30 dark:from-slate-950 dark:via-violet-950/10 dark:to-indigo-950/10">
      {/* Header */}
      <header className="border-b bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-5" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold tracking-tight">&ldquo;Worth It&rdquo; AI Coach</span>
          </div>
          <Badge variant="outline" className="ml-auto text-xs text-violet-600 border-violet-300 bg-violet-50 dark:bg-violet-950/30">
            Gemini
          </Badge>
        </div>
      </header>

      {isLoaded && !isSignedIn && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center px-4">
          <Lock className="w-10 h-10 text-muted-foreground/50" />
          <h2 className="text-xl font-semibold">Sign in to practice</h2>
          <p className="text-muted-foreground max-w-sm text-sm">
            Create a free account to start your negotiation session and track your confidence scores over time.
          </p>
          <SignInButton mode="modal">
            <Button className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
              <Lock className="w-3.5 h-3.5" /> Sign In to Continue
            </Button>
          </SignInButton>
        </div>
      )}

      {isLoaded && isSignedIn && <NegotiateApp />}
    </div>
  );
}