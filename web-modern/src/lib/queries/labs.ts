import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchLabPanels,
  fetchCommonLabPanels,
  fetchLabTestsByPanel,
  fetchLabResults,
  fetchPendingLabResults,
  fetchLabResult,
  createLabResult,
  updateLabResult,
  deleteLabResult,
  fetchTestHistory,
} from "../api/labs"

const LABS_KEY = "labs"
const PANELS_KEY = "panels"
const TESTS_KEY = "tests"
const RESULTS_KEY = "results"

export function useLabPanels(species?: string) {
  return useQuery({
    queryKey: [LABS_KEY, PANELS_KEY, species],
    queryFn: () => fetchLabPanels(species),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCommonLabPanels(species?: string) {
  return useQuery({
    queryKey: [LABS_KEY, PANELS_KEY, "common", species],
    queryFn: () => fetchCommonLabPanels(species),
    staleTime: 5 * 60 * 1000,
  })
}

export function useLabTestsByPanel(panelId: string) {
  return useQuery({
    queryKey: [LABS_KEY, TESTS_KEY, panelId],
    queryFn: () => fetchLabTestsByPanel(panelId),
    enabled: !!panelId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useLabResults(patientId: string) {
  return useQuery({
    queryKey: [LABS_KEY, RESULTS_KEY, patientId],
    queryFn: () => fetchLabResults(patientId),
    enabled: !!patientId,
    staleTime: 30 * 1000,
  })
}

export function usePendingLabResults(patientId: string) {
  return useQuery({
    queryKey: [LABS_KEY, RESULTS_KEY, "pending", patientId],
    queryFn: () => fetchPendingLabResults(patientId),
    enabled: !!patientId,
    staleTime: 30 * 1000,
  })
}

export function useLabResult(id: string) {
  return useQuery({
    queryKey: [LABS_KEY, RESULTS_KEY, id],
    queryFn: () => fetchLabResult(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  })
}

export function useCreateLabResult() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: Parameters<typeof createLabResult>[1] }) =>
      createLabResult(patientId, data),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: [LABS_KEY, RESULTS_KEY, patientId] })
    },
  })
}

export function useUpdateLabResult() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateLabResult>[1] }) =>
      updateLabResult(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LABS_KEY, RESULTS_KEY] })
    },
  })
}

export function useDeleteLabResult() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteLabResult,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LABS_KEY, RESULTS_KEY] })
    },
  })
}

export function useTestHistory(patientId: string, testId: string, limit: number = 10) {
  return useQuery({
    queryKey: [LABS_KEY, TESTS_KEY, "history", patientId, testId, limit],
    queryFn: () => fetchTestHistory(patientId, testId, limit),
    enabled: !!patientId && !!testId,
    staleTime: 60 * 1000,
  })
}