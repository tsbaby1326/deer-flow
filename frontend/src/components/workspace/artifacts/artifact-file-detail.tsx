import { CopyIcon, DownloadIcon, XIcon } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

import {
  Artifact,
  ArtifactAction,
  ArtifactActions,
  ArtifactContent,
  ArtifactDescription,
  ArtifactHeader,
  ArtifactTitle,
} from "@/components/ai-elements/artifact";
import { useArtifactContent } from "@/core/artifacts/hooks";
import { urlOfArtifact } from "@/core/artifacts/utils";
import {
  checkCodeFile,
  getFileExtensionDisplayName,
  getFileName,
} from "@/core/utils/files";
import { cn } from "@/lib/utils";

import { useArtifacts } from "./context";
import { FileViewer } from "./file-viewer";

export function ArtifactFileDetail({
  className,
  filepath,
  threadId,
}: {
  className?: string;
  filepath: string;
  threadId: string;
}) {
  const { setOpen } = useArtifacts();
  const { isCodeFile } = useMemo(() => checkCodeFile(filepath), [filepath]);
  const { content } = useArtifactContent({
    threadId,
    filepath,
    enabled: isCodeFile,
  });
  return (
    <Artifact className={cn("rounded-none", className)}>
      <ArtifactHeader>
        <div>
          <ArtifactTitle>{getFileName(filepath)}</ArtifactTitle>
          <ArtifactDescription className="mt-1 text-xs">
            {getFileExtensionDisplayName(filepath)} file
          </ArtifactDescription>
        </div>
        <div className="flex items-center gap-2">
          <ArtifactActions>
            {isCodeFile && (
              <ArtifactAction
                icon={CopyIcon}
                label="Copy"
                disabled={!content}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(content ?? "");
                    toast.success("Copied to clipboard");
                  } catch (error) {
                    toast.error("Failed to copy to clipboard");
                    console.error(error);
                  }
                }}
                tooltip="Copy content to clipboard"
              />
            )}
            <a
              href={urlOfArtifact({ filepath, threadId, download: true })}
              target="_blank"
            >
              <ArtifactAction
                icon={DownloadIcon}
                label="Download"
                onClick={() => console.log("Download")}
                tooltip="Download file"
              />
            </a>
            <ArtifactAction
              icon={XIcon}
              label="Close"
              onClick={() => setOpen(false)}
              tooltip="Close"
            />
          </ArtifactActions>
        </div>
      </ArtifactHeader>
      <ArtifactContent className="p-0">
        <FileViewer
          className="size-full"
          threadId={threadId}
          filepath={filepath}
        />
      </ArtifactContent>
    </Artifact>
  );
}
