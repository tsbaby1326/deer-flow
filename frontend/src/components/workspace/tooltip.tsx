"use client";

import {
  Tooltip as TooltipPrimitive,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Tooltip({
  children,
  content,
  ...props
}: {
  children: React.ReactNode;
  content?: React.ReactNode;
}) {
  return (
    <TooltipPrimitive {...props}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="shadow">{content}</TooltipContent>
    </TooltipPrimitive>
  );
}
