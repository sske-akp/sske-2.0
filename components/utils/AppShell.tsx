"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { SidebarProvider } from "@/components/ui/sidebar";
import AppSideBar from "@/components/utils/sidebar";
import NavAppBar from "@/components/utils/navbar";
import CommandPane from "@/components/utils/command-pane";
import { Toaster } from "@/components/ui/sonner";
import CompanySelectDialog from "@/components/auth/CompanySelectDialog";
import { useAuth } from "@/hooks/useAuth";

const PUBLIC_ROUTES = ["/login"];

function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="text-muted-foreground size-6 animate-spin" />
    </div>
  );
}

/**
 * Owns auth-gating and the authenticated app shell (sidebar + navbar).
 *  - Public routes (/login) render bare, no shell.
 *  - Unauthenticated users are bounced to /login.
 *  - Authenticated users with no active company get a forced company picker.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isReady, isAuthenticated, companyId } = useAuth();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (isReady && !isAuthenticated && !isPublicRoute) {
      router.replace("/login");
    }
  }, [isReady, isAuthenticated, isPublicRoute, router]);

  // Public routes (login) render without the app shell. Toaster included so
  // login error toasts surface.
  if (isPublicRoute) {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }

  // Wait for localStorage hydration, and hold while the redirect effect runs,
  // so an authenticated reload never flashes the login redirect.
  if (!isReady || !isAuthenticated) {
    return <FullScreenSpinner />;
  }

  return (
    <SidebarProvider>
      <AppSideBar />
      <main className="w-full">
        <NavAppBar />
        <CommandPane />
        <div className="px-4">{companyId ? children : null}</div>
        <Toaster />
      </main>
      {/* No active company yet → force a selection before showing data. */}
      <CompanySelectDialog open={!companyId} onOpenChange={() => {}} forced />
    </SidebarProvider>
  );
}
