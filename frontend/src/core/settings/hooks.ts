import { useCallback, useState } from "react";
import { useEffect } from "react";

import type { AgentThreadContext } from "../threads";

import {
  DEFAULT_LOCAL_SETTINGS,
  getLocalSettings,
  updateContextOfLocalSettings,
} from "./local";

export function useLocalSettings() {
  const [mounted, setMounted] = useState(false);
  const [threadContextState, setThreadContextState] = useState<
    Omit<AgentThreadContext, "thread_id">
  >(DEFAULT_LOCAL_SETTINGS.context);
  useEffect(() => {
    if (!mounted) {
      setThreadContextState(getLocalSettings().context);
    }
    setMounted(true);
  }, [mounted]);
  const setThreadContext = useCallback(
    (context: Omit<AgentThreadContext, "thread_id">) => {
      setThreadContextState(context);
      updateContextOfLocalSettings(context);
    },
    [],
  );
  return {
    threadContext: threadContextState,
    setThreadContext,
  };
}
