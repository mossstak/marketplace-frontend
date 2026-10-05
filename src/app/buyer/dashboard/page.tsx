'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardPage from '../../../components/DashboardPage'
import { getRole, isLoggedIn } from '@/auth/auth'
import { api } from '@/api/api'
import { type UserDetails } from '@/types/user'
import Link from 'next/link'
import { Package, ShoppingBag, Store, Sparkles, ArrowRight, Truck } from 'lucide-react'
import BecomeRoasterModal from '@/components/BecomeRoasterModal'

type OrderItemData = {
  id: number
  productVariantId: number
  productName?: string
  companyName?: string
  size?: string
  quantity: number
  unitPrice: number
  subtotal: number
}

type SubOrderData = {
  id: number
  roasterId?: string
  companyName?: string
  status: string | number
  subtotal: number
  shippingCost?: number
  totalAmount: number
  trackingNumber?: string
  carrier?: string
  shippedAt?: string
  deliveredAt?: string
  items: OrderItemData[]
}

type OrderData = {
  id: number
  totalAmount: number
  subtotalAmount?: number
  status: string | number
  createdAt: string
  paymentIntentId?: string
  packagesCount?: number
  subOrders?: SubOrderData[]
  items?: OrderItemData[]
  legacyItems?: OrderItemData[]
}

