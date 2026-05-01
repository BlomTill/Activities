"use client";

import { Suspense, useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { activities } from "@/lib/content/selectors";
import { useAgeGroup } from "@/context/age-group-context";
import { CATEGORIES, REGIONS } from "@/lib/constants";
import { Activity, Season, getBestPrice, getAverageRating } from "@/lib/types";
import { resolveActivityImage } from "@/lib/images";

/* ──────────────────────────────────────────────────────────────
   ALPINE SUNSHINE ACTIVITIES — pill-dropdown filters,
   warm postcard cards. Scoped via .alpine-page wrapper.
─────────────────────────────────────────────────────────────── */

const SEASONS: { id: Season; label: string }[] = [
  { id: "spring", label: "Spring" },
  { id: "summer", label: "Summer" },
  { id: "autumn", label: "Autumn" },
  { id: "winter", label: "Winter" },
];

const DURATIONS = [
  { id: "<1h",   label: "Under 1 hour" },
  { id: "half",  label: "Half-day (≤ 4h)" },
  { id: "full",  label: "Full day" },
  { id: "multi", label: "Multi-day" },
];

const WEATHERS = [
  { id: "any",    label: "Any weather" },
  { id: "sun",    label: "Sunny" },
  { id: "rain",   label: "Rainy day" },
  { id: "indoor", label: "Indoor only" },
];

type WeatherId = "any" | "sun" | "rain" | "indoor";
type SortKey = "rating" | "price-asc" | "price-desc" | "name";

function durationOf(d: string): string {
  if (/min/.test(d)) return "<1h";
  const n = parseFloat(d);
  if (Number.isNaN(n)) return "full";
  if (n <= 1) return "<1h";
  if (n <= 4) return "half";
  if (n <= 12) return "full";
  return "multi";
}

function crowdOf(a: Activity): "busy" | "moderate" | "quiet" {
  const reviews = a.providers.reduce((s, p) => s + (p.rating ? 100 : 0), 0) + (a.featured ? 1500 : 600);
  if (reviews > 2000) return "busy";
  if (reviews > 800) return "moderate";
  return "quiet";
}

/* ───────── Icons ───────── */
const Search = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
const X = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>;
const Pin = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/></svg>;
const Clock = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
const Star = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.93 6.45 7.07.6-5.36 4.66 1.62 6.94L12 17.77l-6.26 3.38 1.62-6.94L2 9.55l7.07-.6L12 2.5z"/></svg>;
const Heart = ({ filled }: { filled?: boolean }) => <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-4.5-9.5-9.5C1 8 3.5 4 7.5 4 10 4 11.3 5.6 12 7c.7-1.4 2-3 4.5-3 4 0 6.5 4 5 7.5C19 16.5 12 21 12 21z"/></svg>;
const Sun = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/></svg>;
const Chevron = ({ open }: { open: boolean }) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}><path d="m6 9 6 6 6-6"/></svg>;

/* ───────── Pieces ───────── */
function CheckList({ values, options, onChange }: {
  values: string[];
  options: ({ id: string; label: string } | string)[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 280, overflowY: "auto" }}>
      {options.map((o) => {
        const id = typeof o === "object" ? o.id : o;
        const label = typeof o === "object" ? o.label : o;
        const on = values.includes(id);
        return (
          <label key={id} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 10px", borderRadius: 10, cursor: "pointer",
            background: on ? "var(--bg-2)" : "transparent",
          }}>
            <span style={{
              width: 18, height: 18, borderRadius: 6,
              border: `2px solid ${on ? "var(--accent)" : "var(--line)"}`,
              background: on ? "var(--accent)" : "transparent",
              display: "grid", placeItems: "center", transition: "all .15s",
            }}>
              {on && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
            </span>
            <span style={{ fontSize: 14, color: "var(--ink)" }}>{label}</span>
            <input type="checkbox" checked={on} onChange={() => {
              onChange(on ? values.filter((v) => v !== id) : [...values, id]);
            }} style={{ display: "none" }}/>
          </label>
        );
      })}
    </div>
  );
}

