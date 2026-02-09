"use client";

import type { ImgHTMLAttributes } from "react";
import { useMemo } from "react";

import {
  CitationsLoadingIndicator,
  createCitationMarkdownComponents,
} from "@/components/ai-elements/inline-citation";
import {
  MessageResponse,
  type MessageResponseProps,
} from "@/components/ai-elements/message";
import {
  shouldShowCitationLoading,
  useParsedCitations,
} from "@/core/citations";
import { streamdownPlugins } from "@/core/streamdown";
import { cn } from "@/lib/utils";

export type SafeCitationContentProps = {
  content: string;
  isLoading: boolean;
  rehypePlugins: MessageResponseProps["rehypePlugins"];
  className?: string;
  remarkPlugins?: MessageResponseProps["remarkPlugins"];
  isHuman?: boolean;
  img?: (props: ImgHTMLAttributes<HTMLImageElement> & { threadId?: string; maxWidth?: string }) => React.ReactNode;
};

/** Single place for citation-aware body: shows loading until citations complete (no half-finished refs), else body. */
export function SafeCitationContent({
  content,
  isLoading,
  rehypePlugins,
  className,
  remarkPlugins = streamdownPlugins.remarkPlugins,
  isHuman = false,
  img,
}: SafeCitationContentProps) {
  const { citations, cleanContent, citationMap } = useParsedCitations(content);
  const showLoading = shouldShowCitationLoading(content, cleanContent, isLoading);

  if (showLoading) {
    return (
      <CitationsLoadingIndicator
        citations={citations}
        className={cn("my-2", className)}
      />
    );
  }
  if (!cleanContent) return null;

  const components = useMemo(
    () =>
      createCitationMarkdownComponents({
        citationMap,
        isHuman,
        isLoadingCitations: false,
        img,
      }),
    [citationMap, isHuman, img],
  );
  return (
    <MessageResponse
      className={className}
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
      components={components}
    >
      {cleanContent}
    </MessageResponse>
  );
}
