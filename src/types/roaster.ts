export type ApprovalStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'pending'
  | 'approved'
  | 'rejected'
  | number

export type RoasterForm = {
  id: string | number
  companyName?: string | null
  bio?: string | null
  city?: string | null
  country?: string | null
  websiteUrl?: string | null
  instagramUrl?: string | null
  isVerified?: boolean | null
  approvalStatus?: ApprovalStatus | null
}

export type RoasterDetails = {
  id: string | number
  userId: string
  companyName?: string | null
  bio?: string | null
  city?: string | null
  country?: string | null
  websiteUrl?: string | null
  instagramUrl?: string | null
  isVerified?: boolean | null
  approvalStatus?: ApprovalStatus | null
}