import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "primary" | "gold" | "positive" | "attention" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] leading-none font-semibold",
        {
          "border-line bg-soft text-muted": tone === "neutral",
          "border-primary/20 bg-primary-soft text-primary-strong":
            tone === "primary",
          "border-gold/20 bg-gold-soft text-gold": tone === "gold",
          "border-positive/20 bg-positive-soft text-positive":
            tone === "positive",
          "border-attention/20 bg-attention-soft text-attention":
            tone === "attention",
          "border-danger/20 bg-danger-soft text-danger": tone === "danger",
        },
        className,
      )}
      {...props}
    />
  );
}