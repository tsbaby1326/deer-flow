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
  const isWriteFile = useMemo(() => {
    return filepath.startsWith("write-file:");
  }, [filepath]);
  const { isCodeFile, language } = useMemo(() => {
    if (isWriteFile) {
      const url = new URL(filepath);
      const path = decodeURIComponent(url.pathname);
      return checkCodeFile(path);
    }
    return checkCodeFile(filepath);
  }, [filepath, isWriteFile]);
  if (isWriteFile || (isCodeFile && language !== "html")) {
    return (
      <CodeFileView
        language={language ?? "markdown"}
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
        className="size-full rounded-none border-none"
        language={language}
        code={code}
      />
    );
  }
}
