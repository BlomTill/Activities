import { NextRequest, NextResponse } from "next/server";
import { mvpActivities } from "@/lib/content/selectors";
import { getMarketplaceLinks } from "@/lib/affiliate";

/**
 * Daily revenue health check (MVP_LAUNCH_PLAN.md §2 Day 7 step 6).
 *
 * Hit by a Vercel cron at 09:00 UTC (see vercel.json). It:
 *   1. Counts MVP activities with NO usable affiliate link (target: 0).
 *   2. Asks the GA4 Data API for affiliate_click count in the last 24h
 *      — only if GA4_PROPERTY_ID + GA4_ACCESS_TOKEN are configured;
 *      otherwise clickCount is null (not a failure — just unconfigured).
 *   3. Emails ALERT_EMAIL (via Resend) when brokenCount > 5, or when
 *      clickCount is a real number and equals 0.
 *
 * Always returns JSON so it doubles as an uptime/manual probe. Auth: if
 * CRON_SECRET is set, require `Authorization: Bearer <CRON_SECRET>`
 * (Vercel Cron sends this automatically when the env var exists).
 */
export const dynamic = "force-dynamic";

interface HealthResult {
  checkedAt: string;
  mvpActivities: number;
  brokenCount: number;
  brokenSample: string[];
  clickCount24h: number | null;
  ga4Configured: boolean;
  alert: boolean;
  alertReason: string | null;
  emailed: boolean;
}

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // no secret configured → open (manual testing)
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/** An MVP activity is "broken" if it produces no usable affiliate link. */
function countBroken(): { broken: number; sample: string[] } {
  let broken = 0;
  const sample: string[] = [];
  for (const a of mvpActivities) {
    const links = getMarketplaceLinks(a, "activity-detail-provider");
    const usable = links.some(
      (l) => typeof l.url === "string" && /^https?:\/\//.test(l.url) && !/\{[a-z]+\}/i.test(l.url),
    );
    if (!usable) {
      broken += 1;
      if (sample.length < 10) sample.push(a.slug);
    }
  }
  return { broken, sample };
}

async function fetchGa4Clicks24h(): Promise<number | null> {
  const propertyId = process.env.GA4_PROPERTY_ID;
  const accessToken = process.env.GA4_ACCESS_TOKEN;
  if (!propertyId || !accessToken) return null;
  try {
    const res = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: "1daysAgo", endDate: "today" }],
          dimensions: [{ name: "eventName" }],
          metrics: [{ name: "eventCount" }],
          dimensionFilter: {
            filter: {
              fieldName: "eventName",
              stringFilter: { value: "affiliate_click" },
            },
          },
        }),
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      rows?: { metricValues?: { value?: string }[] }[];
    };
    const v = data.rows?.[0]?.metricValues?.[0]?.value;
    return v ? Number(v) : 0;
  } catch {
    return null;
  }
}

async function sendAlert(subject: string, body: string): Promise<boolean> {
  const apiKey = process.env.NEWSLETTER_PROVIDER_API_KEY; // Resend key (reused)
  const to = process.env.ALERT_EMAIL;
  if (!apiKey || !to) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "alerts@realswitzerland.ch",
        to,
        subject,
        text: body,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { broken, sample } = countBroken();
  const clickCount24h = await fetchGa4Clicks24h();
  const ga4Configured = clickCount24h !== null;

  let alertReason: string | null = null;
  if (broken > 5) alertReason = `${broken} MVP activities have no usable affiliate link`;
  else if (ga4Configured && clickCount24h === 0)
    alertReason = "Zero affiliate_click events in the last 24h";

  let emailed = false;
  if (alertReason) {
    emailed = await sendAlert(
      `[realswitzerland.ch] revenue alert: ${alertReason}`,
      `Revenue health check ${new Date().toISOString()}\n\n` +
        `${alertReason}\n\n` +
        `MVP activities: ${mvpActivities.length}\n` +
        `Broken: ${broken}${sample.length ? ` (e.g. ${sample.join(", ")})` : ""}\n` +
        `affiliate_click (24h): ${ga4Configured ? clickCount24h : "GA4 API not configured"}\n`,
    );
  }

  const result: HealthResult = {
    checkedAt: new Date().toISOString(),
    mvpActivities: mvpActivities.length,
    brokenCount: broken,
    brokenSample: sample,
    clickCount24h,
    ga4Configured,
    alert: alertReason !== null,
    alertReason,
    emailed,
  };

  // 200 even on alert — the cron + Vercel logs capture the body; a non-200
  // would just look like an outage to uptime monitors.
  return NextResponse.json(result);
}
