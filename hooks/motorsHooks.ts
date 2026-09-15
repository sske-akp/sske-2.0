import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMotors,
  fetchMotor,
  createMotor,
  updateMotor,
  deleteMotor,
  addSerialsToMotor,
  removeSerialFromMotor,
  renameHpCategory,
  deleteHpCategory,
} from "@/services/motorsServices";
import { MotorAPI, MotorFormData } from "@/types/motors";

export function useMotors(params?: { hp?: string; search?: string }) {
  return useQuery<MotorAPI[], Error>({
    queryKey: ["motors", params],
    queryFn: () => fetchMotors(params),
    retry: 1,
  });
}

export function useMotor(id: string) {
  return useQuery<MotorAPI, Error>({
    queryKey: ["motors", id],
    queryFn: () => fetchMotor(id),
    enabled: Boolean(id),
  });
}

export function useCreateMotor() {
  const queryClient = useQueryClient();
  return useMutation<MotorAPI, Error, MotorFormData>({
    mutationFn: createMotor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motors"] });
    },
  });
}

export function useUpdateMotor() {
  const queryClient = useQueryClient();
  return useMutation<
    MotorAPI,
    Error,
    { id: string; data: Partial<MotorFormData> }
  >({
    mutationFn: ({ id, data }) => updateMotor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motors"] });
    },
  });
}

export function useDeleteMotor() {
  const queryClient = useQueryClient();
  return useMutation<{ detail: string }, Error, string>({
    mutationFn: deleteMotor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motors"] });
    },
  });
}

export function useAddSerialsToMotor() {
  const queryClient = useQueryClient();
  return useMutation<
    MotorAPI,
    Error,
    { id: string; serials: string[] }
  >({
    mutationFn: ({ id, serials }) => addSerialsToMotor(id, serials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motors"] });
    },
  });
}

export function useRemoveSerialFromMotor() {
  const queryClient = useQueryClient();
  return useMutation<
    MotorAPI,
    Error,
    { id: string; serial: string }
  >({
    mutationFn: ({ id, serial }) => removeSerialFromMotor(id, serial),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motors"] });
    },
  });
}

export function useRenameHpCategory() {
  const queryClient = useQueryClient();
  return useMutation<
    { detail: string; count: number },
    Error,
    { oldHp: string; newHp: string }
  >({
    mutationFn: ({ oldHp, newHp }) => renameHpCategory(oldHp, newHp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motors"] });
    },
  });
}

export function useDeleteHpCategory() {
  const queryClient = useQueryClient();
  return useMutation<
    { detail: string; count: number },
    Error,
    string
  >({
    mutationFn: (hp: string) => deleteHpCategory(hp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motors"] });
    },
  });
}
