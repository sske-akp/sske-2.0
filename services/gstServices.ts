import { Gstr1Response, Gstr3bResponse } from "@/types/gst";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function fetchGstr1(from: string, to: string): Promise<Gstr1Response> {
  const res = await fetch(`${baseUrl}/gst/gstr1?from=${from}&to=${to}`);
  if (!res.ok) throw new Error("Failed to fetch GSTR-1");
  return res.json();
}

export async function fetchGstr3b(from: string, to: string): Promise<Gstr3bResponse> {
  const res = await fetch(`${baseUrl}/gst/gstr3b?from=${from}&to=${to}`);
  if (!res.ok) throw new Error("Failed to fetch GSTR-3B");
  return res.json();
}
