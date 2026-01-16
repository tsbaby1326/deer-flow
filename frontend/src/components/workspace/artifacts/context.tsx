import { createContext, useContext, useState, type ReactNode } from "react";

export interface ArtifactsContextType {
  artifacts: string[];
  selectedArtifact: string | null;

  open: boolean;
  setOpen: (open: boolean) => void;

  addArtifacts: (artifacts: string[]) => void;
  openArtifact: (artifact: string) => void;
}

const ArtifactsContext = createContext<ArtifactsContextType | undefined>(
  undefined,
);

interface ArtifactsProviderProps {
  children: ReactNode;
}

export function ArtifactsProvider({ children }: ArtifactsProviderProps) {
  const [artifacts, setArtifacts] = useState<string[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const addArtifacts = (newArtifacts: string[]) => {
    setArtifacts((prev) => [...prev, ...newArtifacts]);
  };

  const openArtifact = (artifact: string) => {
    setSelectedArtifact(artifact);
    setOpen(true);
  };

  const value: ArtifactsContextType = {
    artifacts,
    selectedArtifact,
    open,
    setOpen,
    addArtifacts,
    openArtifact,
  };

  return (
    <ArtifactsContext.Provider value={value}>
      {children}
    </ArtifactsContext.Provider>
  );
}

export function useArtifacts() {
  const context = useContext(ArtifactsContext);
  if (context === undefined) {
    throw new Error("useArtifacts must be used within an ArtifactsProvider");
  }
  return context;
}
