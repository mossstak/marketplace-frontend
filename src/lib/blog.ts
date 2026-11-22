import axios from 'axios'
import { api } from '@/api/api'
import { type BlogPost } from '@/types/blog'

export type BlogPostInput = {
  title: string
  slug?: string
  category: string
  coverImage: string
  excerpt: string
  content: string
}

export const getPosts = async (): Promise<BlogPost[]> => {
  try {
    const res = await api.get<BlogPost[]>('/Blog/all')
    return res.data ?? []
  } catch {
    return []
  }
}

export const getPostBySlug = async (
  slug: string,
): Promise<BlogPost | undefined> => {
  try {
    const res = await api.get<BlogPost>(`/Blog/${slug}`)
    return res.data ?? undefined
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) return undefined
    throw e
  }
}

export const createPost = async (data: BlogPostInput): Promise<BlogPost> => {
  const res = await api.post<BlogPost>('/Blog', data)
  return res.data
}

export const updatePost = async (
  id: string,
  data: BlogPostInput,
): Promise<BlogPost> => {
  const res = await api.put<BlogPost>(`/Blog/${id}`, data)
  return res.data
}

export const deletePost = async (id: string): Promise<void> => {
  await api.delete(`/Blog/${id}`)
}

export const formatPostDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
