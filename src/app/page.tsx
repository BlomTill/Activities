"use client";

import Link from "next/link";

/* ─── Design tokens ─── */
const G = "oklch(74% 0.13 63deg)"; // gold accent

const CATEGORIES = [
  {
    num: "01",
    name: "Mountain",
    nameItalic: "Experiences",
    desc: "From Europe's highest railway station to cable cars that touch 3,883m. Switzerland's peaks aren't just scenery — they're destinations.",
    count: "45 experiences",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=900&fit=crop",
    href: "/activities?category=mountain",
  },
  {
    num: "02",
    name: "Adventure",
    nameItalic: "& Thrills",
    desc: "Paragliding over two lakes. Bungee jumping into a dam. Canyoning through gorges. Switzerland has a quiet way of making your heart race.",
    count: "32 experiences",
    image:
      "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=1200&h=900&fit=crop",
    href: "/activities?category=adventure",
  },
  {
    num: "03",
    name: "Scenic",
    nameItalic: "Railways",
    desc: "The Glacier Express, Bernina Express, GoldenPass Line. Not transportation — destinations in themselves. 291 bridges. 91 tunnels. 8 hours of pure alpine cinema.",
    count: "8 routes",
    image:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&h=900&fit=crop",
    href: "/activities?category=trains",
  },
  {
    num: "04",
    name: "Wellness",
    nameItalic: "& Thermal",
    desc: "Hot springs at 1,411m altitude. Roman baths in a valley spa. Rooftop pools with mountain panoramas. The alpine cure is real.",
    count: "18 experiences",
    image:
      "https://images.unsplash.com/photo-1545389336-cf090694435e?w=1200&h=900&fit=crop",
    href: "/activities?category=wellness",
  },
  {
    num: "05",
    name: "Culture",
    nameItalic: "& History",
    desc: "A 12th-century lakeside castle. A Roman ruin in a Swiss suburb. A chocolate factory that gives you samples you didn't ask for. Four languages, one country.",
    count: "40 experiences",
    image:
      "https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?w=1200&h=900&fit=crop",
    href: "/activities?category=culture",
  },
];

const STORIES = [
  {
    num: "01",
    tags: ["Lakes", "Nature"],
    title: "15 Most Beautiful Lakes in Switzerland You Must Visit",
    excerpt:
      "From the unreal turquoise of Lake Brienz to the remote alpine tarn of Bachalpsee — every one worth the journey.",
    author: "Jonas Weber",
    date: "Mar 28",
    readTime: "8 min",
    href: "/stories/most-beautiful-lakes",
  },
  {
    num: "02",
    tags: ["Hidden Gems"],
    title: "9 Swiss Villages You Should Visit Instead of the Famous Ones",
    excerpt:
      "Grindelwald gets the crowds. These nine villages get the real Switzerland — and far fewer tourists.",
    author: "Emma Clarke",
    date: "Apr 18",
    readTime: "12 min",
    href: "/stories/swiss-villages",
  },
  {
    num: "03",
    tags: ["Trains", "Scenic"],
    title: "5 Most Scenic Train Rides — With Honest Prices",
    excerpt:
      "Which scenic trains are genuinely worth the supplement, and which routes can you ride for free on a Swiss Pass.",
    author: "Tom Lindqvist",
    date: "Feb 22",
    readTime: "10 min",
    href: "/stories/scenic-trains",
  },
];

