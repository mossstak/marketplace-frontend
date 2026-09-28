import {Order} from '../types/orderStatus'

export const formatOrderStatus = (status: number) => {
  const map: Record<number, { label: string; color: string }> = {
    1: { label: 'Pending', color: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30' },
    2: { label: 'Paid', color: 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30' },
    3: { label: 'Shipped', color: 'bg-green-500/15 text-green-800 dark:text-green-300 border-green-500/30' },
    4: { label: 'Cancelled', color: 'bg-red-500/15 text-red-800 dark:text-red-300 border-red-500/30' },
    5: { label: 'Delivered', color: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30' },
    6: { label: 'Refunded', color: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30' },
    7: { label: 'Partially Refunded', color: 'bg-violet-500/15 text-violet-800 dark:text-violet-300 border-violet-500/30' },
  }
  return map[status] ?? { label: 'Unknown', color: 'bg-muted text-muted-foreground border-border' }
}

export function formatAddress(addr?: Order['shippingAddress']) {
  if (!addr) return null
  const line = [addr.line1, addr.line2].filter(Boolean).join(', ')
  const region = [addr.city, addr.state, addr.postalCode, addr.country]
    .filter(Boolean)
    .join(', ')
  return { line, region }
}