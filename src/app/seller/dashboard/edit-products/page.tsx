'use client'

import Link from 'next/link'

export default function EditProductsPage() {
  return (
    <div className="border p-6 rounded bg-white/10 max-w-2xl">
      <h1 className="text-xl font-semibold mb-2">Edit Products</h1>
      <p className="text-sm opacity-80 mb-4">
        To edit an existing product, please select the product from your products list.
      </p>
      <Link
        href="/seller/dashboard/view-products"
        className="inline-block rounded bg-blue-600 px-4 py-2 text-sm text-white font-medium hover:bg-blue-700 transition"
      >
        View Products List
      </Link>
    </div>
  )
}
