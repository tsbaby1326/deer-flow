import { FileIcon, XIcon } from "lucide-react";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";

import { useArtifacts } from "./context";

export function ArtifactFileDetail({ filepath }: { filepath: string }) {
  const { setOpen } = useArtifacts();
  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);
  return (
    <div className="relative flex size-full items-center justify-center">
      <div className="absolute top-1 right-1">
        <Button size="icon-sm" variant="ghost" onClick={handleClose}>
          <XIcon />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <div>
          <FileIcon />
        </div>
        <div>{filepath}</div>
      </div>
    </div>
  );
}
