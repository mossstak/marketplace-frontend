'use client'

import axios from 'axios'
import { useEffect, useState } from 'react'
import { api } from '@/api/api'
import { type AdminUser } from '@/types/user'

type EditForm = {
  firstName: string
  lastName: string
  email: string
}

export default function ViewUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
  }

  const roasters = (users ?? []).filter((u) => u.roles?.includes('Seller'))
  const buyers = (users ?? []).filter((u) => u.roles?.includes('Buyer'))

  if (loading) return <div className="p-6">Loading accounts...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Manage Accounts</h1>
      <UserTable
        title="Roasters"
        users={roasters}
        onDelete={handleDelete}
        onSave={handleSave}
      />
      <UserTable
        title="Buyers"
        users={buyers}
        onDelete={handleDelete}
        onSave={handleSave}
      />
    </div>
  )
}

function UserTable({
  title,
  users,
  onDelete,
  onSave,
}: {
  title: string
  users: AdminUser[]
  onDelete: (id: string) => void
  onSave: (id: string, form: EditForm) => Promise<void>
}) {
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="rounded-xl bg-gray-800/40 border border-gray-600/60 p-4 sm:p-5">
      <h2 className="text-base sm:text-lg font-semibold mb-3">
        {title} ({users.length})
      </h2>
      {users.length === 0 ? (
        <p className="text-sm text-gray-400">No {title.toLowerCase()} found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-600 text-left text-sm">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="py-2.5 pr-4 font-semibold">Name</th>
                <th className="py-2.5 pr-4 font-semibold">Email</th>
                <th className="py-2.5 pr-4 font-semibold">Roles</th>
                <th className="py-2.5 pr-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {users.map((u) =>
                editingId === u.id ? (
                  <EditRow
                    key={u.id}
                    user={u}
                    onCancel={() => setEditingId(null)}
                    onSave={async (form) => {
                      await onSave(u.id, form)
                      setEditingId(null)
                    }}
                  />
                ) : (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 pr-4 font-medium">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-300">{u.email}</td>
                    <td className="py-2.5 pr-4 text-gray-300">{u.roles ? u.roles.join(', ') : '—'}</td>
                    <td className="py-2.5 pr-4 space-x-3 whitespace-nowrap">
                      <button
                        className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
                        onClick={() => setEditingId(u.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-400 hover:text-red-300 underline cursor-pointer"
                        onClick={() => onDelete(u.id)}
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
    <tr className="border-b last:border-0">
      <td className="py-2 pr-4 space-y-1">
        <input
          className="w-full rounded border p-1"
          value={form.firstName}
          onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
          placeholder="First name"
        />
        <input
          className="w-full rounded border p-1"
          value={form.lastName}
          onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
          placeholder="Last name"
        />
      </td>
      <td className="py-2 pr-4 align-top">
        <input
          className="w-full rounded border p-1"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          placeholder="Email"
        />
        {err && <p className="text-red-500 text-xs mt-1">{err}</p>}
      </td>
      <td className="py-2 pr-4 align-top">{user.roles ? user.roles.join(', ') : '—'}</td>
      <td className="py-2 pr-4 align-top space-x-3">
        <button
          className="text-green-600 hover:underline disabled:opacity-50"
          disabled={saving}
          onClick={handleSubmit}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          className="text-gray-600 hover:underline disabled:opacity-50"
          disabled={saving}
          onClick={onCancel}
        >
          Cancel
        </button>
      </td>
    </tr>
  )
}
