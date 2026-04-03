"use client";

import { useAgeGroup } from "@/context/age-group-context";
import { AGE_GROUPS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AgeGroupSelector() {
  const { ageGroup, setAgeGroup } = useAgeGroup();

  return (
    <div className="flex items-center gap-1 rounded-lg border bg-gray-50 p-1">
      {AGE_GROUPS.map((group) => (
        <button
          key={group.value}
          onClick={() => setAgeGroup(group.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
            ageGroup === group.value
              ? "bg-white text-red-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
          title={group.description}
        >
          {group.label}
        </button>
      ))}
    </div>
  );
}
