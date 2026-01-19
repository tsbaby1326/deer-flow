import { useQuery } from "@tanstack/react-query";

import { loadModels } from "./api";

export function useModels() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["models"],
    queryFn: () => loadModels(),
  });
  return { models: data ?? [], isLoading, error };
}
