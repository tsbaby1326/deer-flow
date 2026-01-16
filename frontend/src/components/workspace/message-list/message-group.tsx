import type { Message } from "@langchain/langgraph-sdk";
import {
  BookOpenTextIcon,
  FolderOpenIcon,
  GlobeIcon,
  LightbulbIcon,
  ListTreeIcon,
  NotebookPenIcon,
  SearchIcon,
  SquareTerminalIcon,
  WrenchIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";
import { MessageResponse } from "@/components/ai-elements/message";
import {
  extractReasoningContentFromMessage,
  findToolCallResult,
} from "@/core/messages/utils";
import { useRehypeSplitWordsIntoSpans } from "@/core/rehype";
import { extractTitleFromMarkdown } from "@/core/utils/markdown";
import { cn } from "@/lib/utils";

import { FlipDisplay } from "../flip-display";

export function MessageGroup({
  className,
  messages,
  isLoading = false,
}: {
  className?: string;
  messages: Message[];
  isLoading?: boolean;
}) {
  const steps = useMemo(() => convertToSteps(messages), [messages]);
  const rehypePlugins = useRehypeSplitWordsIntoSpans(isLoading);
  const [open, setOpen] = useState(false);
  const lastStep = steps[steps.length - 1];
  const { label, icon } = describeStep(lastStep);
  return (
    <ChainOfThought
      className={cn("w-full rounded-lg border px-3 py-2", className)}
      defaultOpen={false}
      open={open}
      onOpenChange={setOpen}
    >
      <ChainOfThoughtHeader
        className="min-h-6"
        icon={
          open && steps.length > 1 ? <ListTreeIcon className="size-4" /> : icon
        }
      >
        <div className="flex w-full items-center justify-between">
          <div>
            <div>
              {open && steps.length > 1 ? (
                <div>{steps.length} steps</div>
              ) : (
                <FlipDisplay uniqueKey={`step-${steps.length}`}>
                  <MessageResponse rehypePlugins={rehypePlugins}>
                    {label}
                  </MessageResponse>
                </FlipDisplay>
              )}
            </div>
          </div>
          <div>
            {!open && steps.length > 1 && (
              <div>
                {steps.length - 1 > 1
                  ? `${steps.length - 1} more steps`
                  : `${steps.length - 1} more step`}
              </div>
            )}
          </div>
        </div>
      </ChainOfThoughtHeader>
      <ChainOfThoughtContent className="pb-2">
        {steps.map((step) =>
          step.type === "reasoning" ? (
            <ChainOfThoughtStep
              key={step.id}
              label={
                <MessageResponse rehypePlugins={rehypePlugins}>
                  {step.reasoning ?? ""}
                </MessageResponse>
              }
            />
          ) : (
            <ToolCall key={step.id} {...step} />
          ),
        )}
      </ChainOfThoughtContent>
    </ChainOfThought>
  );
}

function ToolCall({
  id,
  name,
  args,
  result,
}: {
  id?: string;
  name: string;
  args: Record<string, unknown>;
  result?: string | Record<string, unknown>;
}) {
  if (name === "web_search") {
    let label: React.ReactNode = "Search for related information";
    if (typeof args.query === "string") {
      label = (
        <div>
          Search on the web for{" "}
          <span className="font-bold">&quot;{args.query}&quot;</span>
        </div>
      );
    }
    return (
      <ChainOfThoughtStep key={id} label={label} icon={SearchIcon}>
        {Array.isArray(result) && (
          <ChainOfThoughtSearchResults>
            {result.map((item) => (
              <ChainOfThoughtSearchResult key={item.url}>
                <a href={item.url} target="_blank" rel="noreferrer">
                  {item.title}
                </a>
              </ChainOfThoughtSearchResult>
            ))}
          </ChainOfThoughtSearchResults>
        )}
      </ChainOfThoughtStep>
    );
  } else if (name === "web_fetch") {
    const url = (args as { url: string })?.url;
    let title = url;
    if (typeof result === "string") {
      const potentialTitle = extractTitleFromMarkdown(result);
      if (potentialTitle && potentialTitle.toLowerCase() !== "untitled") {
        title = potentialTitle;
      }
    }
    return (
      <ChainOfThoughtStep key={id} label="View web page" icon={GlobeIcon}>
        <ChainOfThoughtSearchResult>
          {url && (
            <a href={url} target="_blank" rel="noreferrer">
              {title}
            </a>
          )}
        </ChainOfThoughtSearchResult>
      </ChainOfThoughtStep>
    );
  } else if (name === "ls") {
    let description: string | undefined = (args as { description: string })
      ?.description;
    if (!description) {
      description = "List folder";
    }
    const path: string | undefined = (args as { path: string })?.path;
    return (
      <ChainOfThoughtStep key={id} label={description} icon={FolderOpenIcon}>
        {path && (
          <ChainOfThoughtSearchResult>{path}</ChainOfThoughtSearchResult>
        )}
      </ChainOfThoughtStep>
    );
  } else if (name === "read_file") {
    let description: string | undefined = (args as { description: string })
      ?.description;
    if (!description) {
      description = "Read file";
    }
    const path: string | undefined = (args as { path: string })?.path;
    return (
      <ChainOfThoughtStep key={id} label={description} icon={BookOpenTextIcon}>
        {path && (
          <ChainOfThoughtSearchResult>{path}</ChainOfThoughtSearchResult>
        )}
      </ChainOfThoughtStep>
    );
  } else if (name === "write_file" || name === "str_replace") {
    let description: string | undefined = (args as { description: string })
      ?.description;
    if (!description) {
      description = "Write file";
    }
    const path: string | undefined = (args as { path: string })?.path;
    return (
      <ChainOfThoughtStep key={id} label={description} icon={NotebookPenIcon}>
        {path && (
          <ChainOfThoughtSearchResult>{path}</ChainOfThoughtSearchResult>
        )}
      </ChainOfThoughtStep>
    );
  } else if (name === "bash") {
    const description: string | undefined = (args as { description: string })
      ?.description;
    if (!description) {
      return "Execute command";
    }
    const command: string | undefined = (args as { command: string })?.command;
    return (
      <ChainOfThoughtStep
        key={id}
        label={description}
        icon={SquareTerminalIcon}
      >
        {command && (
          <ChainOfThoughtSearchResult>{command}</ChainOfThoughtSearchResult>
        )}
      </ChainOfThoughtStep>
    );
  } else {
    const description: string | undefined = (args as { description: string })
      ?.description;
    return (
      <ChainOfThoughtStep
        key={id}
        label={
          description ?? (
            <div>
              Use &quot;<span className="font-bold">{name}</span>&quot; tool
            </div>
          )
        }
        icon={WrenchIcon}
      ></ChainOfThoughtStep>
    );
  }
}

interface GenericCoTStep<T extends string = string> {
  id?: string;
  type: T;
}

interface CoTReasoningStep extends GenericCoTStep<"reasoning"> {
  reasoning: string | null;
}

interface CoTToolCallStep extends GenericCoTStep<"toolCall"> {
  name: string;
  args: Record<string, unknown>;
  result?: string;
}

type CoTStep = CoTReasoningStep | CoTToolCallStep;

function convertToSteps(messages: Message[]): CoTStep[] {
  const steps: CoTStep[] = [];
  for (const message of messages) {
    if (message.type === "ai") {
      const reasoning = extractReasoningContentFromMessage(message);
      if (reasoning) {
        const step: CoTReasoningStep = {
          id: message.id,
          type: "reasoning",
          reasoning: extractReasoningContentFromMessage(message),
        };
        steps.push(step);
      }
      for (const tool_call of message.tool_calls ?? []) {
        const step: CoTToolCallStep = {
          id: tool_call.id,
          type: "toolCall",
          name: tool_call.name,
          args: tool_call.args,
        };
        const toolCallId = tool_call.id;
        if (toolCallId) {
          const toolCallResult = findToolCallResult(toolCallId, messages);
          if (toolCallResult) {
            try {
              const json = JSON.parse(toolCallResult);
              step.result = json;
            } catch {
              step.result = toolCallResult;
            }
          }
        }
        steps.push(step);
      }
    }
  }
  return steps;
}

function describeStep(step: CoTStep | undefined): {
  label: string;
  icon: React.ReactElement;
} {
  if (!step) {
    return { label: "Thinking", icon: <LightbulbIcon className="size-4" /> };
  }
  if (step.type === "reasoning") {
    return { label: "Thinking", icon: <LightbulbIcon className="size-4" /> };
  } else {
    let label: string;
    let icon: React.ReactElement = <WrenchIcon className="size-4" />;
    if (step.name === "web_search") {
      label = `Search &quot;${(step.args as { query: string }).query}&quot; on web`;
      icon = <SearchIcon className="size-4" />;
    } else if (step.name === "web_fetch") {
      label = "View web page";
      icon = <GlobeIcon className="size-4" />;
    } else if (step.name === "ls") {
      label = "List folder";
      icon = <FolderOpenIcon className="size-4" />;
    } else if (step.name === "read_file") {
      label = "Read file";
      icon = <BookOpenTextIcon className="size-4" />;
    } else if (step.name === "write_file" || step.name === "str_replace") {
      label = "Write file";
      icon = <NotebookPenIcon className="size-4" />;
    } else if (step.name === "bash") {
      label = "Execute command";
      icon = <SquareTerminalIcon className="size-4" />;
    } else {
      label = `Call tool "${step.name}"`;
      icon = <WrenchIcon className="size-4" />;
    }
    if (typeof step.args.description === "string") {
      label = step.args.description;
    }
    return { label, icon };
  }
}
