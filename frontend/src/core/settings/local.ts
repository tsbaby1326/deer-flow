import type { AgentThreadContext } from "../threads";

export const DEFAULT_LOCAL_SETTINGS: LocalSettings = {
  context: {
    model_name: "deepseek-v3.2",
    thinking_enabled: true,
  },
};

const LOCAL_SETTINGS_KEY = "deerflow.local-settings";

export interface LocalSettings {
  context: Omit<AgentThreadContext, "thread_id">;
}

export function getLocalSettings(): LocalSettings {
  if (typeof window === "undefined") {
    return DEFAULT_LOCAL_SETTINGS;
  }
  const json = localStorage.getItem(LOCAL_SETTINGS_KEY);
  try {
    if (json) {
      return JSON.parse(json);
    }
  } catch {}
  return DEFAULT_LOCAL_SETTINGS;
}

export function saveLocalSettings(settings: LocalSettings) {
  localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
}

export function updateContextOfLocalSettings(
  context: LocalSettings["context"],
) {
  const settings = getLocalSettings();
  saveLocalSettings({
    ...settings,
    context: {
      ...settings.context,
      ...context,
    },
  });
}
