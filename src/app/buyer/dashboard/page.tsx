'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardPage from '../../../components/DashboardPage'
import { isLoggedIn } from '@/auth/auth'
import { api } from '@/api/api'
import { type UserDetails } from '@/types/user'
import Link from 'next/link'
import { Package, ShoppingBag } from 'lucide-react'

type OrderItemData = {
  id: number
  productVariantId: number
  productName?: string
  size?: string
  quantity: number
  unitPrice: number
  subtotal: number
}

type OrderData = {
  id: number
  totalAmount: number
  status: string | number
  createdAt: string
  items: OrderItemData[]
}

const formatOrderStatus = (status: string | number) => {
  if (typeof status === 'string') return status
  const statuses: Record<number, string> = {
    1: 'Pending',
    2: 'Paid',
    3: 'Shipped',
    4: 'Cancelled',
  }
  return statuses[status] ?? 'Unknown'
}

export default function BuyerDashboard() {
  const router = useRouter()
  const [details, setDetails] = useState<UserDetails | null>(null)
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const handleCancelOrder = async (orderId: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this order? Stock will be restored.',
    )
    if (!confirmed) return

    try {
      await api.delete(`/Order/delete/${orderId}`)
      // Remove the cancelled order from UI state
      setOrders((prev) => prev.filter((order) => order.id !== orderId))
    } catch (err: any) {
      alert(err?.response?.data || 'Failed to cancel order.')
    }
  }

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login')
      return
    }

    const loadData = async () => {
      try {
        setLoading(true)
        setError('')

        const [userRes, ordersRes] = await Promise.allSettled([
          api.get<UserDetails>('/User/me'),
          api.get<OrderData[]>('/Order/mine'),
        ])

        if (userRes.status === 'fulfilled') {
          setDetails(userRes.value.data)
        }

        if (ordersRes.status === 'fulfilled') {
          setOrders(ordersRes.value.data ?? [])
        }
      } catch {
        setError('Failed to load dashboard.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  return (
    <DashboardPage
      sidebar={
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-300 px-2 py-1">
            Buyer Dashboard
          </p>
          <Link
            href="/buyer/dashboard"
            className="block rounded-lg px-3 py-2 bg-white/20 font-bold text-white text-sm"
          >
            My Orders
          </Link>
          <Link
            href="/shop"
            className="block rounded-lg px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-200 text-sm transition"
          >
            Explore Shop
          </Link>
          <Link
            href="/settings"
            className="block rounded-lg px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-200 text-sm transition"
          >
            Account Settings
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gray-800/80 border border-gray-700/80 p-6 sm:p-8 rounded-2xl shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Welcome back{details?.firstName ? `, ${details.firstName}` : ''}!
          </h1>
          <p className="text-sm sm:text-base text-gray-300 mt-1">
            Track your artisan coffee orders and view your purchase history.
          </p>
        </div>

        {/* Orders Section */}
        <div className="bg-gray-800/80 border border-gray-700/80 p-6 sm:p-8 rounded-2xl shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-amber-400" /> My Orders (
              {orders.length})
            </h2>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:underline"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Order More
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-gray-300 py-4">Loading your orders...</p>
          ) : error ? (
            <p className="text-sm text-red-400 py-4">{error}</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-300 text-sm mb-4">
                You haven't placed any orders yet.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-gray-100 transition"
              >
                Browse Shop
              </Link>
            </div>
          ) : (
            <div className="space-y-4 ">
              {orders.map((order) => (
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {formatOrderStatus(order.status)}
                      </span>
                      <span className="font-bold text-amber-300 text-base">
                        £{Number(order.totalAmount ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Items ({order.items?.length ?? 0}):
                    </p>
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

                          {/* Allow buyer to cancel if pending */}
                          {(order.status === 1 ||
                            order.status === 'Pending') && (
                            <button
                              type="button"
                              onClick={() => handleCancelOrder(order.id)}
                              className="text-xs px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition"
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardPage>
  )
}
