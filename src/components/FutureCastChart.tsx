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
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Zap, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import {
  projectWealth,
  CAREER_PATHS,
  INVESTMENT_STRATEGIES,
  formatCurrency,
} from "@/lib/utils";
import type { CareerPath, InvestmentStrategy } from "@/types";

interface FutureCastChartProps {
  netWorth: number;
  isConnected: boolean;
  /** Compact mode: single-column controls, shorter chart, used in right panel */
  compact?: boolean;
  /** Override the default starting monthly contribution (default: 150) */
  initialMonthlyContribution?: number;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value as number;
  return (
    <div className="rounded-xl border border-[#D0E8D0] bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm">
      <p className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wide">
        Year {label}
      </p>
      <p className="text-currency text-base font-bold text-[#2d6a2d]">
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

const MILESTONES = [10, 20, 30, 40] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function FutureCastChart({
  netWorth,
  isConnected,
  compact = false,
  initialMonthlyContribution = 150,
}: FutureCastChartProps) {
  const principal = netWorth > 0 ? netWorth : 1_000;

  const [monthlyContribution, setMonthlyContribution] = useState(initialMonthlyContribution);
  const [career, setCareer] = useState<CareerPath>("starting_out");
  const [strategy, setStrategy] = useState<InvestmentStrategy>("moderate");
  const [expanded, setExpanded] = useState(false);

  const data = useMemo(
    () => projectWealth(principal, monthlyContribution, strategy, career, 40),
    [principal, monthlyContribution, strategy, career]
  );

  const finalWealth = data[data.length - 1]?.wealth ?? 0;
  const at10 = data[10]?.wealth ?? 0;
  const at20 = data[20]?.wealth ?? 0;
  const at30 = data[30]?.wealth ?? 0;
  const multiplier = principal > 0 ? (finalWealth / principal).toFixed(1) : "∞";

  const chartHeight = compact ? 200 : 300;

  return (
    <section
      id="future-cast"
      className={`rounded-2xl overflow-hidden border border-[#D0E8D0] card-soft bg-white ${compact ? "" : "mt-0"}`}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#f0f7f0] to-[#e8f5e8] px-5 pt-5 pb-4 border-b border-[#D0E8D0]">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/80 shadow-sm">
              <TrendingUp className="w-4 h-4 text-[#3E863E]" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-sm">Future-Cast Engine</h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {isConnected
                  ? `Live balance · ${formatCurrency(principal)}`
                  : "Using $1K default"}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="shrink-0 text-[#2d6a2d] border-[#A8D4A8] bg-[#f0f7f0] text-[10px] font-semibold"
          >
            40-yr
          </Badge>
        </div>

        {/* ── Milestone breakdown ─────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: "10 Yrs", value: at10 },
            { label: "20 Yrs", value: at20 },
            { label: "30 Yrs", value: at30 },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-white/80 px-2.5 py-2 text-center">
              <p className="text-[9px] uppercase tracking-wide text-muted-foreground font-semibold">
                {label}
              </p>
              <p className="text-currency text-xs font-bold text-[#2d6a2d] mt-0.5 tabular-nums">
                {formatCurrency(value)}
              </p>
            </div>
          ))}
        </div>

        {/* 40-year total + multiplier */}
        <div className="mt-3 flex items-center justify-between rounded-xl bg-white/90 border border-[#A8D4A8] px-3.5 py-2.5">
          <div>
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground font-semibold">
              40-Year Value
            </p>
            <p className="text-currency text-lg font-bold text-[#2d6a2d] tabular-nums leading-tight">
              {formatCurrency(finalWealth)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground font-semibold">
              Multiplier
            </p>
            <p className="text-currency text-lg font-bold gradient-brand-text tabular-nums leading-tight">
              {multiplier}×
            </p>
          </div>
        </div>
      </div>

      {/* ── Expand toggle ────────────────────────────────────────────────── */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-center gap-2 py-3 px-5 text-xs font-semibold text-[#2d6a2d] hover:bg-[#f0f7f0] transition-colors border-b border-[#D0E8D0]"
      >
        <Sparkles className="w-3.5 h-3.5" />
        {expanded ? "Hide details" : "Slide to see the future"}
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {/* ── Expandable section ───────────────────────────────────────────── */}
      {expanded && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          {/* Controls */}
          <div
            className={`grid gap-5 p-5 bg-[#f5faf5] border-b border-[#D0E8D0] ${
              compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3"
            }`}
          >
            {/* Monthly contribution slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Monthly Contribution
                </Label>
                <span className="text-currency text-xs font-bold text-[#2d6a2d] tabular-nums">
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
              <div className="flex justify-between text-[9px] text-muted-foreground">
                <span>$0</span>
                <span>$2,000</span>
              </div>
            </div>

            {/* Career path */}
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Career Path
              </Label>
              <Select value={career} onValueChange={(v) => setCareer(v as CareerPath)}>
                <SelectTrigger className="border-[#A8D4A8] focus:ring-[#3E863E] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CAREER_PATHS) as CareerPath[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {CAREER_PATHS[key].label}
                      {CAREER_PATHS[key].bonusPerMonth > 0 && (
                        <span className="ml-2 text-xs text-emerald-600 font-medium">
                          +{formatCurrency(CAREER_PATHS[key].bonusPerMonth)}/mo
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {CAREER_PATHS[career].bonusPerMonth > 0 && (
                <p className="text-[10px] text-emerald-600 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Boost unlocks yr {CAREER_PATHS[career].bonusStartYear}
                </p>
              )}
            </div>

            {/* Investment strategy */}
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Investment Strategy
              </Label>
              <Select value={strategy} onValueChange={(v) => setStrategy(v as InvestmentStrategy)}>
                <SelectTrigger className="border-[#A8D4A8] focus:ring-[#3E863E] text-xs">
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

          {/* Chart */}
          <div className="p-4">
            <ResponsiveContainer width="100%" height={chartHeight}>
              <AreaChart data={data} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="fcGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#3E863E" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#4C994C" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E0F0E0"
                  vertical={false}
                />

                <XAxis
                  dataKey="year"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "#a0a0b0" }}
                  tickFormatter={(v) => `Yr ${v}`}
                  ticks={[0, 10, 20, 30, 40]}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "#a0a0b0" }}
                  tickFormatter={formatYAxis}
                  width={compact ? 52 : 62}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "#3E863E", strokeWidth: 1.5, strokeDasharray: "4 2" }}
                />

                {MILESTONES.map((yr) => (
                  <ReferenceLine
                    key={yr}
                    x={yr}
                    stroke="#A8D4A8"
                    strokeOpacity={0.5}
                    strokeDasharray="4 4"
                  />
                ))}

                <Area
                  type="monotone"
                  dataKey="wealth"
                  stroke="#3E863E"
                  strokeWidth={2.5}
                  fill="url(#fcGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#3E863E", stroke: "white", strokeWidth: 2 }}
                  animationDuration={600}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <Separator className="bg-[#E0F0E0]" />

          {/* Footer insight */}
          <div className="px-5 py-3.5 bg-[#f5faf5]">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">How this works: </span>
              Starting from{" "}
              <span className="text-currency font-semibold text-[#2d6a2d]">
                {formatCurrency(principal)}
              </span>
              , contributing{" "}
              <span className="text-currency font-semibold text-foreground">
                {formatCurrency(monthlyContribution)}/mo
              </span>{" "}
              at{" "}
              <span className="font-semibold text-foreground">
                {(INVESTMENT_STRATEGIES[strategy].annualRate * 100).toFixed(0)}% avg annual return
              </span>
              {CAREER_PATHS[career].bonusPerMonth > 0 && (
                <>
                  , with a{" "}
                  <span className="text-currency font-semibold text-emerald-600">
                    {formatCurrency(CAREER_PATHS[career].bonusPerMonth)}/mo raise
                  </span>{" "}
                  after yr {CAREER_PATHS[career].bonusStartYear}
                </>
              )}
              . Compounded monthly.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
