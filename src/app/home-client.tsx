"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

/* ──────────────────────────────────────────────────────────────
   ALPINE SUNSHINE HOME — warm, lively, postcard editorial.
   Scoped via .alpine-page wrapper (see globals.css).
─────────────────────────────────────────────────────────────── */

export interface HomeStats {
  /** Total catalogue size, e.g. 1513 */
  totalActivities: number;
  /** Distinct cantons covered */
  cantonCount: number;
  /** Per-category counts: outdoor / culture / adventure / family / wellness */
  byCategory: Record<string, number>;
  /** Activities tagged "train" or with subcategory containing "rail" */
  scenicRailwayCount: number;
}

interface CategoryCard {
  num: string;
  name: string;
  italic: string;
  count: number;
  desc: string;
  photo: string;
  href: string;
}

function buildCategories(stats: HomeStats): CategoryCard[] {
  return [
    { num: "01", name: "Mountain", italic: "Experiences", count: stats.byCategory.outdoor ?? 0, desc: "Cable cars, peaks, glaciers.",
      photo: "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=600&q=80&auto=format&fit=crop", href: "/activities?category=outdoor" },
    { num: "02", name: "Adventure", italic: "& Thrills", count: stats.byCategory.adventure ?? 0, desc: "Paragliding, canyoning, bungee.",
      photo: "https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=600&q=80&auto=format&fit=crop", href: "/activities?category=adventure" },
    { num: "03", name: "Scenic", italic: "Railways", count: stats.scenicRailwayCount, desc: "Glacier Express & friends.",
      photo: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80&auto=format&fit=crop", href: "/activities?q=train" },
    { num: "04", name: "Wellness", italic: "& Thermal", count: stats.byCategory.wellness ?? 0, desc: "Hot springs in the Alps.",
      photo: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&q=80&auto=format&fit=crop", href: "/activities?category=wellness" },
    { num: "05", name: "Culture", italic: "& History", count: stats.byCategory.culture ?? 0, desc: "Castles, chocolate, four tongues.",
      photo: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=80&auto=format&fit=crop", href: "/activities?category=culture" },
  ];
}

const STORIES = [
  { num: "01", tags: ["Lakes", "Nature"], title: "15 Most Beautiful Lakes in Switzerland",
    excerpt: "From the unreal turquoise of Lake Brienz to the remote tarn of Bachalpsee.", read: "8 min",
    photo: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=600&q=80&auto=format&fit=crop",
    href: "/stories/most-beautiful-lakes-switzerland" },
  { num: "02", tags: ["Hidden Gems"], title: "9 Swiss Villages You Should Visit Instead",
    excerpt: "Grindelwald gets the crowds. These nine get the real Switzerland.", read: "12 min",
    photo: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80&auto=format&fit=crop",
    href: "/stories" },
  { num: "03", tags: ["Trains", "Scenic"], title: "5 Most Scenic Train Rides — With Honest Prices",
    excerpt: "Which scenic trains are worth the supplement, and which ride free on a Swiss Pass.", read: "10 min",
    photo: "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=600&q=80&auto=format&fit=crop",
    href: "/stories/scenic-train-rides-switzerland" },
];

const QUICK = ["Hiking", "Trains", "Wellness", "Family", "Free"];

function Cloud({ className }: { className: string }) {
  return (
    <svg className={"a-cloud " + className} viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="32" rx="22" ry="14" fill="#fff" />
      <ellipse cx="60" cy="28" rx="28" ry="18" fill="#fff" />
      <ellipse cx="90" cy="34" rx="20" ry="13" fill="#fff" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function Hero({ stats }: { stats: HomeStats }) {
  const [q, setQ] = useState("");
  return (
    <section style={{ position: "relative", overflow: "hidden" }}>
      <div aria-hidden style={{
        position: "absolute", top: -120, right: -120, width: 380, height: 380, borderRadius: "50%",
        background: "radial-gradient(circle, var(--accent-3), transparent 60%)", opacity: .55,
        pointerEvents: "none", animation: "a-sunRise 2s cubic-bezier(.2,.7,.2,1) both",
      }}/>
      <Cloud className="a-cloud-1" />
      <Cloud className="a-cloud-2" />

      <div className="a-container" style={{ paddingTop: 56, paddingBottom: 28, position: "relative" }}>
        <div className="hero-grid" style={{
          display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 56, alignItems: "center",
        }}>
          <div className="a-fade-up">
            <span className="a-kicker"><span className="bar" />Switzerland · {stats.totalActivities.toLocaleString()} experiences, real prices</span>
            <h1 className="alpine-display" style={{
              fontSize: "clamp(44px, 7vw, 92px)", lineHeight: .98, margin: "18px 0 18px",
              letterSpacing: "-0.035em",
            }}>
              <span style={{
                display: "inline-block", borderRight: "3px solid var(--accent)",
                whiteSpace: "nowrap", overflow: "hidden", maxWidth: 0,
                animation: "a-typewriter 1.1s steps(11, end) .2s forwards, a-blinkCaret .8s step-end infinite",
              }}>Find your</span>
              <em style={{
                fontStyle: "italic", color: "var(--accent)", display: "block",
                opacity: 0, transform: "translateY(12px)",
                animation: "a-fadeUp .6s cubic-bezier(.2,.7,.2,1) 1.4s forwards",
              }}>Swiss day out.</em>
            </h1>
            <p style={{ fontSize: 18, color: "var(--ink-soft)", maxWidth: 520, marginBottom: 28 }}>
              Hand-picked alpine adventures, scenic trains, hot springs and storybook villages — sorted by what&apos;s actually worth your francs.
            </p>

            <div style={{
              display: "flex", alignItems: "center", gap: 6, padding: 8,
              background: "var(--card)", border: "1px solid var(--line)",
              borderRadius: 999, boxShadow: "var(--shadow-2)", maxWidth: 560,
            }}>
              <span style={{ paddingLeft: 12, color: "var(--ink-mute)", display: "inline-flex" }}><SearchIcon /></span>
              <input
                value={q} onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") window.location.href = `/activities?q=${encodeURIComponent(q)}`; }}
                placeholder="Try ‘paragliding’, ‘Zermatt’, or ‘rainy day’"
                style={{
                  flex: 1, border: 0, outline: 0, background: "transparent",
                  fontFamily: "inherit", fontSize: 15, color: "var(--ink)", padding: "10px 4px",
                }}
              />
              <Link className="a-btn a-btn-primary" href={`/activities${q ? `?q=${encodeURIComponent(q)}` : ""}`}>Search</Link>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
              <span style={{ alignSelf: "center", fontSize: 13, color: "var(--ink-mute)", marginRight: 4 }}>Popular:</span>
              {QUICK.map((qx) => (
                <Link key={qx} className="a-chip" href={`/activities?q=${encodeURIComponent(qx)}`}>{qx}</Link>
              ))}
            </div>

            <div style={{ display: "flex", gap: 22, marginTop: 28, flexWrap: "wrap" }}>
              {[
                [stats.totalActivities.toLocaleString(), "experiences"],
                [String(stats.cantonCount), "cantons"],
                ["4.7★", "avg rating"],
                ["CHF 0–500", "all budgets"],
              ].map(([n, l]) => (
                <div key={l}>
                  <div className="alpine-display" style={{ fontSize: 22, lineHeight: 1 }}>{n}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero collage */}
          <div className="hero-art a-fade-up" style={{ position: "relative", height: 540 }}>
            <div className="a-floaty" style={{
              ["--rot" as string]: "-3deg", position: "absolute", top: 30, right: 0, width: "82%", height: 360,
              borderRadius: 26, overflow: "hidden", boxShadow: "var(--shadow-2)",
              border: "6px solid #FFFDF6", background: "var(--bg-2)",
            } as React.CSSProperties}>
              <Image src="https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=900&q=80&auto=format&fit=crop"
                alt="Snowy alpine peaks" fill sizes="(max-width: 820px) 100vw, 50vw" priority
                style={{ objectFit: "cover" }} />
              <span style={{ position: "absolute", left: 14, bottom: 12, color: "#fff", fontFamily: "JetBrains Mono, monospace", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", textShadow: "0 1px 6px rgba(0,0,0,.5)" }}>Jungfraujoch · 3,454m</span>
            </div>
            <div className="a-floaty" style={{
              ["--rot" as string]: "5deg", animationDelay: "1.5s",
              position: "absolute", bottom: 40, left: 0, width: 220, height: 180,
              borderRadius: 22, overflow: "hidden", boxShadow: "var(--shadow-2)",
              border: "5px solid #FFFDF6", background: "var(--bg-2)",
            } as React.CSSProperties}>
              <Image src="https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=600&q=80&auto=format&fit=crop"
                alt="Lake Brienz" fill sizes="220px" style={{ objectFit: "cover" }} />
              <span style={{ position: "absolute", left: 14, bottom: 10, color: "#fff", fontFamily: "JetBrains Mono, monospace", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", textShadow: "0 1px 6px rgba(0,0,0,.5)" }}>Lake Brienz</span>
            </div>
            <div className="a-floaty" style={{
              ["--rot" as string]: "-8deg", animationDelay: "3s",
              position: "absolute", bottom: 0, right: 50, width: 180, height: 140,
              borderRadius: 18, overflow: "hidden", boxShadow: "var(--shadow-2)",
              border: "5px solid #FFFDF6", background: "var(--bg-2)",
            } as React.CSSProperties}>
              <Image src="https://images.unsplash.com/photo-1551524559-8af4e6624178?w=500&q=80&auto=format&fit=crop"
                alt="Alpine lake" fill sizes="180px" style={{ objectFit: "cover" }} />
              <span style={{ position: "absolute", left: 14, bottom: 8, color: "#fff", fontFamily: "JetBrains Mono, monospace", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", textShadow: "0 1px 6px rgba(0,0,0,.5)" }}>Bachalpsee</span>
            </div>
            <div style={{
              position: "absolute", top: 0, left: 30, transform: "rotate(-10deg)",
              background: "#FFFDF6", border: "2px dashed var(--accent)", color: "var(--accent)",
              padding: "8px 14px", borderRadius: 8,
              fontFamily: "JetBrains Mono, monospace", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase",
              boxShadow: "var(--shadow-1)", zIndex: 2,
            }}>★ Hand-picked</div>
            <div className="a-floaty hide-mobile-tag" style={{
              ["--rot" as string]: "8deg", animationDelay: "2s",
              position: "absolute", top: 220, left: -10,
              background: "var(--ink)", color: "#fff",
              padding: "10px 14px", borderRadius: 14,
              boxShadow: "var(--shadow-2)",
              fontFamily: "JetBrains Mono, monospace", fontSize: 12, letterSpacing: ".06em", zIndex: 2,
            } as React.CSSProperties}>
              <div style={{ opacity: .65, fontSize: 10, textTransform: "uppercase" }}>From</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>CHF 0 ✦ Free</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryStrip({ stats }: { stats: HomeStats }) {
  const categories = buildCategories(stats);
  return (
    <section className="a-container" style={{ padding: "72px 24px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
        <div>
          <span className="a-kicker"><span className="bar" />Browse by mood</span>
          <h2 className="alpine-display" style={{ fontSize: "clamp(30px, 4vw, 48px)", lineHeight: 1.05, margin: "10px 0 0" }}>
            Pick a vibe. <em style={{ fontStyle: "italic", color: "var(--accent)" }}>We sort the rest.</em>
          </h2>
        </div>
        <Link className="a-btn a-btn-ghost" href="/activities">See all {stats.totalActivities.toLocaleString()} <ArrowIcon /></Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {categories.map((c) => (
          <Link key={c.num} href={c.href} className="cat-card" style={{
            background: "var(--card)", borderRadius: 22, border: "1px solid var(--line)",
            padding: 18, display: "flex", flexDirection: "column", gap: 12,
            cursor: "pointer", textDecoration: "none", color: "inherit",
            boxShadow: "var(--shadow-1)", transition: "transform .25s, box-shadow .25s, border-color .25s",
          }}>
            <div style={{ position: "relative", height: 130, borderRadius: 14, overflow: "hidden", background: "var(--bg-2)" }}>
              <Image src={c.photo} alt={c.name} fill sizes="(max-width: 720px) 50vw, 220px"
                style={{ objectFit: "cover" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div className="alpine-display" style={{ fontSize: 22, lineHeight: 1.05 }}>
                {c.name} <em style={{ fontStyle: "italic", color: "var(--ink-mute)" }}>{c.italic}</em>
              </div>
              <span className="alpine-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>{c.num}</span>
            </div>
            <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: 0 }}>{c.desc}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
              <span className="a-tag">{c.count} experiences</span>
              <span style={{ color: "var(--accent)", display: "flex", gap: 6, alignItems: "center", fontWeight: 600, fontSize: 13 }}>
                Browse <ArrowIcon />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FeatureRow() {
  const facts = [["3,454m", "Altitude"], ["6–8h", "Full day"], ["CHF 234", "From"], ["★4.7", "2.8k reviews"]] as const;
  return (
    <section className="a-container" style={{ padding: "72px 24px" }}>
      <div className="feature-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 48, alignItems: "center" }}>
        <div style={{ position: "relative", aspectRatio: "4/5", borderRadius: 26, overflow: "hidden", boxShadow: "var(--shadow-2)", background: "var(--bg-2)" }}>
          <Image src="https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=900&q=80&auto=format&fit=crop"
            alt="Jungfraujoch" fill sizes="(max-width: 820px) 100vw, 50vw" style={{ objectFit: "cover" }} />
          <div style={{ position: "absolute", top: 16, left: 16 }}>
            <span className="a-tag coral" style={{ background: "var(--ink)", color: "#fff" }}>✦ This month&apos;s pick</span>
          </div>
        </div>
        <div>
          <span className="a-kicker"><span className="bar" />Mountain experience</span>
          <h2 className="alpine-display" style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1.02, margin: "12px 0 6px" }}>Jungfraujoch</h2>
          <p className="alpine-display" style={{ fontStyle: "italic", color: "var(--accent)", fontWeight: 500, fontSize: 22, margin: 0 }}>Top of Europe</p>
          <p style={{ fontSize: 17, color: "var(--ink-soft)", lineHeight: 1.7, margin: "20px 0 26px", maxWidth: 520 }}>
            A cogwheel train tunnels through the Eiger to reach the highest railway station in Europe. An ice palace carved into a glacier. The Aletsch — the longest glacier in the Alps — stretching to the horizon.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1, background: "var(--line)", borderRadius: 18, overflow: "hidden", marginBottom: 26 }}>
            {facts.map(([v, k]) => (
              <div key={k} style={{ background: "var(--card)", padding: "16px 18px" }}>
                <div className="alpine-display" style={{ fontSize: 22, lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-mute)", marginTop: 6 }}>{k}</div>
              </div>
            ))}
          </div>
          <Link className="a-btn a-btn-dark" href="/activities?category=outdoor">Book this experience <ArrowIcon /></Link>
        </div>
      </div>
    </section>
  );
}

function ItinTeaser() {
  const route = ["Zurich", "Lucerne", "Interlaken", "Zermatt", "Geneva"];
  return (
    <section style={{ padding: "16px 0 72px" }}>
      <div className="a-container">
        <div className="itin-card" style={{
          background: "var(--ink)", color: "#FFF7EC",
          borderRadius: 30, padding: "44px 36px",
          display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 36, alignItems: "center",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, opacity: .25, pointerEvents: "none" }}>
            <Image src="https://images.unsplash.com/photo-1543634806-d12bf25b8074?w=1200&q=80&auto=format&fit=crop"
              alt="" fill sizes="100vw" style={{ objectFit: "cover" }} />
          </div>
          <div style={{ position: "relative" }}>
            <span className="a-kicker" style={{ color: "var(--accent-3)" }}>
              <span className="bar" style={{ background: "var(--accent-3)" }} />Curated route · 7 days
            </span>
            <h2 className="alpine-display" style={{ color: "#FFF7EC", fontSize: "clamp(34px, 4.4vw, 56px)", lineHeight: 1.02, margin: "12px 0 18px" }}>
              Classic <em style={{ fontStyle: "italic", color: "var(--accent-3)" }}>Switzerland</em>
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
              {route.map((c, i) => (
                <span key={c} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)",
                    padding: "6px 12px", borderRadius: 999, fontSize: 13,
                  }}>{c}</span>
                  {i < route.length - 1 && <span style={{ opacity: .5 }}>→</span>}
                </span>
              ))}
            </div>
            <p style={{ color: "rgba(255,247,236,.78)", fontSize: 15.5, lineHeight: 1.7, maxWidth: 560 }}>
              The definitive first-timer&apos;s route. Five cities, two iconic peaks, one legendary train ride, and a medieval castle on a lake. Budget to luxury: <strong style={{ color: "#fff" }}>CHF 1,200 – 4,500</strong> per person.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
              <Link className="a-btn" style={{ background: "var(--accent-3)", color: "#1F2A2E" }}
                href="/itineraries/classic-switzerland-7-days">View itinerary <ArrowIcon /></Link>
              <Link className="a-btn" style={{ background: "rgba(255,255,255,.1)", color: "#fff", border: "1px solid rgba(255,255,255,.18)" }}
                href="/planner">Customize</Link>
            </div>
          </div>
          <div style={{ position: "relative", aspectRatio: "4/5", borderRadius: 22, overflow: "hidden", boxShadow: "var(--shadow-2)", background: "var(--bg-2)" }}>
            <Image src="https://images.unsplash.com/photo-1560704198-d36d8836f1cd?w=600&q=80&auto=format&fit=crop"
              alt="Swiss train" fill sizes="(max-width: 820px) 100vw, 380px" style={{ objectFit: "cover" }} />
          </div>
        </div>
      </div>
    </section>
  );
}

function StoriesRow() {
  return (
    <section style={{ padding: "16px 0 80px" }}>
      <div className="a-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
          <div>
            <span className="a-kicker"><span className="bar" />Stories</span>
            <h2 className="alpine-display" style={{ fontSize: "clamp(30px, 4vw, 48px)", lineHeight: 1.05, margin: "10px 0 0" }}>
              Read before <em style={{ fontStyle: "italic", color: "var(--accent)" }}>you go.</em>
            </h2>
          </div>
          <Link className="a-btn a-btn-ghost" href="/stories">All stories <ArrowIcon /></Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {STORIES.map((s) => (
            <Link key={s.num} href={s.href} className="cat-card" style={{
              background: "var(--card)", borderRadius: 22, border: "1px solid var(--line)",
              padding: 16, display: "flex", flexDirection: "column", gap: 12,
              textDecoration: "none", color: "inherit", cursor: "pointer", boxShadow: "var(--shadow-1)",
              transition: "transform .25s, box-shadow .25s, border-color .25s",
            }}>
              <div style={{ position: "relative", height: 160, borderRadius: 14, overflow: "hidden", background: "var(--bg-2)" }}>
                <Image src={s.photo} alt={s.title} fill sizes="(max-width: 720px) 100vw, 380px"
                  style={{ objectFit: "cover" }} />
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {s.tags.map((t) => <span key={t} className="a-tag">{t}</span>)}
              </div>
              <h3 className="alpine-display" style={{ fontSize: 22, lineHeight: 1.15, margin: 0 }}>{s.title}</h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: 0 }}>{s.excerpt}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                <span className="alpine-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>{s.num} · {s.read}</span>
                <span style={{ color: "var(--accent)", fontWeight: 600, fontSize: 13, display: "flex", gap: 6, alignItems: "center" }}>Read <ArrowIcon /></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   Easter eggs (Konami → confetti, ripples)
─────────────────────────────────────────────────────────────── */
function useEasterEggs() {
  useEffect(() => {
    const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
    let buf: string[] = [];
    const onKey = (e: KeyboardEvent) => {
      buf.push(e.key);
      if (buf.length > KONAMI.length) buf.shift();
      if (KONAMI.every((k, i) => buf[i] && buf[i].toLowerCase() === k.toLowerCase())) {
        buf = [];
        triggerConfetti(160);
        const banner = document.createElement("div");
        banner.className = "alpine-yodel-banner";
        banner.innerHTML = "🎶 YODEL MODE UNLOCKED — Echoooo through the Alps! Click to dismiss.";
        banner.addEventListener("click", () => banner.remove());
        document.body.appendChild(banner);
        setTimeout(() => banner.remove(), 5500);
      }
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const btn = target?.closest(".a-btn") as HTMLElement | null;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const span = document.createElement("span");
      span.style.position = "absolute";
      span.style.borderRadius = "50%";
      span.style.transform = "scale(0)";
      span.style.background = "rgba(255,255,255,.4)";
      span.style.pointerEvents = "none";
      span.style.animation = "a-rippleAnim .6s ease-out";
      const size = Math.max(r.width, r.height);
      span.style.width = span.style.height = size + "px";
      span.style.left = (e.clientX - r.left - size / 2) + "px";
      span.style.top = (e.clientY - r.top - size / 2) + "px";
      btn.appendChild(span);
      setTimeout(() => span.remove(), 650);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);
}

function triggerConfetti(count = 80, colors?: string[]) {
  const palette = colors || ["#E8634A", "#F4B43E", "#2E6F5E", "#6FB6D9", "#FFFDF6"];
  for (let i = 0; i < count; i++) {
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

export default function HomePageClient({ stats }: { stats: HomeStats }) {
  useEasterEggs();
  return (
    <div className="alpine-page">
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 820px) {
          .alpine-page .hero-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .alpine-page .hero-art { height: 320px !important; }
          .alpine-page .feature-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .alpine-page .itin-card { grid-template-columns: 1fr !important; padding: 28px 20px !important; }
          .alpine-page .hide-mobile-tag { display: none !important; }
        }
        .alpine-page .cat-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-2);
          border-color: color-mix(in oklab, var(--accent) 30%, var(--line)) !important;
        }
      `}} />
      <Hero stats={stats} />
      <CategoryStrip stats={stats} />
      <FeatureRow />
      <ItinTeaser />
      <StoriesRow />
    </div>
  );
}
