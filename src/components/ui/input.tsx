import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-sm bg-elevated px-3 text-sm text-fg shadow-[var(--shadow-border)] outline-none transition-[box-shadow] duration-[var(--motion-quick)] placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-accent/60",
        className,
      )}
      {...props}
    />
  );
}
