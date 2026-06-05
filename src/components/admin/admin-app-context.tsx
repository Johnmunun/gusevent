"use client";

import { createContext, useContext } from "react";
import type { AppSession } from "@/lib/auth/app-session";

export const AdminAppContext = createContext<AppSession | null>(null);

export function useAdminApp() {
  return useContext(AdminAppContext);
}
