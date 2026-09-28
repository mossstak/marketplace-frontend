'use client'

import { Truck, MapPin, User, RotateCcw } from 'lucide-react'
import { Order } from '@/types/orderStatus'
import { OrderRefundBanner } from './OrderRefundBanner'
import { formatOrderStatus, formatAddress } from '@/utils/formatters'

interface OrderCardProps {
  order: Order
  onOpenShipping: (order: Order) => void
  onOpenRefund: (order: Order) => void
  onUpdateStatus: (orderId: number, status: number) => void
}

export function OrderCard({
  order,
  onOpenShipping,
  onOpenRefund,
  onUpdateStatus,
}: OrderCardProps) {
  const statusInfo = formatOrderStatus(order.status)
  const address = formatAddress(order.shippingAddress)

  const maxRefund =
    order.remainingRefundable ?? order.totalAmount ?? order.subtotal ?? 0
  const isFullyRefunded = order.status === 6 || maxRefund <= 0.005
  const canRefund =
    (order.status === 1 ||
      order.status === 2 ||
      order.status === 3 ||
      order.status === 7) &&
    maxRefund > 0.005

  return (
    <div className="rounded-2xl border border-border bg-card text-card-foreground p-4 sm:p-5 text-sm space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              Package #{order.id}
            </span>
            {order.parentOrderId && (
              <span className="text-xs text-amber-900 dark:text-amber-200 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 font-medium">
                Checkout #{order.parentOrderId}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            Placed on{' '}
            {order.createdAt
              ? new Date(order.createdAt).toLocaleDateString()
              : ''}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>

          <span className="font-bold text-foreground text-base">
            £{Number(order.totalAmount ?? order.subtotal ?? 0).toFixed(2)}
          </span>

          {!isFullyRefunded && (order.status === 1 || order.status === 2) && (
            <button
              type="button"
              onClick={() => onOpenShipping(order)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              Mark as Shipped
            </button>
          )}

          {!isFullyRefunded && order.status === 3 && (
            <button
              type="button"
              onClick={() => onUpdateStatus(order.id, 5)}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              Mark as Delivered
            </button>
          )}

          {canRefund && (
            <button
              type="button"
              onClick={() => onOpenRefund(order)}
              className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Issue Refund
            </button>
          )}
        </div>
      </div>

      {/* Tracking info */}
      {(order.trackingNumber || order.carrier) && (
        <div className="flex flex-wrap items-center gap-2 text-xs bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl text-amber-950 dark:text-amber-200">
          <Truck className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="font-medium">
            Carrier: {order.carrier || 'Standard'}
          </span>
          {order.trackingNumber && (
            <span className="font-mono bg-amber-500/20 px-2 py-0.5 rounded text-foreground font-semibold">
              Tracking: {order.trackingNumber}
            </span>
          )}
          {order.shippedAt && (
            <span className="text-muted-foreground ml-auto">
              Shipped on {new Date(order.shippedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      {/* Refunds summary */}
      {order.refunds && order.refunds.length > 0 && (
        <OrderRefundBanner
          refunds={order.refunds}
          totalRefunded={order.totalRefunded}
          remainingRefundable={order.remainingRefundable}
        />
      )}

      {/* Customer & Shipping Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-muted/40 p-3.5 rounded-xl border border-border">
        {order.buyer && (
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <span className="text-muted-foreground block font-medium">Customer:</span>
              <span className="text-foreground font-medium">
                {order.buyer.firstName} {order.buyer.lastName}
              </span>
              {order.buyer.email && (
                <span className="text-muted-foreground block">{order.buyer.email}</span>
              )}
            </div>
          </div>
        )}

        {address && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <span className="text-muted-foreground block font-medium">Ship To:</span>
              {address.line && (
                <span className="text-foreground font-medium block">{address.line}</span>
              )}
              {address.region && (
                <span className="text-muted-foreground block">{address.region}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Package Items:
        </span>
        <div className="flex flex-col gap-2 w-full">
          {(order.items ?? []).map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center text-xs bg-muted/30 px-4 py-2.5 rounded-xl border border-border w-full"
            >
              <div className="flex flex-col truncate pr-4">
                <span className="text-foreground font-medium truncate">
                  {item.productName ?? `Variant #${item.productVariantId}`}
                </span>
                <span className="text-muted-foreground text-[11px]">
                  {item.size ? `Size: ${item.size} • ` : ''}Qty: {item.quantity}
                </span>
              </div>
              <span className="font-semibold text-foreground whitespace-nowrap text-sm">
                £
                {Number(
                  item.subtotal ?? item.unitPrice * item.quantity,
                ).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
