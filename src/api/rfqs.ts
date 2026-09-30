import { del, get, patch, post, postFormData } from './client'
import type { InboundMessageRead } from '../types/inbound'
import type { CorrugatedRFQCreate, CorrugatedRFQUpdate } from '../types/corrugated'
import type { BuyerActionRead } from '../types/buyerAction'
import type { CommercialRFQWrite, RFQCreate, RFQRead, RFQDetail, SupplierCreate, SupplierRead, SendRequestsResponse } from '../types/rfq'

export function createRFQ(data: RFQCreate | CorrugatedRFQCreate | CommercialRFQWrite): Promise<RFQRead> {
  return post<RFQRead>('/rfqs', data)
}

export function updateRFQ(id: string, data: CorrugatedRFQUpdate | Partial<RFQCreate> | Partial<CommercialRFQWrite>): Promise<RFQRead> {
  return patch<RFQRead>(`/rfqs/${id}`, data)
}

export function uploadReferenceSpec(rfqId: string, file: File): Promise<RFQRead> {
  const fd = new FormData()
  fd.append('file', file)
  return postFormData<RFQRead>(`/rfqs/${rfqId}/attachments`, fd)
}

export async function deleteReferenceSpec(rfqId: string, attachmentId: string): Promise<RFQRead> {
  await del(`/rfqs/${rfqId}/attachments/${attachmentId}`)
  return getRFQ(rfqId)
}

export function listRFQs(): Promise<RFQRead[]> {
  return get<RFQRead[]>('/rfqs')
}

export function getRFQ(id: string): Promise<RFQDetail> {
  return get<RFQDetail>(`/rfqs/${id}`)
}

export function addSupplier(rfqId: string, data: SupplierCreate): Promise<SupplierRead> {
  return post<SupplierRead>(`/rfqs/${rfqId}/suppliers`, data)
}

export function addSupplierFromDirectory(rfqId: string, supplierCompanyId: string): Promise<SupplierRead> {
  return post<SupplierRead>(`/rfqs/${rfqId}/suppliers/from-directory`, {
    supplier_company_id: supplierCompanyId,
  })
}

export function listSuppliers(rfqId: string): Promise<SupplierRead[]> {
  return get<SupplierRead[]>(`/rfqs/${rfqId}/suppliers`)
}

export function closeSupplierOnRfq(rfqId: string, supplierId: string): Promise<SupplierRead> {
  return post<SupplierRead>(`/rfqs/${rfqId}/suppliers/${supplierId}/close`)
}

export function listBuyerActions(rfqId: string): Promise<BuyerActionRead[]> {
  return get<BuyerActionRead[]>(`/rfqs/${rfqId}/buyer-actions`)
}

export function listOpenBuyerActions(): Promise<BuyerActionRead[]> {
  return get<BuyerActionRead[]>('/buyer-actions')
}

export function resolveBuyerAction(rfqId: string, actionId: string): Promise<BuyerActionRead> {
  return post<BuyerActionRead>(`/rfqs/${rfqId}/buyer-actions/${actionId}/resolve`)
}

export function sendRequests(rfqId: string): Promise<SendRequestsResponse> {
  return post<SendRequestsResponse>(`/rfqs/${rfqId}/send`)
}

export function syncRFQ(rfqId: string): Promise<InboundMessageRead[]> {
  return post<InboundMessageRead[]>(`/rfqs/${rfqId}/sync`)
}

export function listInbound(rfqId: string): Promise<InboundMessageRead[]> {
  return get<InboundMessageRead[]>(`/rfqs/${rfqId}/inbound`)
}
