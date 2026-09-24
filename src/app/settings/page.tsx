'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Lock, ArrowLeft, Shield, Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { api } from '@/api/api'
import { isLoggedIn } from '@/auth/auth'
import type { UserDetails } from '@/types/user'
import ProfileImageUploader from '@/components/settings/ProfileImageUploader'
import PersonalInfoForm from '@/components/settings/PersonalInfoForm'
import ChangePasswordForm from '@/components/ChangePasswordForm'

type SettingsTab = 'profile' | 'security'

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [user, setUser] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login?redirect=/settings')
      return
    }

    const loadUserProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await api.get<UserDetails>('/User/me')
        setUser(res.data)
      } catch (err: unknown) {
        setError('Failed to load profile details. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [router])

  const handleImageUpdated = (newUrl: string | null) => {
    if (user) {
      setUser({ ...user, profileImageUrl: newUrl })
    }
  }

  const handleUserUpdated = (updatedUser: UserDetails) => {
    setUser(updatedUser)
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600 dark:text-amber-400" />
        <p className="text-xs text-stone-500 font-medium">Loading your settings...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50/50 dark:bg-zinc-950/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Account Preferences</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Settings
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              Manage your personal profile, custom avatar image, and account credentials.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition self-start sm:self-center"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Marketplace
          </Link>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-xs text-red-700 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1.5 bg-stone-200/70 dark:bg-zinc-900 rounded-xl border border-stone-300 dark:border-zinc-800 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-zinc-800 text-stone-950 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-foreground'
            }`}
          >
            <User className="h-4 w-4" />
            Profile & Avatar
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'security'
                ? 'bg-white dark:bg-zinc-800 text-stone-950 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-foreground'
            }`}
          >
            <Shield className="h-4 w-4" />
            Password & Security
          </button>
        </div>

        {/* Tab 1: Profile & Avatar Content */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 1. Profile Picture Uploader */}
            <ProfileImageUploader
              currentImageUrl={user?.profileImageUrl}
              firstName={user?.firstName}
              lastName={user?.lastName}
              onImageUpdated={handleImageUpdated}
            />

            {/* 2. Personal Information Form */}
            <PersonalInfoForm
              initialUser={user}
              onUserUpdated={handleUserUpdated}
            />
          </div>
        )}

        {/* Tab 2: Security & Password Content */}
        {activeTab === 'security' && (
          <div className="animate-in fade-in duration-200">
            <ChangePasswordForm />
          </div>
        )}
      </div>
    </div>
  )
}