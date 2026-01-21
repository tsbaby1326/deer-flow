import { ChevronUpIcon } from "lucide-react";

import type { Todo } from "@/core/todos";
import { cn } from "@/lib/utils";

import {
  QueueItem,
  QueueItemContent,
  QueueItemIndicator,
  QueueList,
} from "../ai-elements/queue";

export function TodoList({
  className,
  todos,
  collapsed = false,
  onToggle,
}: {
  className?: string;
  todos: Todo[];
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex h-fit w-full flex-col overflow-hidden rounded-t-xl border bg-white backdrop-blur-sm",
        className,
      )}
    >
      <header
        className="bg-accent flex min-h-8 shrink-0 cursor-pointer items-center justify-between px-4 text-sm"
        onClick={() => {
          onToggle?.();
        }}
      >
        <div className="text-muted-foreground">To-dos</div>
        <div>
          <ChevronUpIcon
            className={cn(
              "text-muted-foreground size-4 transition-transform duration-300 ease-out",
              collapsed ? "" : "rotate-180",
            )}
          />
        </div>
      </header>
      <main
        className={cn(
          "bg-accent flex grow px-2 transition-all duration-300 ease-out",
          collapsed ? "h-0" : "h-28",
        )}
      >
        <QueueList className="bg-background mt-0 w-full rounded-t-xl">
          {todos.map((todo, i) => (
            <QueueItem key={i + (todo.content ?? "")}>
              <div className="flex items-center gap-2">
                <QueueItemIndicator completed={todo.status === "completed"} />
                <QueueItemContent completed={todo.status === "completed"}>
                  {todo.content}
                </QueueItemContent>
              </div>
            </QueueItem>
          ))}
        </QueueList>
      </main>
    </div>
  );
}
