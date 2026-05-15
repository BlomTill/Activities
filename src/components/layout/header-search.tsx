"use client";

import { useState, useRef, useEffect, useMemo, useDeferredValue } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import mvpSearchIndex from "../../../.content/generated/mvp-search-index.json";

interface IndexEntry {
  slug: string;
  name: string;
  destination: string | null;
}

const INDEX = mvpSearchIndex as IndexEntry[];
const MAX_RESULTS = 8;

/**
 * Header search — fuzzy-ish substring match on MVP activity NAME only
 * (per MVP_LAUNCH_PLAN.md §2 Day 4 step 5). Top 8 in a dropdown; Enter
 * goes to the full /activities?q= results. Phase 2 swaps this for
 * MeiliSearch. Reads a tiny build-time index, not the full catalogue.
 */
export function HeaderSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const deferredQ = useDeferredValue(q);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const term = deferredQ.trim().toLowerCase();
    if (term.length < 2) return [];
    return INDEX.filter((e) => e.name.toLowerCase().includes(term)).slice(0, MAX_RESULTS);
  }, [deferredQ]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => setActive(0), [deferredQ]);

  function submit(term: string) {
    const t = term.trim();
    if (!t) return;
    setOpen(false);
    router.push(`/activities?q=${encodeURIComponent(t)}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) {
      if (e.key === "Enter") submit(q);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = results[active];
      if (hit) {
        setOpen(false);
        router.push(`/activities/${hit.slug}`);
      } else {
        submit(q);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapRef} className="wander-header-search" style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 12px",
          background: "var(--card, #fff)",
          border: "1px solid var(--line, #e5e1d8)",
          borderRadius: 999,
          minWidth: 180,
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search activities…"
          aria-label="Search activities"
          style={{
            border: 0,
            outline: 0,
            background: "transparent",
            font: "inherit",
            fontSize: 14,
            color: "var(--ink, #1c1a17)",
            width: "100%",
            minWidth: 0,
          }}
        />
      </div>

      {open && results.length > 0 && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            minWidth: 280,
            background: "var(--card, #fff)",
            border: "1px solid var(--line, #e5e1d8)",
            borderRadius: 14,
            boxShadow: "var(--shadow-2, 0 12px 32px rgba(0,0,0,.14))",
            padding: 6,
            zIndex: 60,
          }}
        >
          {results.map((r, i) => (
            <Link
              key={r.slug}
              href={`/activities/${r.slug}`}
              role="option"
              aria-selected={i === active}
              onClick={() => setOpen(false)}
              onMouseEnter={() => setActive(i)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 9,
                textDecoration: "none",
                color: "var(--ink, #1c1a17)",
                background: i === active ? "var(--bg-2, #f4f1ea)" : "transparent",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 500 }}>{r.name}</span>
              {r.destination && (
                <span style={{ fontSize: 12, color: "var(--ink-mute, #8a8275)" }}>{r.destination}</span>
              )}
            </Link>
          ))}
          <button
            onClick={() => submit(q)}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "8px 10px",
              marginTop: 2,
              border: 0,
              borderTop: "1px solid var(--line, #e5e1d8)",
              background: "transparent",
              font: "inherit",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--accent, #c4622d)",
              cursor: "pointer",
            }}
          >
            See all results for “{q.trim()}” →
          </button>
        </div>
      )}
    </div>
  );
}
