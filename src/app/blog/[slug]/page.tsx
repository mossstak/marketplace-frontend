import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { formatPostDate, getPostBySlug } from '@/lib/blog'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'Post not found' }
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, images: [post.coverImage] },
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  return (
    <article className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to blog
      </Link>

      <header className="mt-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/20">
            {post.category}
          </span>
          <time dateTime={post.publishedAt} className="text-sm text-muted-foreground">
            {formatPostDate(post.publishedAt)}
          </time>
        </div>
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
          {post.title}
        </h1>
      </header>

      <div className="relative mt-8 aspect-3/2 overflow-hidden rounded-xl border border-border bg-muted">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          priority
          unoptimized
          sizes="(min-width: 768px) 768px, 100vw"
          className="object-cover"
        />
      </div>

      <div className="mt-8 space-y-5 text-base sm:text-lg leading-relaxed text-foreground/90">
        {post.content.split('\n\n').map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </article>
  )
}
