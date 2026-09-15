import { apiFetch } from "@/lib/apiClient";
import {
  MotorAPI,
  MotorFormData,
  MotorSerialsAddBatch,
  MotorHpRenameData,
} from "@/types/motors";

export async function fetchMotors(params?: {
  hp?: string;
  search?: string;
}): Promise<MotorAPI[]> {
  const searchParams = new URLSearchParams();
  if (params?.hp) searchParams.set("hp", params.hp);
  if (params?.search) searchParams.set("search", params.search);

  const query = searchParams.toString();
  const path = query ? `/motors/?${query}` : "/motors/";
  return apiFetch<MotorAPI[]>(path);
}

export async function fetchMotor(id: string): Promise<MotorAPI> {
  return apiFetch<MotorAPI>(`/motors/${id}`);
}

export async function createMotor(data: MotorFormData): Promise<MotorAPI> {
  return apiFetch<MotorAPI>("/motors/", {
    method: "POST",
    json: data,
  });
}

export async function updateMotor(
  id: string,
  data: Partial<MotorFormData>
): Promise<MotorAPI> {
  return apiFetch<MotorAPI>(`/motors/${id}`, {
    method: "PUT",
    json: data,
  });
}

export async function deleteMotor(id: string): Promise<{ detail: string }> {
  return apiFetch<{ detail: string }>(`/motors/${id}`, {
    method: "DELETE",
  });
}

export async function addSerialsToMotor(
  id: string,
  serials: string[]
): Promise<MotorAPI> {
  const payload: MotorSerialsAddBatch = { serials };
  return apiFetch<MotorAPI>(`/motors/${id}/serials`, {
    method: "POST",
    json: payload,
  });
}

export async function removeSerialFromMotor(
  id: string,
  serialNumber: string
): Promise<MotorAPI> {
  return apiFetch<MotorAPI>(
    `/motors/${id}/serials/${encodeURIComponent(serialNumber)}`,
    {
      method: "DELETE",
    }
  );
}

export async function renameHpCategory(
  oldHp: string,
  newHp: string
): Promise<{ detail: string; count: number }> {
  const payload: MotorHpRenameData = { new_hp: newHp };
  return apiFetch<{ detail: string; count: number }>(
    `/motors/hp/${encodeURIComponent(oldHp)}`,
    {
      method: "PUT",
      json: payload,
    }
  );
}

export async function deleteHpCategory(
  hp: string
): Promise<{ detail: string; count: number }> {
  return apiFetch<{ detail: string; count: number }>(
    `/motors/hp/${encodeURIComponent(hp)}`,
    {
      method: "DELETE",
    }
  );
}
