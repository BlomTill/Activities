import { NextRequest, NextResponse } from "next/server";

interface NewsletterRequest {
  email?: string;
  intent?: string;
}

function isValidEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

export async function POST(req: NextRequest) {
  let payload: NewsletterRequest;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = payload.email?.trim().toLowerCase() ?? "";
  const intent = payload.intent?.trim() || "deals";

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  const apiKey = process.env.NEWSLETTER_PROVIDER_API_KEY;
  const audienceId = process.env.NEWSLETTER_AUDIENCE_ID;
  if (!apiKey || !audienceId) {
    return NextResponse.json(
      { error: "Newsletter is not configured yet. Please try again later." },
      { status: 503 }
    );
  }

  const upstream = await fetch("https://api.resend.com/contacts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      audience_id: audienceId,
      unsubscribed: false,
      metadata: { intent, source: "realswitzerland" },
    }),
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    // Resend returns 409 when the contact already exists. Treat this as success.
    if (upstream.status === 409 && text.toLowerCase().includes("already exists")) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Could not subscribe right now. Please retry." }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}

