import Link from "next/link";
import { Calendar, ArrowRight, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { blogPosts } from "@/data/blog-posts";

export const metadata = {
  title: "Blog",
  description: "Tips, guides, and inspiration for activities across Switzerland.",
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 mb-4">
          <BookOpen className="h-4 w-4" />
          Blog
        </div>
        <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
          Swiss Activity Guide
        </h1>
        <p className="mt-3 text-gray-500 max-w-xl mx-auto">
          Tips, guides, and inspiration for making the most of Switzerland — on any budget.
        </p>
      </div>

      <div className="space-y-8">
        {blogPosts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <article className="group rounded-2xl border bg-white p-6 transition-all hover:shadow-lg hover:border-red-100">
              <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span>&middot;</span>
                <span>{post.author}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                {post.title}
              </h2>
              <p className="mt-2 text-gray-500">{post.excerpt}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-2">
                  {post.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <span className="flex items-center gap-1 text-sm font-medium text-red-600 group-hover:gap-2 transition-all">
                  Read more <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
