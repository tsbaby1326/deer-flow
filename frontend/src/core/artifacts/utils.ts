export function urlOfArtifact({
  filepath,
  threadId,
  download = false,
}: {
  filepath: string;
  threadId: string;
  download?: boolean;
}) {
  return `http://localhost:8000/api/threads/${threadId}/artifacts${filepath}${download ? "?download=true" : ""}`;
}
