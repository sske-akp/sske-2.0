import { Gstr1Response, Gstr3bResponse } from "@/types/gst";
import { apiFetch } from "@/lib/apiClient";

export async function fetchGstr1(from: string, to: string): Promise<Gstr1Response> {
  return apiFetch<Gstr1Response>(`/gst/gstr1?from=${from}&to=${to}`);
}

export async function fetchGstr3b(from: string, to: string): Promise<Gstr3bResponse> {
  return apiFetch<Gstr3bResponse>(`/gst/gstr3b?from=${from}&to=${to}`);
}
