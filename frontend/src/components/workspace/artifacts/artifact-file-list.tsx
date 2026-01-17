import { DownloadIcon } from "lucide-react";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { urlOfArtifact } from "@/core/artifacts/utils";
import { getFileExtensionDisplayName, getFileName } from "@/core/utils/files";
import { cn } from "@/lib/utils";

import { useArtifacts } from "./context";

export function ArtifactFileList({
  className,
  files,
  threadId,
}: {
  className?: string;
  files: string[];
  threadId: string;
}) {
  const { openArtifact } = useArtifacts();
  const handleClick = useCallback(
    (filepath: string) => {
      openArtifact(filepath);
    },
    [openArtifact],
  );
  return (
    <ul className={cn("flex w-full flex-col gap-4", className)}>
      {files.map((file) => (
        <Card
          key={file}
          className="cursor-pointer p-3"
          onClick={() => handleClick(file)}
        >
          <CardHeader className="pr-2 pl-1">
            <CardTitle>{getFileName(file)}</CardTitle>
            <CardDescription className="text-xs">
              {getFileExtensionDisplayName(file)} file
            </CardDescription>
            <CardAction>
              <a
                href={urlOfArtifact({
                  filepath: file,
                  threadId: threadId,
                  download: true,
                })}
                target="_blank"
                onClick={(e) => e.stopPropagation()}
              >
                <Button variant="ghost">
                  <DownloadIcon className="size-4" />
                  Download
                </Button>
              </a>
            </CardAction>
          </CardHeader>
        </Card>
      ))}
    </ul>
  );
}
