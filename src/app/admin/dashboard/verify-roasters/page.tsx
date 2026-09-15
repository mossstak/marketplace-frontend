'use client'

import { useEffect, useState } from 'react'
import { api } from '@/api/api'
import { type RoasterDetails } from '@/types/roaster'
import { CheckCircle, XCircle, Clock, Store, AlertCircle, RefreshCw } from 'lucide-react'

export default function AdminRoastersPage() {
  const [roasters, setRoasters] = useState<RoasterDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState<string | number | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const fetchRoasters = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await api.get<RoasterDetails[]>('/api/admin/roasters')
      setRoasters(res.data ?? [])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load roaster profiles.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoasters()
  }, [])

  const handleUpdateStatus = async (roasterId: string | number, newStatus: 'Approved' | 'Rejected' | 'Pending') => {
    try {
      setActionLoadingId(roasterId)
      setFeedback(null)
      await api.patch(`/api/admin/roasters/${roasterId}/status`, { status: newStatus })

      setRoasters((prev) =>
        prev.map((r) =>
          String(r.id) === String(roasterId) ? { ...r, approvalStatus: newStatus } : r
        )
      )
      setFeedback(`Roaster status successfully updated to "${newStatus}".`)
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update roaster status.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const getStatusBadge = (status: any) => {
    if (status === 'Approved' || status === 1 || status === 'approved') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30">
          <CheckCircle className="h-3.5 w-3.5" /> Approved
        </span>
      )
    }
    if (status === 'Rejected' || status === 2 || status === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
          <XCircle className="h-3.5 w-3.5" /> Rejected
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
        <Clock className="h-3.5 w-3.5" /> Pending
      </span>
    )
  }

  return (
    <div className="bg-gray-800/80 border border-gray-700/80 w-full p-6 sm:p-8 rounded-2xl shadow-lg space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Store className="h-6 w-6 text-amber-400" /> Roaster Verification
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Review and manage seller approval statuses for public storefront display.
          </p>
        </div>
        <button
          onClick={fetchRoasters}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-900/60 text-xs font-medium text-gray-300 hover:text-white transition disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl border border-green-500/30 bg-green-500/10 text-green-300 text-sm flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-green-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl border border-red-500/40 bg-red-950/40 text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-400">Loading roaster applications...</div>
      ) : roasters.length === 0 ? (
        <div className="py-12 text-center text-gray-400">No roaster profiles found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900/60 text-xs uppercase tracking-wider text-gray-400 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Company Name</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Website</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/60">
              {roasters.map((r) => {
                const isActing = actionLoadingId === r.id
                return (
                  <tr key={r.id} className="hover:bg-gray-700/20 transition">
                    <td className="px-4 py-3 text-xs text-gray-500">#{r.id}</td>
                    <td className="px-4 py-3 font-semibold text-white">
                      {r.companyName || 'Unnamed Roastery'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {[r.city, r.country].filter(Boolean).join(', ') || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {r.websiteUrl ? (
                        <a
                          href={r.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-400 hover:underline"
                        >
                          Visit
                        </a>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(r.approvalStatus)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={isActing}
                          onClick={() => handleUpdateStatus(r.id, 'Approved')}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30 transition disabled:opacity-50 cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={isActing}
                          onClick={() => handleUpdateStatus(r.id, 'Rejected')}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 transition disabled:opacity-50 cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
