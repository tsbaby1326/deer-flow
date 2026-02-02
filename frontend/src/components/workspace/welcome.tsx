"use client";

import { useSearchParams } from "next/navigation";

import { useI18n } from "@/core/i18n/hooks";
import { cn } from "@/lib/utils";

export function Welcome({ className }: { className?: string }) {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col items-center justify-center gap-2 px-8 py-4 text-center",
        className,
      )}
    >
      <div className="text-2xl font-bold">
        {searchParams.get("mode") === "skill"
          ? `🚀 ${t.settings.skills.createSkill}`
          : t.welcome.greeting}
      </div>
      <div className="text-muted-foreground text-sm">
        {t.welcome.description.includes("\n") ? (
          <pre className="whitespace-pre">{t.welcome.description}</pre>
        ) : (
          <p>{t.welcome.description}</p>
        )}
      </div>
    </div>
  );
}
