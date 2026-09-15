"use client";

import {
  BarChart3,
  ChevronRight,
  Gauge,
  HeartHandshake,
  Menu,
  Plus,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Brand } from "./brand";
import { ThemeToggle } from "./theme-toggle";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: Gauge },
  { label: "New Kundli", href: "/new-kundli", icon: Plus },
  { label: "Charts", href: "/charts", icon: BarChart3 },
  { label: "Predictions", href: "/predictions", icon: Sparkles },
  { label: "Compatibility", href: "/compatibility", icon: HeartHandshake },
];

function NavItems({ close }: { close?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary navigation" className="space-y-1">
      {navigation.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={close}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-[9px] px-3 text-[14px] font-semibold transition",
              active
                ? "bg-primary-soft text-primary-strong"
                : "text-muted hover:bg-soft hover:text-foreground",
            )}
          >
            <item.icon className="size-[18px]" strokeWidth={1.8} />
            {item.label}
            {active && <ChevronRight className="ml-auto size-4" />}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  children,
  title,
  description,
  actions,
}: {
  children: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="app-background min-h-screen">
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-[248px] border-r border-line bg-surface px-4 py-5 lg:flex lg:flex-col">
        <Brand className="px-2" />
        <div className="mt-7">
          <NavItems />
        </div>
        <div className="mt-auto rounded-[10px] border border-line bg-soft p-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-positive" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Private session</p>
              <p className="text-xs text-muted">No account · nothing stored</p>
            </div>
          </div>
        </div>
      </aside>

      {open && (
        <div className="no-print fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/42"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[290px] max-w-[86vw] border-r border-line bg-surface p-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <Brand />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" />
              </Button>
            </div>
            <div className="mt-7">
              <NavItems close={() => setOpen(false)} />
            </div>
            <div className="mt-7 rounded-[10px] border border-line bg-soft p-3 text-xs leading-5 text-muted">
              Reports remain only in this browser tab. Download or print before closing it.
            </div>
          </aside>
        </div>
      )}

      <div className="lg:pl-[248px]">
        <header className="no-print sticky top-0 z-20 border-b border-line bg-background/88 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open navigation"
              onClick={() => setOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
            <div className="lg:hidden">
              <Brand compact />
            </div>
            <Badge tone="primary" className="hidden sm:inline-flex">
              <span className="size-1.5 rounded-full bg-positive" />
              Gemini + calculation engine online
            </Badge>
            <div className="ml-auto flex items-center gap-1">
              <ThemeToggle />
              <Link
                href="/new-kundli"
                className={cn(
                  buttonStyles({ size: "sm" }),
                  "hidden sm:inline-flex",
                )}
              >
                <Plus className="size-4" />
                New Kundli
              </Link>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-64px)] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-[1320px]">
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="font-display text-3xl font-semibold sm:text-[34px]">
                  {title}
                </h1>
                {description && (
                  <p className="mt-2 max-w-2xl text-[15px] text-muted">
                    {description}
                  </p>
                )}
              </div>
              {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
