export default function OwnerDashboard() {
  return (
    <section aria-labelledby="owner-heading" data-testid="page-owner">
      <h1 id="owner-heading" className="text-2xl font-semibold mb-4">Owner dashboard</h1>
      <div className="flex gap-2 mb-4">
        <a href="/appointments/new" className="bg-slate-900 text-white px-3 py-2 rounded" data-testid="cta-new-appointment">New appointment</a>
        <a href="/owner/animals" className="border px-3 py-2 rounded" data-testid="cta-animals">Your animals</a>
      </div>
      <div className="text-slate-600">Upcoming appointments will appear here.</div>
    </section>
  );
}
