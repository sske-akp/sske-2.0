import { useQuery } from "@tanstack/react-query";
import { fetchDashboardData, fetchHomeDashboard } from "@/services/reportsServices";
import { DashboardData, HomeDashboardData } from "@/types/reports";

export function useDashboard() {
  return useQuery<DashboardData, Error>({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
  });
}

export function useHomeDashboard() {
  return useQuery<HomeDashboardData, Error>({
    queryKey: ["homeDashboard"],
    queryFn: fetchHomeDashboard,
  });
}
