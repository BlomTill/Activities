"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export interface GroupConfig {
  adults: number;
  children: number;
  seniors: number;
  students: number;
}

interface GroupContextType {
  group: GroupConfig;
  setGroup: (group: GroupConfig) => void;
  updateCount: (type: keyof GroupConfig, delta: number) => void;
  totalPeople: number;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: ReactNode }) {
  const [group, setGroup] = useState<GroupConfig>({
    adults: 2,
    children: 0,
    seniors: 0,
    students: 0,
  });

  const updateCount = useCallback((type: keyof GroupConfig, delta: number) => {
    setGroup((prev) => ({
      ...prev,
      [type]: Math.max(0, Math.min(10, prev[type] + delta)),
    }));
  }, []);

  const totalPeople = group.adults + group.children + group.seniors + group.students;

  return (
    <GroupContext.Provider value={{ group, setGroup, updateCount, totalPeople }}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroup() {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error("useGroup must be used within a GroupProvider");
  }
  return context;
}
