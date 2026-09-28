import * as SliderPrimitive from "@radix-ui/react-slider";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Slider({
  className,
  trackClassName,
  rangeClassName,
  ...props
}: ComponentProps<typeof SliderPrimitive.Root> & {
  trackClassName?: string;
  rangeClassName?: string;
}) {
  return (
    <SliderPrimitive.Root
      className={cn(
        "relative flex h-11 w-full touch-none items-center select-none",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn(
          "relative h-1 w-full grow overflow-hidden rounded-full bg-elevated",
          trackClassName,
        )}
      >
        <SliderPrimitive.Range
          className={cn("absolute h-full bg-accent", rangeClassName)}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="relative block size-4 rounded-full bg-fg shadow-[var(--shadow-border)] after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60" />
    </SliderPrimitive.Root>
  );
}
