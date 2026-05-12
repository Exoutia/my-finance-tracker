import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import * as React from "react";

import { cn } from "@/lib/utils.ts";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-base border-2 border-border px-2.5 py-0.5 text-xs font-base w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-main text-main-foreground",
        neutral: "bg-secondary-background text-foreground",
        colorful: "text-main-foreground font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  tagName = "",
  asChild = false,
  ...props
}:
  & React.ComponentProps<"span">
  & VariantProps<typeof badgeVariants>
  & {
    tagName: string;
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "span";

  const colorMap: Record<number, string> = {
    1: "bg-chart-1",
    2: "bg-chart-2",
    3: "bg-chart-3",
    4: "bg-chart-4",
    5: "bg-chart-5",
  };

  const colorIndex = (tagName.length % 5) + 1;
  const colorClass = colorMap[colorIndex];
  // const color = "";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className, colorClass)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
