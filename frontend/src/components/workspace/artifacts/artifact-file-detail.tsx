import { FileIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function ArtifactFileDetail({
  className,
  filepath,
}: {
  className?: string;
  filepath: string;
}) {
  return (
    <div
      className={cn(
        "relative flex size-full items-center justify-center",
        className,
      )}
    >
      <div className="flex size-fit items-center gap-2">
        <div>
          <FileIcon />
        </div>
        <div>{filepath}</div>
      </div>
    </div>
  );
}
