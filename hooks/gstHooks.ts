import { useQuery } from "@tanstack/react-query";
import { fetchGstr1, fetchGstr3b } from "@/services/gstServices";
import { Gstr1Response, Gstr3bResponse } from "@/types/gst";

export function useGstr1(from: string, to: string, enabled: boolean) {
  return useQuery<Gstr1Response, Error>({
    queryKey: ["gstr1", from, to],
    queryFn: () => fetchGstr1(from, to),
    enabled: enabled && !!from && !!to,
  });
}

export function useGstr3b(from: string, to: string, enabled: boolean) {
  return useQuery<Gstr3bResponse, Error>({
    queryKey: ["gstr3b", from, to],
    queryFn: () => fetchGstr3b(from, to),
    enabled: enabled && !!from && !!to,
  });
}
