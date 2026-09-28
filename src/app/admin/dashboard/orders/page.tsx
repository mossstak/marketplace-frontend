'use client'

import { useEffect, useMemo, useState } from 'react'
import { api } from '@/api/api'
import {
  Package,
  Search,
  Filter,
  RotateCcw,
  ExternalLink,
  AlertTriangle,
  X,
} from 'lucide-react'

type OrderItem = {
  id: number
  productVariantId: number
  productName: string
  size?: string
  quantity: number
  unitPrice: number
  subtotal: number
}

type RefundRecord = {
  id: number
  amount: number
  stripeRefundId?: string
  reason?: string
  initiatedBy: string
  createdAt: string
}

type AdminOrder = {
  subOrderId: number
  parentOrderId: number
  paymentIntentId?: string
  buyerEmail: string
  buyerName: string
  roasterId?: string
  roasterName: string
  roasterStripeAccountId?: string
  totalAmount: number
  subtotal: number
  shippingCost: number
  status: number
  createdAt: string
  shippedAt?: string
  deliveredAt?: string
  carrier?: string
  trackingNumber?: string
  totalRefunded: number
  remainingRefundable: number
  refunds: RefundRecord[]
  items: OrderItem[]
}

const formatOrderStatus = (status: number) => {
  const map: Record<number, { label: string; color: string }> = {
    1: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
    2: { label: 'Paid', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    3: { label: 'Shipped', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
    4: { label: 'Cancelled', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
    5: { label: 'Delivered', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    6: { label: 'Refunded', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    7: { label: 'Partially Refunded', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
  }
  return map[status] ?? { label: 'Unknown', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' }
}

export default function AdminOrdersAndRefundsPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters & Search
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Admin Override Modal
  const [overrideModal, setOverrideModal] = useState<{
    order: AdminOrder
    refundType: 'full' | 'partial'
    amount: string
    reason: string
    paymentIntentIdOverride: string
    offlineRefund: boolean
  } | null>(null)
  const [submittingOverride, setSubmittingOverride] = useState(false)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await api.get<AdminOrder[]>('/api/admin/orders')
      setOrders(res.data ?? [])
    } catch (err: any) {
      setError(err?.response?.data || 'Failed to load marketplace orders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  // Filter & Search logic
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Status filter
      if (selectedStatus === 'PAID' && o.status !== 2) return false
      if (selectedStatus === 'PENDING' && o.status !== 1) return false
      if (selectedStatus === 'SHIPPED' && o.status !== 3) return false
      if (
        selectedStatus === 'REFUNDED' &&
        o.status !== 6 &&
        o.status !== 7 &&
        o.totalRefunded <= 0
      )
        return false

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesId =
          o.subOrderId.toString().includes(q) ||
          o.parentOrderId.toString().includes(q)
        const matchesBuyer =
          o.buyerEmail?.toLowerCase().includes(q) ||
          o.buyerName?.toLowerCase().includes(q)
        const matchesRoaster = o.roasterName?.toLowerCase().includes(q)
        const matchesItems = o.items?.some((i) =>
          i.productName?.toLowerCase().includes(q),
        )

        if (!matchesId && !matchesBuyer && !matchesRoaster && !matchesItems) {
          return false
        }
      }

      return true
    })
  }, [orders, selectedStatus, searchQuery])

  const handleProcessAdminRefund = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!overrideModal) return

    const maxRefund =
      overrideModal.order.remainingRefundable ?? overrideModal.order.totalAmount
    const refundAmount =
      overrideModal.refundType === 'full'
        ? maxRefund
        : parseFloat(overrideModal.amount)

    if (isNaN(refundAmount) || refundAmount <= 0) {
      alert('Please enter a valid refund amount.')
      return
    }

    if (refundAmount > maxRefund + 0.005) {
      alert(`Refund amount cannot exceed £${maxRefund.toFixed(2)}.`)
      return
    }

    if (!overrideModal.reason.trim()) {
      alert('Please specify an administrative reason for this override.')
      return
    }

    if (!overrideModal.order.paymentIntentId && !overrideModal.paymentIntentIdOverride.trim() && !overrideModal.offlineRefund) {
      alert('This order has no Stripe PaymentIntent linked. Please either provide a Stripe PaymentIntent ID or check "Process as Offline / Database-Only Refund".')
      return
    }

    setSubmittingOverride(true)
    try {
      const res = await api.post(
        `/api/admin/orders/${overrideModal.order.subOrderId}/refund`,
        {
          amount: refundAmount,
          reason: overrideModal.reason.trim(),
          paymentIntentId: overrideModal.paymentIntentIdOverride.trim() || undefined,
          offlineRefund: overrideModal.offlineRefund,
        },
      )

      const result = res.data
      setOrders((prev) =>
        prev.map((o) => {
          if (o.subOrderId === overrideModal.order.subOrderId) {
            const newRefundLog: RefundRecord = {
              id: Date.now(),
              amount: result.refundAmount,
              stripeRefundId: result.stripeRefundId,
              reason: result.reason,
              initiatedBy: result.initiatedBy,
              createdAt: result.createdAt,
            }
            return {
              ...o,
              status: result.status,
              totalRefunded: result.totalRefunded,
              remainingRefundable: result.remainingRefundable,
              refunds: [newRefundLog, ...(o.refunds || [])],
            }
          }
          return o
        }),
      )

      setOverrideModal(null)
      alert(
        `Admin Override: Successfully refunded £${refundAmount.toFixed(2)} on Sub-Order #${overrideModal.order.subOrderId}.`,
      )
    } catch (err: any) {
      alert(err?.response?.data || err?.message || 'Failed to process admin refund.')
    } finally {
      setSubmittingOverride(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header and Summary stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-700/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Package className="h-6 w-6 text-amber-400" /> Marketplace Orders &
            Refunds
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Global order fulfillment and Stripe Connect refund administration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs bg-gray-800 text-gray-300 px-3 py-1.5 rounded-lg border border-gray-700">
            Total Sub-Orders: <strong className="text-white">{orders.length}</strong>
          </span>
          <button
            type="button"
            onClick={fetchOrders}
            className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-lg transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <Filter className="h-4 w-4 text-gray-400 shrink-0" />
          {[
            { id: 'ALL', label: 'All Orders' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'PAID', label: 'Paid' },
            { id: 'SHIPPED', label: 'Shipped' },
            { id: 'REFUNDED', label: 'Refunded' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer border ${
                selectedStatus === tab.id
                  ? 'bg-amber-400 text-zinc-950 font-bold border-amber-400'
                  : 'bg-gray-800/80 text-gray-300 border-gray-700 hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80 shrink-0">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, email, roaster..."
            className="w-full pl-9 pr-3 py-1.5 bg-gray-800/90 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="text-center py-12 bg-gray-800/40 rounded-xl border border-gray-700">
          <p className="text-gray-300 text-sm">Loading orders & refunds...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/40 rounded-xl border border-gray-700">
          <p className="text-gray-400 text-sm">No orders match the selected filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-700/80 bg-gray-900/60 shadow-lg">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-800/90 text-gray-400 uppercase tracking-wider text-[11px] border-b border-gray-700">
              <tr>
                <th className="py-3 px-4">Order IDs</th>
                <th className="py-3 px-4">Buyer</th>
                <th className="py-3 px-4">Roaster</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-center">Fulfillment</th>
                <th className="py-3 px-4 text-center">Refund Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/60">
              {filteredOrders.map((o) => {
                const statusInfo = formatOrderStatus(o.status)
                const isFullyRefunded =
                  o.status === 6 || o.remainingRefundable <= 0.005
                const isPartiallyRefunded =
                  o.status === 7 || (o.totalRefunded > 0 && !isFullyRefunded)

                return (
                  <tr
                    key={o.subOrderId}
                    className="hover:bg-white/[0.02] transition"
                  >
                    {/* IDs */}
                    <td className="py-3 px-4 align-top">
                      <div className="font-semibold text-white">
                        Sub #{o.subOrderId}
                      </div>
                      <div className="text-gray-400 text-[11px]">
                        Checkout #{o.parentOrderId}
                      </div>
                      <div className="text-gray-500 text-[10px] mt-0.5">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Buyer */}
                    <td className="py-3 px-4 align-top">
                      <div className="text-white font-medium">{o.buyerName}</div>
                      <div className="text-gray-400 text-[11px]">{o.buyerEmail}</div>
                    </td>

                    {/* Roaster */}
                    <td className="py-3 px-4 align-top">
                      <div className="text-amber-300 font-medium">
                        {o.roasterName}
                      </div>
                      {o.roasterStripeAccountId && (
                        <div className="text-gray-400 text-[10px] font-mono truncate max-w-[120px]">
                          {o.roasterStripeAccountId}
                        </div>
                      )}
                    </td>

                    {/* Items */}
                    <td className="py-3 px-4 align-top">
                      <div className="space-y-0.5 max-w-[180px]">
                        {o.items.map((i) => (
                          <div key={i.id} className="truncate text-gray-200">
                            {i.productName} (x{i.quantity})
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Total */}
                    <td className="py-3 px-4 align-top text-right whitespace-nowrap">
                      <div className="font-bold text-white text-sm">
                        £{Number(o.totalAmount).toFixed(2)}
                      </div>
                      {o.shippingCost > 0 && (
                        <div className="text-gray-400 text-[10px]">
                          incl. £{Number(o.shippingCost).toFixed(2)} ship
                        </div>
                      )}
                    </td>

                    {/* Fulfillment Status */}
                    <td className="py-3 px-4 align-top text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </span>
                      {o.carrier && (
                        <div className="text-gray-400 text-[10px] mt-1">
                          {o.carrier}
                        </div>
                      )}
                    </td>

                    {/* Refund Status */}
                    <td className="py-3 px-4 align-top text-center">
                      {isFullyRefunded ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Fully Refunded
                        </span>
                      ) : isPartiallyRefunded ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                            Partial: £{Number(o.totalRefunded).toFixed(2)}
                          </span>
                          <div className="text-gray-400 text-[10px]">
                            Rem: £{Number(o.remainingRefundable).toFixed(2)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-[11px]">None</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 align-top text-right">
                      {!isFullyRefunded ? (
                        <button
                          type="button"
                          onClick={() => {
                            setOverrideModal({
                              order: o,
                              refundType: 'full',
                              amount: (
                                o.remainingRefundable ?? o.totalAmount
                              ).toFixed(2),
                              reason: 'Roaster unresponsive',
                              paymentIntentIdOverride: '',
                              offlineRefund: false,
                            })
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold transition cursor-pointer"
                        >
                          <RotateCcw className="h-3 w-3" /> Admin Refund Override
                        </button>
                      ) : (
                        <span className="text-gray-500 text-[11px] italic">
                          Closed
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Admin Override Refund Modal */}
      {overrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-gray-900 border border-red-500/40 rounded-2xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-gray-700 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-red-400" /> Admin Refund
                Override - Sub-Order #{overrideModal.order.subOrderId}
              </h3>
              <button
                type="button"
                onClick={() => setOverrideModal(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleProcessAdminRefund}
              className="space-y-4 text-xs"
            >
              {/* Payout & Stripe Details */}
              <div className="bg-gray-800/60 p-3.5 rounded-xl border border-gray-700/60 space-y-2">
                <span className="font-semibold text-gray-300 uppercase tracking-wider block">
                  Payout & Stripe Details:
                </span>
                <div className="grid grid-cols-2 gap-2 text-gray-300">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Roaster:</span>
                    <span className="font-medium text-white">
                      {overrideModal.order.roasterName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Connected Account:</span>
                    <span className="font-mono text-amber-300 text-[11px]">
                      {overrideModal.order.roasterStripeAccountId || 'Platform Direct'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Buyer Email:</span>
                    <span className="text-white">{overrideModal.order.buyerEmail}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Stripe PaymentIntent:</span>
                    {overrideModal.order.paymentIntentId ? (
                      <a
                        href={`https://dashboard.stripe.com/test/payments/${overrideModal.order.paymentIntentId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-400 hover:underline font-mono text-[11px]"
                      >
                        {overrideModal.order.paymentIntentId.slice(0, 14)}...
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-amber-400 italic">None recorded</span>
                    )}
                  </div>
                </div>
              </div>

              {/* If no paymentIntent recorded on order, give admin option to provide one or mark as offline */}
              {!overrideModal.order.paymentIntentId && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 space-y-3">
                  <div className="text-amber-300 text-xs font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                    No Stripe PaymentIntent Linked to this Order
                  </div>
                  <div>
                    <label className="block text-gray-300 text-[11px] font-medium mb-1">
                      Stripe PaymentIntent or Charge ID (Optional if issuing Stripe refund):
                    </label>
                    <input
                      type="text"
                      disabled={overrideModal.offlineRefund}
                      value={overrideModal.paymentIntentIdOverride}
                      onChange={(e) =>
                        setOverrideModal({
                          ...overrideModal,
                          paymentIntentIdOverride: e.target.value,
                        })
                      }
                      placeholder="e.g. pi_3UKN3P2Mpu7OcFsC0RGsAqta"
                      className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-amber-400 disabled:opacity-50"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                    <input
                      type="checkbox"
                      checked={overrideModal.offlineRefund}
                      onChange={(e) =>
                        setOverrideModal({
                          ...overrideModal,
                          offlineRefund: e.target.checked,
                        })
                      }
                      className="rounded border-gray-700 bg-gray-800 text-amber-500 focus:ring-amber-400"
                    />
                    <span>Process as Offline / Database-Only Refund (Skip Stripe API call)</span>
                  </label>
                </div>
              )}

              {/* Financial Balance Summary */}
              <div className="grid grid-cols-3 gap-2 bg-gray-800/40 p-3 rounded-xl border border-gray-700/40 text-center">
                <div>
                  <span className="text-gray-400 text-[11px] block">Order Total</span>
                  <span className="font-bold text-white text-sm">
                    £{Number(overrideModal.order.totalAmount).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Already Refunded</span>
                  <span className="font-bold text-purple-300 text-sm">
                    £{Number(overrideModal.order.totalRefunded).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Max Available</span>
                  <span className="font-bold text-emerald-400 text-sm font-mono">
                    £{Number(overrideModal.order.remainingRefundable).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Refund Type Selection */}
              <div>
                <label className="block font-medium text-gray-300 mb-1.5">
                  Refund Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setOverrideModal({
                        ...overrideModal,
                        refundType: 'full',
                        amount: overrideModal.order.remainingRefundable.toFixed(2),
                      })
                    }
                    className={`py-2 px-3 rounded-lg font-medium border text-center transition cursor-pointer ${
                      overrideModal.refundType === 'full'
                        ? 'bg-red-600 border-red-400 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Full Refund (£
                    {overrideModal.order.remainingRefundable.toFixed(2)})
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setOverrideModal({
                        ...overrideModal,
                        refundType: 'partial',
                        amount: '',
                      })
                    }
                    className={`py-2 px-3 rounded-lg font-medium border text-center transition cursor-pointer ${
                      overrideModal.refundType === 'partial'
                        ? 'bg-red-600 border-red-400 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Partial Amount
                  </button>
                </div>
              </div>

              {/* Partial Amount Input */}
              {overrideModal.refundType === 'partial' && (
                <div>
                  <label className="block font-medium text-gray-300 mb-1">
                    Custom Refund Amount (£)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={overrideModal.order.remainingRefundable}
                    value={overrideModal.amount}
                    onChange={(e) =>
                      setOverrideModal({
                        ...overrideModal,
                        amount: e.target.value,
                      })
                    }
                    placeholder="e.g. 15.00"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono focus:outline-none focus:border-red-400"
                  />
                </div>
              )}

              {/* Reason Text Field */}
              <div>
                <label className="block font-medium text-gray-300 mb-1">
                  Reason for Admin Override
                </label>
                <input
                  type="text"
                  value={overrideModal.reason}
                  onChange={(e) =>
                    setOverrideModal({
                      ...overrideModal,
                      reason: e.target.value,
                    })
                  }
                  placeholder="e.g. Roaster unresponsive, Dispute resolution, Customer escalation"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-400"
                />
              </div>

              {/* Warning Notice */}
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-200 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <p>
                  As Administrator, this action immediately instructs Stripe to
                  reverse the connected transfer and return funds to the customer.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setOverrideModal(null)}
                  className="px-4 py-2 rounded-lg font-medium text-gray-300 hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOverride}
                  className="px-4 py-2 rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50 cursor-pointer"
                >
                  {submittingOverride ? 'Processing...' : 'Process Override Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
