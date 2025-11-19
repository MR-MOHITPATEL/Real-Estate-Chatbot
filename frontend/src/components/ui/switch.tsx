import * as React from "react";

import { cn } from "../../lib/utils";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  label?: string;
  className?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <label className="inline-flex cursor-pointer items-center gap-3">
        {label && <span className="text-sm text-muted-foreground">{label}</span>}
        <span className="relative inline-flex h-7 w-12 items-center">
          <input type="checkbox" className="peer sr-only" ref={ref} {...props} />
          <span
            className={cn(
              "absolute inset-0 rounded-full bg-muted transition peer-checked:bg-primary/80",
              className
            )}
          />
          <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-background shadow transition peer-checked:translate-x-5" />
        </span>
      </label>
    );
  }
);
Switch.displayName = "Switch";


