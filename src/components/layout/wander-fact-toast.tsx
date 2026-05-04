"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const SWISS_FACTS = [
  "There are four official Swiss languages — German, French, Italian and Romansh.",
  "Switzerland has 1,500 lakes — you're never more than 16 km from one.",
  "The Swiss eat more chocolate per person than any other country: ~10 kg per year.",
  "There are no official capital cities — Bern is the de facto capital but it's not legal.",
  "The longest staircase in the world climbs Niesen mountain: 11,674 steps.",
  "Switzerland has more than 7,000 km of marked hiking trails.",
  "The Glacier Express isn't actually express — it's the slowest express train in the world.",
  "Swiss banks were the first to introduce numbered accounts in the 1930s.",
  "More than 60% of Switzerland is mountainous — but only the Alps get the postcards.",
  "The Swiss flag is one of only two square national flags in the world.",
  "The CERN Large Hadron Collider sits underneath the Franco-Swiss border.",
  "Velcro was invented in Switzerland after a walk with a sticky-burr-covered dog.",
];

const PAGES_WHERE_FACT_SHOWS = ["/", "/activities"];

/**
 * Drops a "Did you know?" Swiss-fact toast in the corner ~4.5s after landing
 * on the home or activities page. Auto-dismisses after 9s. Only shows once
 * per browser session (sessionStorage).
 */
export function WanderFactToast() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [fact, setFact] = useState("");
  const shownThisSession = useRef(false);

  useEffect(() => {
    // Read once. If already shown this session, never show again.
    try {
      if (sessionStorage.getItem("wander.factShown") === "1") {
        shownThisSession.current = true;
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (shownThisSession.current) return;
    if (!PAGES_WHERE_FACT_SHOWS.includes(pathname)) return;

    const showT = setTimeout(() => {
      setFact(SWISS_FACTS[Math.floor(Math.random() * SWISS_FACTS.length)]);
      setVisible(true);
      shownThisSession.current = true;
      try {
        sessionStorage.setItem("wander.factShown", "1");
      } catch {
        /* ignore */
      }
    }, 4500);

    return () => clearTimeout(showT);
  }, [pathname]);

  useEffect(() => {
    if (!visible) return;
    const hideT = setTimeout(() => handleClose(), 9000);
    return () => clearTimeout(hideT);
  }, [visible]);

  function handleClose() {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 350);
  }

  if (!visible) return null;

  return (
    <div
      className={"wander-fact-toast" + (closing ? " out" : "")}
      role="status"
      aria-live="polite"
    >
      <span className="fact-emoji" aria-hidden>🇨🇭</span>
      <div className="fact-body">
        <div className="fact-kicker">Did you know?</div>
        <div className="fact-text">{fact}</div>
      </div>
      <button
        type="button"
        className="fact-x"
        onClick={handleClose}
        aria-label="Dismiss fact"
      >
        ×
      </button>
    </div>
  );
}
