import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[transform,background-color,color,opacity,box-shadow] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-fg hover:opacity-90",
        ghost:
          "bg-transparent text-fg hover:bg-elevated",
        outline:
          "bg-transparent text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
        subtle: "bg-elevated text-fg hover:bg-elevated/80",
        danger: "bg-danger/15 text-danger hover:bg-danger/25",
      },
      size: {
        default: "h-10 rounded-md px-3.5 text-sm",
        sm: "h-9 rounded-sm px-3 text-sm",
        lg: "h-11 rounded-md px-4 text-sm",
        icon: "size-10 rounded-md",
        "icon-sm": "size-9 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  static: isStatic,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    static?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        buttonVariants({ variant, size }),
        !isStatic && "active:not-disabled:scale-[0.96]",
        className,
      )}
      {...props}
    />
  );
}
