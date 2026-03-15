export default function NewAppointmentPage() {
  return (
    <section aria-labelledby="new-appt-heading" data-testid="page-new-appointment">
      <h1 id="new-appt-heading" className="text-2xl font-semibold mb-4">Book an appointment</h1>
      <ol className="list-decimal pl-6 space-y-2">
        <li>Select animal</li>
        <li>Choose reason</li>
        <li>Pick date/time</li>
        <li>Confirm</li>
      </ol>
    </section>
  );
}
