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
  filepath,
  threadId,
}: {
  className?: string;
  filepath: string;
  threadId: string;
}) {
  const { artifacts, setOpen, select } = useArtifacts();
  const { isCodeFile } = useMemo(() => checkCodeFile(filepath), [filepath]);
  const { content } = useArtifactContent({
    threadId,
    filepath,
    enabled: isCodeFile,
  });
  return (
    <Artifact className={cn("rounded-none", className)}>
      <ArtifactHeader className="px-2">
        <div>
          <ArtifactTitle>
            <Select value={filepath} onValueChange={select}>
              <SelectTrigger className="border-none bg-transparent! select-none focus:outline-0 active:outline-0">
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
          </ArtifactTitle>
        </div>
        <div className="flex items-center gap-2">
          <ArtifactActions>
            <a href={urlOfArtifact({ filepath, threadId })} target="_blank">
              <ArtifactAction
                icon={SquareArrowOutUpRightIcon}
                label="Open in new window"
                tooltip="Open in new window"
              />
            </a>
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