function PriceRange({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ padding: "8px 10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, fontWeight: 600 }}>
        <span>CHF 0</span>
        <span style={{ color: "var(--accent)" }}>{value === 500 ? "Any price" : `Up to CHF ${value}`}</span>
      </div>
      <input type="range" min={0} max={500} step={10} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "var(--accent)" }}/>
      <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
        {[0, 25, 50, 100, 200, 500].map((v) => (
          <button key={v} className="a-chip" data-on={value === v}
            style={{ padding: "5px 10px", fontSize: 12 }}
            onClick={() => onChange(v)}>
            {v === 0 ? "Free" : v === 500 ? "Any" : `≤ ${v}`}
          </button>
        ))}
      </div>
    </div>
  );
}

function PillDropdown({ label, count, isOpen, onToggle, children }: {
  label: string; count: number; isOpen: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  const active = count > 0;
  return (
    <div style={{ position: "relative" }}>
      <button onClick={onToggle} className="a-chip" style={{
        padding: "10px 14px", fontWeight: 600,
        background: active ? "var(--ink)" : "var(--card)",
        color: active ? "#fff" : "var(--ink)",
        borderColor: active ? "var(--ink)" : "var(--line)",
      }}>
        {label}
        {count > 0 && (
          <span style={{
            background: active ? "rgba(255,255,255,.22)" : "var(--accent)", color: "#fff",
            borderRadius: 999, padding: "1px 7px", fontSize: 11, fontWeight: 700, marginLeft: 2,
          }}>{count}</span>
        )}
        <Chevron open={isOpen} />
      </button>
      {isOpen && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0,
          minWidth: 260, background: "var(--card)",
          border: "1px solid var(--line)", borderRadius: 18,
          boxShadow: "var(--shadow-2)", padding: 10, zIndex: 50,
          animation: "a-popIn .18s cubic-bezier(.2,.7,.2,1)",
        }}>{children}</div>
      )}
    </div>
  );
}

function ActivityCardAlpine({ a, fav, onFav }: { a: Activity; fav: boolean; onFav: (id: string) => void }) {
  const { ageGroup } = useAgeGroup();
  const price = getBestPrice(a, ageGroup);
  const rating = getAverageRating(a);
  const crowd = crowdOf(a);
  const { src, alt } = resolveActivityImage(a);
  const ref = useRef<HTMLAnchorElement>(null);
  const [popping, setPopping] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - .5;
    const py = (e.clientY - r.top) / r.height - .5;
    ref.current.style.transform = `perspective(800px) rotateY(${px * 5}deg) rotateX(${-py * 5}deg) translateY(-3px)`;
  };
  const handleLeave = () => { if (ref.current) ref.current.style.transform = ""; };

  const onHeart = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    onFav(a.id);
    setPopping(true);
    setTimeout(() => setPopping(false), 350);
  };
  const onHeartDown = () => { longPressTimer.current = setTimeout(triggerEdelweiss, 600); };
  const onHeartUp = () => clearTimeout(longPressTimer.current);

  return (
    <Link ref={ref} href={`/activities/${a.slug}`} className="a-card-in"
      onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{
        background: "var(--card)", borderRadius: 22, border: "1px solid var(--line)",
        overflow: "hidden", display: "flex", flexDirection: "column",
        boxShadow: "var(--shadow-1)", cursor: "pointer", textDecoration: "none", color: "inherit",
        transition: "transform .25s, box-shadow .25s, border-color .25s",
      }}>
      <div style={{ position: "relative", aspectRatio: "16/11", overflow: "hidden", background: "var(--bg-2)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .6s ease" }}/>
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
          <span className="a-tag" style={{ background: "rgba(255,253,246,.92)", color: "var(--ink)", backdropFilter: "blur(6px)" }}>{a.category}</span>
          {price === 0 && <span className="a-tag coral">Free</span>}
        </div>
        <button onClick={onHeart}
          onMouseDown={onHeartDown} onMouseUp={onHeartUp} onMouseLeave={onHeartUp}
          onTouchStart={onHeartDown} onTouchEnd={onHeartUp}
          aria-label="Save"
          style={{
            position: "absolute", top: 10, right: 10, width: 36, height: 36,
            border: 0, borderRadius: 999, cursor: "pointer",
            background: "rgba(255,253,246,.92)",
            color: fav ? "var(--accent)" : "var(--ink-soft)",
            display: "grid", placeItems: "center",
            boxShadow: "0 4px 14px -4px rgba(0,0,0,.25)",
            transition: "transform .2s",
            transform: fav ? "scale(1.08)" : "scale(1)",
            animation: popping ? "a-heartPop .35s cubic-bezier(.2,.9,.3,1.4)" : "none",
          }}>
          <Heart filled={fav}/>
        </button>
        <div style={{
          position: "absolute", bottom: 12, right: 12,
          background: "var(--ink)", color: "#fff",
          padding: "6px 10px", borderRadius: 999,
          fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 600,
        }}>{price === 0 ? "FREE" : `CHF ${price}`}</div>
      </div>

      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <h3 className="alpine-display" style={{ fontSize: 19, lineHeight: 1.15, margin: 0 }}>{a.name}</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, color: "var(--ink-soft)", fontSize: 13, alignItems: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Pin /> {a.location.region}</span>
          <span style={{ color: "var(--ink-mute)" }}>·</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Clock /> {a.duration}</span>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: "auto" }}>
          {a.tags.slice(0, 3).map((t) => <span key={t} className="a-tag sky">{t}</span>)}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px dashed var(--line)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ink-soft)", fontWeight: 600 }}>
            <span style={{ color: "var(--accent-3)", display: "inline-flex" }}><Star/></span>
            {rating.toFixed(1)} <span style={{ color: "var(--ink-mute)", fontWeight: 400 }}>({a.providers.length}+ providers)</span>
          </span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: 11, fontWeight: 600,
            color: crowd === "busy" ? "#b53d27" : crowd === "moderate" ? "#8a5b06" : "var(--accent-2)",
            textTransform: "uppercase", letterSpacing: ".08em",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: "currentColor", boxShadow: "0 0 0 3px color-mix(in oklab, currentColor 20%, transparent)" }}/>
            {crowd === "busy" ? "Busy" : crowd === "moderate" ? "Moderate" : "Quiet"}
          </span>
        </div>
      </div>
    </Link>
  );
}

