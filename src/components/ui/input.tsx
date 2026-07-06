import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Airbnb-style: hairline outline, 8px radius; on focus the border
          // thickens to 2px ink — no glow ring.
          "flex h-12 w-full rounded-lg border border-hairline bg-white px-4 py-2 text-base text-ink placeholder:text-muted focus-visible:outline-none focus-visible:border-2 focus-visible:border-ink disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-soft transition-colors",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
