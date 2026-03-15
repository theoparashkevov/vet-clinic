export default function AnimalsPage() {
  return (
    <section aria-labelledby="animals-heading" data-testid="page-animals">
      <h1 id="animals-heading" className="text-2xl font-semibold mb-4">Your animals</h1>
      <ul className="space-y-3">
        <li className="border rounded p-3">Rex — Dog (sample)</li>
      </ul>
    </section>
  );
}
