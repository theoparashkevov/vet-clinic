import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vet Clinic",
  description: "POC UI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        <a href="#main" className="sr-only focus:not-sr-only">Skip to content</a>
        <header role="banner" className="border-b px-4 py-3">Vet Clinic</header>
        <main id="main" role="main" className="container mx-auto p-4" data-testid="main">
          {children}
        </main>
        <footer role="contentinfo" className="border-t px-4 py-3 text-sm text-slate-600">UTC; TZ: Europe/Sofia</footer>
      </body>
    </html>
  );
}
