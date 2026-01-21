"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useMemo } from "react";

import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { ArtifactsProvider } from "@/components/workspace/artifacts";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isNewThread = useMemo(() => {
    return pathname === "/workspace/chats/new";
  }, [pathname]);
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  return (
    <ArtifactsProvider>
      {isNewThread && (
        <>
          <FlickeringGrid
            className="absolute inset-0 z-0 translate-y-[2vh] mask-center mask-no-repeat"
            squareSize={4}
            gridGap={4}
            color={
              currentTheme === "dark" ? "#60A5FA" : "oklch(0 0.0098 87.47)"
            }
            maxOpacity={currentTheme === "dark" ? 0.04 : 0.03}
            flickerChance={0.1}
          />
          <FlickeringGrid
            className="absolute inset-0 z-0 translate-y-[2vh] mask-[url(/images/deer.svg)] mask-size-[100vw] mask-center mask-no-repeat md:mask-size-[72vh]"
            squareSize={4}
            gridGap={4}
            color={
              currentTheme === "dark" ? "#60A5FA" : "oklch(0 0.0098 87.47)"
            }
            maxOpacity={currentTheme === "dark" ? 0.15 : 0.11}
            flickerChance={0.12}
          />
        </>
      )}
      {children}
    </ArtifactsProvider>
  );
}
