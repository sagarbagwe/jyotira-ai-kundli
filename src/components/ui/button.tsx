import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function buttonStyles({
  variant = "primary",
  size = "md",
}: {
  variant?: Variant;
  size?: Size;
} = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-[10px] font-semibold transition duration-200 disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25",
    {
      "bg-primary text-white shadow-[0_1px_2px_rgba(35,28,89,.18)] hover:bg-primary-strong":
        variant === "primary",
      "border border-line bg-surface text-foreground hover:bg-soft":
        variant === "secondary",
      "text-muted hover:bg-soft hover:text-foreground": variant === "ghost",
      "bg-danger text-white hover:brightness-95": variant === "danger",
      "h-9 px-3 text-sm": size === "sm",
      "h-11 px-4 text-sm": size === "md",
      "h-12 px-5 text-base": size === "lg",
      "size-11 p-0": size === "icon",
    },
  );
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonStyles({ variant, size }), className)}
      {...props}
    />
  );
}