"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  GraduationCap,
  TrendingUp,
  Minus,
  AlertCircle,
} from "lucide-react";
import type { CollegeProfile } from "@/types";

interface CollegeProfileFormProps {
  profile: CollegeProfile;
  onChange: (profile: CollegeProfile) => void;
}

interface FieldConfig {
  key: keyof CollegeProfile;
  label: string;
  placeholder: string;
  hint?: string;
}

const ASSET_FIELDS: FieldConfig[] = [
  { key: "monthlyIncome", label: "Monthly Income", placeholder: "0", hint: "Part-time job, work-study" },
  { key: "financialAid", label: "Annual Grants / Scholarships", placeholder: "0", hint: "Aid that doesn't need repayment" },
  { key: "otherCash", label: "Other Cash & Savings", placeholder: "0", hint: "Venmo, Zelle, physical cash" },
];

const EXPENSE_FIELDS: FieldConfig[] = [
  { key: "monthlyRent", label: "Monthly Housing / Rent", placeholder: "0" },
  { key: "monthlyTuition", label: "Monthly Tuition Cost", placeholder: "0" },
];

const LIABILITY_FIELDS: FieldConfig[] = [
  { key: "studentLoanBalance", label: "Student Loan Balance", placeholder: "0", hint: "Total outstanding principal" },
  { key: "creditCardDebt", label: "Credit Card Debt", placeholder: "0", hint: "Balance you carry month-to-month" },
];

function FieldRow({
  config,
  value,
  onChange,
}: {
  config: FieldConfig;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label htmlFor={config.key} className="text-xs font-medium text-foreground">
          {config.label}
        </Label>
        {config.hint && (
          <span className="text-[10px] text-muted-foreground">{config.hint}</span>
        )}
      </div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
        <Input
          id={config.key}
          type="number"
          min="0"
          step="1"
          className="pl-7"
          placeholder={config.placeholder}
          value={value === 0 ? "" : value}
          onChange={(e) => {
            const parsed = parseFloat(e.target.value);
            onChange(isNaN(parsed) ? 0 : parsed);
          }}
        />
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  color,
}: {
  icon: React.ElementType;
  title: string;
  color: string;
}) {
  return (
    <div className={`flex items-center gap-2 text-sm font-semibold ${color}`}>
      <Icon className="w-4 h-4" />
      {title}
    </div>
  );
}

export function CollegeProfileForm({ profile, onChange }: CollegeProfileFormProps) {
  const set = (key: keyof CollegeProfile) => (v: number) =>
    onChange({ ...profile, [key]: v });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-violet-500" />
          <CardTitle className="text-base font-semibold">My Financial Profile</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Fill in what applies to you — this powers your live Net Worth calculation.
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Assets */}
        <div className="space-y-3">
          <SectionHeader icon={TrendingUp} title="Income & Assets" color="text-emerald-600 dark:text-emerald-400" />
          {ASSET_FIELDS.map((f) => (
            <FieldRow key={f.key} config={f} value={profile[f.key]} onChange={set(f.key)} />
          ))}
        </div>

        <Separator />

        {/* Expenses — context only */}
        <div className="space-y-3">
          <SectionHeader icon={Minus} title="Monthly Expenses (context)" color="text-amber-600 dark:text-amber-400" />
          <p className="text-[10px] text-muted-foreground">
            These don&apos;t affect your net worth, but help you understand your cash flow.
          </p>
          {EXPENSE_FIELDS.map((f) => (
            <FieldRow key={f.key} config={f} value={profile[f.key]} onChange={set(f.key)} />
          ))}
        </div>

        <Separator />

        {/* Liabilities */}
        <div className="space-y-3">
          <SectionHeader icon={AlertCircle} title="Liabilities / Debt" color="text-rose-600 dark:text-rose-400" />
          {LIABILITY_FIELDS.map((f) => (
            <FieldRow key={f.key} config={f} value={profile[f.key]} onChange={set(f.key)} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
