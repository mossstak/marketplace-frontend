'use client'

import { RotateCcw } from 'lucide-react'
import { RefundLog } from '@/types/orderStatus'

interface OrderRefundBannerProps {
  refunds: RefundLog[]
  totalRefunded?: number
  remainingRefundable?: number
}

export function OrderRefundBanner({
  refunds,
  totalRefunded,
  remainingRefundable,
}: OrderRefundBannerProps) {
  return (
    <div className="text-xs bg-purple-500/10 border border-purple-500/20 px-3.5 py-2.5 rounded-xl text-purple-900 dark:text-purple-200 space-y-1.5 font-medium">
      <div className="flex items-center justify-between font-semibold">
        <span className="flex items-center gap-1.5">
          <RotateCcw className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
          Total Refunded: £{Number(totalRefunded ?? 0).toFixed(2)}
        </span>
        {remainingRefundable !== undefined && (
          <span className="text-purple-700 dark:text-purple-300 font-semibold">
            Remaining Refundable: £{Number(remainingRefundable).toFixed(2)}
          </span>
        )}
      </div>

      <div className="space-y-1 pt-1.5 border-t border-purple-500/20">
        {refunds.map((rf) => (
          <div
            key={rf.id}
            className="text-foreground text-[11px] flex justify-between items-center"
          >
            <span>
              {rf.reason || 'Reason not specified'} ({rf.initiatedBy})
            </span>
            <span className="font-mono text-purple-800 dark:text-purple-300 font-semibold">
              -£{Number(rf.amount).toFixed(2)}
              <span className="text-muted-foreground font-normal ml-2">
                {new Date(rf.createdAt).toLocaleDateString()}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}