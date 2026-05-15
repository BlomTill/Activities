import Link from "next/link";
import { cn } from "@/lib/utils";
import { isRouteEnabled } from "@/lib/constants";

export function AffiliateDisclosure({ className }: { className?: string }) {
  const partnersLive = isRouteEnabled("/partners");
  return (
    <p className={cn("text-xs leading-5 text-gray-500", className)}>
      Booking links may earn us a commission at no extra cost to you.
      {partnersLive ? (
        <>
          {" "}See our{" "}
          <Link href="/partners" className="text-red-600 hover:underline">
            partners disclosure
          </Link>
          .
        </>
      ) : null}
    </p>
  );
}

