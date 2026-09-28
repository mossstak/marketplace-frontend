'use client'

import Link from 'next/link'

export default function EditProductsPage() {
  return (
    <div className="border border-border p-6 rounded-2xl bg-card text-card-foreground shadow-xs max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Edit Products</h1>
        <p className="text-sm text-muted-foreground">
          To edit an existing product, please select the product from your products list.
        </p>
      </div>
      <div>
        <Link
          href="/seller/dashboard/view-products"
          className="inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 text-sm shadow-xs transition"
        >
          View Products List
        </Link>
      </div>
    </div>
  )
}
