import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchPatientPhotos,
  uploadPatientPhoto,
  deletePatientPhoto,
  type PhotoUploadData,
} from "../api/photos"

const PHOTOS_KEY = "photos"

export function usePatientPhotos(patientId: string) {
  return useQuery({
    queryKey: [PHOTOS_KEY, patientId],
    queryFn: () => fetchPatientPhotos(patientId),
    enabled: !!patientId,
    staleTime: 30 * 1000,
  })
}

export function useUploadPhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      patientId,
      file,
      metadata,
    }: {
      patientId: string
      file: File
      metadata: PhotoUploadData
    }) => uploadPatientPhoto(patientId, file, metadata),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: [PHOTOS_KEY, patientId] })
    },
  })
}

export function useDeletePhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (vars: { id: string; patientId: string }) =>
      deletePatientPhoto(vars.id),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: [PHOTOS_KEY, vars.patientId] })
    },
  })
}