/* ──────────────────────────────────────────────────────────────
   HERO
─────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section
      style={{
        position: "relative",
        height: "100svh",
        minHeight: "580px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        overflow: "hidden",
      }}
    >
      {/* Alpine photo */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "url('https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1920&h=1080&fit=crop')",
          backgroundPosition: "center 40%",
          backgroundSize: "cover",
          animation: "es-revealScale 2.2s cubic-bezier(0.16,1,0.3,1) both",
        }}
      />
      {/* Gradient veil */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(12,11,9,0.15) 0%, rgba(12,11,9,0) 35%, rgba(12,11,9,0.6) 70%, rgba(12,11,9,1) 100%)",
        }}
      />
      {/* Copy */}
      <div style={{ position: "relative", zIndex: 2, padding: "0 6vw 8vh" }}>
        <p
          style={{
            fontSize: "0.62rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: G,
            marginBottom: "1.4rem",
            animation: "es-fadeUp 0.8s 0.3s both",
          }}
        >
          The whole Switzerland experience
        </p>
        <h1
          style={{
            fontSize: "clamp(3rem, 9vw, 8rem)",
            fontWeight: 800,
            lineHeight: 0.92,
            letterSpacing: "-0.03em",
            color: "#ede8df",
            animation: "es-fadeUp 1s 0.45s both",
          }}
        >
          Explore
          <br />
          <em style={{ fontStyle: "italic", color: G }}>Switzerland</em>
        </h1>
        <p
          style={{
            marginTop: "2rem",
            fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)",
            color: "#9a9187",
            fontWeight: 300,
            maxWidth: "420px",
            lineHeight: 1.65,
            animation: "es-fadeUp 0.9s 0.6s both",
          }}
        >
          Every peak. Every hidden lake. Every story worth telling. Real
          activities, honest prices.
        </p>
        <Link
          href="#experiences"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.75rem",
            marginTop: "2.5rem",
            fontSize: "0.68rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#ede8df",
            textDecoration: "none",
            borderBottom: "1px solid #504840",
            paddingBottom: "3px",
            animation: "es-fadeUp 0.9s 0.75s both",
          }}
          className="es-hero-cta"
        >
          Discover what&apos;s here{" "}
          <span className="es-arr">→</span>
        </Link>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   INTRO
