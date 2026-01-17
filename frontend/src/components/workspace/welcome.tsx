import { cn } from "@/lib/utils";

export function Welcome({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col items-center justify-center gap-2 px-8 py-4 text-center",
        className,
      )}
    >
      <div className="text-2xl font-bold">👋 Hello, again!</div>
      <div className="text-muted-foreground text-sm">
        <p>
          Welcome to 🦌 DeerFlow, an open source super agent. With built-in and
          custom
        </p>
        <p>
          skills, DeerFlow helps you search on the web, analyze data, and
          generate
        </p>{" "}
        <p>artifacts like slides, web pages and do almost anything.</p>
      </div>
    </div>
  );
}
