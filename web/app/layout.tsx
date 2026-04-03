import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import Providers from "./providers";
import AppShell from "../components/AppShell";
import { ErrorBoundary } from "../components/ErrorBoundary";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontSans.variable}>
      <body className={fontSans.className} style={{ margin: 0 }}>
        <ErrorBoundary>
          <Providers>
            <AppShell>{children}</AppShell>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
