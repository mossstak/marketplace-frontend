export type OrderItem = {
  id: number
  productVariantId: number
  productName?: string
  size?: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export type RefundLog = {
  id: number
  amount: number
  stripeRefundId?: string
  reason?: string
  initiatedBy: string
  createdAt: string
}

export type Order = {
  id: number
  parentOrderId?: number
  paymentIntentId?: string
  totalAmount: number
  subtotal?: number
  shippingCost?: number
  status: number
  createdAt: string
  trackingNumber?: string
  carrier?: string
  shippedAt?: string
  deliveredAt?: string
  totalRefunded?: number
  remainingRefundable?: number
  refunds?: RefundLog[]
  buyer?: {
    firstName?: string
    lastName?: string
    email?: string
  }
  shippingAddress?: {
    line1?: string
    line2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  items: OrderItem[]
}