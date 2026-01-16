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
import { getFileExtension, getFileName } from "@/core/utils/files";
import { cn } from "@/lib/utils";

import { useArtifacts } from "./context";

export function ArtifactFileList({
  className,
  files,
}: {
  className?: string;
  files: string[];
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
          className="cursor-pointer"
          key={file}
          onClick={() => handleClick(file)}
        >
          <CardHeader>
            <CardTitle>{getFileName(file)}</CardTitle>
            <CardDescription>{getFileExtension(file)} file</CardDescription>
            <CardAction>
              <Button variant="ghost">
                <DownloadIcon className="size-4" />
                Download
              </Button>
            </CardAction>
          </CardHeader>
        </Card>
      ))}
    </ul>
  );
}
