'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/api/api'
import { isLoggedIn } from '@/auth/auth'
import { RefundLog, Order } from '@/types/orderStatus'
import { Package } from 'lucide-react'
import { OrderCard } from '@/components/OrderCard'
import { ShippingModal, ShippingModalState } from '@/components/ShippingModal'
import { RefundModal, RefundModalState } from '@/components/RefundModal'

export default function SellerDashboardOrderPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [shippingModal, setShippingModal] = useState<ShippingModalState | null>(null)
  const [submittingShipping, setSubmittingShipping] = useState(false)

  const [refundModal, setRefundModal] = useState<RefundModalState | null>(null)
  const [submittingRefund, setSubmittingRefund] = useState(false)

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login')
      return
    }

    const fetchSellerOrders = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.get<Order[]>('/Order/seller')
        setOrders(res.data ?? [])
      } catch (err: any) {
        setError(err?.response?.data || 'Failed to load seller orders.')
      } finally {
        setLoading(false)
      }
    }

    fetchSellerOrders()
  }, [router])

  const handleUpdateStatus = async (
    orderId: number,
    nextStatus: number,
    carrier?: string,
    trackingNumber?: string,
  ) => {
    try {
      await api.patch(`/Order/${orderId}/status`, {
        status: nextStatus,
        carrier: carrier || undefined,
        trackingNumber: trackingNumber || undefined,
      })

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: nextStatus,
                carrier: carrier ?? o.carrier,
                trackingNumber: trackingNumber ?? o.trackingNumber,
                shippedAt: nextStatus === 3 ? new Date().toISOString() : o.shippedAt,
                deliveredAt: nextStatus === 5 ? new Date().toISOString() : o.deliveredAt,
              }
            : o,
        ),
      )
    } catch (err: any) {
      alert(err?.response?.data || 'Failed to update order status.')
    }
  }

  const handleConfirmShipped = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shippingModal) return

    setSubmittingShipping(true)
    try {
      await handleUpdateStatus(
        shippingModal.orderId,
        3,
        shippingModal.carrier.trim() || undefined,
        shippingModal.trackingNumber.trim() || undefined,
      )
      setShippingModal(null)
    } finally {
      setSubmittingShipping(false)
    }
  }

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!refundModal) return

    const maxRefund =
      refundModal.order.remainingRefundable ?? refundModal.order.totalAmount
    const refundAmount =
      refundModal.refundType === 'full'
        ? maxRefund
        : parseFloat(refundModal.amount)

    if (isNaN(refundAmount) || refundAmount <= 0) {
      alert('Please enter a valid refund amount.')
      return
    }

    if (refundAmount > maxRefund + 0.005) {
      alert(`Refund amount cannot exceed £${maxRefund.toFixed(2)}.`)
      return
    }

    if (!refundModal.confirmed) {
      alert('Please check the confirmation box to authorize this refund.')
      return
    }

    setSubmittingRefund(true)
    try {
      const res = await api.post(
        `/api/roaster/orders/${refundModal.order.id}/refund`,
        {
          amount: refundAmount,
          reason: refundModal.reason,
          paymentIntentId: refundModal.paymentIntentIdOverride.trim() || undefined,
        },
      )

      const result = res.data
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === refundModal.order.id) {
            const newRefundLog: RefundLog = {
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

      setRefundModal(null)
      alert(
        `Refund of £${refundAmount.toFixed(2)} processed successfully for Package #${refundModal.order.id}.`,
      )
    } catch (err: any) {
      alert(err?.response?.data || err?.message || 'Failed to process refund.')
    } finally {
      setSubmittingRefund(false)
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground p-4">Loading orders...</p>
  if (error) return <p className="text-sm text-red-700 dark:text-red-400 font-medium p-4">{error}</p>

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Package className="h-5 w-5 text-amber-500" /> Incoming Customer Orders
      </h2>

      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No orders received yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
              onOpenShipping={(ord) =>
                setShippingModal({
                  orderId: ord.id,
                  carrier: ord.carrier || 'Royal Mail',
                  trackingNumber: ord.trackingNumber || '',
                })
              }
              onOpenRefund={(ord) => {
                const remaining = ord.remainingRefundable ?? ord.totalAmount
                setRefundModal({
                  order: ord,
                  refundType: 'full',
                  amount: remaining.toFixed(2),
                  reason: 'Out of stock',
                  confirmed: false,
                  paymentIntentIdOverride: '',
                })
              }}
            />
          ))}
        </div>
      )}

      {shippingModal && (
        <ShippingModal
          modal={shippingModal}
          submitting={submittingShipping}
          onClose={() => setShippingModal(null)}
          onSubmit={handleConfirmShipped}
          onChange={setShippingModal}
        />
      )}

      {refundModal && (
        <RefundModal
          modal={refundModal}
          submitting={submittingRefund}
          onClose={() => setRefundModal(null)}
          onSubmit={handleProcessRefund}
          onChange={setRefundModal}
        />
      )}
    </div>
  )
}