import { DownloadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getFileExtension, getFileName } from "@/core/utils/files";

export function PresentFileList({ files }: { files: string[] }) {
  return (
    <ul className="w-full">
      {files.map((file) => (
        <Card key={file}>
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
