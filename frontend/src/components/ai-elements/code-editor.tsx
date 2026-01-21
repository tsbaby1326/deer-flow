"use client";

import CodeMirror from "@uiw/react-codemirror";
import { languages } from "@codemirror/language-data";
import { basicLightInit } from "@uiw/codemirror-theme-basic";
import { monokaiInit } from "@uiw/codemirror-theme-monokai";
import { javascript, javascriptLanguage } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { html } from "@codemirror/lang-html";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { css } from "@codemirror/lang-css";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import { useMemo } from "react";
const customDarkTheme = monokaiInit({
  settings: {
    background: "transparent",
    gutterBackground: "transparent",
    gutterForeground: "#555",
    gutterActiveForeground: "#fff",
    fontSize: "var(--text-sm)",
  },
});

const customLightTheme = basicLightInit({
  settings: {
    background: "transparent",
    fontSize: "var(--text-sm)",
  },
});

export function CodeEditor({
  className,
  placeholder,
  value,
  readonly,
  disabled,
  autoFocus,
  settings,
}: {
  className?: string;
  placeholder?: string;
  value: string;
  readonly?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  settings?: any;
}) {
  const { theme = "system", systemTheme = "light" } = useTheme();

  const currentTheme =
    theme === "system" ? systemTheme : (theme as "dark" | "light");

  const extensions = useMemo(() => {
    return [
      css(),
      html(),
      javascript({}),
      json(),
      markdown({
        base: markdownLanguage,
        codeLanguages: languages,
      }),
      python(),
    ];
  }, []);

  return (
    <div
      className={cn(
        "flex cursor-text flex-col overflow-hidden rounded-md",
        className,
      )}
    >
      <CodeMirror
        readOnly={readonly ?? disabled}
        placeholder={placeholder}
        className={cn(
          "h-full overflow-auto font-mono [&_.cm-editor]:h-full [&_.cm-focused]:outline-none!",
          "px-2 py-0! [&_.cm-line]:px-2! [&_.cm-line]:py-0!",
        )}
        theme={currentTheme === "dark" ? customDarkTheme : customLightTheme}
        extensions={extensions}
        basicSetup={{
          foldGutter: settings?.foldGutter ?? false,
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
          lineNumbers: settings?.lineNumbers ?? false,
        }}
        autoFocus={autoFocus}
        value={value}
      />
    </div>
  );
}