function triggerEdelweiss() {
  const palette = ["#FFFDF6", "#F4B43E", "#E8634A", "#2E6F5E"];
  for (let i = 0; i < 80; i++) {
    const e = document.createElement("div");
    e.className = "alpine-confetti";
    e.style.left = Math.random() * 100 + "vw";
    e.style.background = palette[i % palette.length];
    e.style.transform = `rotate(${Math.random() * 360}deg)`;
    e.style.animationDuration = (3 + Math.random() * 2) + "s";
    e.style.animationDelay = (Math.random() * .6) + "s";
    e.style.borderRadius = Math.random() < .3 ? "50%" : "2px";
    document.body.appendChild(e);
    setTimeout(() => e.remove(), 6000);
  }
}

/* ───────── Page ───────── */
export default function ActivitiesPage() {
  return (
    <Suspense fallback={<div className="alpine-page" style={{ padding: "60px 24px", textAlign: "center", color: "var(--ink-mute)" }}>Loading activities…</div>}>
      <ActivitiesContent />
    </Suspense>
  );
}

function ActivitiesContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { ageGroup } = useAgeGroup();

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [cats, setCats] = useState<string[]>(searchParams.get("category") ? [searchParams.get("category")!] : []);
  const [regions, setRegions] = useState<string[]>(searchParams.get("region") ? [searchParams.get("region")!] : []);
  const [durations, setDurations] = useState<string[]>([]);
  const [seasons, setSeasons] = useState<string[]>(searchParams.get("season") ? [searchParams.get("season")!] : []);
  const [weather, setWeather] = useState<WeatherId>("any");
  const [priceMax, setPriceMax] = useState<number>(searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : 500);
  const [sort, setSort] = useState<SortKey>("rating");
  const [bestNow, setBestNow] = useState(false);
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [openPill, setOpenPill] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // Outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!filterRef.current) return;
      if (!filterRef.current.contains(e.target as Node)) setOpenPill(null);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Sync URL
  useEffect(() => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (cats.length) u.set("category", cats[0]);
    if (regions.length) u.set("region", regions[0]);
    if (seasons.length) u.set("season", seasons[0]);
    if (priceMax !== 500) u.set("maxPrice", String(priceMax));
    const url = `${pathname}${u.toString() ? `?${u.toString()}` : ""}`;
    window.history.replaceState({}, "", url);
  }, [q, cats, regions, seasons, priceMax, pathname]);

  const filtered = useMemo(() => {
    let r = [...activities];
    if (q) {
      const ql = q.toLowerCase();
      r = r.filter((a) =>
        a.name.toLowerCase().includes(ql) ||
        a.description.toLowerCase().includes(ql) ||
        a.subcategory.toLowerCase().includes(ql) ||
        a.category.toLowerCase().includes(ql) ||
        a.tags.some((t) => t.toLowerCase().includes(ql)) ||
        a.location.city.toLowerCase().includes(ql) ||
        a.location.region.toLowerCase().includes(ql)
      );
    }
    if (cats.length) r = r.filter((a) => cats.includes(a.category));
    if (regions.length) r = r.filter((a) => regions.includes(a.location.region));
    if (durations.length) r = r.filter((a) => durations.includes(durationOf(a.duration)));
    if (seasons.length) r = r.filter((a) => seasons.some((s) => a.seasons.includes(s as Season)));
    if (weather === "rain" || weather === "indoor") r = r.filter((a) => a.indoor);
    if (weather === "sun") r = r.filter((a) => !a.indoor);
    if (priceMax !== 500) r = r.filter((a) => getBestPrice(a, ageGroup) <= priceMax);
    if (bestNow) r = r.filter((a) => getAverageRating(a) >= 4.5);
    switch (sort) {
      case "price-asc":  r.sort((a, b) => getBestPrice(a, ageGroup) - getBestPrice(b, ageGroup)); break;
      case "price-desc": r.sort((a, b) => getBestPrice(b, ageGroup) - getBestPrice(a, ageGroup)); break;
      case "name":       r.sort((a, b) => a.name.localeCompare(b.name)); break;
      default:           r.sort((a, b) => getAverageRating(b) - getAverageRating(a));
    }
    return r;
  }, [q, cats, regions, durations, seasons, weather, priceMax, sort, bestNow, ageGroup]);

  const toggleFav = useCallback((id: string) => {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const clearAll = () => {
    setQ(""); setCats([]); setRegions([]); setDurations([]);
    setSeasons([]); setWeather("any"); setPriceMax(500); setBestNow(false);
  };

  const activeChips: { label: string; remove: () => void }[] = [
    ...cats.map((c) => ({ label: CATEGORIES.find((x) => x.value === c)?.label || c, remove: () => setCats(cats.filter((x) => x !== c)) })),
    ...regions.map((c) => ({ label: c, remove: () => setRegions(regions.filter((x) => x !== c)) })),
    ...durations.map((c) => ({ label: DURATIONS.find((d) => d.id === c)?.label || c, remove: () => setDurations(durations.filter((x) => x !== c)) })),
    ...seasons.map((c) => ({ label: c[0].toUpperCase() + c.slice(1), remove: () => setSeasons(seasons.filter((x) => x !== c)) })),
    ...(weather !== "any" ? [{ label: WEATHERS.find((w) => w.id === weather)!.label, remove: () => setWeather("any") }] : []),
    ...(priceMax !== 500 ? [{ label: priceMax === 0 ? "Free only" : `≤ CHF ${priceMax}`, remove: () => setPriceMax(500) }] : []),
    ...(bestNow ? [{ label: "Best right now", remove: () => setBestNow(false) }] : []),
  ];

  const trending = useMemo(() => {
    return [...activities].sort((a, b) => getAverageRating(b) - getAverageRating(a)).slice(0, 6);
  }, []);

  const togglePill = (id: string) => setOpenPill(openPill === id ? null : id);

  return (
    <div className="alpine-page">
      <style dangerouslySetInnerHTML={{ __html: `
        .alpine-page input[type="range"] { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 999px; background: var(--line); outline: none; }
        .alpine-page input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: var(--accent); border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,.25); cursor: pointer; }
        .alpine-page input[type="range"]::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: var(--accent); border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,.25); cursor: pointer; }
        .alpine-page .acts-grid { display: grid; gap: 18px; grid-template-columns: repeat(auto-fill, minmax(min(330px, 100%), 1fr)); }
        .alpine-page .x-scroll::-webkit-scrollbar { height: 6px; }
        .alpine-page .x-scroll::-webkit-scrollbar-thumb { background: var(--line); border-radius: 999px; }
        .alpine-page .a-card-in:hover { transform: translateY(-3px); box-shadow: var(--shadow-2); border-color: color-mix(in oklab, var(--accent) 30%, var(--line)) !important; }
      `}} />

      <section className="a-container" style={{ padding: "32px 24px 12px" }}>
        <span className="a-kicker"><span className="bar" />Activities</span>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", flexWrap: "wrap", gap: 16, marginTop: 10 }}>
          <h1 className="alpine-display" style={{ fontSize: "clamp(38px, 5.5vw, 68px)", lineHeight: 1.05, margin: "0 0 0.35em", paddingBottom: "0.12em" }}>
            Find your <em style={{ fontStyle: "italic", color: "var(--accent)" }}>perfect day</em>
          </h1>
          <p style={{ color: "var(--ink-soft)", fontSize: 16, maxWidth: 360, margin: 0 }}>
            {activities.length} hand-picked Swiss experiences. Filter by mood, season, weather, or budget — we&apos;ll do the matching.
          </p>
        </div>
      </section>

      {/* Trending strip */}
      <div className="a-container" style={{ padding: "16px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <span className="a-kicker"><span className="bar" />Trending now</span>
          <span style={{ fontSize: 12, color: "var(--ink-mute)" }}>Updated daily</span>
        </div>
        <div className="x-scroll" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 10 }}>
          {trending.map((a) => {
            const { src } = resolveActivityImage(a);
            return (
              <button key={a.id} onClick={() => setQ(a.name)} style={{
                flexShrink: 0, width: 220, padding: 8, borderRadius: 16,
                background: "var(--card)", border: "1px solid var(--line)",
                display: "flex", gap: 10, alignItems: "center",
                cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                transition: "transform .2s, border-color .2s",
              }}>
                <div style={{ width: 60, height: 50, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "var(--bg-2)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 3 }}>★ {getAverageRating(a).toFixed(1)} · {a.location.city}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Bar */}
      <div ref={filterRef} style={{
        position: "sticky", top: 60, zIndex: 30,
        background: "color-mix(in oklab, var(--bg) 92%, transparent)",
        backdropFilter: "blur(12px)", borderBottom: "1px solid var(--line)", marginTop: 12,
      }}>
        <div className="a-container" style={{ padding: "16px 24px 12px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
              background: "var(--card)", border: "1px solid var(--line)",
              borderRadius: 999, flex: "1 1 280px", minWidth: 0,
            }}>
              <Search />
              <input value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Search activities, cities, tags…"
                style={{
                  border: 0, outline: 0, background: "transparent",
                  fontFamily: "inherit", fontSize: 15, color: "var(--ink)",
                  padding: "6px 0", flex: 1, minWidth: 0,
                }}/>
              {q && <button onClick={() => setQ("")} style={{ border: 0, background: "transparent", color: "var(--ink-mute)", cursor: "pointer" }}><X /></button>}
            </div>

            <button className="a-btn a-btn-ghost" onClick={() => setBestNow(!bestNow)}
              style={{
                background: bestNow ? "var(--accent)" : "var(--card)",
                color: bestNow ? "#fff" : "var(--ink)",
                borderColor: bestNow ? "var(--accent)" : "var(--line)",
              }}>
              <Sun /> Best right now
            </button>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <PillDropdown label="Category" count={cats.length} isOpen={openPill === "cat"} onToggle={() => togglePill("cat")}>
              <CheckList values={cats} options={CATEGORIES.map((c) => ({ id: c.value, label: c.label }))} onChange={setCats} />
            </PillDropdown>
            <PillDropdown label="Region" count={regions.length} isOpen={openPill === "region"} onToggle={() => togglePill("region")}>
              <CheckList values={regions} options={[...REGIONS]} onChange={setRegions} />
            </PillDropdown>
            <PillDropdown label="Duration" count={durations.length} isOpen={openPill === "dur"} onToggle={() => togglePill("dur")}>
              <CheckList values={durations} options={DURATIONS} onChange={setDurations} />
            </PillDropdown>
            <PillDropdown label="Price" count={priceMax === 500 ? 0 : 1} isOpen={openPill === "price"} onToggle={() => togglePill("price")}>
              <PriceRange value={priceMax} onChange={setPriceMax} />
            </PillDropdown>
            <PillDropdown label="Season" count={seasons.length} isOpen={openPill === "season"} onToggle={() => togglePill("season")}>
              <CheckList values={seasons} options={SEASONS} onChange={setSeasons} />
            </PillDropdown>
            <PillDropdown label="Weather" count={weather === "any" ? 0 : 1} isOpen={openPill === "weather"} onToggle={() => togglePill("weather")}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {WEATHERS.map((w) => (
                  <button key={w.id} onClick={() => { setWeather(w.id as WeatherId); setOpenPill(null); }}
                    style={{
                      textAlign: "left", padding: "10px 12px", borderRadius: 10, border: 0,
                      fontFamily: "inherit", fontSize: 14, cursor: "pointer",
                      background: weather === w.id ? "var(--bg-2)" : "transparent",
                      color: "var(--ink)", fontWeight: weather === w.id ? 600 : 400,
                    }}>{w.label}</button>
                ))}
              </div>
            </PillDropdown>
          </div>

          {activeChips.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", paddingTop: 4 }}>
              {activeChips.map((c, i) => (
                <button key={i} onClick={c.remove} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "5px 5px 5px 11px", borderRadius: 999,
                  background: "var(--bg-2)", color: "var(--ink)",
                  border: 0, fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer",
                  animation: "a-popIn .25s cubic-bezier(.2,.7,.2,1)",
                }}>
                  {c.label}
                  <span style={{ width: 18, height: 18, borderRadius: 999, background: "var(--ink)", color: "#fff", display: "grid", placeItems: "center" }}><X /></span>
                </button>
              ))}
              <button onClick={clearAll} style={{
                border: 0, background: "transparent", color: "var(--accent)",
                fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "5px 8px",
              }}>Clear all</button>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 4, gap: 12, flexWrap: "wrap" }}>
            <span style={{ color: "var(--ink-soft)", fontSize: 14 }}>
              <strong style={{ color: "var(--ink)" }}>{filtered.length}</strong> {filtered.length === 1 ? "experience" : "experiences"} match
            </span>
            <div style={{ display: "flex", gap: 2, padding: 3, background: "var(--bg-2)", borderRadius: 999 }}>
              {([
                { id: "rating", label: "Top rated" },
                { id: "price-asc", label: "Cheapest" },
                { id: "price-desc", label: "Premium" },
                { id: "name", label: "A → Z" },
              ] as { id: SortKey; label: string }[]).map((opt) => (
                <button key={opt.id} onClick={() => setSort(opt.id)} style={{
                  border: 0, padding: "7px 14px", borderRadius: 999, cursor: "pointer",
                  background: sort === opt.id ? "var(--card)" : "transparent",
                  color: sort === opt.id ? "var(--ink)" : "var(--ink-soft)",
                  boxShadow: sort === opt.id ? "var(--shadow-1)" : "none",
                  fontSize: 13, fontWeight: 600, fontFamily: "inherit", transition: "all .2s",
                }}>{opt.label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="a-container" style={{ padding: "24px 24px 80px" }}>
        {filtered.length === 0 ? (
          <div style={{
            background: "var(--card)", borderRadius: 22, border: "1px dashed var(--line)",
            padding: "70px 24px", textAlign: "center", maxWidth: 520, margin: "0 auto",
          }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🏔️</div>
            <div className="alpine-display" style={{ fontSize: 26, marginBottom: 8 }}>No matches yet</div>
            <p style={{ color: "var(--ink-soft)", marginBottom: 20 }}>Try relaxing some filters.</p>
            <button className="a-btn a-btn-primary" onClick={clearAll}>Clear all filters</button>
          </div>
        ) : (
          <div className="acts-grid" key={`${q}-${cats.join()}-${regions.join()}-${durations.join()}-${seasons.join()}-${weather}-${priceMax}-${sort}-${bestNow}`}>
            {filtered.map((a, i) => (
              <div key={a.id} style={{ animationDelay: `${Math.min(i, 9) * 35}ms` }}>
                <ActivityCardAlpine a={a} fav={favs.has(a.id)} onFav={toggleFav} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
