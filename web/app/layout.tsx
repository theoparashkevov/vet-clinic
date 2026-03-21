import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Inter, system-ui, sans-serif', margin: 0 }}>
        <header style={{ padding: 16, borderBottom: '1px solid #eee', display: 'flex', gap: 16, alignItems: 'center' }}>
          <strong>Vet Clinic</strong>
          <nav aria-label="Primary">
            <ul style={{ listStyle: 'none', display: 'flex', gap: 12, margin: 0, padding: 0 }}>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/patients">Patients</Link></li>
              <li><Link href="/appointments">Appointments</Link></li>
            </ul>
          </nav>
        </header>
        <main style={{ padding: 16 }}>{children}</main>
      </body>
    </html>
  );
}
