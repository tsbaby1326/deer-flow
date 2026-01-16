import type { AgentThreadContext } from "../threads";

export const DEFAULT_LOCAL_SETTINGS: LocalSettings = {
  context: {
    model_name: "deepseek-v3.2",
    thinking_enabled: true,
  },
  layout: {
    sidebar_collapsed: false,
  },
};

const LOCAL_SETTINGS_KEY = "deerflow.local-settings";

export interface LocalSettings {
  context: Omit<AgentThreadContext, "thread_id">;
  layout: {
    sidebar_collapsed: boolean;
  };
}

export function getLocalSettings(): LocalSettings {
  if (typeof window === "undefined") {
    return DEFAULT_LOCAL_SETTINGS;
  }
  const json = localStorage.getItem(LOCAL_SETTINGS_KEY);
  try {
    if (json) {
      const settings = JSON.parse(json);
      return {
        ...DEFAULT_LOCAL_SETTINGS,
        ...settings,
      };
    }
  } catch {}
  return DEFAULT_LOCAL_SETTINGS;
}

export function saveLocalSettings(settings: LocalSettings) {
  localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
}
