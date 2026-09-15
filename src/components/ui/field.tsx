import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export function FieldLabel({
  children,
  htmlFor,
  optional,
}: {
  children: ReactNode;
  htmlFor?: string;
  optional?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 flex items-center justify-between text-sm font-semibold"
    >
      <span>{children}</span>
      {optional && <span className="text-xs font-normal text-muted">Optional</span>}
    </label>
  );
}

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-[10px] border border-line bg-surface px-3.5 text-[15px] text-foreground placeholder:text-muted/70",
        "transition hover:border-muted/45 focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/12",
        "disabled:bg-soft disabled:text-muted",
        className,
      )}
      {...props}
    />
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        "h-11 w-full rounded-[10px] border border-line bg-surface px-3.5 text-[15px] text-foreground",
        "transition hover:border-muted/45 focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/12",
        className,
      )}
      {...props}
    />
  );
});

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-sm text-danger">{children}</p>;
}