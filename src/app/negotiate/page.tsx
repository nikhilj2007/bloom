"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Wallet,
  TrendingDown,
  Link2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
  MessageSquare,
} from "lucide-react";
import type { ChatMessage, GeminiNegotiationResponse } from "@/types";
import { useProfile } from "@/context/ProfileContext";
import { usePlaid } from "@/context/PlaidContext";

// ─── Web Speech API type shim ─────────────────────────────────────────────────

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface SpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  start(): void;
  stop(): void;
}
declare const SpeechRecognition: { new (): SpeechRecognition };

declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "negotiate" | "budget";
type NegotiateMode = "text" | "voice";
type VoiceState = "idle" | "listening" | "thinking" | "speaking";

// ─── Confidence Meter ─────────────────────────────────────────────────────────

function ConfidenceMeter({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const color =
    score >= 8
      ? "from-emerald-400 to-[#2ECC71]"
      : score >= 5
      ? "from-[#3E863E] to-[#4C994C]"
      : "from-[#5aaa5a] to-rose-400";
  const label =
    score >= 8 ? "Strong 💪" : score >= 5 ? "Building 🌱" : "Keep Going 🔥";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Confidence Score
        </span>
        <span className="text-[10px] font-semibold text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="relative h-3 w-full rounded-full bg-[#E0F0E0] overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>1</span>
        <span className="text-currency font-bold text-sm text-foreground">
          {score}/10
        </span>
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
      <div
        className={`max-w-[78%] space-y-1 ${
          isUser ? "items-end" : "items-start"
        } flex flex-col`}
      >
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "gradient-brand text-white rounded-tr-sm shadow-md shadow-[#3E863E]/20"
              : isError
              ? "bg-rose-50 border border-rose-200 text-rose-700 rounded-tl-sm"
              : "bg-white border border-[#D0E8D0] text-foreground rounded-tl-sm card-soft"
          }`}
        >
          {msg.content}
        </div>
        <span className="text-[10px] text-muted-foreground px-1">
          {msg.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
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
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#2d6a2d]">
        <Lightbulb className="w-3.5 h-3.5" />
        Coach Tips
      </div>
      <ul className="space-y-2">
        {tips.map((tip, i) => (
          <li
            key={i}
            className="flex gap-2 text-xs text-foreground leading-relaxed bg-[#F0F7F0] border border-[#A8D4A8] rounded-xl px-3 py-2.5"
          >
            <span className="gradient-brand-text font-bold shrink-0">
              {i + 1}.
            </span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Starter prompts ──────────────────────────────────────────────────────────

const NEGOTIATE_STARTER_PROMPTS = [
  "I was hoping to make $20/hour for this internship.",
  "Based on my Python skills and coursework, I'd like to request $22/hour.",
  "I've done research and found that similar interns in this field earn $18–$24/hour. I'd like to discuss the top of that range.",
];

const BUDGET_STARTER_PROMPTS = [
  "Am I spending too much on food this month?",
  "How should I split my income between saving and spending?",
  "What's my highest expense and how can I cut back?",
];

// ─── Loading bubble ───────────────────────────────────────────────────────────

function LoadingBubble() {
  return (
    <div className="flex gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6b7280] to-[#4b5563] flex items-center justify-center text-white shrink-0">
        <Bot className="w-4 h-4" />
      </div>
      <div className="bg-white border border-[#D0E8D0] rounded-2xl rounded-tl-sm px-4 py-3 card-soft">
        <div className="flex gap-1 items-center h-4">
          <div className="w-1.5 h-1.5 rounded-full bg-[#3E863E] animate-bounce [animation-delay:0ms]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#4C994C] animate-bounce [animation-delay:150ms]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#5aaa5a] animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

// ─── Voice waveform bars ──────────────────────────────────────────────────────

function VoiceWaveform({ active, color = "#3E863E" }: { active: boolean; color?: string }) {
  return (
    <div className="flex items-center gap-0.5 h-5">
      {[0.4, 0.7, 1, 0.7, 0.4, 0.9, 0.6].map((h, i) => (
        <div
          key={i}
          className={`w-0.5 rounded-full transition-all ${active ? "animate-bounce" : ""}`}
          style={{
            height: active ? `${h * 18}px` : "4px",
            backgroundColor: color,
            animationDelay: `${i * 60}ms`,
            animationDuration: "600ms",
          }}
        />
      ))}
    </div>
  );
}

// ─── Input bar (text mode) ────────────────────────────────────────────────────

function InputBar({
  value,
  onChange,
  onSend,
  disabled,
  placeholder,
  textareaRef,
  onMicClick,
  isListening,
  isMuted,
  onToggleMute,
  showVoiceControls = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: (v: string) => void;
  disabled: boolean;
  placeholder: string;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onMicClick?: () => void;
  isListening?: boolean;
  isMuted?: boolean;
  onToggleMute?: () => void;
  showVoiceControls?: boolean;
}) {
  return (
    <div className="border-t border-[#D0E8D0] p-4 bg-white space-y-2">
      {isListening && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200">
          <VoiceWaveform active color="#e11d48" />
          <span className="text-xs font-semibold text-rose-600">Listening… speak now</span>
        </div>
      )}

      <div className="flex gap-2 items-end">
        {showVoiceControls && onMicClick && (
          <button
            onClick={onMicClick}
            disabled={disabled}
            title={isListening ? "Stop listening" : "Speak your negotiation"}
            className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-all border ${
              isListening
                ? "bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-300 scale-105"
                : "border-[#A8D4A8] bg-[#f0f7f0] text-[#3E863E] hover:bg-[#e8f5e8]"
            } disabled:opacity-40`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        )}

        <textarea
          ref={textareaRef}
          rows={2}
          className="flex-1 resize-none rounded-xl border border-[#D0E8D0] bg-[#f5faf5] px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E863E]/40 focus-visible:border-[#3E863E] disabled:opacity-50 transition-colors"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend(value);
            }
          }}
          disabled={disabled}
        />
        <Button
          onClick={() => onSend(value)}
          disabled={disabled || !value.trim()}
          size="icon"
          className="h-10 w-10 shrink-0 gradient-brand border-0 text-white shadow-md hover:opacity-90 transition-opacity"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] text-muted-foreground">
          Enter to send · Shift+Enter for new line
          {showVoiceControls && " · 🎤 mic to speak"}
        </p>
        {showVoiceControls && onToggleMute && (
          <button
            onClick={onToggleMute}
            title={isMuted ? "Unmute AI voice" : "Mute AI voice"}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-[#2d6a2d] transition-colors"
          >
            {isMuted ? (
              <><VolumeX className="w-3.5 h-3.5" /> Voice off</>
            ) : (
              <><Volume2 className="w-3.5 h-3.5" /> Voice on</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Voice Mode Panel ─────────────────────────────────────────────────────────

function VoiceModePanel({
  voiceState,
  isActive,
  onToggle,
  messages,
  loading,
  bottomRef,
}: {
  voiceState: VoiceState;
  isActive: boolean;
  onToggle: () => void;
  messages: ChatMessage[];
  loading: boolean;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}) {
  const STATUS: Record<VoiceState, string> = {
    idle: "Tap the mic to start your session",
    listening: "Listening…",
    thinking: "Thinking…",
    speaking: "Hiring Manager is Speaking…",
  };

  const isListening = voiceState === "listening";
  const isThinking = voiceState === "thinking";
  const isSpeaking = voiceState === "speaking";

  return (
    <div className="flex flex-col rounded-2xl border border-[#D0E8D0] overflow-hidden card-soft bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#D0E8D0] bg-gradient-to-r from-[#f0f7f0] to-[#e8f5e8]">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#6b7280] to-[#4b5563] flex items-center justify-center text-white shadow-sm">
            <Bot className="w-4 h-4" />
            {isSpeaking && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#3E863E] border-2 border-white animate-ping" />
            )}
          </div>
          <div>
            <p className="font-heading font-semibold text-sm">Jordan — Hiring Manager</p>
            <div className="flex items-center gap-1.5">
              {isSpeaking ? (
                <>
                  <VoiceWaveform active color="#3E863E" />
                  <p className="text-[10px] text-[#3E863E] font-semibold">Speaking…</p>
                </>
              ) : (
                <>
                  <div className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
                  <p className="text-[10px] text-muted-foreground">Gemini 2.5 · ElevenLabs Voice</p>
                </>
              )}
            </div>
          </div>
        </div>
        {isActive && (
          <button
            onClick={onToggle}
            className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <Square className="w-3 h-3 fill-current" /> End Session
          </button>
        )}
      </div>

      {/* Central mic controls */}
      <div className="flex flex-col items-center py-10 px-5 gap-6 bg-gradient-to-b from-[#f5faf5] to-white border-b border-[#E8F5E8]">
        {/* Big animated mic button */}
        <div className="relative flex items-center justify-center">
          {/* Outer ring animations */}
          {isListening && (
            <>
              <span className="absolute w-36 h-36 rounded-full bg-rose-400/15 animate-ping" style={{ animationDuration: "1.2s" }} />
              <span className="absolute w-28 h-28 rounded-full bg-rose-400/20 animate-ping" style={{ animationDuration: "0.8s" }} />
            </>
          )}
          {isSpeaking && (
            <>
              <span className="absolute w-36 h-36 rounded-full bg-[#3E863E]/10 animate-ping" style={{ animationDuration: "1.2s" }} />
              <span className="absolute w-28 h-28 rounded-full bg-[#3E863E]/15 animate-ping" style={{ animationDuration: "0.8s" }} />
            </>
          )}

          <button
            onClick={onToggle}
            disabled={isThinking || isSpeaking}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#3E863E]/40
              ${isListening
                ? "bg-rose-500 shadow-rose-300/50 scale-110"
                : isThinking
                ? "bg-[#e8f5e8] cursor-not-allowed shadow-none"
                : isSpeaking
                ? "bg-[#3E863E]/20 cursor-not-allowed"
                : "bg-[#3E863E] hover:bg-[#2d6a2d] hover:scale-105 shadow-[#3E863E]/40 cursor-pointer"
              }`}
          >
            {isThinking ? (
              <div className="w-9 h-9 border-[3px] border-[#3E863E] border-t-transparent rounded-full animate-spin" />
            ) : isSpeaking ? (
              <VoiceWaveform active color="#3E863E" />
            ) : (
              <Mic className={`w-10 h-10 ${isListening ? "text-white" : "text-white"}`} />
            )}
          </button>
        </div>

        {/* Status label */}
        <div className="text-center space-y-1.5">
          <p className={`text-sm font-semibold transition-colors duration-200 ${
            isListening
              ? "text-rose-600"
              : isSpeaking
              ? "text-[#3E863E]"
              : isThinking
              ? "text-[#2d6a2d]"
              : "text-muted-foreground"
          }`}>
            {STATUS[voiceState]}
          </p>
          {!isActive && (
            <p className="text-[11px] text-muted-foreground/70">
              Your mic gesture enables audio autoplay
            </p>
          )}
          {isActive && !isListening && !isThinking && !isSpeaking && (
            <p className="text-[11px] text-muted-foreground/70">Session active · waiting for audio to finish</p>
          )}
        </div>
      </div>

      {/* Live transcript */}
      <div className="flex-1 overflow-y-auto max-h-80 min-h-40">
        {messages.length <= 1 && !loading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-center px-5">
            <div className="w-10 h-10 rounded-2xl bg-[#F0F7F0] flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-[#3E863E]" />
            </div>
            <p className="text-xs text-muted-foreground">
              Your conversation will appear here
            </p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">
              Live Transcript
            </p>
            {messages.map((msg) => (
              <ChatBubble key={msg.id} msg={msg} />
            ))}
            {loading && <LoadingBubble />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main negotiate/coach app ─────────────────────────────────────────────────

function NegotiateApp() {
  // ── Tabs ───────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>("negotiate");
  const [negotiateMode, setNegotiateMode] = useState<NegotiateMode>("text");

  // ── Contexts ───────────────────────────────────────────────────────────────
  const { profile } = useProfile();
  const { transactionSummary, isConnected } = usePlaid();

  // ── Negotiate state ────────────────────────────────────────────────────────
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

  // ── Budget state ───────────────────────────────────────────────────────────
  const [budgetMessages, setBudgetMessages] = useState<ChatMessage[]>([
    {
      id: "budget-intro",
      role: "assistant",
      content:
        "Hey! I'm Glow, your personal budget coach. I can see your financial snapshot and Plaid spending data. Ask me anything about your budget, savings goals, or spending habits.",
      timestamp: new Date(),
    },
  ]);
  const [budgetInput, setBudgetInput] = useState("");
  const [budgetLoading, setBudgetLoading] = useState(false);

  // ── Voice state ────────────────────────────────────────────────────────────
  const [isListening, setIsListening]   = useState(false);   // text mode mic
  const [isMuted, setIsMuted]           = useState(false);
  const [isSpeaking, setIsSpeaking]     = useState(false);
  const [voiceState, setVoiceState]     = useState<VoiceState>("idle");

  // ── Refs ───────────────────────────────────────────────────────────────────
  const recognitionRef   = useRef<SpeechRecognition | null>(null);
  const audioRef         = useRef<HTMLAudioElement | null>(null);
  const voiceActiveRef   = useRef(false);
  const messagesRef      = useRef<ChatMessage[]>(messages);
  const sendMessageRef   = useRef<(text: string) => void>(() => {});
  const bottomRef        = useRef<HTMLDivElement>(null);
  const inputRef         = useRef<HTMLTextAreaElement>(null);
  const budgetInputRef   = useRef<HTMLTextAreaElement>(null);

  // Keep messagesRef in sync
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [budgetMessages]);

  // Stop voice session when switching away from voice mode
  useEffect(() => {
    if (negotiateMode !== "voice" || activeTab !== "negotiate") {
      if (voiceActiveRef.current) {
        voiceActiveRef.current = false;
        recognitionRef.current?.stop();
        audioRef.current?.pause();
        setIsSpeaking(false);
        setVoiceState("idle");
      }
    }
  }, [negotiateMode, activeTab]);

  // ── Continuous voice loop ──────────────────────────────────────────────────
  // Empty deps — all dynamic values accessed via refs or stable state setters
  const runVoiceLoop = useCallback(() => {
    if (!voiceActiveRef.current) return;

    const SpeechRec =
      typeof window !== "undefined"
        ? window.SpeechRecognition ?? window.webkitSpeechRecognition
        : undefined;

    if (!SpeechRec) {
      alert("Speech recognition is not supported in this browser. Please use Chrome.");
      voiceActiveRef.current = false;
      setVoiceState("idle");
      return;
    }

    setVoiceState("listening");

    const rec = new SpeechRec();
    rec.lang = "en-US";
    rec.continuous = true;      // keep mic open until we explicitly call stop()
    rec.interimResults = true;  // receive partial results so we can reset the timer

    let finalTranscript = "";
    let silenceTimer: ReturnType<typeof setTimeout> | null = null;
    const SILENCE_MS = 1500; // submit after 1.5 s of no new speech

    rec.onresult = (e: SpeechRecognitionEvent) => {
      // Accumulate only confirmed final segments to avoid duplicates
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal && result[0]) {
          finalTranscript += result[0].transcript + " ";
        }
      }
      // Each new word resets the silence countdown
      if (silenceTimer) clearTimeout(silenceTimer);
      if (voiceActiveRef.current) {
        silenceTimer = setTimeout(() => {
          rec.stop(); // triggers onend → auto-submit
        }, SILENCE_MS);
      }
    };

    rec.onend = async () => {
      if (silenceTimer) clearTimeout(silenceTimer);
      if (!voiceActiveRef.current) return;

      // No speech detected — restart after brief pause
      if (!finalTranscript.trim()) {
        setTimeout(() => { if (voiceActiveRef.current) runVoiceLoop(); }, 800);
        return;
      }

      setVoiceState("thinking");

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: finalTranscript.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      try {
        // Build history from the snapshot BEFORE this user message
        const history = messagesRef.current
          .filter((m) => m.id !== "intro" && !m.content.startsWith("Error:"))
          .map((m) => ({
            role: (m.role === "user" ? "user" : "model") as "user" | "model",
            parts: [{ text: m.content }],
          }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: finalTranscript.trim(), history }),
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data: GeminiNegotiationResponse & { error?: string } = await res.json();
        if (data.error) throw new Error(data.error);

        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply || "I didn't generate a proper reply.",
          confidence_score: data.confidence_score || 0,
          feedback: data.feedback || [],
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setConfidenceScore(data.confidence_score || 0);
        setFeedbackTips(data.feedback || []);
        setSessionScore((prev) => [...prev, data.confidence_score || 0]);

        // ── Speak the reply ──────────────────────────────────────────────────
        setVoiceState("speaking");
        setIsSpeaking(true);

        const ttsRes = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: data.reply }),
        });

        if (ttsRes.ok) {
          const blob = await ttsRes.blob();
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          audioRef.current = audio;

          audio.onended = () => {
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);
            if (voiceActiveRef.current) {
              runVoiceLoop(); // Continue the loop
            } else {
              setVoiceState("idle");
            }
          };

          audio.onerror = () => {
            console.error("Voice mode: audio playback error");
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);
            if (voiceActiveRef.current) runVoiceLoop();
            else setVoiceState("idle");
          };

          audio.play().catch(console.error);
        } else {
          // TTS failed — skip speaking, restart listening
          setIsSpeaking(false);
          if (voiceActiveRef.current) runVoiceLoop();
          else setVoiceState("idle");
        }
      } catch (err) {
        const errMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Error: ${err instanceof Error ? err.message : String(err)}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errMsg]);
        setIsSpeaking(false);
        if (voiceActiveRef.current) {
          setTimeout(() => runVoiceLoop(), 1500);
        } else {
          setVoiceState("idle");
        }
      } finally {
        setLoading(false);
      }
    };

    rec.onerror = () => {
      if (!voiceActiveRef.current) return;
      setTimeout(() => { if (voiceActiveRef.current) runVoiceLoop(); }, 1000);
    };

    recognitionRef.current = rec;
    rec.start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleVoiceSession = useCallback(() => {
    if (voiceActiveRef.current) {
      voiceActiveRef.current = false;
      recognitionRef.current?.stop();
      audioRef.current?.pause();
      setIsSpeaking(false);
      setVoiceState("idle");
    } else {
      // User gesture here satisfies browser autoplay policy for subsequent audio
      voiceActiveRef.current = true;
      runVoiceLoop();
    }
  }, [runVoiceLoop]);

  // ── Text mode TTS helper ───────────────────────────────────────────────────
  const speakText = useCallback(async (text: string) => {
    if (isMuted || !text.trim()) return;
    try {
      setIsSpeaking(true);
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) { setIsSpeaking(false); return; }

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        console.error("Text mode: audio playback error");
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.play().catch(console.error);
    } catch {
      setIsSpeaking(false);
    }
  }, [isMuted]);

  // ── Text mode mic toggle (continuous + 2s silence → auto-send) ──────────────
  const handleMicClick = useCallback(() => {
    const SpeechRec =
      typeof window !== "undefined"
        ? window.SpeechRecognition ?? window.webkitSpeechRecognition
        : undefined;

    if (!SpeechRec) {
      alert("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const rec = new SpeechRec();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;

    let collectedTranscript = "";
    let silenceTimer: ReturnType<typeof setTimeout> | null = null;
    const SILENCE_MS = 2000; // slightly longer (2 s) for deliberate text dictation

    rec.onresult = (e: SpeechRecognitionEvent) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal && result[0]) {
          collectedTranscript += result[0].transcript + " ";
          setInput((prev) => (prev ? prev + " " + result[0].transcript : result[0].transcript));
        }
      }
      if (silenceTimer) clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => rec.stop(), SILENCE_MS);
    };

    rec.onend = () => {
      if (silenceTimer) clearTimeout(silenceTimer);
      setIsListening(false);
      const text = collectedTranscript.trim();
      if (text) {
        // Auto-send after silence — use stable ref to avoid stale closure
        sendMessageRef.current(text);
        setInput("");
      }
    };

    rec.onerror = () => {
      if (silenceTimer) clearTimeout(silenceTimer);
      setIsListening(false);
    };

    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  }, [isListening]);

  // ── Negotiate helpers ──────────────────────────────────────────────────────

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
          body: JSON.stringify({ message: text.trim(), history: buildHistory() }),
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

        speakText(data.reply || "");
      } catch (err: unknown) {
        const errMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Error: ${
            err instanceof Error ? err.message : String(err)
          }. Please check your terminal for more details.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [loading, buildHistory, speakText]
  );

  // Keep sendMessageRef pointing at the latest sendMessage closure
  useEffect(() => { sendMessageRef.current = sendMessage; }, [sendMessage]);

  const resetSession = () => {
    // Stop any active voice session
    if (voiceActiveRef.current) {
      voiceActiveRef.current = false;
      recognitionRef.current?.stop();
      audioRef.current?.pause();
      setIsSpeaking(false);
      setVoiceState("idle");
    }
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

  // ── Budget helpers ─────────────────────────────────────────────────────────

  const buildBudgetHistory = useCallback(() => {
    return budgetMessages
      .filter(
        (m) => m.id !== "budget-intro" && !m.content.startsWith("Error:")
      )
      .map((m) => ({
        role: (m.role === "user" ? "user" : "model") as "user" | "model",
        parts: [{ text: m.content }],
      }));
  }, [budgetMessages]);

  const buildSystemContext = useCallback(() => {
    const spendingLines =
      transactionSummary.length > 0
        ? transactionSummary
            .map((c) => `${c.label}: $${c.total.toFixed(2)}`)
            .join(", ")
        : "no spending data available (Plaid not connected)";

    return (
      `You are Glow, an empathetic, non-corporate financial coach for a college student. ` +
      `Here is the user's current financial snapshot:\n` +
      `- Monthly Income: $${profile.monthlyIncome}\n` +
      `- Liquid Savings: $${profile.otherCash}\n` +
      `- Total Student Loans: $${profile.studentLoanBalance}\n` +
      `- Total Credit Card Debt: $${profile.creditCardDebt}\n\n` +
      `Based on their recent Plaid data, they have spent the following this month: ${spendingLines}.\n\n` +
      `Answer the user's query briefly, strictly using this exact financial data to answer questions about their snapshot or spending. ` +
      `Do not use markdown headers, keep it conversational.`
    );
  }, [profile, transactionSummary]);

  const sendBudgetMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || budgetLoading) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };
      setBudgetMessages((prev) => [...prev, userMsg]);
      setBudgetInput("");
      setBudgetLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            history: buildBudgetHistory(),
            systemContext: buildSystemContext(),
            mode: "budget",
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || `Server responded with status ${res.status}`);
        }

        const data: { reply: string; error?: string } = await res.json();
        if (data.error) throw new Error(data.error);

        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            data.reply || "I couldn't generate a response, check backend logs.",
          timestamp: new Date(),
        };

        setBudgetMessages((prev) => [...prev, assistantMsg]);
      } catch (err: unknown) {
        const errMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Error: ${
            err instanceof Error ? err.message : String(err)
          }. Please check your terminal for more details.`,
          timestamp: new Date(),
        };
        setBudgetMessages((prev) => [...prev, errMsg]);
      } finally {
        setBudgetLoading(false);
        budgetInputRef.current?.focus();
      }
    },
    [budgetLoading, buildBudgetHistory, buildSystemContext]
  );

  const resetBudgetSession = () => {
    setBudgetMessages([
      {
        id: "budget-intro",
        role: "assistant",
        content:
          "Fresh start! I still have your financial data loaded. What would you like to work through?",
        timestamp: new Date(),
      },
    ]);
    setBudgetInput("");
  };

  const avgScore =
    sessionScore.length > 0
      ? Math.round(
          sessionScore.reduce((a, b) => a + b, 0) / sessionScore.length
        )
      : 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* ── Top-level tab selector ──────────────────────────────────────────── */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F0F7F0] border border-[#D0E8D0] w-fit">
        <button
          onClick={() => setActiveTab("negotiate")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "negotiate"
              ? "bg-[#3E863E] text-white shadow-sm"
              : "text-[#2d6a2d] hover:bg-[#e8f5e8]"
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5" />
          Negotiation Simulator
        </button>
        <button
          onClick={() => setActiveTab("budget")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "budget"
              ? "bg-[#3E863E] text-white shadow-sm"
              : "text-[#2d6a2d] hover:bg-[#e8f5e8]"
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          Budget Coach
        </button>
      </div>

      {/* ── Negotiate tab ──────────────────────────────────────────────────── */}
      {activeTab === "negotiate" && (
        <div className="space-y-5">
          {/* Empowerment banner */}
          <div className="rounded-2xl border border-[#A8D4A8] bg-gradient-to-r from-[#f0f7f0] via-[#e8f5e8] to-[#f0f7f0] px-5 py-4 flex items-start gap-3">
            <span className="text-lg leading-none mt-0.5" aria-hidden>💼</span>
            <p className="text-sm text-[#2d6a2d] leading-relaxed">
              <strong>The average woman leaves $1M+ on the table</strong> over her career by not
              negotiating her first offer.{" "}
              <span className="font-medium">This is your practice round — make it count.</span>
            </p>
          </div>

          {/* ── Text / Voice mode sub-tabs ────────────────────────────────── */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-[#D0E8D0] w-fit shadow-sm">
            <button
              onClick={() => setNegotiateMode("text")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                negotiateMode === "text"
                  ? "bg-[#3E863E] text-white shadow-sm"
                  : "text-[#2d6a2d] hover:bg-[#e8f5e8]"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Text Mode
            </button>
            <button
              onClick={() => setNegotiateMode("voice")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                negotiateMode === "voice"
                  ? "bg-[#3E863E] text-white shadow-sm"
                  : "text-[#2d6a2d] hover:bg-[#e8f5e8]"
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              Voice Mode
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Main chat column ──────────────────────────────────────────── */}
            <div className="lg:col-span-2">

              {/* TEXT MODE */}
              {negotiateMode === "text" && (
                <div className="flex flex-col rounded-2xl border border-[#D0E8D0] overflow-hidden card-soft bg-white">
                  {/* Chat header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#D0E8D0] bg-gradient-to-r from-[#f0f7f0] to-[#e8f5e8]">
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#6b7280] to-[#4b5563] flex items-center justify-center text-white shadow-sm">
                        <Bot className="w-4 h-4" />
                        {isSpeaking && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#3E863E] border-2 border-white animate-ping" />
                        )}
                      </div>
                      <div>
                        <p className="font-heading font-semibold text-sm">Jordan — Hiring Manager</p>
                        <div className="flex items-center gap-1.5">
                          {isSpeaking ? (
                            <>
                              <VoiceWaveform active color="#3E863E" />
                              <p className="text-[10px] text-[#3E863E] font-semibold">Speaking…</p>
                            </>
                          ) : (
                            <>
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <p className="text-[10px] text-muted-foreground">
                                Gemini 2.5 · ElevenLabs Voice
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetSession}
                      className="gap-1.5 text-xs text-[#2d6a2d] hover:bg-[#F0F7F0] hover:text-[#1e551e]"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> New Session
                    </Button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-[#f5faf5] to-white min-h-80 max-h-[480px]">
                    {messages.map((msg) => (
                      <ChatBubble key={msg.id} msg={msg} />
                    ))}
                    {loading && <LoadingBubble />}
                    <div ref={bottomRef} />
                  </div>

                  {/* Starter prompts */}
                  {messages.filter((m) => m.role === "user").length === 0 && (
                    <div className="px-5 pb-3 flex flex-wrap gap-2">
                      {NEGOTIATE_STARTER_PROMPTS.map((p) => (
                        <button
                          key={p}
                          onClick={() => sendMessage(p)}
                          className="text-xs px-3 py-1.5 rounded-full border border-[#A8D4A8] bg-[#F0F7F0] text-[#2d6a2d] hover:bg-[#e8f5e8] transition-colors"
                        >
                          {p.length > 52 ? p.slice(0, 52) + "…" : p}
                        </button>
                      ))}
                    </div>
                  )}

                  <InputBar
                    value={input}
                    onChange={setInput}
                    onSend={sendMessage}
                    disabled={loading}
                    placeholder="Type your negotiation message… or click 🎤"
                    textareaRef={inputRef}
                    showVoiceControls
                    onMicClick={handleMicClick}
                    isListening={isListening}
                    isMuted={isMuted}
                    onToggleMute={() => {
                      if (!isMuted && audioRef.current) {
                        audioRef.current.pause();
                        setIsSpeaking(false);
                      }
                      setIsMuted((m) => !m);
                    }}
                  />
                </div>
              )}

              {/* VOICE MODE */}
              {negotiateMode === "voice" && (
                <VoiceModePanel
                  voiceState={voiceState}
                  isActive={voiceActiveRef.current}
                  onToggle={toggleVoiceSession}
                  messages={messages}
                  loading={loading}
                  bottomRef={bottomRef}
                />
              )}
            </div>

            {/* ── Side panel (shared across text & voice modes) ─────────────── */}
            <div className="space-y-5">
              {/* Confidence meter */}
              <div className="rounded-2xl border border-[#D0E8D0] bg-white p-5 card-soft space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-semibold text-sm">
                    Negotiation Score
                  </h3>
                  {sessionScore.length > 0 && (
                    <Badge className="bg-[#F0F7F0] text-[#2d6a2d] border-[#A8D4A8] border text-[10px] font-semibold">
                      Avg: {avgScore}/10
                    </Badge>
                  )}
                </div>

                {confidenceScore > 0 ? (
                  <ConfidenceMeter score={confidenceScore} />
                ) : (
                  <div className="text-center py-6 text-muted-foreground text-sm space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-[#F0F7F0] flex items-center justify-center mx-auto">
                      <Sparkles className="w-5 h-5 text-[#3E863E]" />
                    </div>
                    <p className="text-xs">
                      {negotiateMode === "voice"
                        ? "Start the voice session to see your score"
                        : "Send your first message to see your score"}
                    </p>
                  </div>
                )}

                <Separator className="bg-[#E0F0E0]" />
                <FeedbackPanel tips={feedbackTips} />
              </div>

              {/* Negotiation Playbook */}
              <div className="rounded-2xl border border-[#A8D4A8] bg-gradient-to-br from-[#f0f7f0] to-[#e8f5e8] p-5 space-y-3">
                <div className="flex items-center gap-2 font-heading font-semibold text-sm text-[#2d6a2d]">
                  <Lightbulb className="w-4 h-4" />
                  Negotiation Playbook
                </div>
                <ul className="space-y-2">
                  {[
                    "Always anchor with a number first — let them react.",
                    'Use market data: "Glassdoor shows $X for this role."',
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
                <div className="rounded-2xl border border-[#D0E8D0] bg-white p-5 card-soft space-y-3">
                  <h3 className="font-heading font-semibold text-sm">
                    Session Progress
                  </h3>
                  <div className="flex gap-1.5 flex-wrap">
                    {sessionScore.map((s, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-currency text-white shadow-sm ${
                          s >= 8
                            ? "bg-gradient-to-br from-emerald-400 to-[#2ECC71]"
                            : s >= 5
                            ? "gradient-brand"
                            : "bg-gradient-to-br from-[#5aaa5a] to-rose-400"
                        }`}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {sessionScore.length} exchange
                    {sessionScore.length !== 1 ? "s" : ""} this session
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Budget Coach tab ────────────────────────────────────────────────── */}
      {activeTab === "budget" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat column */}
          <div className="lg:col-span-2 flex flex-col rounded-2xl border border-[#D0E8D0] overflow-hidden card-soft bg-white">
            {/* Chat header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D0E8D0] bg-gradient-to-r from-[#f0f7f0] to-[#e8f5e8]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center text-white shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-sm">
                    Glow — Budget Coach
                  </p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[10px] text-muted-foreground">
                      Context-aware · Powered by Gemini 2.5
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetBudgetSession}
                className="gap-1.5 text-xs text-[#2d6a2d] hover:bg-[#F0F7F0] hover:text-[#1e551e]"
              >
                <RefreshCw className="w-3.5 h-3.5" /> New Session
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-[#f5faf5] to-white min-h-80 max-h-[480px]">
              {budgetMessages.map((msg) => (
                <ChatBubble key={msg.id} msg={msg} />
              ))}
              {budgetLoading && <LoadingBubble />}
              <div ref={bottomRef} />
            </div>

            {/* Starter prompts */}
            {budgetMessages.filter((m) => m.role === "user").length === 0 && (
              <div className="px-5 pb-3 flex flex-wrap gap-2">
                {BUDGET_STARTER_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendBudgetMessage(p)}
                    className="text-xs px-3 py-1.5 rounded-full border border-[#A8D4A8] bg-[#F0F7F0] text-[#2d6a2d] hover:bg-[#e8f5e8] transition-colors"
                  >
                    {p.length > 52 ? p.slice(0, 52) + "…" : p}
                  </button>
                ))}
              </div>
            )}

            <InputBar
              value={budgetInput}
              onChange={setBudgetInput}
              onSend={sendBudgetMessage}
              disabled={budgetLoading}
              placeholder="Ask Glow about your budget…"
              textareaRef={budgetInputRef}
            />
          </div>

          {/* Budget side panel */}
          <div className="space-y-5">
            {/* Financial Snapshot */}
            <div className="rounded-2xl border border-[#D0E8D0] bg-white p-5 card-soft space-y-4">
              <div className="flex items-center gap-2 font-heading font-semibold text-sm">
                <Wallet className="w-4 h-4 text-[#3E863E]" />
                Your Snapshot
              </div>
              <div className="space-y-2.5">
                {[
                  { label: "Monthly Income",    value: profile.monthlyIncome,      subtext: undefined,                                           negative: false },
                  { label: "Independence Fund", value: profile.otherCash,          subtext: "Your safety net for total independence.",           negative: false },
                  { label: "Student Loans",     value: profile.studentLoanBalance, subtext: undefined,                                           negative: true  },
                  { label: "Credit Card Debt",  value: profile.creditCardDebt,     subtext: undefined,                                           negative: true  },
                ].map(({ label, value, negative, subtext }) => (
                  <div key={label} className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs text-muted-foreground">{label}</span>
                      {subtext && (
                        <p className="text-[9px] text-[#3E863E] leading-tight mt-0.5 italic">{subtext}</p>
                      )}
                    </div>
                    <span
                      className={`text-xs font-semibold font-mono shrink-0 ${
                        negative && value > 0 ? "text-rose-500" : "text-[#2d6a2d]"
                      }`}
                    >
                      {negative && value > 0 ? "-" : ""}${value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Update your profile on the dashboard to keep this current.
              </p>
            </div>

            {/* Spending Breakdown */}
            {isConnected && transactionSummary.length > 0 ? (
              <div className="rounded-2xl border border-[#D0E8D0] bg-white p-5 card-soft space-y-4">
                <div className="flex items-center gap-2 font-heading font-semibold text-sm">
                  <TrendingDown className="w-4 h-4 text-[#3E863E]" />
                  This Month&apos;s Spending
                </div>
                <ul className="space-y-2.5">
                  {transactionSummary.slice(0, 6).map((c) => (
                    <li key={c.category} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-foreground">{c.label}</span>
                        <span className="text-xs font-semibold font-mono text-[#2d6a2d]">
                          ${c.total.toFixed(2)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-[#E0F0E0] overflow-hidden">
                        <div
                          className="h-full rounded-full gradient-brand transition-all duration-500"
                          style={{ width: `${Math.min(c.percentage, 100)}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] text-muted-foreground">
                  Glow has access to this data in every message.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#A8D4A8] bg-gradient-to-br from-[#f0f7f0] to-[#e8f5e8] p-5 space-y-3 text-center">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#D0E8D0] flex items-center justify-center mx-auto">
                  <Link2 className="w-4 h-4 text-[#3E863E]" />
                </div>
                <p className="text-xs font-semibold text-[#2d6a2d]">
                  Connect Plaid for spending insights
                </p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Link your bank on the dashboard so Glow can give you advice
                  based on your real transaction data.
                </p>
                <Link href="/">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-[#A8D4A8] text-[#2d6a2d] hover:bg-[#e8f5e8] mt-1"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function NegotiatePage() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <div className="min-h-screen bg-[#F9FAFB] relative">
      {/* Header */}
      <header className="border-b border-[#D0E8D0] bg-white/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-[#2d6a2d] hover:bg-[#F0F7F0]"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-5 bg-[#D0E8D0]" />
          {/* Logo + title */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Bloom"
              width={44}
              height={44}
              className="rounded-xl shadow-md object-contain"
              priority
            />
            <span className="font-heading font-bold tracking-tight text-[#1e551e]">
              &ldquo;Worth It&rdquo; AI Coach
            </span>
          </div>
          <Badge className="ml-auto text-[10px] font-semibold text-[#2d6a2d] border-[#A8D4A8] bg-[#F0F7F0] border">
            Gemini 2.5
          </Badge>
        </div>
      </header>

      {isLoaded && !isSignedIn && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-5 text-center px-4">
          <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center shadow-xl shadow-[#3E863E]/30 mx-auto">
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
            <Button className="gap-2 gradient-brand border-0 text-white shadow-lg shadow-[#3E863E]/30 hover:opacity-90 transition-opacity">
              <Lock className="w-3.5 h-3.5" /> Sign In to Continue
            </Button>
          </SignInButton>
        </div>
      )}

      {isLoaded && isSignedIn && <NegotiateApp />}
    </div>
  );
}
