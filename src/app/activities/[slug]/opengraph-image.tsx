import { ImageResponse } from "next/og";
import { getActivityBySlug } from "@/lib/content/selectors";
import { resolveActivityImage } from "@/lib/images";
import { getBestPrice } from "@/lib/types";

// Built into Next 14 (next/og) — no @vercel/og dependency added.
export const alt = "Activity on realswitzerland.ch";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const activity = getActivityBySlug(params.slug);
  if (!activity) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0c0b09",
            color: "#fff",
            fontSize: 56,
            fontWeight: 700,
          }}
        >
          realswitzerland.ch
        </div>
      ),
      size,
    );
  }

  const photo = resolveActivityImage(activity).src;
  const price = getBestPrice(activity, "adult");
  const priceLabel =
    price === null ? "Compare prices" : price === 0 ? "Free entry" : `from CHF ${price}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          alt=""
          width={1200}
          height={630}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background: "linear-gradient(to top, rgba(8,8,8,0.86) 0%, rgba(8,8,8,0.25) 55%, rgba(8,8,8,0.1) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 64,
            right: 64,
            bottom: 56,
            display: "flex",
            flexDirection: "column",
            color: "#fff",
          }}
        >
          <div style={{ display: "flex", fontSize: 26, fontWeight: 600, letterSpacing: 1, color: "#f4b43e" }}>
            realswitzerland.ch
          </div>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 800, lineHeight: 1.1, marginTop: 14 }}>
            {activity.name.length > 70 ? activity.name.slice(0, 67) + "…" : activity.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 22, gap: 18 }}>
            <div
              style={{
                display: "flex",
                background: "#e8634a",
                color: "#fff",
                fontSize: 32,
                fontWeight: 700,
                padding: "10px 22px",
                borderRadius: 999,
              }}
            >
              {priceLabel}
            </div>
            <div style={{ display: "flex", fontSize: 26, color: "rgba(255,255,255,0.85)" }}>
              {activity.location.city}, Switzerland · prices compared
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
