const AFFILIATE_PARAMS: Record<string, string> = {
  "getyourguide.com": "partner_id=XXXXXXX&utm_medium=online_publisher",
  "viator.com": "pid=P00XXXXX&mcid=42383&medium=link",
  "klook.com": "aid=XXXXX",
  "swissactivities.com": "tap_a=XXXXX",
};

export function getAffiliateUrl(bookingUrl: string): string {
  try {
    const url = new URL(bookingUrl);
    for (const [domain, params] of Object.entries(AFFILIATE_PARAMS)) {
      if (url.hostname.includes(domain)) {
        const separator = url.search ? "&" : "?";
        return `${bookingUrl}${separator}${params}`;
      }
    }
    return bookingUrl;
  } catch {
    return bookingUrl;
  }
}
