import { del, get, patch, post } from './client'
import type {
  SupplierCompanyCreate,
  SupplierCompanyListRead,
  SupplierCompanyRead,
  SupplierCompanyUpdate,
  SupplierContactCreate,
  SupplierContactRead,
  SupplierContactUpdate,
  SupplierRfqHistoryRead,
} from '../types/supplierDirectory'

export function listSuppliers(query?: string, includeInactive = false): Promise<SupplierCompanyListRead[]> {
  const params = new URLSearchParams()
  if (query) params.set('q', query)
  if (includeInactive) params.set('include_inactive', 'true')
  const qs = params.toString()
  return get<SupplierCompanyListRead[]>(`/suppliers${qs ? `?${qs}` : ''}`)
}

export function listSupplierRfqs(supplierId: string): Promise<SupplierRfqHistoryRead> {
  return get<SupplierRfqHistoryRead>(`/suppliers/${supplierId}/rfqs`)
}

export function createSupplier(data: SupplierCompanyCreate): Promise<SupplierCompanyRead> {
  return post<SupplierCompanyRead>('/suppliers', data)
}

export function getSupplier(id: string): Promise<SupplierCompanyRead> {
  return get<SupplierCompanyRead>(`/suppliers/${id}`)
}

export function updateSupplier(id: string, data: SupplierCompanyUpdate): Promise<SupplierCompanyRead> {
  return patch<SupplierCompanyRead>(`/suppliers/${id}`, data)
}

export function listSupplierContacts(id: string): Promise<SupplierContactRead[]> {
  return get<SupplierContactRead[]>(`/suppliers/${id}/contacts`)
}

export function addSupplierContact(id: string, data: SupplierContactCreate): Promise<SupplierContactRead> {
  return post<SupplierContactRead>(`/suppliers/${id}/contacts`, data)
}

export function updateSupplierContact(
  supplierId: string,
  contactId: string,
  data: SupplierContactUpdate,
): Promise<SupplierContactRead> {
  return patch<SupplierContactRead>(`/suppliers/${supplierId}/contacts/${contactId}`, data)
}

export function deleteSupplierContact(supplierId: string, contactId: string): Promise<void> {
  return del(`/suppliers/${supplierId}/contacts/${contactId}`)
}
