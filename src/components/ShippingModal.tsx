'use client'

import { Truck, X } from 'lucide-react'

export interface ShippingModalState {
  orderId: number
  carrier: string
  trackingNumber: string
}

interface ShippingModalProps {
  modal: ShippingModalState
  submitting: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  onChange: (updated: ShippingModalState) => void
}

export function ShippingModal({
  modal,
  submitting,
  onClose,
  onSubmit,
  onChange,
}: ShippingModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Truck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> Mark Package #{modal.orderId} as Shipped
          </h3>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Shipping Carrier
            </label>
            <input
              type="text"
              value={modal.carrier}
              onChange={(e) => onChange({ ...modal, carrier: e.target.value })}
              placeholder="e.g. Royal Mail, DPD, Evri, DHL"
              className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Tracking Number (Optional)
            </label>
            <input
              type="text"
              value={modal.trackingNumber}
              onChange={(e) => onChange({ ...modal, trackingNumber: e.target.value })}
              placeholder="e.g. GB123456789"
              className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono transition"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold border border-border bg-muted hover:bg-muted/80 text-foreground transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Confirm Shipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}