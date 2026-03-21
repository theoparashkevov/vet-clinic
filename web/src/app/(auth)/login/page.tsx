export default function LoginPage() {
  return (
    <section aria-labelledby="login-heading" className="max-w-md mx-auto" data-testid="page-login">
      <h1 id="login-heading" className="text-2xl font-semibold mb-4">Sign in</h1>
      <form className="space-y-3" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <input id="email" name="email" type="email" className="mt-1 w-full border rounded px-3 py-2" autoComplete="email" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">Password</label>
          <input id="password" name="password" type="password" className="mt-1 w-full border rounded px-3 py-2" autoComplete="current-password" />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button type="button" className="underline" data-testid="demo-doctor">Use demo doctor</button>
          <button type="button" className="underline" data-testid="demo-owner">Use demo owner</button>
        </div>
        <button type="submit" className="mt-2 bg-slate-900 text-white px-4 py-2 rounded" data-testid="btn-sign-in">Sign in</button>
      </form>
    </section>
  );
}
