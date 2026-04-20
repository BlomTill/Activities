/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Wikimedia Commons direct image CDN (used by the photo resolver)
      { protocol: "https", hostname: "upload.wikimedia.org" },
      // Wikimedia Special:FilePath (returns 302 → upload.wikimedia.org)
      { protocol: "https", hostname: "commons.wikimedia.org" },
      // Useful if you later curate OpenStreetMap / Mapillary / Flickr photos
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
