import * as SwitchPrimitive from "@radix-ui/react-switch";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Switch({
  className,
  ...props
}: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full bg-elevated shadow-[var(--shadow-border)] transition-[background-color] duration-[var(--motion-quick)] ease-[var(--ease-out)] data-[state=checked]:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block size-5 translate-x-0.5 rounded-full bg-fg transition-transform duration-[var(--motion-fast)] ease-[var(--ease-out)] data-[state=checked]:translate-x-[18px] data-[state=checked]:bg-accent-fg" />
    </SwitchPrimitive.Root>
  );
}
