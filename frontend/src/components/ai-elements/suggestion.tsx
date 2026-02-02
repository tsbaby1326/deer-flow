"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Icon } from "@radix-ui/react-select";
import type { LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";

export type SuggestionsProps = ComponentProps<typeof ScrollArea>;

export const Suggestions = ({
  className,
  children,
  ...props
}: SuggestionsProps) => (
  <ScrollArea className="overflow-x-auto whitespace-nowrap" {...props}>
    <div className={cn("flex w-max flex-nowrap items-center gap-2", className)}>
      {children}
    </div>
    <ScrollBar className="hidden" orientation="horizontal" />
  </ScrollArea>
);

export type SuggestionProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  suggestion: React.ReactNode;
  icon?: LucideIcon;
  onClick?: () => void;
};

export const Suggestion = ({
  suggestion,
  onClick,
  className,
  icon: Icon,
  variant = "outline",
  size = "sm",
  children,
  ...props
}: SuggestionProps) => {
  const handleClick = () => {
    onClick?.();
  };

  return (
    <Button
      className={cn(
        "text-muted-foreground cursor-pointer rounded-full px-4 text-xs font-normal",
        className,
      )}
      onClick={handleClick}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {Icon && <Icon className="size-4" />}
      {children || suggestion}
    </Button>
  );
};
