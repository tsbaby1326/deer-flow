import { FileIcon } from "lucide-react";

export function ArtifactFileDetail({ filepath }: { filepath: string }) {
  return (
    <div className="flex size-full items-center justify-center">
      <div className="flex items-center gap-2">
        <div>
          <FileIcon />
        </div>
        <div>{filepath}</div>
      </div>
    </div>
  );
}
