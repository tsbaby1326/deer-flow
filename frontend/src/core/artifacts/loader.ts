import { urlOfArtifact } from "./utils";

export async function loadArtifactContent({
  filepath,
  threadId,
}: {
  filepath: string;
  threadId: string;
}) {
  const url = urlOfArtifact({ filepath, threadId });
  const response = await fetch(url);
  const text = await response.text();
  return text;
}
