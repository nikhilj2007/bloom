"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Bell,
  Lock,
  Home as HomeIcon,
  BarChart2,
  TrendingUp,
  Gamepad2,
  User,
  BookOpen,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Learn", href: "/learn" },
  { label: "Budget", href: "/budget" },
  { label: "Grow", href: "/grow" },
];

const DOCK_ITEMS = [
  { icon: HomeIcon, label: "Home", href: "/" },
  { icon: BookOpen, label: "Learn", href: "/learn" },
  { icon: BarChart2, label: "Budget", href: "/budget" },
  { icon: TrendingUp, label: "Grow", href: "/grow" },
  { icon: Gamepad2, label: "Arcade", href: "/arcade" },
  { icon: User, label: "Profile", href: "/" },
];

export function AppHeader() {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();

  return (
    <header className="border-b border-[#D0E8D0] bg-white/90 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image
            src="/logo.png"
            alt="WorthWise Logo"
            width={32}
            height={32}
            className="rounded-xl shadow-md"
          />
          <span className="font-heading font-bold text-lg tracking-tight">WorthWise</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, href }) => {
            const active = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${active
                    ? "bg-[#F0F7F0] text-[#2d6a2d] font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-[#F0F7F0]"
                  }`}
              >
                {label}
              </Link>
            );
          })}
          <Link
            href="/negotiate"
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${pathname === "/negotiate"
                ? "bg-[#F0F7F0] text-[#2d6a2d] font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-[#F0F7F0]"
              }`}
          >
            <Bot className="w-3.5 h-3.5" /> AI Coach
          </Link>
          <Link
            href="/arcade"
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${pathname === "/arcade"
                ? "bg-[#F0F7F0] text-[#2d6a2d] font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-[#F0F7F0]"
              }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" /> Arcade
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2.5">
          {isSignedIn && (
            <button className="w-8 h-8 rounded-lg hover:bg-[#F0F7F0] flex items-center justify-center transition-colors relative">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full gradient-brand" />
            </button>
          )}

          {isSignedIn ? (
            <UserButton />
          ) : (
            <SignInButton mode="modal">
              <Button
                size="sm"
                className="gap-1.5 gradient-brand border-0 text-white shadow-md hover:opacity-90 transition-opacity"
              >
                <Lock className="w-3.5 h-3.5" /> Sign In
              </Button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  );
}

export function MobileBottomDock() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 px-4 pb-safe">
      <div className="mb-3 glass rounded-2xl border border-white/60 shadow-2xl shadow-[#3E863E]/10 overflow-hidden">
        <div className="flex items-center justify-around px-2 py-3">
          {DOCK_ITEMS.map(({ icon: Icon, label, href }) => {
            const active = pathname === href && href !== "/";
            return (
              <Link
                key={label}
                href={href}
                className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-[#F0F7F0] transition-colors group"
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${active ? "text-[#2d6a2d]" : "text-muted-foreground group-hover:text-[#2d6a2d]"
                    }`}
                />
                <span
                  className={`text-[9px] font-semibold uppercase tracking-wider transition-colors ${active ? "text-[#2d6a2d]" : "text-muted-foreground group-hover:text-[#2d6a2d]"
                    }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
