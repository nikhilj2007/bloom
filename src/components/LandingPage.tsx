"use client";

import { SignUpButton, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, BarChart2, Link2, Sparkles } from "lucide-react";

// ─── Feature cards ────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Link2,
    title: "Seamless Bank Sync",
    desc: "Connect your bank accounts via Plaid for real-time balance tracking and automatic spending categorization.",
    bg: "bg-gradient-to-br from-[#e8fdf3] to-[#f0fef8]",
    border: "border-emerald-100",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    icon: BarChart2,
    title: "Smart Budgeting",
    desc: "See exactly where your money goes each month with visual breakdowns powered by your live transaction data.",
    bg: "bg-gradient-to-br from-[#f0f7f0] to-[#e8f5e8]",
    border: "border-[#D0E8D0]",
    iconBg: "bg-[#e8f5e8]",
    iconColor: "text-[#2d6a2d]",
  },
  {
    icon: Bot,
    title: "Gemini AI Coach",
    desc: "Practice salary negotiations and get personalized budget advice from an AI coach that knows your real financial picture.",
    bg: "bg-gradient-to-br from-[#f0f7f0] to-white",
    border: "border-[#D0E8D0]",
    iconBg: "bg-[#f0f7f0]",
    iconColor: "text-[#3E863E]",
  },
];

// ─── Landing page ─────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">

      {/* ── Minimal nav ────────────────────────────────────────────── */}
      <header className="border-b border-[#D0E8D0] bg-white/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-heading font-bold tracking-tight text-sm">Glow</span>
          </div>
          <SignInButton mode="modal">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-[#2d6a2d] hover:bg-[#F0F7F0]"
            >
              Sign In
            </Button>
          </SignInButton>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ───────────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center space-y-8 relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[640px] h-[420px] rounded-full bg-[#3E863E]/6 blur-[100px] pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-white border border-[#3E863E]/30 text-[#2d6a2d] text-xs font-semibold shadow-sm relative">
            <Sparkles className="w-3 h-3" />
            The financial dashboard built for college students
          </div>

          {/* Headline */}
          <h1 className="font-heading text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.05] relative">
            Know your{" "}
            <span className="relative inline-block text-[#3E863E]">
              worth
              {/* Subtle underline accent */}
              <svg
                className="absolute -bottom-1 left-0 w-full"
                height="6"
                viewBox="0 0 100 6"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M0 4 Q 25 0 50 4 Q 75 8 100 4"
                  stroke="#3E863E"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.45"
                />
              </svg>
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-muted-foreground text-lg sm:text-xl max-w-xl mx-auto leading-relaxed relative">
            The financial dashboard built for college students. Link your bank,
            track your spending, and get personalized AI coaching to start
            building wealth today.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center relative">
            <SignUpButton mode="modal">
              <Button
                size="lg"
                className="gap-2 gradient-brand border-0 text-white shadow-xl shadow-[#3E863E]/25 hover:opacity-90 transition-opacity px-8 h-12 font-semibold text-base"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-[#A8D4A8] text-[#2d6a2d] hover:bg-[#F0F7F0] px-8 h-12 font-semibold text-base bg-white"
              >
                Sign In
              </Button>
            </SignInButton>
          </div>

          <p className="text-xs text-muted-foreground relative">
            No credit card required · Free for students
          </p>
        </section>

        {/* ── Feature grid ───────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-24">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, bg, border, iconBg, iconColor }) => (
              <div
                key={title}
                className={`rounded-2xl ${bg} border ${border} p-6 space-y-4 hover:shadow-md transition-all duration-300`}
              >
                <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div className="space-y-1.5">
                  <p className="font-heading font-bold text-sm text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-[#D0E8D0] py-6 text-center">
        <p className="text-xs text-muted-foreground">
          Built for the next generation of financially empowered students.
        </p>
      </footer>
    </div>
  );
}
