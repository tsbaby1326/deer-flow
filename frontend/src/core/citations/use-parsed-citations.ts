"use client";

import { useMemo } from "react";

import { parseCitations } from "./utils";
import type { Citation } from "./utils";

export interface UseParsedCitationsResult {
  citations: Citation[];
  cleanContent: string;
  citationMap: Map<string, Citation>;
}

/**
 * Parse content for citations and build citation map. Memoized by content.
 */
export function useParsedCitations(content: string): UseParsedCitationsResult {
  return useMemo(() => {
    const parsed = parseCitations(content ?? "");
    const citationMap = new Map<string, Citation>();
    for (const c of parsed.citations) citationMap.set(c.url, c);
    return {
      citations: parsed.citations,
      cleanContent: parsed.cleanContent,
      citationMap,
    };
  }, [content]);
}
