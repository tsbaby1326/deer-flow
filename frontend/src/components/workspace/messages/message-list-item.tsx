import type { Message } from "@langchain/langgraph-sdk";
import { ExternalLinkIcon, LinkIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { memo, useMemo } from "react";

import {
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationSource,
} from "@/components/ai-elements/inline-citation";
import {
  Message as AIElementMessage,
  MessageContent as AIElementMessageContent,
  MessageResponse as AIElementMessageResponse,
  MessageToolbar,
} from "@/components/ai-elements/message";
import { Badge } from "@/components/ui/badge";
import { HoverCardTrigger } from "@/components/ui/hover-card";
import { resolveArtifactURL } from "@/core/artifacts/utils";
import {
  type Citation,
  buildCitationMap,
  extractDomainFromUrl,
  parseCitations,
} from "@/core/citations";
import {
  extractContentFromMessage,
  extractReasoningContentFromMessage,
} from "@/core/messages/utils";
import { useRehypeSplitWordsIntoSpans } from "@/core/rehype";
import { cn } from "@/lib/utils";

import { CopyButton } from "../copy-button";

export function MessageListItem({
  className,
  message,
  isLoading,
}: {
  className?: string;
  message: Message;
  isLoading?: boolean;
}) {
  return (
    <AIElementMessage
      className={cn("group/conversation-message relative w-full", className)}
      from={message.type === "human" ? "user" : "assistant"}
    >
      <MessageContent
        className={message.type === "human" ? "w-fit" : "w-full"}
        message={message}
        isLoading={isLoading}
      />
      <MessageToolbar
        className={cn(
          message.type === "human" && "justify-end",
          message.type === "human" ? "-bottom-9" : "-bottom-8",
          "absolute right-0 left-0 z-20 opacity-0 transition-opacity delay-200 duration-300 group-hover/conversation-message:opacity-100",
        )}
      >
        <div className="flex gap-1">
          <CopyButton
            clipboardData={
              extractContentFromMessage(message)
                ? extractContentFromMessage(message)
                : (extractReasoningContentFromMessage(message) ?? "")
            }
          />
        </div>
      </MessageToolbar>
    </AIElementMessage>
  );
}

function MessageContent_({
  className,
  message,
  isLoading = false,
}: {
  className?: string;
  message: Message;
  isLoading?: boolean;
}) {
  const rehypePlugins = useRehypeSplitWordsIntoSpans(isLoading);

  // Extract and parse citations from message content
  const { citations, cleanContent } = useMemo(() => {
    const reasoningContent = extractReasoningContentFromMessage(message);
    const rawContent = extractContentFromMessage(message);
    if (!isLoading && reasoningContent && !rawContent) {
      return { citations: [], cleanContent: reasoningContent };
    }
    return parseCitations(rawContent ?? "");
  }, [isLoading, message]);

  // Build citation map for quick URL lookup
  const citationMap = useMemo(
    () => buildCitationMap(citations),
    [citations],
  );

  const { thread_id } = useParams<{ thread_id: string }>();

  return (
    <AIElementMessageContent className={className}>
      {/* Citations list at the top */}
      {citations.length > 0 && <CitationsList citations={citations} />}

      <AIElementMessageResponse
        rehypePlugins={rehypePlugins}
        components={{
          a: ({
            href,
            children,
          }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
            if (!href) {
              return <span>{children}</span>;
            }

            // Check if this link matches a citation
            const citation = citationMap.get(href);
            if (citation) {
              return (
                <CitationLink citation={citation} href={href}>
                  {children}
                </CitationLink>
              );
            }

            // Regular external link
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:no-underline"
              >
                {children}
              </a>
            );
          },
          img: ({ src, alt }: React.ImgHTMLAttributes<HTMLImageElement>) => {
            if (!src) return null;
            if (typeof src !== "string") {
              return (
                <img
                  className="max-w-full overflow-hidden rounded-lg"
                  src={src}
                  alt={alt}
                />
              );
            }
            let url = src;
            if (src.startsWith("/mnt/")) {
              url = resolveArtifactURL(src, thread_id);
            }
            return (
              <a href={url} target="_blank" rel="noopener noreferrer">
                <img
                  className="max-w-full overflow-hidden rounded-lg"
                  src={url}
                  alt={alt}
                />
              </a>
            );
          },
        }}
      >
        {cleanContent}
      </AIElementMessageResponse>
    </AIElementMessageContent>
  );
}

/**
 * Citations list component that displays all sources at the top
 */
function CitationsList({ citations }: { citations: Citation[] }) {
  if (citations.length === 0) return null;

  return (
    <div className="mb-4 rounded-lg border bg-muted/30 p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <LinkIcon className="size-4" />
        <span>Sources ({citations.length})</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {citations.map((citation) => (
          <CitationBadge key={citation.id} citation={citation} />
        ))}
      </div>
    </div>
  );
}

/**
 * Single citation badge in the citations list
 */
function CitationBadge({ citation }: { citation: Citation }) {
  const domain = extractDomainFromUrl(citation.url);

  return (
    <InlineCitationCard>
      <HoverCardTrigger asChild>
        <a
          href={citation.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex"
        >
          <Badge
            variant="secondary"
            className="cursor-pointer gap-1 rounded-full px-2.5 py-1 text-xs font-normal hover:bg-secondary/80"
          >
            {domain}
            <ExternalLinkIcon className="size-3" />
          </Badge>
        </a>
      </HoverCardTrigger>
      <InlineCitationCardBody>
        <div className="p-3">
          <InlineCitationSource
            title={citation.title}
            url={citation.url}
            description={citation.snippet}
          />
          <a
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary mt-2 inline-flex items-center gap-1 text-xs hover:underline"
          >
            Visit source
            <ExternalLinkIcon className="size-3" />
          </a>
        </div>
      </InlineCitationCardBody>
    </InlineCitationCard>
  );
}

/**
 * Citation link component that renders as a hover card badge
 */
function CitationLink({
  citation,
  href,
  children,
}: {
  citation: Citation;
  href: string;
  children: React.ReactNode;
}) {
  const domain = extractDomainFromUrl(href);

  return (
    <InlineCitationCard>
      <HoverCardTrigger asChild>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <Badge
            variant="secondary"
            className="mx-0.5 cursor-pointer gap-1 rounded-full px-2 py-0.5 text-xs font-normal hover:bg-secondary/80"
          >
            {children ?? domain}
            <ExternalLinkIcon className="size-3" />
          </Badge>
        </a>
      </HoverCardTrigger>
      <InlineCitationCardBody>
        <div className="p-3">
          <InlineCitationSource
            title={citation.title}
            url={href}
            description={citation.snippet}
          />
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary mt-2 inline-flex items-center gap-1 text-xs hover:underline"
          >
            Visit source
            <ExternalLinkIcon className="size-3" />
          </a>
        </div>
      </InlineCitationCardBody>
    </InlineCitationCard>
  );
}
const MessageContent = memo(MessageContent_);
