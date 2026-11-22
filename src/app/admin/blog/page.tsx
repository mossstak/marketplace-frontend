'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Newspaper, Pencil, Plus, Trash2, X } from 'lucide-react'
import { getRole, isLoggedIn } from '@/auth/auth'
import { roleRedirect } from '@/auth/roleredirect'
import { Button } from '@/components/ui/button'
import {
  createPost,
  deletePost,
  formatPostDate,
  getPosts,
  updatePost,
  type BlogPostInput,
} from '@/lib/blog'
import { type BlogPost } from '@/types/blog'

const emptyForm: BlogPostInput = {
  title: '',
  slug: '',
  category: '',
  coverImage: '',
  excerpt: '',
  content: '',
}

const errorMessage = (e: unknown, fallback: string) => {
  if (axios.isAxiosError(e)) {
    const data = e.response?.data
    return data?.message || (typeof data === 'string' ? data : '') || e.message || fallback
  }
  return fallback
}

const inputClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40'

export default function AdminBlogPage() {
  const router = useRouter()
  const authSnapshot = useMemo(() => {
    const loggedIn = isLoggedIn()
    return { loggedIn, role: loggedIn ? getRole() : null }
  }, [])
  const isAdmin = authSnapshot.loggedIn && authSnapshot.role === 'Admin'

  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<BlogPostInput>(emptyForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authSnapshot.loggedIn || !authSnapshot.role) {
      router.push('/login')
      return
    }
    if (authSnapshot.role !== 'Admin') router.push(roleRedirect(authSnapshot.role))
  }, [router, authSnapshot])

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      setPosts(await getPosts())
    } catch (e) {
      setError(errorMessage(e, 'Failed to load posts.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) fetchPosts()
  }, [isAdmin, fetchPosts])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
    setFormOpen(true)
  }

  const openEdit = (post: BlogPost) => {
    setEditingId(post.id)
    setForm({
      title: post.title,
      slug: post.slug,
      category: post.category,
      coverImage: post.coverImage,
      excerpt: post.excerpt,
      content: post.content,
    })
    setFormError('')
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId(null)
    setFormError('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const payload: BlogPostInput = { ...form, slug: form.slug?.trim() || undefined }
    try {
      setSaving(true)
      setFormError('')
      if (editingId) await updatePost(editingId, payload)
      else await createPost(payload)
      closeForm()
      await fetchPosts()
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setFormError('A post with this slug already exists. Choose a different slug.')
      } else {
        setFormError(errorMessage(err, 'Failed to save post.'))
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return
    try {
      setDeletingId(post.id)
      await deletePost(post.id)
      await fetchPosts()
    } catch (e) {
      alert(errorMessage(e, 'Failed to delete post.'))
    } finally {
      setDeletingId(null)
    }
  }

  const setField =
    (key: keyof BlogPostInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  if (!isAdmin) return <div className="p-6">Loading...</div>

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-amber-500" /> Blog Posts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Create, edit and remove blog posts.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus /> New Post
        </Button>
      </div>

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {editingId ? 'Edit Post' : 'Create Post'}
            </h2>
            <Button type="button" variant="ghost" size="icon" onClick={closeForm} aria-label="Close">
              <X />
            </Button>
          </div>

          {formError && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1 text-sm font-medium text-foreground">
              <span>Title</span>
              <input required value={form.title} onChange={setField('title')} className={inputClass} />
            </label>
            <label className="space-y-1 text-sm font-medium text-foreground">
              <span>Slug <span className="text-muted-foreground font-normal">(optional)</span></span>
              <input value={form.slug ?? ''} onChange={setField('slug')} className={inputClass} placeholder="auto-generated from title" />
            </label>
            <label className="space-y-1 text-sm font-medium text-foreground">
              <span>Category</span>
              <input required value={form.category} onChange={setField('category')} className={inputClass} />
            </label>
            <label className="space-y-1 text-sm font-medium text-foreground">
              <span>Cover Image URL</span>
              <input required type="url" value={form.coverImage} onChange={setField('coverImage')} className={inputClass} />
            </label>
          </div>
          <label className="block space-y-1 text-sm font-medium text-foreground">
            <span>Excerpt</span>
            <textarea required rows={2} value={form.excerpt} onChange={setField('excerpt')} className={inputClass} />
          </label>
          <label className="block space-y-1 text-sm font-medium text-foreground">
            <span>Content</span>
            <textarea required rows={10} value={form.content} onChange={setField('content')} className={inputClass} />
          </label>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeForm}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Post'}
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-muted-foreground">Loading posts...</p>
      ) : error ? (
        <p className="text-destructive">{error}</p>
      ) : posts.length === 0 ? (
        <p className="text-muted-foreground">No posts yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Published</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{post.title}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {formatPostDate(post.publishedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(post)}>
                        <Pencil /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={deletingId === post.id}
                        onClick={() => handleDelete(post)}
                      >
                        <Trash2 /> {deletingId === post.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
