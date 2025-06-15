import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSideBar from '@/components/utils/sidebar';
import NavAppBar from '@/components/utils/navbar';
import CommandPane from "@/components/utils/command-pane";
import { Toaster } from "@/components/ui/sonner"
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// import { QueryClient, QueryClientProvider, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import QueryProviderWrapper from "@/components/QueryProviderWrapper";


export const metadata: Metadata = {
  title: "SSKE 2.0",
  description: "POS App for SSKE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProviderWrapper>
              <SidebarProvider>
                <AppSideBar />
                <main className="w-full">
                  <NavAppBar />
                  <CommandPane />
                  <div className="px-4">{children}</div>
                  <Toaster />
                  <ReactQueryDevtools initialIsOpen={false} />
                </main>
              </SidebarProvider>
            </QueryProviderWrapper>
          </ThemeProvider>

        </body>
      </html>
    </>
  );
}
