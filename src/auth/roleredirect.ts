import { Role } from '@/auth/auth'

export const roleRedirect = (role: Role | null) => {
  if (role === 'Admin') return '/admin/dashboard'
  if (role === 'Seller') return '/seller/dashboard'
  if (role === 'Buyer') return '/buyer/dashboard'
  return '/login'
}
