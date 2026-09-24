export type UserDetails = {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string | null
  addressOne?: string | null
  addressTwo?: string | null
  city?: string | null
  country?: string | null
  postalCode?: string | null
  profileImageUrl?: string | null
  companyName?: string | null
  roles?: string[]
  hasRoasterProfile?: boolean
}

export type AdminUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  roles: string[]
}