export type UserDetails = {
  id: string
  firstName: string
  lastName: string
  email: string
  addressOne?: string | null
  addressTwo?: string | null
  city?: string | null
  country?: string | null
  postalCode?: string | null
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