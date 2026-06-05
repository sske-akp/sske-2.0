import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import AppShell from "@/components/utils/AppShell";
import QueryProviderWrapper from "@/components/QueryProviderWrapper";
import AuthProvider from "@/components/providers/AuthProvider";


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
              <AuthProvider>
                <AppShell>{children}</AppShell>
              </AuthProvider>
            </QueryProviderWrapper>
          </ThemeProvider>

        </body>
      </html>
    </>
  );
}
