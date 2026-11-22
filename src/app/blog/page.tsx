import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { formatPostDate, getPosts } from '@/lib/blog'

export const metadata: Metadata = { title: 'Blog' }

export default async function Page() {
  const posts = await getPosts()

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Blog
        </h1>
        <p className="mt-3 text-muted-foreground">
          Brewing guides, roaster stories and marketplace news.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">No posts yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <article className="flex flex-col h-full rounded-xl border border-border bg-card overflow-hidden shadow-sm transition duration-200 group-hover:shadow-md group-hover:-translate-y-0.5 group-hover:border-primary/30">
                <div className="relative aspect-3/2 bg-muted overflow-hidden">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="flex flex-col flex-1 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/20">
                      {post.category}
                    </span>
                    <time
                      dateTime={post.publishedAt}
                      className="text-xs text-muted-foreground"
                    >
                      {formatPostDate(post.publishedAt)}
                    </time>
                  </div>
                  <h2 className="mt-3 font-bold text-lg leading-snug text-card-foreground line-clamp-2 transition-colors group-hover:text-primary">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