─────────────────────────────────────────────────────────────── */
function Intro() {
  return (
    <div
      className="es-intro"
      style={{
        padding: "8rem 6vw",
        display: "grid",
        gridTemplateColumns: "1fr 2fr",
        gap: "4vw",
        alignItems: "start",
      }}
    >
      <div
        style={{
          fontSize: "0.62rem",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "#9a9187",
          paddingTop: "0.4rem",
        }}
      >
        About this place
      </div>
      <p
        style={{
          fontSize: "clamp(1.05rem, 1.8vw, 1.35rem)",
          fontWeight: 400,
          lineHeight: 1.7,
          color: "#b0a898",
        }}
      >
        Switzerland is{" "}
        <em style={{ fontStyle: "italic", color: "#ede8df" }}>41,285 km²</em> of
        mountains, lakes, and villages — and most of it is still waiting to be
        found. This is the guide that tells you what&apos;s actually worth it,
        what it costs, and how to get there.
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   CATEGORY STRIPS
─────────────────────────────────────────────────────────────── */
function CategoryItem({
  cat,
  index,
}: {
  cat: (typeof CATEGORIES)[0];
  index: number;
}) {
  const isEven = index % 2 === 1;
  return (
    <Link
      href={cat.href}
      className="es-cat-item"
      data-even={isEven ? "true" : "false"}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        minHeight: "55vh",
        borderTop: "1px solid #1e1b17",
        textDecoration: "none",
        color: "inherit",
        overflow: "hidden",
        direction: isEven ? "rtl" : "ltr",
      }}
    >
      {/* Text */}
      <div
        className="es-cat-text"
        style={{
          direction: "ltr",
          padding: "4rem 6vw",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0c0b09",
          transition: "background 0.4s",
        }}
      >
        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: 300,
            color: "#9a9187",
            letterSpacing: "0.1em",
          }}
        >
          {cat.num}
        </div>
        <div>
          <div
            className="es-cat-name"
            style={{
                fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
              fontWeight: 700,
              lineHeight: 1.05,
              color: "#ede8df",
              transition: "color 0.3s",
            }}
          >
            {cat.name}
            <br />
            <em style={{ fontStyle: "italic" }}>{cat.nameItalic}</em>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <p style={{ fontSize: "0.85rem", color: "#9a9187", lineHeight: 1.65, maxWidth: "360px" }}>
            {cat.desc}
          </p>
          <span
            className="es-cat-link"
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#9a9187",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "color 0.2s",
            }}
          >
            {cat.count}{" "}
            <span className="es-arr" style={{ display: "inline-block", transition: "transform 0.25s" }}>→</span>
          </span>
        </div>
      </div>

      {/* Image */}
      <div style={{ direction: "ltr", overflow: "hidden", position: "relative" }}>
        <div
          className="es-cat-img"
          style={{
            width: "100%",
            height: "100%",
            backgroundImage: `url(${cat.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "1.5rem",
            right: "1.5rem",
            fontSize: "0.6rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#9a9187",
            background: "rgba(12,11,9,0.65)",
            padding: "0.35rem 0.8rem",
            backdropFilter: "blur(6px)",
          }}
        >
          {cat.count}
        </div>
      </div>
    </Link>
  );
}

function Categories() {
  return (
    <section id="experiences" style={{ paddingTop: "2rem" }}>
      {CATEGORIES.map((cat, i) => (
        <CategoryItem key={i} cat={cat} index={i} />
      ))}
      <div style={{ borderBottom: "1px solid #1e1b17" }} />
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   FEATURE SPOTLIGHT
─────────────────────────────────────────────────────────────── */
function Feature() {
  const facts = [
    { val: "3,454m", key: "Altitude" },
    { val: "6–8h", key: "Full day" },
    { val: "CHF 234", key: "From" },
  ];
  return (
    <section
      className="es-feature"
      style={{
        padding: "10rem 6vw",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "8vw",
        alignItems: "center",
      }}
    >
      <div style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=1000&fit=crop"
          alt="Jungfraujoch — Top of Europe"
          className="es-feature-img"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1)",
            display: "block",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "1.5rem",
            left: "1.5rem",
            fontSize: "0.58rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            background: G,
            color: "#0c0b09",
            padding: "0.3rem 0.7rem",
            fontWeight: 500,
          }}
        >
          This Month&apos;s Highlight
        </div>
      </div>

      <div>
        <div style={{ fontSize: "0.62rem", letterSpacing: "0.25em", textTransform: "uppercase", color: G, marginBottom: "1.5rem" }}>
          Mountain Experience
        </div>
        <h2
          style={{
            fontSize: "clamp(2rem, 3.5vw, 3rem)",
            fontWeight: 700,
            lineHeight: 1.1,
            color: "#ede8df",
            marginBottom: "0.5rem",
          }}
        >
          Jungfraujoch
        </h2>
        <p style={{ fontStyle: "italic", fontSize: "1.1rem", color: "#9a9187", marginBottom: "2rem" }}>
          Top of Europe
        </p>
        <p style={{ fontSize: "0.88rem", color: "#9a9187", lineHeight: 1.8, marginBottom: "2.5rem", maxWidth: "420px" }}>
          A cogwheel train tunnels through the Eiger itself to reach the highest
          railway station in Europe at 3,454m. An ice palace carved into a
          glacier. The Aletsch — the Alps&apos; longest glacier — stretching to the
          horizon. On clear days, you can see the Black Forest in Germany.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "1px",
            background: "#1e1b17",
            marginBottom: "2.5rem",
          }}
        >
          {facts.map((f) => (
            <div key={f.key} style={{ background: "#0c0b09", padding: "1.2rem 1rem" }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#ede8df" }}>
                {f.val}
              </div>
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9a9187", marginTop: "0.15rem" }}>
                {f.key}
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/activities?category=mountain"
          className="es-feature-link"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.75rem",
            fontSize: "0.68rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#9a9187",
            textDecoration: "none",
            borderBottom: "1px solid #2d2920",
            paddingBottom: "3px",
            transition: "color 0.2s, border-color 0.2s",
          }}
        >
          See all mountain experiences{" "}
          <span className="es-arr" style={{ display: "inline-block", transition: "transform 0.2s" }}>→</span>
        </Link>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   ITINERARY TEASER
─────────────────────────────────────────────────────────────── */
function ItinTeaser() {
  const route = ["Zurich", "Lucerne", "Interlaken", "Zermatt", "Geneva"];
  return (
    <div
      id="itinerary"
      className="es-itin"
      style={{
        borderTop: "1px solid #1e1b17",
        borderBottom: "1px solid #1e1b17",
        padding: "6rem 6vw",
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: "4vw",
        alignItems: "center",
      }}
    >
      <div
        className="es-itin-label"
        style={{
          fontSize: "0.62rem",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "#9a9187",
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
        }}
      >
        Itinerary
      </div>

      <div>
        <div style={{ fontSize: "0.62rem", letterSpacing: "0.25em", textTransform: "uppercase", color: G, marginBottom: "1rem" }}>
          Curated Route · 7 Days
        </div>
        <h2
          style={{
            fontSize: "clamp(2rem, 3.5vw, 3rem)",
            fontWeight: 700,
            lineHeight: 1.1,
            color: "#ede8df",
            marginBottom: "0.75rem",
          }}
        >
          Classic{" "}
          <em style={{ fontStyle: "italic", color: "#9a9187" }}>Switzerland</em>
        </h2>

        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          {route.map((city, i) => (
            <span key={city} style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", letterSpacing: "0.08em", color: "#9a9187" }}>{city}</span>
              {i < route.length - 1 && (
                <span style={{ width: "20px", height: "1px", background: "#8a7e70", margin: "0 0.5rem" }} />
              )}
            </span>
          ))}
        </div>

        <p style={{ fontSize: "0.85rem", color: "#9a9187", lineHeight: 1.7, maxWidth: "520px", marginBottom: "2rem" }}>
          The definitive first-timer&apos;s route. Five cities, two iconic peaks, one
          legendary train ride, and a medieval castle on a lake. Everything in
          the right order, at the right pace. Budget to luxury: CHF 1,200 –
          4,500 per person.
        </p>

        <Link
          href="/itineraries"
          className="es-itin-link"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.75rem",
            fontSize: "0.68rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#9a9187",
            textDecoration: "none",
            borderBottom: "1px solid #2d2920",
            paddingBottom: "3px",
            transition: "color 0.2s, border-color 0.2s",
          }}
        >
          View full itinerary{" "}
          <span className="es-arr" style={{ display: "inline-block", transition: "transform 0.2s" }}>→</span>
        </Link>
      </div>

      <div className="es-itin-img-wrap" style={{ width: "280px", aspectRatio: "3/4", overflow: "hidden", flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=800&fit=crop"
          alt="Classic Switzerland route"
          className="es-itin-img"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1)",
            display: "block",
          }}
        />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   STORIES
─────────────────────────────────────────────────────────────── */
function Stories() {
  return (
    <section id="stories" style={{ padding: "8rem 6vw" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4rem" }}>
        <h2
          style={{
            fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
            fontWeight: 700,
            color: "#ede8df",
          }}
        >
          Read before
          <br />
          <em style={{ fontStyle: "italic", color: "#9a9187" }}>you go</em>
        </h2>
        <Link
          href="/stories"
          className="es-stories-see"
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#9a9187",
            textDecoration: "none",
            borderBottom: "1px solid #1e1b17",
            paddingBottom: "2px",
            transition: "color 0.2s, border-color 0.2s",
          }}
        >
          All stories →
        </Link>
      </div>

      <div
        className="es-story-row"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2px" }}
      >
        {STORIES.map((s) => (
          <Link
            key={s.num}
            href={s.href}
            className="es-story-item"
            style={{
              padding: "2rem 2rem 2rem 0",
              borderRight: "1px solid #1e1b17",
              textDecoration: "none",
              color: "inherit",
              display: "block",
              transition: "opacity 0.2s",
            }}
          >
            <div
              style={{
                    fontSize: "3.5rem",
                fontWeight: 300,
                color: "#5a5040",
                lineHeight: 1,
                marginBottom: "1.5rem",
              }}
            >
              {s.num}
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
              {s.tags.map((t) => (
                <span key={t} style={{ fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: G }}>
                  {t}
                </span>
              ))}
            </div>
            <h3
              style={{
                    fontSize: "1.3rem",
                fontWeight: 400,
                lineHeight: 1.3,
                color: "#ede8df",
                marginBottom: "0.75rem",
              }}
            >
              {s.title}
            </h3>
            <p style={{ fontSize: "0.78rem", color: "#9a9187", lineHeight: 1.65, marginBottom: "1.25rem" }}>
              {s.excerpt}
            </p>
            <div style={{ fontSize: "0.65rem", letterSpacing: "0.08em", color: "#9a9187", display: "flex", gap: "0.75rem" }}>
              <span>{s.author}</span>
              <span>·</span>
              <span>{s.date}</span>
              <span>·</span>
              <span>{s.readTime} read</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   PAGE ROOT
─────────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      <style>{`
        /* ── Keyframes ── */
        @keyframes es-fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes es-revealScale {
          from { transform: scale(1.1); }
          to   { transform: scale(1); }
        }

        /* ── Wrapper ── */
        .es-home {
          background: #0c0b09;
          color: #ede8df;
          font-family: 'DM Sans', 'Geist Sans', sans-serif;
          font-weight: 300;
          line-height: 1.6;
          overflow-x: hidden;
        }
        .es-home ::selection { background: oklch(74% 0.13 63deg); color: #0c0b09; }

        /* ── Hero CTA ── */
        .es-hero-cta:hover { color: oklch(74% 0.13 63deg) !important; border-color: oklch(74% 0.13 63deg) !important; }
        .es-hero-cta:hover .es-arr { transform: translateX(4px) !important; }

        /* ── Divider ── */
        .es-divider { height: 1px; background: #1e1b17; margin: 0 6vw; }

        /* ── Intro ── */
        @media (max-width: 700px) {
          .es-intro { grid-template-columns: 1fr !important; gap: 1.5rem !important; padding: 5rem 6vw !important; }
        }

        /* ── Category items ── */
        .es-cat-item:hover .es-cat-text { background: #131210 !important; }
        .es-cat-item:hover .es-cat-name { color: oklch(74% 0.13 63deg) !important; }
        .es-cat-item:hover .es-cat-link { color: oklch(74% 0.13 63deg) !important; }
        .es-cat-item:hover .es-cat-link .es-arr { transform: translateX(5px) !important; }
        .es-cat-item:hover .es-cat-img { transform: scale(1.04) !important; }
        @media (max-width: 800px) {
          .es-cat-item { grid-template-columns: 1fr !important; direction: ltr !important; min-height: auto !important; }
          .es-cat-item > div:last-child { height: 45vw; min-height: 200px; }
        }

        /* ── Feature ── */
        .es-feature:hover .es-feature-img { transform: scale(1.04); }
        .es-feature-link:hover { color: oklch(74% 0.13 63deg) !important; border-color: oklch(74% 0.13 63deg) !important; }
        .es-feature-link:hover .es-arr { transform: translateX(4px) !important; }
        @media (max-width: 800px) {
          .es-feature { grid-template-columns: 1fr !important; padding: 6rem 6vw !important; gap: 3rem !important; }
        }

        /* ── Itinerary ── */
        .es-itin:hover .es-itin-img { transform: scale(1.04); }
        .es-itin-link:hover { color: oklch(74% 0.13 63deg) !important; border-color: oklch(74% 0.13 63deg) !important; }
        .es-itin-link:hover .es-arr { transform: translateX(4px) !important; }
        @media (max-width: 900px) {
          .es-itin { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .es-itin-label { writing-mode: horizontal-tb !important; transform: none !important; }
          .es-itin-img-wrap { width: 100% !important; aspect-ratio: 16/9 !important; }
        }

        /* ── Stories ── */
        .es-stories-see:hover { color: #9a9187 !important; border-color: #504840 !important; }
        .es-story-item:last-child { border-right: none !important; padding-right: 0 !important; }
        .es-story-item:hover { opacity: 0.7; }
        @media (max-width: 800px) {
          .es-story-row { grid-template-columns: 1fr !important; }
          .es-story-item { border-right: none !important; border-bottom: 1px solid #1e1b17 !important; padding: 2rem 0 !important; }
          .es-story-item:last-child { border-bottom: none !important; }
        }
      `}</style>

      <div className="es-home">
        <Hero />
        <div className="es-divider" />
        <Intro />
        <Categories />
        <Feature />
        <ItinTeaser />
        <Stories />
      </div>
    </>
  );
}
