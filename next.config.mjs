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

      // ── SwissActivities CDN (imgix-backed) ───────────────────────────────────
      { protocol: "https", hostname: "contentapi-swissactivities.imgix.net" },
      { protocol: "https", hostname: "swissactivities.imgix.net" },

      // ── Misc curated sources ─────────────────────────────────────────────────
      { protocol: "https", hostname: "live.staticflickr.com" },
      { protocol: "https", hostname: "i.imgur.com" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days — these images are very stable
  },
  async redirects() {
    return [
      // Stories is the new home for editorial posts (see MASTER_PLAN)
      { source: "/blog/:slug*", destination: "/stories/:slug*", permanent: true },
    ];
  },
};

export default nextConfig;
