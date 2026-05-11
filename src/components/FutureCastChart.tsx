"use client";

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  TooltipProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BarChart3, TrendingUp, Zap } from "lucide-react";
import {
  projectWealth,
  CAREER_PATHS,
  INVESTMENT_STRATEGIES,
  formatCurrency,
} from "@/lib/utils";
import type { CareerPath, InvestmentStrategy } from "@/types";

interface FutureCastChartProps {
  /** Starting principal — defaults to $1,000 when no account is linked */
  netWorth: number;
  isConnected: boolean;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value as number;
  return (
    <div className="rounded-xl border border-slate-200/60 bg-white/95 dark:bg-slate-900/95 dark:border-slate-700/60 px-4 py-3 shadow-xl backdrop-blur-sm">
      <p className="text-xs font-medium text-muted-foreground mb-1">Year {label}</p>
      <p className="text-lg font-bold text-violet-600 dark:text-violet-400">
        {formatCurrency(value)}
      </p>
    </div>
  );
}

// ─── Y-Axis formatter ─────────────────────────────────────────────────────────

function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

// ─── Milestone markers ────────────────────────────────────────────────────────

const MILESTONES = [10, 20, 30, 40] as const;

// ─── Component ───────────────────────────────────────────────────────────────

export function FutureCastChart({ netWorth, isConnected }: FutureCastChartProps) {
  const principal = netWorth > 0 ? netWorth : 1_000;

  const [monthlyContribution, setMonthlyContribution] = useState(150);
  const [career, setCareer] = useState<CareerPath>("starting_out");
  const [strategy, setStrategy] = useState<InvestmentStrategy>("moderate");

  const data = useMemo(
    () => projectWealth(principal, monthlyContribution, strategy, career, 40),
    [principal, monthlyContribution, strategy, career]
  );

  const finalWealth = data[data.length - 1]?.wealth ?? 0;
  const at10 = data[10]?.wealth ?? 0;
  const at20 = data[20]?.wealth ?? 0;
  const multiplier = principal > 0 ? (finalWealth / principal).toFixed(1) : "∞";

  const strategyColor =
    strategy === "aggressive"
      ? { from: "#7c3aed", to: "#6366f1" }
      : strategy === "moderate"
      ? { from: "#6366f1", to: "#0ea5e9" }
      : { from: "#0ea5e9", to: "#06b6d4" };

  return (
    <section id="future-cast" className="space-y-6">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Future-Cast Engine</h2>
            <p className="text-sm text-muted-foreground">
              {isConnected
                ? `Based on your live balance of ${formatCurrency(principal)}`
                : `Using $1,000 default — link your accounts to use your real balance`}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="hidden sm:inline-flex text-indigo-600 border-indigo-300 bg-indigo-50 dark:bg-indigo-950/30 dark:border-indigo-700 dark:text-indigo-400"
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          40-year projection
        </Badge>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* ── Controls strip ─────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 bg-muted/30 border-b">
            {/* Monthly contribution slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Monthly Contribution
                </Label>
                <span className="text-sm font-bold text-foreground tabular-nums">
                  {formatCurrency(monthlyContribution)}
                </span>
              </div>
              <Slider
                min={0}
                max={2000}
                step={25}
                value={[monthlyContribution]}
                onValueChange={([v]) => setMonthlyContribution(v)}
                aria-label="Monthly contribution"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>$0</span>
                <span>$2,000</span>
              </div>
            </div>

            {/* Career path */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Career Path
              </Label>
              <Select value={career} onValueChange={(v) => setCareer(v as CareerPath)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CAREER_PATHS) as CareerPath[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {CAREER_PATHS[key].label}
                      {CAREER_PATHS[key].bonusPerMonth > 0 && (
                        <span className="ml-2 text-xs text-emerald-600 font-medium">
                          +{formatCurrency(CAREER_PATHS[key].bonusPerMonth)}/mo after yr {CAREER_PATHS[key].bonusStartYear}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {CAREER_PATHS[career].bonusPerMonth > 0 && (
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Salary boost unlocks at year {CAREER_PATHS[career].bonusStartYear}
                </p>
              )}
            </div>

            {/* Investment strategy */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Investment Strategy
              </Label>
              <Select value={strategy} onValueChange={(v) => setStrategy(v as InvestmentStrategy)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(INVESTMENT_STRATEGIES) as InvestmentStrategy[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {INVESTMENT_STRATEGIES[key].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                {(INVESTMENT_STRATEGIES[strategy].annualRate * 100).toFixed(0)}% avg annual return
              </p>
            </div>
          </div>

          {/* ── Stat cards ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x border-b">
            {[
              { label: "10-Year Value", value: at10, highlight: false },
              { label: "20-Year Value", value: at20, highlight: false },
              { label: "40-Year Value", value: finalWealth, highlight: true },
              { label: "Growth Multiplier", value: null, multiplier, highlight: true },
            ].map(({ label, value, multiplier: m, highlight }) => (
              <div key={label} className={`px-4 py-4 ${highlight ? "bg-violet-50/60 dark:bg-violet-950/20" : ""}`}>
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
                {value !== null ? (
                  <p className={`text-lg font-bold tabular-nums mt-0.5 ${highlight ? "text-violet-600 dark:text-violet-400" : "text-foreground"}`}>
                    {formatCurrency(value)}
                  </p>
                ) : (
                  <p className="text-lg font-bold tabular-nums mt-0.5 text-violet-600 dark:text-violet-400">
                    {m}×
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* ── Chart ──────────────────────────────────────────────────── */}
          <div className="p-4 sm:p-6">
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={strategyColor.from} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={strategyColor.to} stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-border"
                  vertical={false}
                />

                <XAxis
                  dataKey="year"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "currentColor", className: "text-muted-foreground" }}
                  tickFormatter={(v) => `Yr ${v}`}
                  ticks={[0, 10, 20, 30, 40]}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "currentColor", className: "text-muted-foreground" }}
                  tickFormatter={formatYAxis}
                  width={62}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: strategyColor.from, strokeWidth: 1.5, strokeDasharray: "4 2" }}
                />

                {/* Milestone reference lines */}
                {MILESTONES.map((yr) => (
                  <ReferenceLine
                    key={yr}
                    x={yr}
                    stroke={strategyColor.from}
                    strokeOpacity={0.25}
                    strokeDasharray="4 4"
                  />
                ))}

                <Area
                  type="monotone"
                  dataKey="wealth"
                  stroke={strategyColor.from}
                  strokeWidth={2.5}
                  fill="url(#wealthGradient)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: strategyColor.from,
                    stroke: "white",
                    strokeWidth: 2,
                  }}
                  animationDuration={600}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <Separator />

          {/* ── Footer insight ─────────────────────────────────────────── */}
          <div className="px-6 py-4 bg-muted/20">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">How this works:</span> Starting from{" "}
              <span className="text-violet-600 dark:text-violet-400 font-semibold">
                {formatCurrency(principal)}
              </span>
              , contributing{" "}
              <span className="font-semibold text-foreground">
                {formatCurrency(monthlyContribution)}/mo
              </span>{" "}
              at a{" "}
              <span className="font-semibold text-foreground">
                {(INVESTMENT_STRATEGIES[strategy].annualRate * 100).toFixed(0)}% avg annual return
              </span>
              {CAREER_PATHS[career].bonusPerMonth > 0 && (
                <>
                  , with a{" "}
                  <span className="font-semibold text-emerald-600">
                    {formatCurrency(CAREER_PATHS[career].bonusPerMonth)}/mo raise
                  </span>{" "}
                  after year {CAREER_PATHS[career].bonusStartYear} ({CAREER_PATHS[career].label})
                </>
              )}
              . Compounded monthly.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
