"use client";

import { useState } from "react";
import { Mail, Check, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type NewsletterIntent = "deals" | "destinations" | "region" | "itinerary";

const COPY: Record<NewsletterIntent, { title: string; description: string; success: string }> = {
  deals: {
    title: "Get Weekly Swiss Deals",
    description: "Join travelers who want the best prices on Swiss activities without digging through dozens of sites.",
    success: "We’ll send deal-focused picks and price-aware trip ideas.",
  },
  destinations: {
    title: "Get destination-specific ideas",
    description: "Tell us which parts of Switzerland interest you and we’ll send useful, region-led recommendations.",
    success: "We’ll send destination-led ideas instead of generic travel blasts.",
  },
  region: {
    title: "Get region-specific trip ideas",
    description: "Receive curated activity picks, itineraries, and budget suggestions tailored to this region.",
    success: "We’ll keep the emails focused on this region and similar trip ideas.",
  },
  itinerary: {
    title: "Get itinerary-ready travel emails",
    description: "Receive route ideas, budget-friendly swaps, and booking reminders for multi-day Swiss trips.",
    success: "We’ll send planning-focused ideas for building a better Swiss itinerary.",
  },
};

export function NewsletterSignup({
  variant = "inline",
  intent = "deals",
  title,
  description,
}: {
  variant?: "inline" | "banner";
  intent?: NewsletterIntent;
  title?: string;
  description?: string;
}) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const copy = COPY[intent];
  const heading = title || copy.title;
  const body = description || copy.description;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes("@")) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className={`flex items-center gap-3 ${variant === "banner" ? "justify-center py-6" : "py-4"}`}>
        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100">
          <Check className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">You&apos;re on the list!</p>
          <p className="text-sm text-gray-500">{copy.success}</p>
        </div>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="mx-auto max-w-4xl px-4 py-10 text-center">
          <Mail className="h-8 w-8 mx-auto mb-3 opacity-80" />
          <h3 className="text-xl font-bold mb-1">{heading}</h3>
          <p className="text-red-100 text-sm mb-5 max-w-md mx-auto">{body}</p>
          <form onSubmit={handleSubmit} className="flex max-w-md mx-auto gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="h-11 bg-white/10 border-white/20 text-white placeholder:text-red-200 flex-1"
            />
            <Button type="submit" className="h-11 bg-white text-red-600 hover:bg-red-50 font-semibold px-6">
              Subscribe <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </form>
          <p className="text-[11px] text-red-200 mt-3">No spam, unsubscribe anytime. Free forever.</p>
        </div>
      </section>
    );
  }

  return (
    <div className="rounded-xl border bg-gray-50 p-5">
      <div className="flex items-center gap-2 mb-2">
        <Mail className="h-5 w-5 text-red-600" />
        <h3 className="font-semibold text-gray-900">{heading}</h3>
      </div>
      <p className="text-sm text-gray-500 mb-3">{body}</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="h-9 text-sm text-gray-900"
        />
        <Button type="submit" size="sm" className="bg-red-600 hover:bg-red-700 text-white h-9">
          Subscribe
        </Button>
      </form>
    </div>
  );
}
