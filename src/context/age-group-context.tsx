"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { AgeGroup } from "@/lib/types";

interface AgeGroupContextType {
  ageGroup: AgeGroup;
  setAgeGroup: (group: AgeGroup) => void;
}

const AgeGroupContext = createContext<AgeGroupContextType | undefined>(undefined);

export function AgeGroupProvider({ children }: { children: ReactNode }) {
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("adult");

  return (
    <AgeGroupContext.Provider value={{ ageGroup, setAgeGroup }}>
      {children}
    </AgeGroupContext.Provider>
  );
}

export function useAgeGroup() {
  const context = useContext(AgeGroupContext);
  if (!context) {
    throw new Error("useAgeGroup must be used within an AgeGroupProvider");
  }
  return context;
}
