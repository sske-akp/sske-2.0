"use client";

import { useContext } from "react";
import { AuthContext } from "@/components/providers/AuthProvider";
import type { AuthContextShape } from "@/types/auth";

export function useAuth(): AuthContextShape {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}
