import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchMedicalRecords,
  createMedicalRecord,
  updateMedicalRecord,
  type CreateMedicalRecordData,
  type UpdateMedicalRecordData,
} from "../api/medical-records"

const MEDICAL_RECORDS_KEY = "medical-records"

export function useMedicalRecords(patientId: string) {
  return useQuery({
    queryKey: [MEDICAL_RECORDS_KEY, patientId],
    queryFn: () => fetchMedicalRecords(patientId),
    enabled: !!patientId,
    staleTime: 30 * 1000,
  })
}

export function useCreateMedicalRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      patientId,
      data,
    }: {
      patientId: string
      data: CreateMedicalRecordData
    }) => createMedicalRecord(patientId, data),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: [MEDICAL_RECORDS_KEY, patientId] })
    },
  })
}

export function useUpdateMedicalRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMedicalRecordData }) =>
      updateMedicalRecord(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MEDICAL_RECORDS_KEY] })
    },
  })
}
