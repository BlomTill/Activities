import Link from "next/link";
import { Calendar, ArrowLeft, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { getBlogPostBySlug, blogPosts } from "@/data/blog-posts";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getBlogPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: `${post.title} | ${SITE_NAME} Stories`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
  };
}

export default function StoryPage({ params }: { params: { slug: string } }) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/stories"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-700 mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> All stories
      </Link>

      <article>
        <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-gray-500 mb-5">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span>&middot;</span>
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {post.author}
          </span>
        </div>

        <h1 className="font-serif text-3xl md:text-5xl text-gray-900 leading-tight mb-5">
          {post.title}
        </h1>

        <div className="flex gap-2 mb-10">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="prose prose-lg prose-gray max-w-none prose-headings:font-serif prose-headings:text-gray-900 prose-a:text-red-700 prose-strong:text-gray-900">
          {post.content.split("\n").map((line, i) => {
            if (line.startsWith("## ")) {
              return (
                <h2 key={i} className="text-2xl font-serif mt-10 mb-4">
                  {line.replace("## ", "")}
                </h2>
              );
            }
            if (line.startsWith("**") && line.endsWith("**")) {
              return (
                <p key={i} className="font-semibold text-gray-900 mt-4">
                  {line.replace(/\*\*/g, "")}
                </p>
              );
            }
            if (line.startsWith("- **")) {
              const match = line.match(/- \*\*(.+?)\*\*\s*[—–-]\s*(.+)/);
              if (match) {
                return (
                  <div key={i} className="flex gap-2 py-1">
                    <span className="text-red-700 font-medium">&bull;</span>
                    <p>
                      <strong>{match[1]}</strong> — {match[2]}
                    </p>
                  </div>
                );
              }
            }
            if (line.startsWith("- ")) {
              return (
                <div key={i} className="flex gap-2 py-1">
                  <span className="text-red-700">&bull;</span>
                  <p>{line.replace("- ", "")}</p>
                </div>
              );
            }
            if (line.match(/^\d+\.\s\*\*/)) {
              const match = line.match(/^\d+\.\s\*\*(.+?)\*\*\s*(.*)/);
              if (match) {
                return (
                  <div key={i} className="py-2 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">{match[1]}</h3>
                    {match[2] && <p className="text-gray-600 mt-1">{match[2]}</p>}
                  </div>
                );
              }
            }
            if (line.trim() === "") return <div key={i} className="h-4" />;
            return (
              <p key={i} className="text-gray-700 leading-relaxed">
                {line}
              </p>
            );
          })}
        </div>
      </article>

      <div className="mt-20 border-t pt-10">
        <div className="mb-10">
          <NewsletterSignup />
        </div>
        <h2 className="font-serif text-2xl text-gray-900 mb-6">More stories</h2>
        <div className="space-y-3">
          {blogPosts
            .filter((p) => p.slug !== post.slug)
            .slice(0, 3)
            .map((p) => (
              <Link key={p.slug} href={`/stories/${p.slug}`}>
                <div className="group rounded-lg border border-gray-200 p-4 hover:border-gray-900 transition-colors">
                  <h3 className="font-semibold text-gray-900 group-hover:text-red-700 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.excerpt}</p>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
