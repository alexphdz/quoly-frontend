import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as rfqApi from '../api/rfqs'
import type { CorrugatedRFQCreate, CorrugatedRFQUpdate } from '../types/corrugated'
import type { CommercialRFQWrite, RFQCreate, RFQRead, RFQDetail, SupplierCreate } from '../types/rfq'

export function useRFQs() {
  return useQuery<RFQRead[]>({
    queryKey: ['rfqs'],
    queryFn: rfqApi.listRFQs,
  })
}

export function useRFQ(id: string) {
  return useQuery<RFQDetail>({
    queryKey: ['rfq', id],
    queryFn: () => rfqApi.getRFQ(id),
    enabled: !!id,
  })
}

export function useCreateRFQ() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: RFQCreate | CommercialRFQWrite) => rfqApi.createRFQ(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] })
    },
  })
}

export function useUpdateCommercialRFQ() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CommercialRFQWrite> }) =>
      rfqApi.updateRFQ(id, data),
    onSuccess: (rfq) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] })
      queryClient.invalidateQueries({ queryKey: ['rfq', rfq.id] })
    },
  })
}

export function useCreateCorrugatedRFQ() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CorrugatedRFQCreate) => rfqApi.createRFQ(data),
    onSuccess: (rfq) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] })
      queryClient.setQueryData(['rfq', rfq.id], rfq)
    },
  })
}

export function useUpdateCorrugatedRFQ() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CorrugatedRFQUpdate }) => rfqApi.updateRFQ(id, data),
    onSuccess: (rfq) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] })
      queryClient.invalidateQueries({ queryKey: ['rfq', rfq.id] })
    },
  })
}

export function useAddSupplier(rfqId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SupplierCreate) => rfqApi.addSupplier(rfqId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfq', rfqId] })
    },
  })
}

export function useAddSupplierFromDirectory(rfqId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (supplierCompanyId: string) => rfqApi.addSupplierFromDirectory(rfqId, supplierCompanyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfq', rfqId] })
    },
  })
}

export function useBuyerActions(rfqId: string) {
  return useQuery({
    queryKey: ['buyer-actions', rfqId],
    queryFn: () => rfqApi.listBuyerActions(rfqId),
    enabled: !!rfqId,
  })
}

export function useOpenBuyerActions() {
  return useQuery({
    queryKey: ['buyer-actions', 'open'],
    queryFn: rfqApi.listOpenBuyerActions,
  })
}

export function useResolveBuyerAction(rfqId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (actionId: string) => rfqApi.resolveBuyerAction(rfqId, actionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-actions'] })
      queryClient.invalidateQueries({ queryKey: ['rfq', rfqId] })
    },
  })
}

export function useCloseSupplier(rfqId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (supplierId: string) => rfqApi.closeSupplierOnRfq(rfqId, supplierId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfq', rfqId] })
      queryClient.invalidateQueries({ queryKey: ['rfqs'] })
    },
  })
}

export function useSendRequests(rfqId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => rfqApi.sendRequests(rfqId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfq', rfqId] })
      queryClient.invalidateQueries({ queryKey: ['rfqs'] })
    },
  })
}

export function useInbound(rfqId: string) {
  return useQuery({
    queryKey: ['inbound', rfqId],
    queryFn: () => rfqApi.listInbound(rfqId),
    enabled: !!rfqId,
    refetchInterval: 60_000,
  })
}
