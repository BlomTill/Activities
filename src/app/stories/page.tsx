import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, ArrowRight, Feather } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { blogPosts } from "@/lib/content/selectors";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Stories — ${SITE_NAME}`,
  description:
    "Editorial long-reads, essays and first-person accounts from the Swiss alps and beyond. Slow travel, told well.",
};

/**
 * /stories is the new editorial home. /blog remains a legacy alias
 * that redirects here via next.config.mjs.
 */
export default function StoriesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-14 max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700 mb-4">
          <Feather className="h-3.5 w-3.5" />
          Stories &amp; essays
        </div>
        <h1 className="font-serif italic text-4xl text-gray-900 md:text-5xl leading-tight">
          Slow travel, told well.
        </h1>
        <p className="mt-3 text-lg text-gray-600 leading-relaxed">
          Long-form dispatches from the valleys, passes, huts and hidden
          corners of Switzerland. No listicles. Just the places worth
          getting to.
        </p>
      </div>

      <div className="space-y-10">
        {blogPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/stories/${post.slug}`}
            className="group block border-b border-gray-200 pb-10 last:border-b-0"
          >
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span>&middot;</span>
              <span>{post.author}</span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-gray-900 group-hover:text-red-700 transition-colors leading-snug">
              {post.title}
            </h2>
            <p className="mt-3 text-gray-600 leading-relaxed">{post.excerpt}</p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-2">
                {post.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-700 group-hover:gap-2.5 transition-all">
                Read <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
