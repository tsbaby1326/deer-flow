import { env } from "@/env";

export function getBackendBaseURL() {
  return env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "http://localhost:8000";
}
