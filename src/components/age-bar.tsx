"use client";

import { useState } from "react";
import { Minus, Plus, Users, ChevronDown, ChevronUp } from "lucide-react";
import { useAgeGroup } from "@/context/age-group-context";
import { useGroup, GroupConfig } from "@/context/group-context";
import { AGE_GROUPS } from "@/lib/constants";
import { cn } from "@/lib/utils";

function CounterButton({ label, count, onDecrement, onIncrement }: {
  label: string;
  count: number;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 w-16">{label}</span>
      <button
        onClick={onDecrement}
        disabled={count <= 0}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="w-6 text-center text-sm font-semibold">{count}</span>
      <button
        onClick={onIncrement}
        disabled={count >= 10}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}

export function AgeBar() {
  const { ageGroup, setAgeGroup } = useAgeGroup();
  const { group, updateCount, totalPeople } = useGroup();
  const [groupOpen, setGroupOpen] = useState(false);

  return (
    <div className="sticky top-16 z-40 border-b bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        {/* Age Group Pills */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:inline">Pricing for:</span>
          <div className="flex items-center gap-1 rounded-lg border bg-gray-50 p-0.5">
            {AGE_GROUPS.map((g) => (
              <button
                key={g.value}
                onClick={() => setAgeGroup(g.value)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-all",
                  ageGroup === g.value
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
                title={g.description}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Group Selector Toggle */}
        <button
          onClick={() => setGroupOpen(!groupOpen)}
          className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <Users className="h-4 w-4 text-red-600" />
          <span>{totalPeople} {totalPeople === 1 ? "person" : "people"}</span>
          {groupOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {/* Group Configurator Dropdown */}
      {groupOpen && (
        <div className="border-t bg-white px-4 py-3">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-2">
            <CounterButton
              label="Adults"
              count={group.adults}
              onDecrement={() => updateCount("adults", -1)}
              onIncrement={() => updateCount("adults", 1)}
            />
            <CounterButton
              label="Children"
              count={group.children}
              onDecrement={() => updateCount("children", -1)}
              onIncrement={() => updateCount("children", 1)}
            />
            <CounterButton
              label="Seniors"
              count={group.seniors}
              onDecrement={() => updateCount("seniors", -1)}
              onIncrement={() => updateCount("seniors", 1)}
            />
            <CounterButton
              label="Students"
              count={group.students}
              onDecrement={() => updateCount("students", -1)}
              onIncrement={() => updateCount("students", 1)}
            />
            <div className="ml-auto flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5">
              <span className="text-xs text-gray-500">Group total:</span>
              <span className="text-sm font-bold text-red-600">{totalPeople} people</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
