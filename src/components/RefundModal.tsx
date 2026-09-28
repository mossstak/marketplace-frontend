'use client'

import { RotateCcw, X, AlertTriangle } from 'lucide-react'
import { Order } from '@/types/orderStatus'


export interface RefundModalState {
  order: Order
  refundType: 'full' | 'partial'
  amount: string
  reason: string
  confirmed: boolean
  paymentIntentIdOverride: string
}

interface RefundModalProps {
  modal: RefundModalState
  submitting: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  onChange: (updated: RefundModalState) => void
}

export function RefundModal({
  modal,
  submitting,
  onClose,
  onSubmit,
  onChange,
}: RefundModalProps) {
  const maxRefund = modal.order.remainingRefundable ?? modal.order.totalAmount

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-2xl space-y-4 my-8">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-purple-600 dark:text-purple-400" /> Issue Refund - Package #{modal.order.id}
          </h3>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          {/* Items Breakdown */}
          <div className="space-y-1.5 bg-muted/40 p-3 rounded-xl border border-border">
            <span className="font-semibold text-muted-foreground uppercase tracking-wider block">
              Package Items Breakdown:
            </span>
            <div className="space-y-1 max-h-32 overflow-y-auto divide-y divide-border">
              {modal.order.items?.map((i) => (
                <div key={i.id} className="flex justify-between py-1 text-foreground">
                  <span className="truncate pr-2">
                    {i.productName ?? 'Item'} (x{i.quantity})
                  </span>
                  <span className="font-semibold text-foreground whitespace-nowrap">
                    £{Number(i.subtotal ?? i.unitPrice * i.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Max Refundable Badge */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-800 dark:text-purple-300 font-medium">
            <span>Maximum Refundable Amount:</span>
            <span className="text-sm font-bold text-purple-900 dark:text-purple-200 font-mono">
              £{Number(maxRefund).toFixed(2)}
            </span>
          </div>

          {/* Missing PaymentIntent Notice */}
          {!modal.order.paymentIntentId && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-amber-950 dark:text-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                No Stripe Payment Reference Recorded
              </div>
              <p className="text-muted-foreground text-[11px]">
                This order does not have a linked Stripe transaction. If you have the Stripe PaymentIntent ID from the customer payment, enter it below:
              </p>
              <input
                type="text"
                value={modal.paymentIntentIdOverride}
                onChange={(e) =>
                  onChange({ ...modal, paymentIntentIdOverride: e.target.value })
                }
                placeholder="e.g. pi_3UKN3P2Mpu7OcFsC0RGsAqta"
                className="w-full px-3 py-1.5 bg-background border border-input rounded-lg text-foreground text-xs font-mono placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>
          )}

          {/* Refund Type Selection */}
          <div>
            <label className="block font-semibold text-foreground mb-1.5">Refund Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...modal,
                    refundType: 'full',
                    amount: maxRefund.toFixed(2),
                  })
                }
                className={`py-2 px-3 rounded-lg font-semibold border text-center transition cursor-pointer ${
                  modal.refundType === 'full'
                    ? 'bg-purple-600 border-purple-500 text-white shadow-xs'
                    : 'bg-muted border-border text-foreground hover:bg-muted/80'
                }`}
              >
                Full Refund (£{maxRefund.toFixed(2)})
              </button>

              <button
                type="button"
                onClick={() => onChange({ ...modal, refundType: 'partial', amount: '' })}
                className={`py-2 px-3 rounded-lg font-semibold border text-center transition cursor-pointer ${
                  modal.refundType === 'partial'
                    ? 'bg-purple-600 border-purple-500 text-white shadow-xs'
                    : 'bg-muted border-border text-foreground hover:bg-muted/80'
                }`}
              >
                Partial Refund
              </button>
            </div>
          </div>

          {/* Partial Amount Input */}
          {modal.refundType === 'partial' && (
            <div>
              <label className="block font-semibold text-foreground mb-1">
                Custom Refund Amount (£)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={maxRefund}
                value={modal.amount}
                onChange={(e) => onChange({ ...modal, amount: e.target.value })}
                placeholder="e.g. 10.00"
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground font-mono placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block font-semibold text-foreground mb-1">Reason for Refund</label>
            <select
              value={modal.reason}
              onChange={(e) => onChange({ ...modal, reason: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            >
              <option value="Out of stock">Out of stock</option>
              <option value="Customer cancellation">Customer cancellation</option>
              <option value="Damaged goods">Damaged goods</option>
              <option value="Incorrect item sent">Incorrect item sent</option>
              <option value="Dispute resolution">Dispute resolution</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Confirmation Warning */}
          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-amber-950 dark:text-amber-200 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="font-medium">
                This will deduct £
                {(
                  parseFloat(modal.amount) ||
                  (modal.refundType === 'full' ? maxRefund : 0)
                ).toFixed(2)}{' '}
                from your payout balance and return it to the buyer.
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1 text-foreground select-none font-medium">
              <input
                type="checkbox"
                checked={modal.confirmed}
                onChange={(e) => onChange({ ...modal, confirmed: e.target.checked })}
                className="rounded border-input text-purple-600 focus:ring-purple-500 h-4 w-4 accent-purple-600"
              />
              <span>I confirm this deduction from my seller balance.</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-semibold border border-border bg-muted hover:bg-muted/80 text-foreground transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !modal.confirmed}
              className="px-4 py-2 rounded-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Processing...' : 'Confirm & Process Refund'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}