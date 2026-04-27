/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // ── Unsplash ────────────────────────────────────────────────────────────
      { protocol: "https", hostname: "images.unsplash.com" },

      // ── Wikimedia Commons ────────────────────────────────────────────────────
      // Direct image CDN (upload.wikimedia.org) + Special:FilePath redirects
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "commons.wikimedia.org" },

      // ── Pexels ───────────────────────────────────────────────────────────────
      { protocol: "https", hostname: "images.pexels.com" },

      // ── Pixabay ──────────────────────────────────────────────────────────────
      { protocol: "https", hostname: "pixabay.com" },
      { protocol: "https", hostname: "cdn.pixabay.com" },

      // ── Misc curated sources ─────────────────────────────────────────────────
      { protocol: "https", hostname: "live.staticflickr.com" },
      { protocol: "https", hostname: "i.imgur.com" },
    ],
  },
  async redirects() {
    return [
      // Stories is the new home for editorial posts (see MASTER_PLAN)
      { source: "/blog/:slug*", destination: "/stories/:slug*", permanent: true },
    ];
  },
};

export default nextConfig;
