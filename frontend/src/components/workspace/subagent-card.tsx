"use client";

import { CheckCircleIcon, Loader2Icon, SquareTerminalIcon, WrenchIcon, XCircleIcon } from "lucide-react";

import { MessageResponse } from "@/components/ai-elements/message";
import { useI18n } from "@/core/i18n/hooks";
import { cn } from "@/lib/utils";

import type { SubagentState } from "@/core/threads/types";

interface SubagentCardProps {
  subagentType: string;
  state?: SubagentState;
  isLoading?: boolean;
  prompt?: string;
}

export function SubagentCard({ subagentType, state, isLoading, prompt }: SubagentCardProps) {
  const { t } = useI18n();

  const getSubagentIcon = (type: string) => {
    switch (type) {
      case "bash":
        return SquareTerminalIcon;
      case "general-purpose":
        return WrenchIcon;
      default:
        return WrenchIcon;
    }
  };

  const getSubagentLabel = (type: string) => {
    switch (type) {
      case "bash":
        return t.subagents.bash;
      case "general-purpose":
        return t.subagents.generalPurpose;
      default:
        return t.subagents.unknown;
    }
  };

  const IconComponent = getSubagentIcon(subagentType);
  const label = getSubagentLabel(subagentType);

  // Determine status based on state, not isLoading
  const status = state?.status || "running";
  const isRunning = status === "running";
  const isCompleted = status === "completed";
  const isFailed = status === "failed";

  const getStatusIcon = () => {
    if (isCompleted) {
      return <CheckCircleIcon className="size-4 text-green-600" />;
    }
    if (isFailed) {
      return <XCircleIcon className="size-4 text-red-600" />;
    }
    if (isRunning) {
      return <Loader2Icon className="size-4 animate-spin text-blue-600" />;
    }
    return null;
  };

  const borderColorClass = isCompleted
    ? "border-green-200 bg-green-50/30"
    : isFailed
    ? "border-red-200 bg-red-50/30"
    : "border-blue-200 bg-blue-50/30";

  return (
    <div className={cn(
      "rounded-lg border-l-2 p-4 transition-colors space-y-3",
      borderColorClass
    )}>
      {/* Header */}
      <div className="flex items-start gap-2">
        <div className="mt-0.5 flex-shrink-0">
          <IconComponent className="size-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{label}</span>
            {getStatusIcon()}
          </div>
          {prompt && (
            <div className="mt-1 text-xs text-muted-foreground">
              {prompt}
            </div>
          )}
        </div>
      </div>

      {/* Status message for running state */}
      {isRunning && !state?.result && (
        <div className="text-sm text-muted-foreground ml-6">
          {t.subagents.running}
        </div>
      )}

      {/* Result */}
      {state?.result && (
        <div className="ml-6 text-sm">
          <MessageResponse>{state.result}</MessageResponse>
        </div>
      )}

      {/* Error */}
      {state?.status === "failed" && state.error && (
        <div className="ml-6 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          <div className="font-medium">{t.subagents.failed}</div>
          <div className="mt-1 text-xs">{state.error}</div>
        </div>
      )}
    </div>
  );
}