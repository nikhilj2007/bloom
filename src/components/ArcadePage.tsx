"use client";

import { useState, useEffect, useCallback } from "react";
import { AppHeader, MobileBottomDock } from "@/components/AppHeader";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Gamepad2,
  Trophy,
  Star,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Gift,
  Zap,
  RefreshCw,
  Sparkles,
  CircleDollarSign,
} from "lucide-react";

// ─── Quiz data ────────────────────────────────────────────────────────────────

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
}

const DAILY_QUESTIONS: Question[] = [
  {
    id: 1,
    topic: "Compound Interest",
    question:
      "You invest $1,000 at 8% annual interest, compounded yearly. Roughly how much will you have after 10 years?",
    options: ["$1,480", "$1,800", "$2,159", "$2,600"],
    correctIndex: 2,
    explanation:
      "Compound interest uses the formula A = P(1 + r)^t. At 8% for 10 years: $1,000 × (1.08)^10 ≈ $2,159. Starting early is the single biggest financial advantage you have right now.",
  },
  {
    id: 2,
    topic: "Credit Utilization",
    question:
      "Your credit card limit is $5,000. To maximize your credit score, how much should you ideally spend each month?",
    options: [
      "Up to $4,500 (90% utilization)",
      "Up to $2,500 (50% utilization)",
      "Up to $1,500 (30% utilization)",
      "No more than $500 (10% utilization)",
    ],
    correctIndex: 2,
    explanation:
      "Credit bureaus recommend keeping utilization below 30% of your limit. Staying under $1,500 on a $5,000 card signals responsible usage and boosts your credit score over time.",
  },
  {
    id: 3,
    topic: "Stocks vs. Mutual Funds",
    question:
      "Which statement BEST describes a mutual fund compared to an individual stock?",
    options: [
      "A mutual fund only invests in government bonds",
      "A mutual fund pools money from many investors to buy a diversified basket of assets, spreading risk",
      "Individual stocks are always safer than mutual funds",
      "Mutual funds guarantee a fixed annual return",
    ],
    correctIndex: 1,
    explanation:
      "Mutual funds pool capital from many investors and spread it across dozens or hundreds of assets. This built-in diversification means one bad stock doesn't sink your entire portfolio — making them ideal for beginner investors.",
  },
];

const POINTS_PER_CORRECT = 100;
const POINTS_PER_REWARD  = 500;
const LS_KEY_POINTS       = "worthwise_arcade_points_v1";
const LS_KEY_DATE         = "worthwise_arcade_date_v1";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function loadPoints(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(LS_KEY_POINTS) ?? "0", 10) || 0;
}

