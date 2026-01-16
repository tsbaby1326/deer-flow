import type { ChatStatus } from "ai";
import { LightbulbIcon, LightbulbOffIcon } from "lucide-react";
import { useCallback, type ComponentProps } from "react";

import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { cn } from "@/lib/utils";

import { Tooltip } from "./tooltip";

export function InputBox({
  className,
  autoFocus,
  status = "ready",
  onSubmit,
  onStop,
  ...props
}: Omit<ComponentProps<typeof PromptInput>, "onSubmit"> & {
  assistantId?: string | null;
  status?: ChatStatus;
  onSubmit?: (message: PromptInputMessage) => void;
  onStop?: () => void;
}) {
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
        "bg-background/50 rounded-2xl drop-shadow-2xl backdrop-blur-sm transition-all duration-300 ease-out *:data-[slot='input-group']:rounded-2xl",
        "focus-within:bg-background/85 h-48 translate-y-14 overflow-hidden",
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
          <Tooltip content="">
            <PromptInputButton>
              <LightbulbOffIcon className="size-4" />
            </PromptInputButton>
          </Tooltip>
        </div>
        <div className="flex items-center gap-2">
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