const formatOrderStatus = (status: string | number) => {
  if (typeof status === 'string') {
    return { label: status, color: 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30' }
  }
  const statuses: Record<number, { label: string; color: string }> = {
    1: { label: 'Pending', color: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30' },
    2: { label: 'Paid', color: 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30' },
    3: { label: 'Shipped', color: 'bg-green-500/15 text-green-800 dark:text-green-300 border-green-500/30' },
    4: { label: 'Cancelled', color: 'bg-red-500/15 text-red-800 dark:text-red-300 border-red-500/30' },
    5: { label: 'Delivered', color: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30' },
    6: { label: 'Refunded', color: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30' },
    7: { label: 'Partially Refunded', color: 'bg-violet-500/15 text-violet-800 dark:text-violet-300 border-violet-500/30' },
  }
  return statuses[status] ?? { label: 'Unknown', color: 'bg-muted text-muted-foreground border-border' }
}

export default function BuyerDashboard() {
  const router = useRouter()
  const [details, setDetails] = useState<UserDetails | null>(null)
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showBecomeRoasterModal, setShowBecomeRoasterModal] = useState(false)

  const handleCancelOrder = async (orderId: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this package? Stock will be restored.',
    )
    if (!confirmed) return

    try {
      await api.delete(`/Order/delete/${orderId}`)
      const ordersRes = await api.get<OrderData[]>('/Order/mine')
      setOrders(ordersRes.data ?? [])
    } catch (err: any) {
      alert(err?.response?.data || 'Failed to cancel package.')
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

  const isRoaster =
    details?.hasRoasterProfile ||
    details?.roles?.includes('Seller') ||
    getRole() === 'Seller'

  return (
    <DashboardPage
      sidebar={
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-foreground px-2 py-1">
            Buyer Dashboard
          </p>
          <Link
            href="/buyer/dashboard"
            className="block rounded-lg px-3 py-2 bg-amber-500/15 text-amber-950 dark:text-amber-200 font-bold border border-amber-500/30 text-sm shadow-xs"
          >
            My Orders
          </Link>
          <Link
            href="/shop"
            className="block rounded-lg px-3 py-2 hover:bg-muted text-muted-foreground hover:text-foreground text-sm transition"
          >
            Explore Shop
          </Link>
          {!isRoaster && (
            <button
              type="button"
              onClick={() => setShowBecomeRoasterModal(true)}
              className="w-full text-left rounded-lg px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" /> Become a Roaster
            </button>
          )}
          <Link
            href="/settings"
            className="block rounded-lg px-3 py-2 hover:bg-muted text-muted-foreground hover:text-foreground text-sm transition"
          >
            Account Settings
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-card text-card-foreground border border-border p-6 sm:p-8 rounded-2xl shadow-xs">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Welcome back{details?.firstName ? `, ${details.firstName}` : ''}!
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Track your artisan coffee orders and view your purchase history.
          </p>
        </div>

        {/* Become a Roaster Banner/Card (for accounts without a roaster profile) */}
        {!isRoaster && (
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-linear-to-r from-stone-900 via-amber-950/40 to-stone-900 p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <Store className="h-3.5 w-3.5" /> Start Selling
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Become a Roaster on Roaster&apos;s Market
                </h2>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Turn your coffee craft into a business. Set up your roastery
                  storefront, sell signature bags directly to customers, and
                  configure instant payouts with Stripe Express.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowBecomeRoasterModal(true)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-400 text-zinc-950 font-bold hover:bg-amber-300 transition shadow-lg text-sm cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" /> Become a Roaster
                </button>
                <Link
                  href="/become-roaster"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-gray-700 bg-gray-900/60 hover:bg-gray-800 text-gray-200 text-xs font-medium transition"
                >
                  Learn More <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Orders Section */}
        <div className="bg-card text-card-foreground border border-border p-6 sm:p-8 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Package className="h-5 w-5 text-amber-500" /> My Orders (
              {orders.length})
            </h2>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Order More
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground py-4">Loading your orders...</p>
          ) : error ? (
            <p className="text-sm text-red-700 dark:text-red-400 font-medium py-4">{error}</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm mb-4">
                You haven&apos;t placed any orders yet.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary/90 px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs transition"
              >
                Browse Shop
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const parentStatusInfo = formatOrderStatus(order.status)
                const packages: SubOrderData[] =
                  order.subOrders && order.subOrders.length > 0
                    ? order.subOrders
                    : [
                        {
                          id: order.id,
                          roasterId: undefined,
                          companyName:
                            order.items?.[0]?.companyName || 'Artisan Roaster',
                          status: order.status,
                          subtotal: order.subtotalAmount ?? order.totalAmount,
                          totalAmount: order.totalAmount,
                          items: order.items ?? [],
                        },
                      ]

                return (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-border bg-card text-card-foreground p-5 sm:p-6 shadow-xs space-y-4"
                  >
                    {/* Checkout Session Container Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-bold text-foreground text-base">
                          Order #{order.id}
                        </span>
                        <span className="text-muted-foreground text-xs">•</span>
                        <span className="text-xs text-muted-foreground">
                          Placed on{' '}
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString(
                                'en-GB',
                                {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                },
                              )
                            : ''}
                        </span>
                        <span className="text-muted-foreground text-xs">•</span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/30">
                          <Package className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                          {packages.length}{' '}
                          {packages.length === 1 ? 'Package' : 'Packages'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${parentStatusInfo.color}`}
                        >
                          {parentStatusInfo.label}
                        </span>
                        <span className="font-bold text-foreground text-base">
                          Total: £{Number(order.totalAmount ?? 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Sub-Packages Nested Inside Checkout Container */}
                    <div className="space-y-3">
                      {packages.map((pkg, idx) => {
                        const pkgStatusInfo = formatOrderStatus(pkg.status)
                        const isPending =
                          pkg.status === 1 || pkg.status === 'Pending'

                        return (
                          <div
                            key={pkg.id || idx}
                            className="rounded-xl border border-border bg-muted/20 p-4 sm:p-5 space-y-3 transition hover:border-amber-500/40"
                          >
                            {/* Roaster / Package Header */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                              <div className="flex items-center gap-2">
                                <Store className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                <span className="font-semibold text-foreground text-sm">
                                  {pkg.companyName || 'Artisan Roaster'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  (Package #{pkg.id})
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${pkgStatusInfo.color}`}
                                >
                                  {pkgStatusInfo.label}
                                </span>
                                <span className="font-semibold text-foreground text-sm">
                                  £
                                  {Number(
                                    pkg.totalAmount ?? pkg.subtotal ?? 0,
                                  ).toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {/* Tracking Information Banner if Shipped */}
                            {(pkg.trackingNumber || pkg.carrier) && (
                              <div className="flex flex-wrap items-center gap-2 text-xs bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl text-amber-950 dark:text-amber-200">
                                <Truck className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                <span className="font-medium">
                                  Shipped via {pkg.carrier || 'Standard Carrier'}
                                </span>
                                {pkg.trackingNumber && (
                                  <span className="font-mono bg-amber-500/20 px-2 py-0.5 rounded text-foreground font-semibold">
                                    Tracking: {pkg.trackingNumber}
                                  </span>
                                )}
                                {pkg.shippedAt && (
                                  <span className="text-muted-foreground ml-auto">
                                    Shipped on{' '}
                                    {new Date(
                                      pkg.shippedAt,
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Items in this specific Roaster Package */}
                            <div className="space-y-1.5">
                              <div className="flex flex-col gap-2 w-full">
                                {(pkg.items ?? []).map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex justify-between items-center text-xs bg-muted/40 px-4 py-2.5 rounded-xl border border-border w-full"
                                  >
                                    <div className="flex flex-col min-w-0 pr-4">
                                      <span className="text-foreground font-medium truncate">
                                        {item.productName ??
                                          `Variant #${item.productVariantId}`}
                                      </span>
                                      <span className="text-muted-foreground text-[11px]">
                                        {item.size
                                          ? `Size: ${item.size} • `
                                          : ''}
                                        Qty: {item.quantity}
                                      </span>
                                    </div>
                                    <span className="font-semibold text-foreground whitespace-nowrap text-sm text-right min-w-17.5">
                                      £
                                      {Number(
                                        item.subtotal ??
                                          item.unitPrice * item.quantity,
                                      ).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Cancel Package Action (Only available if this package is Pending) */}
                            {isPending && (
                              <div className="flex justify-end pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleCancelOrder(pkg.id)}
                                  className="text-xs px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30 rounded-lg transition cursor-pointer font-medium"
                                >
                                  Cancel Package
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Become a Roaster Modal */}
      <BecomeRoasterModal
        isOpen={showBecomeRoasterModal}
        onClose={() => setShowBecomeRoasterModal(false)}
        initialAddress={details ?? undefined}
      />
    </DashboardPage>
  )
}
