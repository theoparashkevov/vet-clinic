import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchAppointments,
  fetchAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  fetchAvailableSlots,
} from "../api/appointments"

const APPOINTMENTS_KEY = "appointments"
const SLOTS_KEY = "slots"

export function useAppointments(
  page: number = 1,
  limit: number = 10,
  filters?: {
    date?: string
    doctorId?: string
    status?: string
    patientId?: string
  }
) {
  return useQuery({
    queryKey: [APPOINTMENTS_KEY, page, limit, filters],
    queryFn: () => fetchAppointments(page, limit, filters),
    staleTime: 30 * 1000,
  })
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: [APPOINTMENTS_KEY, id],
    queryFn: () => fetchAppointment(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  })
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] })
    },
  })
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateAppointment>[1] }) =>
      updateAppointment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_KEY, id] })
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] })
    },
  })
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] })
    },
  })
}

export function useAvailableSlots(date: string, doctorId?: string) {
  return useQuery({
    queryKey: [SLOTS_KEY, date, doctorId],
    queryFn: () => fetchAvailableSlots(date, doctorId),
    enabled: !!date,
    staleTime: 60 * 1000,
  })
}