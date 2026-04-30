import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/appointments')({
  component: AppointmentsPage,
});

function AppointmentsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Appointments</h1>
      <p className="text-muted-foreground mt-2">Coming soon...</p>
    </div>
  );
}
