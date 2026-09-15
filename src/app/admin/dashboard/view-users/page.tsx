'use client'

import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { api } from '@/api/api'
import { type AdminUser } from '@/types/user'

type EditForm = {
  firstName: string
  lastName: string
  email: string
}

type RoleFilter = 'ALL' | 'Seller' | 'Buyer'

export default function ViewUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState<RoleFilter>('ALL')
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.get<AdminUser[]>('/User/all')
        setUsers(res.data)
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          (typeof e?.response?.data === 'string' ? e.response.data : '') ||
          e?.message ||
          'Failed to load users.'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return

    try {
      await api.delete(`/User/delete/${id}`)
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        (typeof e?.response?.data === 'string' ? e.response.data : '') ||
        e?.message ||
        'Failed to delete user.'
      alert(msg)
    }
  }

  const handleSave = async (id: string, form: EditForm) => {
    await api.patch(`/User/edituser/${id}`, form)
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...form } : u)))
    setEditingId(null)
  }

  const filteredUsers = useMemo(() => {
    if (activeFilter === 'ALL') return users
    return users.filter((u) => u.roles?.includes(activeFilter))
  }, [users, activeFilter])

  const counts = useMemo(
    () => ({
      all: users.length,
      sellers: users.filter((u) => u.roles?.includes('Seller')).length,
      buyers: users.filter((u) => u.roles?.includes('Buyer')).length,
    }),
    [users],
  )

  if (loading) return <div className="p-6">Loading accounts...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Manage Accounts</h1>
          <p className="text-sm text-gray-400 mt-1">
            View, filter, edit, and remove marketplace user accounts.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="inline-flex rounded-lg bg-gray-900/60 p-1 border border-gray-700/50 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeFilter === 'ALL'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('Seller')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeFilter === 'Seller'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Roasters ({counts.sellers})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('Buyer')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeFilter === 'Buyer'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Buyers ({counts.buyers})
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-gray-800/40 border border-gray-700/60 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <p className="p-6 text-sm text-gray-400">
            No accounts found in this category.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700/60 text-left text-sm">
              <thead>
                <tr className="border-b border-gray-700/60 text-gray-400 bg-gray-900/20">
                  <th className="py-3 pl-6 pr-4 font-semibold">Name</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Roles</th>
                  <th className="py-3 pl-4 pr-6 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredUsers.map((u) =>
                  editingId === u.id ? (
                    <EditRow
                      key={u.id}
                      user={u}
                      onCancel={() => setEditingId(null)}
                      onSave={(form) => handleSave(u.id, form)}
                    />
                  ) : (
                    <tr
                      key={u.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3.5 pl-6 pr-4 font-medium text-white whitespace-nowrap">
                        {u.firstName} {u.lastName}
                      </td>
                      <td className="py-3.5 px-4 text-gray-300">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {u.roles && u.roles.length > 0 ? (
                            u.roles.map((role) => (
                              <span
                                key={role}
                                className="inline-flex items-center rounded-md bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-300 ring-1 ring-inset ring-gray-700"
                              >
                                {role}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </div>
                      </td>
                      <td className="flex justify-around p-3">
                        <button
                          type="button"
                          className="font-medium text-sky-400 hover:text-sky-300 transition-colors mr-3"
                          onClick={() => setEditingId(u.id)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="font-medium text-rose-400 hover:text-rose-300 transition-colors"
                          onClick={() => handleDelete(u.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function EditRow({
  user,
  onCancel,
  onSave,
}: {
  user: AdminUser
  onCancel: () => void
  onSave: (form: EditForm) => Promise<void>
}) {
  const [form, setForm] = useState<EditForm>({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const handleSubmit = async () => {
    try {
      setSaving(true)
      setErr('')
      await onSave(form)
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const data = e.response?.data
        setErr(typeof data === 'string' ? data : 'Failed to save changes.')
      } else {
        setErr('Failed to save changes.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <tr className="bg-gray-900/50">
      <td className="py-3 pl-6 pr-4 align-top">
        <div className="flex gap-2">
          <input
            className="w-full rounded border border-gray-600 bg-gray-950 text-white px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
            value={form.firstName}
            onChange={(e) =>
              setForm((p) => ({ ...p, firstName: e.target.value }))
            }
            placeholder="First"
          />
          <input
            className="w-full rounded border border-gray-600 bg-gray-950 text-white px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
            value={form.lastName}
            onChange={(e) =>
              setForm((p) => ({ ...p, lastName: e.target.value }))
            }
            placeholder="Last"
          />
        </div>
      </td>
      <td className="py-3 px-4 align-top">
        <input
          className="w-full rounded border border-gray-600 bg-gray-950 text-white px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          placeholder="Email"
        />
        {err && <p className="text-rose-400 text-xs mt-1">{err}</p>}
      </td>
      <td className="py-3 px-4 align-top">
        <div className="flex flex-wrap gap-1.5 pt-1">
          {user.roles && user.roles.length > 0 ? (
            user.roles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center rounded-md bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-400 ring-1 ring-inset ring-gray-700"
              >
                {role}
              </span>
            ))
          ) : (
            <span className="text-gray-500">—</span>
          )}
        </div>
      </td>
      <td className="flex justify-around p-3">
        <button
          type="button"
          className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors mr-3 disabled:opacity-50"
          disabled={saving}
          onClick={handleSubmit}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          className="text-gray-400 hover:text-white font-medium transition-colors disabled:opacity-50"
          disabled={saving}
          onClick={onCancel}
        >
          Cancel
        </button>
      </td>
    </tr>
  )
}
