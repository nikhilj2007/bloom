"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Trash2, Banknote } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { ManualCashEntry } from "@/types";

interface ManualCashFormProps {
  entries: ManualCashEntry[];
  onChange: (entries: ManualCashEntry[]) => void;
}

export function ManualCashForm({ entries, onChange }: ManualCashFormProps) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");

  const handleAdd = () => {
    const parsed = parseFloat(amount.replace(/[^0-9.-]/g, ""));
    if (!label.trim() || isNaN(parsed)) return;
    onChange([
      ...entries,
      { id: crypto.randomUUID(), label: label.trim(), amount: parsed },
    ]);
    setLabel("");
    setAmount("");
  };

  const handleRemove = (id: string) => {
    onChange(entries.filter((e) => e.id !== id));
  };

  return (
    <Card className="border-dashed border-slate-300 dark:border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Banknote className="w-5 h-5 text-amber-500" />
          <CardTitle className="text-base font-semibold">Other Cash &amp; Savings</CardTitle>
          <Badge variant="secondary" className="ml-auto">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Add balances from Venmo, physical cash, or any account not connected via Plaid.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Existing entries */}
        {entries.length > 0 && (
          <ul className="space-y-2">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2 bg-muted/30"
              >
                <span className="text-sm font-medium">{entry.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                    {formatCurrency(entry.amount)}
                  </span>
                  <button
                    onClick={() => handleRemove(entry.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Remove entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Add form */}
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <Label htmlFor="cash-label" className="sr-only">Label</Label>
            <Input
              id="cash-label"
              placeholder='e.g. "Venmo Balance"'
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
          <div className="w-36 space-y-1">
            <Label htmlFor="cash-amount" className="sr-only">Amount</Label>
            <Input
              id="cash-amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="$0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
          <Button
            onClick={handleAdd}
            size="icon"
            variant="outline"
            className="shrink-0"
            aria-label="Add entry"
          >
            <PlusCircle className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
