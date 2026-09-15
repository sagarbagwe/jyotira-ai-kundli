import Link from "next/link";
import { cn } from "@/lib/utils";

export function Brand({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-3", className)}
      aria-label="Jyotira home"
    >
      <span className="relative grid size-9 place-items-center rounded-full border border-gold/30 bg-gold-soft text-gold">
        <span className="absolute inset-[5px] rotate-45 rounded-[4px] border border-current/55" />
        <span className="relative size-1.5 rounded-full bg-current" />
      </span>
      {!compact && (
        <span>
          <span className="font-display block text-[22px] leading-5 font-semibold">
            Jyotira
          </span>
          <span className="mt-1 block text-[9px] font-bold tracking-[0.22em] text-muted uppercase">
            Calculated · Interpreted
          </span>
        </span>
      )}
    </Link>
  );
}