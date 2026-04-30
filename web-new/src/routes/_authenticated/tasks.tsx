import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/tasks')({
  component: TasksPage,
});

function TasksPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Tasks</h1>
      <p className="text-muted-foreground mt-2">Coming soon...</p>
    </div>
  );
}
