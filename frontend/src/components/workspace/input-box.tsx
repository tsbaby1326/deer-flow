"use client";

import type { ChatStatus } from "ai";
import { CheckIcon, LightbulbIcon, LightbulbOffIcon } from "lucide-react";
import { useCallback, useMemo, useState, type ComponentProps } from "react";

import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { useI18n } from "@/core/i18n/hooks";
import { useModels } from "@/core/models/hooks";
import type { AgentThreadContext } from "@/core/threads";
import { cn } from "@/lib/utils";

import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "../ai-elements/model-selector";

import { Tooltip } from "./tooltip";

export function InputBox({
  className,
  autoFocus,
  status = "ready",
  context,
  onContextChange,
  onSubmit,
  onStop,
  ...props
}: Omit<ComponentProps<typeof PromptInput>, "onSubmit"> & {
  assistantId?: string | null;
  status?: ChatStatus;
  context: Omit<AgentThreadContext, "thread_id">;
  onContextChange?: (context: Omit<AgentThreadContext, "thread_id">) => void;
  onSubmit?: (message: PromptInputMessage) => void;
  onStop?: () => void;
}) {
  const { t } = useI18n();
  const [modelDialogOpen, setModelDialogOpen] = useState(false);
  const { models } = useModels();
  const selectedModel = useMemo(
    () => models.find((m) => m.name === context.model_name),
    [context.model_name, models],
  );
  const handleModelSelect = useCallback(
    (model_name: string) => {
      const supports_thinking = selectedModel?.supports_thinking ?? false;
      onContextChange?.({
        ...context,
        model_name,
        thinking_enabled: supports_thinking && context.thinking_enabled,
      });
      setModelDialogOpen(false);
    },
    [selectedModel?.supports_thinking, onContextChange, context],
  );
  const handleThinkingToggle = useCallback(() => {
    onContextChange?.({
      ...context,
      thinking_enabled: !context.thinking_enabled,
    });
  }, [onContextChange, context]);
  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      if (status === "streaming") {
        onStop?.();
        return;
      }
      if (!message.text) {
        return;
      }
      onSubmit?.(message);
    },
    [onSubmit, onStop, status],
  );
  return (
    <PromptInput
      className={cn(
        "bg-background/85 rounded-2xl backdrop-blur-sm transition-all duration-300 ease-out *:data-[slot='input-group']:rounded-2xl",
        "-translate-y-4 overflow-hidden",
        className,
      )}
      globalDrop
      multiple
      onSubmit={handleSubmit}
      {...props}
    >
      <PromptInputBody>
        <PromptInputTextarea
          className={cn("size-full")}
          placeholder={t.inputBox.placeholder}
          autoFocus={autoFocus}
        />
      </PromptInputBody>
      <PromptInputFooter className="flex">
        <div>
          <Tooltip
            content={
              context.thinking_enabled ? (
                <div className="tex-sm flex flex-col gap-1">
                  <div>{t.inputBox.thinkingEnabled}</div>
                  <div className="opacity-50">
                    {t.inputBox.clickToDisableThinking}
                  </div>
                </div>
              ) : (
                <div className="tex-sm flex flex-col gap-1">
                  <div>{t.inputBox.thinkingDisabled}</div>
                  <div className="opacity-50">
                    {t.inputBox.clickToEnableThinking}
                  </div>
                </div>
              )
            }
          >
            {selectedModel?.supports_thinking && (
              <PromptInputButton onClick={handleThinkingToggle}>
                <>
                  {context.thinking_enabled ? (
                    <LightbulbIcon className="text-primary size-4" />
                  ) : (
                    <LightbulbOffIcon className="size-4" />
                  )}
                  <span
                    className={cn(
                      "text-xs font-normal",
                      context.thinking_enabled
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    Thinking
                  </span>
                </>
              </PromptInputButton>
            )}
          </Tooltip>
        </div>
        <div className="flex items-center gap-2">
          <ModelSelector
            open={modelDialogOpen}
            onOpenChange={setModelDialogOpen}
          >
            <ModelSelectorTrigger asChild>
              <PromptInputButton>
                <ModelSelectorName className="text-xs font-normal">
                  {selectedModel?.display_name}
                </ModelSelectorName>
              </PromptInputButton>
            </ModelSelectorTrigger>
            <ModelSelectorContent>
              <ModelSelectorInput placeholder={t.inputBox.searchModels} />
              <ModelSelectorList>
                {models.map((m) => (
                  <ModelSelectorItem
                    key={m.name}
                    value={m.name}
                    onSelect={() => handleModelSelect(m.name)}
                  >
                    <ModelSelectorName>{m.display_name}</ModelSelectorName>
                    {m.name === context.model_name ? (
                      <CheckIcon className="ml-auto size-4" />
                    ) : (
                      <div className="ml-auto size-4" />
                    )}
                  </ModelSelectorItem>
                ))}
              </ModelSelectorList>
            </ModelSelectorContent>
          </ModelSelector>
          <PromptInputSubmit
            className="rounded-full"
            variant="outline"
            status={status}
          />
        </div>
      </PromptInputFooter>
    </PromptInput>
  );
}
