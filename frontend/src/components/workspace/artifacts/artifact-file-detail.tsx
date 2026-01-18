import {
  CopyIcon,
  DownloadIcon,
  SquareArrowOutUpRightIcon,
  XIcon,
} from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

import {
  Artifact,
  ArtifactAction,
  ArtifactActions,
  ArtifactContent,
  ArtifactHeader,
  ArtifactTitle,
} from "@/components/ai-elements/artifact";
import { Select, SelectItem } from "@/components/ui/select";
import {
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useArtifactContent } from "@/core/artifacts/hooks";
import { urlOfArtifact } from "@/core/artifacts/utils";
import { checkCodeFile, getFileName } from "@/core/utils/files";
import { cn } from "@/lib/utils";

import { useArtifacts } from "./context";
import { FileViewer } from "./file-viewer";

export function ArtifactFileDetail({
  className,
  filepath: filepathFromProps,
  threadId,
}: {
  className?: string;
  filepath: string;
  threadId: string;
}) {
  const { artifacts, setOpen, select } = useArtifacts();
  const isWriteFile = useMemo(() => {
    return filepathFromProps.startsWith("write-file:");
  }, [filepathFromProps]);
  const filepath = useMemo(() => {
    if (isWriteFile) {
      const url = new URL(filepathFromProps);
      return url.pathname;
    }
    return filepathFromProps;
  }, [filepathFromProps, isWriteFile]);
  const { isCodeFile } = useMemo(() => {
    if (isWriteFile) {
      let language = checkCodeFile(filepath).language;
      language ??= "markdown";
      return { isCodeFile: true, language };
    }
    return checkCodeFile(filepath);
  }, [filepath, isWriteFile]);
  const { content } = useArtifactContent({
    threadId,
    filepath: filepathFromProps,
    enabled: isCodeFile && !isWriteFile,
  });
  return (
    <Artifact className={cn("rounded-none", className)}>
      <ArtifactHeader className="px-2">
        <div>
          <ArtifactTitle>
            {isWriteFile ? (
              <div className="px-2">{getFileName(filepath)}</div>
            ) : (
              <Select value={filepath} onValueChange={select}>
                <SelectTrigger className="border-none bg-transparent! shadow-none select-none focus:outline-0 active:outline-0">
                  <SelectValue placeholder="Select a file" />
                </SelectTrigger>
                <SelectContent className="select-none">
                  <SelectGroup>
                    {(artifacts ?? []).map((filepath) => (
                      <SelectItem key={filepath} value={filepath}>
                        {getFileName(filepath)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </ArtifactTitle>
        </div>
        <div className="flex items-center gap-2">
          <ArtifactActions>
            {!isWriteFile && (
              <a href={urlOfArtifact({ filepath, threadId })} target="_blank">
                <ArtifactAction
                  icon={SquareArrowOutUpRightIcon}
                  label="Open in new window"
                  tooltip="Open in new window"
                />
              </a>
            )}
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
            {!isWriteFile && (
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
            )}
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
          filepath={filepathFromProps}
        />
      </ArtifactContent>
    </Artifact>
  );
}
