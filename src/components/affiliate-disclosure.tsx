import Link from "next/link";
import { cn } from "@/lib/utils";

export function AffiliateDisclosure({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs leading-5 text-gray-500", className)}>
      Booking links may earn us a commission at no extra cost to you. See our{" "}
      <Link href="/partners" className="text-red-600 hover:underline">
        partners disclosure
      </Link>
      .
    </p>
  );
}

