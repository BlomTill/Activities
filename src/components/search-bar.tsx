"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchBar({ className, placeholder }: { className?: string; placeholder?: string }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/activities?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || "Search activities, cities, categories..."}
          className="h-12 pl-10 pr-24 text-base text-gray-900 rounded-full border-gray-200 bg-white shadow-sm"
        />
        <Button
          type="submit"
          className="absolute right-1.5 h-9 rounded-full bg-red-600 px-5 text-sm hover:bg-red-700"
        >
          Search
        </Button>
      </div>
    </form>
  );
}
