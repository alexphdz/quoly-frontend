import type { PackagingCategory } from '../constants/providerOptions'

export interface SupplierContactCreate {
  name: string
  email: string
  phone?: string | null
  job_title?: string | null
  department?: string | null
  is_primary?: boolean
}

export interface SupplierContactUpdate {
  name?: string
  email?: string
  phone?: string | null
  job_title?: string | null
  department?: string | null
  is_primary?: boolean
}

export interface SupplierContactRead {
  id: string
  supplier_company_id: string
  name: string
  email: string
  phone: string | null
  job_title: string | null
  department: string | null
  is_primary: boolean
  source: string
  last_seen_at: string | null
  created_at: string
  updated_at: string
}

export interface SupplierCompanyCreate {
  display_name: string
  legal_name?: string | null
  primary_email: string
  phone?: string | null
  website?: string | null
  country?: string | null
  city?: string | null
  address?: string | null
  material_categories?: string[]
  packaging_categories?: PackagingCategory[]
  tags?: string[]
  default_payment_terms?: string | null
  default_incoterm?: string | null
  notes?: string | null
}

export interface SupplierCompanyUpdate extends Partial<SupplierCompanyCreate> {
  is_active?: boolean
}

export interface SupplierCompanyRead extends SupplierCompanyCreate {
  id: string
  user_id: string
  display_name: string
  primary_email: string
  source: string
  confidence_score: number | null
  is_active: boolean
  created_at: string
  updated_at: string
  contacts: SupplierContactRead[]
}

export interface SupplierCompanyListRead extends SupplierCompanyRead {
  rfq_count: number
}

export interface SupplierRfqHistoryItem {
  supplier_id: string
  rfq_id: string
  rfq_name: string
  rfq_status: string
  supplier_status: string
  created_at: string
  requested_at: string | null
}

export interface SupplierRfqHistoryRead {
  supplier_company_id: string
  total: number
  items: SupplierRfqHistoryItem[]
}