function savePoints(pts: number): void {
  localStorage.setItem(LS_KEY_POINTS, String(pts));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PointsTracker({
  points,
  onRedeem,
  redeemed,
}: {
  points: number;
  onRedeem: () => void;
  redeemed: boolean;
}) {
  const nextMilestone = Math.ceil((points + 1) / POINTS_PER_REWARD) * POINTS_PER_REWARD;
  const progress      = (points % POINTS_PER_REWARD) / POINTS_PER_REWARD;
  const canRedeem     = points >= POINTS_PER_REWARD;
  const rewards       = Math.floor(points / POINTS_PER_REWARD);

  return (
    <div className="bg-white rounded-2xl border border-[#D0E8D0] card-soft p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-50">
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-semibold text-sm" style={{ fontFamily: "var(--font-jakarta)" }}>
            Rewards Tracker
          </p>
        </div>
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 border text-[10px] font-semibold">
          {points.toLocaleString()} pts
        </Badge>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{points % POINTS_PER_REWARD} / {POINTS_PER_REWARD} pts to next reward</span>
          <span className="text-[#3E863E] font-semibold">
            {rewards > 0 ? `${rewards} reward${rewards > 1 ? "s" : ""} earned` : "Keep going!"}
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-[#E0F0E0] overflow-hidden">
          <div
            className="h-full rounded-full gradient-brand transition-all duration-700"
            style={{ width: `${Math.min(progress * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Reward explanation */}
      <div className="rounded-xl bg-gradient-to-br from-[#f0f7f0] to-[#e8f5e8] border border-[#A8D4A8] p-3.5">
        <div className="flex items-start gap-2">
          <Gift className="w-4 h-4 text-[#3E863E] shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-[#2d6a2d]">Fidelity Investment Bonus</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
              Every <strong>500 points</strong> earned unlocks a{" "}
              <strong className="text-[#3E863E]">$1.00 Bonus Investment Reward</strong> sponsored
              by Fidelity. Points never expire.
            </p>
          </div>
        </div>
      </div>

      {/* Redeem button */}
      {redeemed ? (
        <div className="rounded-xl bg-gradient-to-r from-[#e8fdf3] to-[#f0fef8] border border-emerald-200 p-4 text-center space-y-1">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
          <p className="text-sm font-semibold text-emerald-700">Reward Claimed!</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            $1.00 will be credited to your linked Fidelity Investment account upon verification.
          </p>
        </div>
      ) : canRedeem ? (
        <button
          onClick={onRedeem}
          className="w-full py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md"
        >
          <Sparkles className="w-4 h-4" /> Redeem {rewards} Reward{rewards > 1 ? "s" : ""} →
        </button>
      ) : (
        <button
          disabled
          className="w-full py-2.5 rounded-xl bg-[#f0f7f0] text-[#aac8aa] text-sm font-semibold flex items-center justify-center gap-2 cursor-not-allowed border border-[#D0E8D0]"
        >
          <Gift className="w-4 h-4" /> Need {nextMilestone - points} more pts to redeem
        </button>
      )}
    </div>
  );
}

// ─── Quiz component ───────────────────────────────────────────────────────────

type QuizState = "idle" | "playing" | "answered" | "done";

function QuizCard({
  onPointsEarned,
  alreadyPlayed,
}: {
  onPointsEarned: (pts: number) => void;
  alreadyPlayed: boolean;
}) {
  const [state, setState]           = useState<QuizState>(alreadyPlayed ? "done" : "idle");
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selected, setSelected]     = useState<number | null>(null);
  const [score, setScore]           = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const currentQ = DAILY_QUESTIONS[questionIdx];

  const handleAnswer = useCallback(
    (idx: number) => {
      if (state !== "playing") return;
      setSelected(idx);
      setState("answered");
      if (idx === currentQ.correctIndex) {
        setScore((s) => s + POINTS_PER_CORRECT);
        setCorrectCount((c) => c + 1);
      }
    },
    [state, currentQ]
  );

  // `score` is already updated by handleAnswer before Finish is clicked.
  const finalScore = score;

  if (state === "idle") {
    return (
      <div className="bg-white rounded-2xl border border-[#D0E8D0] card-soft p-6 space-y-5 text-center">
        <div className="w-14 h-14 gradient-brand rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <Gamepad2 className="w-7 h-7 text-white" />
        </div>
        <div className="space-y-2">
          <h2
            className="text-xl font-extrabold tracking-tight"
            style={{ fontFamily: "var(--font-jakarta)", color: "#1a2332" }}
          >
            Daily Financial Quiz
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            3 quick questions. Earn up to{" "}
            <strong className="text-[#3E863E]">300 points</strong> today. Knowledge compounds too.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["Compound Interest", "Credit Utilization", "Stocks vs. Funds"].map((topic) => (
            <div
              key={topic}
              className="rounded-xl bg-[#f0f7f0] border border-[#D0E8D0] p-2.5 text-center"
            >
              <Zap className="w-3.5 h-3.5 text-[#3E863E] mx-auto mb-1" />
              <p className="text-[10px] font-semibold text-[#2d6a2d] leading-tight">{topic}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => setState("playing")}
          className="w-full py-3 rounded-xl gradient-brand text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md"
        >
          Start Quiz <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (state === "done") {
    const totalPossible = DAILY_QUESTIONS.length * POINTS_PER_CORRECT;
    const pct = Math.round((finalScore / totalPossible) * 100);
    return (
      <div className="bg-white rounded-2xl border border-[#D0E8D0] card-soft p-6 space-y-5 text-center">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center mx-auto shadow-md">
          <Trophy className="w-7 h-7 text-white" />
        </div>
        <div className="space-y-1">
          <h2
            className="text-xl font-extrabold"
            style={{ fontFamily: "var(--font-jakarta)", color: "#1a2332" }}
          >
            Quiz Complete!
          </h2>
          <p className="text-3xl font-bold text-[#3E863E]" style={{ fontFamily: "var(--font-mono)" }}>
            +{alreadyPlayed ? 0 : finalScore} pts
          </p>
          <p className="text-sm text-muted-foreground">
            {alreadyPlayed
              ? "You already completed today's quiz. Come back tomorrow!"
              : `${correctCount} of ${DAILY_QUESTIONS.length} correct · ${pct}% accuracy`}
          </p>
        </div>
        {!alreadyPlayed && (
          <div className="grid grid-cols-3 gap-2">
            {DAILY_QUESTIONS.map((q, i) => (
              <div
                key={q.id}
                className={`rounded-xl p-2.5 border text-center ${
                  i < correctCount
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-rose-50 border-rose-200"
                }`}
              >
                {i < correctCount ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 mx-auto mb-1" />
                )}
                <p className="text-[10px] font-semibold text-muted-foreground">{q.topic}</p>
              </div>
            ))}
          </div>
        )}
        <p className="text-[11px] text-muted-foreground">
          Points added to your rewards tracker below. Come back tomorrow for a new quiz!
        </p>
      </div>
    );
  }

  // "playing" or "answered"
  const isCorrect = selected === currentQ.correctIndex;

  return (
    <div className="bg-white rounded-2xl border border-[#D0E8D0] card-soft p-5 space-y-5">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {DAILY_QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i < questionIdx
                  ? "w-8 bg-[#3E863E]"
                  : i === questionIdx
                  ? "w-8 gradient-brand"
                  : "w-8 bg-[#E0F0E0]"
              }`}
            />
          ))}
        </div>
        <Badge className="bg-[#f0f7f0] text-[#2d6a2d] border-[#A8D4A8] border text-[10px] font-semibold">
          {questionIdx + 1} / {DAILY_QUESTIONS.length}
        </Badge>
      </div>

      {/* Topic pill */}
      <div className="flex items-center gap-1.5">
        <Zap className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
          {currentQ.topic}
        </span>
      </div>

      {/* Question */}
      <p
        className="text-base font-semibold leading-snug"
        style={{ fontFamily: "var(--font-jakarta)", color: "#1a2332" }}
      >
        {currentQ.question}
      </p>

      {/* Options */}
      <div className="space-y-2.5">
        {currentQ.options.map((opt, idx) => {
          let variant = "default";
          if (state === "answered") {
            if (idx === currentQ.correctIndex) variant = "correct";
            else if (idx === selected) variant = "wrong";
          }
          const styles: Record<string, string> = {
            default:
              "bg-[#f9fafb] border-[#D0E8D0] hover:bg-[#f0f7f0] hover:border-[#A8D4A8] cursor-pointer",
            correct: "bg-emerald-50 border-emerald-400",
            wrong:   "bg-rose-50 border-rose-300",
          };
          return (
            <button
              key={idx}
              disabled={state === "answered"}
              onClick={() => handleAnswer(idx)}
              className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition-all duration-200 flex items-center justify-between gap-3 ${styles[variant]}`}
            >
              <span className="font-medium leading-snug">{opt}</span>
              {state === "answered" && idx === currentQ.correctIndex && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              )}
              {state === "answered" && idx === selected && idx !== currentQ.correctIndex && (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {state === "answered" && (
        <div
          className={`rounded-xl p-3.5 border text-xs leading-relaxed ${
            isCorrect
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <span className="font-bold mr-1">{isCorrect ? "✓ Correct!" : "✗ Not quite."}</span>
          {currentQ.explanation}
        </div>
      )}

      {/* Next / score */}
      {state === "answered" && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-[#3E863E]">
            {isCorrect ? `+${POINTS_PER_CORRECT} pts earned!` : "No points this round"}
          </span>
          <button
            onClick={() => {
              if (questionIdx < DAILY_QUESTIONS.length - 1) {
                setQuestionIdx((i) => i + 1);
                setSelected(null);
                setState("playing");
              } else {
                // `score` already reflects the last correct answer via handleAnswer
                onPointsEarned(score);
                setState("done");
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-brand text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            {questionIdx < DAILY_QUESTIONS.length - 1 ? "Next" : "Finish"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Leaderboard / stats strip ────────────────────────────────────────────────

function StatsStrip({ points }: { points: number }) {
  const rewards = Math.floor(points / POINTS_PER_REWARD);
  const streak  = 1; // demo value

  const stats = [
    { label: "Total Points",     value: points.toLocaleString(), icon: Star,        color: "text-amber-500",   bg: "bg-amber-50"   },
    { label: "Rewards Earned",   value: `$${rewards}.00`,        icon: Gift,        color: "text-[#3E863E]",   bg: "bg-[#f0f7f0]" },
    { label: "Day Streak",       value: `${streak} day`,         icon: Zap,         color: "text-violet-500",  bg: "bg-violet-50"  },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(({ label, value, icon: Icon, color, bg }) => (
        <div
          key={label}
          className="bg-white rounded-2xl border border-[#D0E8D0] card-soft p-4 flex flex-col items-center gap-1.5 text-center"
        >
          <div className={`p-2 rounded-xl ${bg}`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <p
            className="text-base font-bold"
            style={{ fontFamily: "var(--font-mono)", color: "#1a2332" }}
          >
            {value}
          </p>
          <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ArcadePage() {
  const [points, setPoints]     = useState(0);
  const [redeemed, setRedeemed] = useState(false);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved     = loadPoints();
    const lastDate  = localStorage.getItem(LS_KEY_DATE) ?? "";
    setPoints(saved);
    setAlreadyPlayed(lastDate === todayStr());
  }, []);

  const handlePointsEarned = useCallback((earned: number) => {
    setPoints((prev) => {
      const next = prev + earned;
      savePoints(next);
      return next;
    });
    localStorage.setItem(LS_KEY_DATE, todayStr());
  }, []);

  const handleRedeem = useCallback(() => {
    setRedeemed(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <AppHeader />
      <MobileBottomDock />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pb-24 md:pb-10 pt-8 space-y-6">
        {/* Page header */}
        <section className="text-center py-2">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <div className="w-10 h-10 gradient-brand rounded-2xl flex items-center justify-center shadow-md">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-jakarta)", color: "#1a2332" }}
          >
            Financial Literacy{" "}
            <span style={{ color: "#3E863E" }}>Arcade</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-sm mx-auto">
            Answer daily quiz questions to earn points and unlock real investment rewards
            sponsored by Fidelity.
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Badge className="bg-[#f0f7f0] text-[#2d6a2d] border-[#A8D4A8] border text-[10px] font-semibold">
              100 pts per correct answer
            </Badge>
            <Badge className="bg-amber-50 text-amber-700 border-amber-200 border text-[10px] font-semibold">
              500 pts = $1 reward
            </Badge>
          </div>
        </section>

        {/* Stats strip */}
        <StatsStrip points={points} />

        {/* Clicker game promo */}
        <Link href="/arcade/clicker">
          <div className="group bg-white rounded-2xl border border-[#D0E8D0] card-soft p-5 flex items-center gap-4 hover:border-[#A8D4A8] hover:card-glow transition-all duration-200 cursor-pointer">
            <div className="w-12 h-12 gradient-brand rounded-2xl flex items-center justify-center shadow-md shrink-0">
              <CircleDollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground" style={{ fontFamily: "var(--font-jakarta)" }}>
                💰 Financial Freedom Clicker
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                Build your net worth to $100K by buying assets &amp; earning passive income.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#3E863E] group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>
        </Link>

        {/* Quiz */}
        <QuizCard onPointsEarned={handlePointsEarned} alreadyPlayed={alreadyPlayed} />

        {/* Rewards tracker */}
        <PointsTracker points={points} onRedeem={handleRedeem} redeemed={redeemed} />

        {/* Fine print */}
        <p className="text-center text-[11px] text-muted-foreground leading-relaxed pb-2">
          <RefreshCw className="w-3 h-3 inline mr-1 opacity-50" />
          New quiz every day. Investment rewards are for demo purposes only and are not real
          financial transactions. For hackathon demonstration only.
        </p>
      </main>
    </div>
  );
}
