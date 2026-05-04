// Shared confetti + "yodel banner" easter egg trigger.
// Used by Header (5x logo click) and the Konami easter egg in home-client.

const PALETTE = ["#E8634A", "#F4B43E", "#2E6F5E", "#6FB6D9", "#FFFDF6"];

export function triggerConfetti(count = 80, colors: string[] = PALETTE) {
  if (typeof document === "undefined") return;
  for (let i = 0; i < count; i++) {
    const e = document.createElement("div");
    e.className = "alpine-confetti";
    e.style.left = Math.random() * 100 + "vw";
    e.style.background = colors[i % colors.length];
    e.style.transform = `rotate(${Math.random() * 360}deg)`;
    e.style.animationDuration = 3 + Math.random() * 2 + "s";
    e.style.animationDelay = Math.random() * 0.6 + "s";
    e.style.borderRadius = Math.random() < 0.3 ? "50%" : "2px";
    document.body.appendChild(e);
    setTimeout(() => e.remove(), 6000);
  }
}

export function triggerYodel() {
  if (typeof document === "undefined") return;
  const banner = document.createElement("div");
  banner.className = "alpine-yodel-banner";
  banner.innerHTML =
    "🎺 YODEL-AY-EE-OOO! ✨ You found the easter egg. (CHF 0 off, but the view is on us.)";
  banner.addEventListener("click", () => banner.remove());
  document.body.appendChild(banner);
  setTimeout(() => banner.remove(), 4500);
  triggerConfetti(120);
}
