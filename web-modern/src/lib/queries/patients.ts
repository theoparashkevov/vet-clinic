import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchPatients,
  fetchPatient,
  createPatient,
  updatePatient,
  deletePatient,
  fetchOwners,
  fetchOwner,
  createOwner,
  updateOwner,
  deleteOwner,
} from "../api/patients"

const PATIENTS_KEY = "patients"
const OWNERS_KEY = "owners"

export function usePatients(page: number = 1, limit: number = 10, search?: string) {
  return useQuery({
    queryKey: [PATIENTS_KEY, page, limit, search],
    queryFn: () => fetchPatients(page, limit, search),
    staleTime: 30 * 1000,
  })
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: [PATIENTS_KEY, id],
    queryFn: () => fetchPatient(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  })
}

export function useCreatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PATIENTS_KEY] })
    },
  })
}

export function useUpdatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updatePatient>[1] }) =>
      updatePatient(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [PATIENTS_KEY, id] })
      queryClient.invalidateQueries({ queryKey: [PATIENTS_KEY] })
    },
  })
}

export function useDeletePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PATIENTS_KEY] })
    },
  })
}

export function useOwners(page: number = 1, limit: number = 10, search?: string) {
  return useQuery({
    queryKey: [OWNERS_KEY, page, limit, search],
    queryFn: () => fetchOwners(page, limit, search),
    staleTime: 30 * 1000,
  })
}

export function useOwner(id: string) {
  return useQuery({
    queryKey: [OWNERS_KEY, id],
    queryFn: () => fetchOwner(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  })
}

export function useCreateOwner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOwner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OWNERS_KEY] })
    },
  })
}

export function useUpdateOwner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateOwner>[1] }) =>
      updateOwner(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [OWNERS_KEY, id] })
      queryClient.invalidateQueries({ queryKey: [OWNERS_KEY] })
    },
  })
}

export function useDeleteOwner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteOwner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OWNERS_KEY] })
    },
  })
}