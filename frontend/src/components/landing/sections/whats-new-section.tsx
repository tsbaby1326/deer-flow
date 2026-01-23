"use client";

import MagicBento from "@/components/ui/magic-bento";
import { cn } from "@/lib/utils";

import { Section } from "../section";

export function WhatsNewSection({ className }: { className?: string }) {
  return (
    <Section
      className={cn("", className)}
      title="Whats New in DeerFlow 2.0"
      subtitle="DeerFlow is now evolving from a Deep Research agent into a full-stack Super Agent"
    >
      <div className="flex w-full items-center justify-center">
        <MagicBento />
      </div>
    </Section>
  );
}
