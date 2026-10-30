import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as supplierApi from '../api/supplierDirectory'
import type {
  SupplierCompanyCreate,
  SupplierCompanyUpdate,
  SupplierContactCreate,
  SupplierContactUpdate,
} from '../types/supplierDirectory'

export function useSupplierDirectory(query = '', includeInactive = false) {
  return useQuery({
    queryKey: ['supplier-directory', query, includeInactive],
    queryFn: () => supplierApi.listSuppliers(query, includeInactive),
  })
}

export function useSupplierCompany(id: string) {
  return useQuery({
    queryKey: ['supplier-company', id],
    queryFn: () => supplierApi.getSupplier(id),
    enabled: !!id,
  })
}

export function useSupplierRfqHistory(id: string) {
  return useQuery({
    queryKey: ['supplier-rfqs', id],
    queryFn: () => supplierApi.listSupplierRfqs(id),
    enabled: !!id,
  })
}

export function useCreateSupplierCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SupplierCompanyCreate) => supplierApi.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-directory'] })
    },
  })
}

export function useSetSupplierActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      supplierApi.updateSupplier(id, { is_active: isActive }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['supplier-directory'] })
      queryClient.invalidateQueries({ queryKey: ['supplier-company', variables.id] })
    },
  })
}

export function useUpdateSupplierCompany(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SupplierCompanyUpdate) => supplierApi.updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-directory'] })
      queryClient.invalidateQueries({ queryKey: ['supplier-company', id] })
    },
  })
}

export function useAddSupplierContact(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SupplierContactCreate) => supplierApi.addSupplierContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-company', id] })
      queryClient.invalidateQueries({ queryKey: ['supplier-directory'] })
    },
  })
}

export function useUpdateSupplierContact(supplierId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ contactId, data }: { contactId: string; data: SupplierContactUpdate }) =>
      supplierApi.updateSupplierContact(supplierId, contactId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-company', supplierId] })
    },
  })
}

export function useDeleteSupplierContact(supplierId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (contactId: string) => supplierApi.deleteSupplierContact(supplierId, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-company', supplierId] })
    },
  })
}
