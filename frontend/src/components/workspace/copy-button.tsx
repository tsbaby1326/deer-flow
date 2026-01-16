import { CheckIcon, CopyIcon } from "lucide-react";
import { useCallback, useState, type ComponentProps } from "react";

import { Button } from "@/components/ui/button";

import { Tooltip } from "./tooltip";

export function CopyButton({
  clipboardData,
  ...props
}: ComponentProps<typeof Button> & {
  clipboardData: string;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(clipboardData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [clipboardData]);
  return (
    <Tooltip content="Copy to clipboard">
      <Button
        size="icon-sm"
        type="button"
        variant="ghost"
        onClick={handleCopy}
        {...props}
      >
        {copied ? (
          <CheckIcon className="text-green-500" size={12} />
        ) : (
          <CopyIcon size={12} />
        )}
      </Button>
    </Tooltip>
  );
}
