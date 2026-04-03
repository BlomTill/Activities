"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Activity } from "@/lib/types";

interface ComparisonContextType {
  comparisonList: Activity[];
  addToComparison: (activity: Activity) => void;
  removeFromComparison: (id: string) => void;
  clearComparison: () => void;
  isInComparison: (id: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [comparisonList, setComparisonList] = useState<Activity[]>([]);

  const addToComparison = (activity: Activity) => {
    if (comparisonList.length < 3 && !comparisonList.find((a) => a.id === activity.id)) {
      setComparisonList((prev) => [...prev, activity]);
    }
  };

  const removeFromComparison = (id: string) => {
    setComparisonList((prev) => prev.filter((a) => a.id !== id));
  };

  const clearComparison = () => setComparisonList([]);

  const isInComparison = (id: string) => comparisonList.some((a) => a.id === id);

  return (
    <ComparisonContext.Provider
      value={{ comparisonList, addToComparison, removeFromComparison, clearComparison, isInComparison }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error("useComparison must be used within a ComparisonProvider");
  }
  return context;
}
