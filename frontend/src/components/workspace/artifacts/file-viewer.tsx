import { useMemo } from "react";
import type { BundledLanguage } from "shiki";

import { CodeBlock } from "@/components/ai-elements/code-block";
import { useArtifactContent } from "@/core/artifacts/hooks";
import { urlOfArtifact } from "@/core/artifacts/utils";
import { checkCodeFile } from "@/core/utils/files";
import { cn } from "@/lib/utils";

export function FileViewer({
  className,
  filepath,
  threadId,
}: {
  className?: string;
  filepath: string;
  threadId: string;
}) {
  const { isCodeFile, language } = useMemo(
    () => checkCodeFile(filepath),
    [filepath],
  );
  if (isCodeFile && language !== "html") {
    return (
      <CodeFileView
        language={language}
        filepath={filepath}
        threadId={threadId}
      />
    );
  }
  return (
    <div className={cn("size-full border-none", className)}>
      <iframe
        className={cn("size-full border-none", className)}
        src={urlOfArtifact({ filepath, threadId })}
      ></iframe>
    </div>
  );
}

function CodeFileView({
  language,
  filepath,
  threadId,
}: {
  language: BundledLanguage;
  filepath: string;
  threadId: string;
}) {
  const { content: code } = useArtifactContent({
    filepath,
    threadId,
  });
  if (code) {
    return (
      <CodeBlock
        className="rounded-none border-none"
        language={language}
        code={code}
      />
    );
  }
}
