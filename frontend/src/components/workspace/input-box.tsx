import type { ChatStatus } from "ai";
import {
  BoxIcon,
  CheckIcon,
  LightbulbIcon,
  LightbulbOffIcon,
} from "lucide-react";
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

const AVAILABLE_MODELS = [
  { name: "deepseek-v3.2", displayName: "DeepSeek v3.2", provider: "deepseek" },
  {
    name: "doubao-seed-1.8",
    displayName: "Doubao Seed 1.8",
    provider: "doubao",
  },
];

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
  showWelcome?: boolean;
  onContextChange?: (context: Omit<AgentThreadContext, "thread_id">) => void;
  onSubmit?: (message: PromptInputMessage) => void;
  onStop?: () => void;
}) {
  const [modelDialogOpen, setModelDialogOpen] = useState(false);
  const selectedModel = useMemo(
    () => AVAILABLE_MODELS.find((m) => m.name === context.model_name),
    [context.model_name],
  );
  const handleModelSelect = useCallback(
    (model_name: string) => {
      onContextChange?.({
        ...context,
        model_name,
      });
      setModelDialogOpen(false);
    },
    [onContextChange, context],
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
        "bg-background/50 rounded-2xl backdrop-blur-sm transition-all duration-300 ease-out *:data-[slot='input-group']:rounded-2xl",
        "h-48 translate-y-14 overflow-hidden",
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
          placeholder="How can I assist you today?"
          autoFocus={autoFocus}
        />
      </PromptInputBody>
      <PromptInputFooter className="flex">
        <div>
          <Tooltip
            content={
              context.thinking_enabled ? (
                <div className="tex-sm flex flex-col gap-1">
                  <div>Thinking is enabled</div>
                  <div className="opacity-50">Click to disable thinking</div>
                </div>
              ) : (
                <div className="tex-sm flex flex-col gap-1">
                  <div>Thinking is disabled</div>
                  <div className="opacity-50">Click to enable thinking</div>
                </div>
              )
            }
          >
            <PromptInputButton onClick={handleThinkingToggle}>
              {context.thinking_enabled ? (
                <LightbulbIcon className="text-primary size-4" />
              ) : (
                <LightbulbOffIcon className="size-4" />
              )}
            </PromptInputButton>
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
                  {selectedModel?.displayName}
                </ModelSelectorName>
              </PromptInputButton>
            </ModelSelectorTrigger>
            <ModelSelectorContent>
              <ModelSelectorInput placeholder="Search models..." />
              <ModelSelectorList>
                {AVAILABLE_MODELS.map((m) => (
                  <ModelSelectorItem
                    key={m.name}
                    value={m.name}
                    onSelect={() => handleModelSelect(m.name)}
                  >
                    <ModelSelectorName>{m.displayName}</ModelSelectorName>
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
