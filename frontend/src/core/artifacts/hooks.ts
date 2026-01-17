import { useQuery } from "@tanstack/react-query";

import { loadArtifactContent } from "./loader";

export function useArtifactContent({
  filepath,
  threadId,
  enabled,
}: {
  filepath: string;
  threadId: string;
  enabled?: boolean;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["artifact", filepath, threadId],
    queryFn: () => loadArtifactContent({ filepath, threadId }),
    enabled,
  });
  return { content: data, isLoading, error };
}
