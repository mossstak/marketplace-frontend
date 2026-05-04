'use client'

import { useState, useEffect } from 'react'
import { api } from '@/api/api'
import { ProductDetails } from '@/types/product'

const page = ({ id }: { id: number }) => {
  const [loading, setLoading] = useState(true)
  const [productName, setProductName] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [category, setCategory] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    const myProduct = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.patch<ProductDetails>(`/editProduct/${id}`)
        const data = res.data
        productName: productName.trim()
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          (typeof e?.response?.data === 'string' ? e.response.data : '') ||
          e?.message ||
          'Failed to load profile.'

        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    myProduct()
  }, [])

  return (
    <div>

    </div>
  )
}

export default page
