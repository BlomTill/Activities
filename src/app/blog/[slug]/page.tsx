import Link from "next/link";
import { Calendar, ArrowLeft, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getBlogPostBySlug, blogPosts } from "@/data/blog-posts";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Blog
      </Link>

      <article>
        <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span>&middot;</span>
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {post.author}
          </span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 md:text-4xl mb-4">{post.title}</h1>

        <div className="flex gap-2 mb-8">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-a:text-red-600 prose-strong:text-gray-900">
          {post.content.split("\n").map((line, i) => {
            if (line.startsWith("## ")) {
              return <h2 key={i} className="text-xl font-bold mt-8 mb-3">{line.replace("## ", "")}</h2>;
            }
            if (line.startsWith("**") && line.endsWith("**")) {
              return <p key={i} className="font-semibold text-gray-900 mt-4">{line.replace(/\*\*/g, "")}</p>;
            }
            if (line.startsWith("- **")) {
              const match = line.match(/- \*\*(.+?)\*\*\s*[—–-]\s*(.+)/);
              if (match) {
                return (
                  <div key={i} className="flex gap-2 py-1">
                    <span className="text-red-600 font-medium">&bull;</span>
                    <p><strong>{match[1]}</strong> — {match[2]}</p>
                  </div>
                );
              }
            }
            if (line.startsWith("- ")) {
              return (
                <div key={i} className="flex gap-2 py-1">
                  <span className="text-red-600">&bull;</span>
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
            return <p key={i} className="text-gray-600 leading-relaxed">{line}</p>;
          })}
        </div>
      </article>

      {/* Related Posts */}
      <div className="mt-16 border-t pt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">More from the Blog</h2>
        <div className="space-y-4">
          {blogPosts
            .filter((p) => p.slug !== post.slug)
            .slice(0, 3)
            .map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`}>
                <div className="group rounded-lg border p-4 hover:bg-gray-50 transition-colors">
                  <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{p.excerpt}</p>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
