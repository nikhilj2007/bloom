"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useUser } from "@clerk/nextjs";
import type { CollegeProfile } from "@/types";
import { DEFAULT_COLLEGE_PROFILE } from "@/types";
import { getUserProfile, upsertUserProfile } from "@/lib/db";

const LS_KEY = "worthwise_profile_v1";

interface ProfileContextValue {
  profile: CollegeProfile;
  setProfile: (p: CollegeProfile) => void;
  isHydrated: boolean;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();
  const [profile, setProfileState] = useState<CollegeProfile>(DEFAULT_COLLEGE_PROFILE);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    const hydrate = async () => {
      try {
        // 1. Immediately hydrate from localStorage for zero-flash UX
        const stored = localStorage.getItem(LS_KEY);
        const fromLS: CollegeProfile | null = stored
          ? { ...DEFAULT_COLLEGE_PROFILE, ...JSON.parse(stored) }
          : null;
        if (fromLS) setProfileState(fromLS);

        // 2. If signed in, fetch from Supabase (source of truth) and override
        if (user) {
          const db = await getUserProfile(user.id);
          if (db) {
            const merged: CollegeProfile = {
              ...(fromLS ?? DEFAULT_COLLEGE_PROFILE),
              monthlyIncome:     db.monthly_income     ?? fromLS?.monthlyIncome     ?? 0,
              otherCash:         db.liquid_savings     ?? fromLS?.otherCash         ?? 0,
              studentLoanBalance:db.student_loan_debt  ?? fromLS?.studentLoanBalance?? 0,
              creditCardDebt:    db.credit_card_debt   ?? fromLS?.creditCardDebt    ?? 0,
              expectedCareer:   (db.expected_career as CollegeProfile["expectedCareer"]) ??
                                 fromLS?.expectedCareer ?? "starting_out",
            };
            setProfileState(merged);
            localStorage.setItem(LS_KEY, JSON.stringify(merged));
          }
        }
      } catch {
        // Silently ignore errors
      } finally {
        setIsHydrated(true);
      }
    };

    hydrate();
  }, [isLoaded, user]);

  const setProfile = useCallback(
    (p: CollegeProfile) => {
      setProfileState(p);
      // Persist to localStorage immediately
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(p));
      } catch {}
      // Fire-and-forget Supabase sync
      if (user) {
        upsertUserProfile(user.id, {
          monthly_income:    p.monthlyIncome,
          liquid_savings:    p.otherCash,
          student_loan_debt: p.studentLoanBalance,
          credit_card_debt:  p.creditCardDebt,
          expected_career:   p.expectedCareer,
        }).catch(console.error);
      }
    },
    [user]
  );

  return (
    <ProfileContext.Provider value={{ profile, setProfile, isHydrated }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside <ProfileProvider>");
  return ctx;
}
