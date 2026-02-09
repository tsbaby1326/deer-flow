"use client";

import type { ImgHTMLAttributes } from "react";
import type { ReactNode } from "react";
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
  type UseParsedCitationsResult,
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
  img?: (props: ImgHTMLAttributes<HTMLImageElement> & { threadId?: string; maxWidth?: string }) => ReactNode;
  /** When true, only show loading indicator or null (e.g. write_file step). */
  loadingOnly?: boolean;
  /** When set, use instead of default MessageResponse (e.g. artifact preview). */
  renderBody?: (parsed: UseParsedCitationsResult) => ReactNode;
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
  loadingOnly = false,
  renderBody,
}: SafeCitationContentProps) {
  const parsed = useParsedCitations(content);
  const { citations, cleanContent, citationMap } = parsed;
  const showLoading = shouldShowCitationLoading(content, cleanContent, isLoading);
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

  if (showLoading) {
    return (
      <CitationsLoadingIndicator
        citations={citations}
        className={cn("my-2", className)}
      />
    );
  }
  if (loadingOnly) return null;
  if (renderBody) return renderBody(parsed);
  if (!cleanContent) return null;

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
