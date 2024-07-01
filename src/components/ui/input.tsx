"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ReactElement } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactElement;
  iconPosition?: "left" | "right";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, iconPosition, ...props }, ref) => {
    return (
      <div className={cn("relative flex items-center rounded-md", className)}>
        {icon && iconPosition === "left" && (
          <span className="absolute inset-y-0 left-3 flex cursor-pointer items-center">
            {icon}
          </span>
        )}
        {icon && iconPosition === "right" && (
          <span className="absolute inset-y-0 right-3 flex cursor-pointer items-center">
            {icon}
          </span>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          )}
          ref={ref}
          style={{ paddingLeft: iconPosition === "left" ? "2rem" : "" }} // Adjust padding based on icon size
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
