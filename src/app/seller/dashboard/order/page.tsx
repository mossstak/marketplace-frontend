'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/api/api'
import { isLoggedIn } from '@/auth/auth'
import { Package } from 'lucide-react'

type OrderItem = {
  id: number
  productVariantId: number
  productName?: string
  size?: string
  quantity: number
  unitPrice: number
  subtotal: number
}

type Order = {
  id: number
  totalAmount: number
  status: number
  createdAt: string
  items: OrderItem[]
}

const formatOrderStatus = (status: number) => {
  const map: Record<number, { label: string; color: string }> = {
    1: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
    2: { label: 'Paid', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    3: { label: 'Shipped', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
    4: { label: 'Cancelled', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  }
  return map[status] ?? { label: 'Unknown', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' }
}

export default function SellerDashboardOrderPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  const handleUpdateStatus = async (orderId: number, nextStatus: number) => {
    try {
      await api.patch(`/Order/${orderId}/status`, { status: nextStatus })

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
      )
    } catch (err: any) {
      alert(err?.response?.data || 'Failed to update order status.')
    }
  }

  if (loading) return <p className="text-sm text-gray-400 p-4">Loading orders...</p>
  if (error) return <p className="text-sm text-red-400 p-4">{error}</p>

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <Package className="h-5 w-5 text-amber-400" /> Incoming Customer Orders
      </h2>

      {orders.length === 0 ? (
        <p className="text-sm text-gray-400">No orders received yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = formatOrderStatus(order.status)

            return (
              <div
                key={order.id}
                className="rounded-xl border border-gray-700 bg-gray-900/60 p-4 sm:p-5 text-sm space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-700/60 pb-3">
                  <div>
                    <span className="font-semibold text-white">
                      Order #{order.id}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </span>

                    <span className="font-bold text-amber-300 text-base">
                      £{Number(order.totalAmount ?? 0).toFixed(2)}
                    </span>

                    {/* Action Button: Visible for Pending (1) and Paid (2) */}
                    {(order.status === 1 || order.status === 2) && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(order.id, 3)} // 3 = OrderStatus.Shipped
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition"
                      >
                        Mark as Shipped
                      </button>
                    )}
                  </div>
                </div>

                {/* Items List */}
                <div className="flex flex-col gap-2 w-full">
                  {(order.items ?? []).map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center text-xs bg-gray-800/60 px-4 py-2.5 rounded-lg border border-gray-700/40 w-full"
                    >
                      <div className="flex flex-col truncate pr-4">
                        <span className="text-gray-200 font-medium truncate">
                          {item.productName ??
                            `Variant #${item.productVariantId}`}
                        </span>
                        <span className="text-gray-400 text-[11px]">
                          {item.size ? `Size: ${item.size} • ` : ''}Qty:{' '}
                          {item.quantity}
                        </span>
                      </div>
                      <span className="font-semibold text-white whitespace-nowrap text-sm">
                        £
                        {Number(
                          item.subtotal ?? item.unitPrice * item.quantity,
                        ).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}