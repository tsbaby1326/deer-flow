"use client";

import { PromptInputProvider } from "@/components/ai-elements/prompt-input";
import { ArtifactsProvider } from "@/components/workspace/artifacts";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ArtifactsProvider>
      <PromptInputProvider>{children}</PromptInputProvider>
    </ArtifactsProvider>
  );
}
