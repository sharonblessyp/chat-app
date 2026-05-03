import { useState } from "react";
import AuthShell from "../components/authShell";
import { useAuthStore } from "../store/useAuthStore";

function SignUpPage() {
  const signup = useAuthStore((state) => state.signup);
  const isSigningUp = useAuthStore((state) => state.isSigningUp);
  const [formState, setFormState] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await signup(formState);
    } catch {
      // Toast feedback is handled in the auth store.
    }
  };

  return (
    <AuthShell
      title="Create account"
      hint="Already have an account?"
      hintLink="Sign in"
      hintHref="/login"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Full name</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-fuchsia-300/70 focus:ring-2 focus:ring-fuchsia-400/20"
            type="text"
            placeholder="Sharon Blessy"
            value={formState.fullName}
            onChange={(event) =>
              setFormState((current) => ({ ...current, fullName: event.target.value }))
            }
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Email address</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-fuchsia-300/70 focus:ring-2 focus:ring-fuchsia-400/20"
            type="email"
            placeholder="you@example.com"
            value={formState.email}
            onChange={(event) =>
              setFormState((current) => ({ ...current, email: event.target.value }))
            }
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Password</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-fuchsia-300/70 focus:ring-2 focus:ring-fuchsia-400/20"
            type="password"
            placeholder="At least 6 characters"
            value={formState.password}
            onChange={(event) =>
              setFormState((current) => ({ ...current, password: event.target.value }))
            }
          />
        </label>

        <button
          className="inline-flex w-full items-center justify-center rounded-2xl bg-fuchsia-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-fuchsia-300 disabled:cursor-not-allowed disabled:bg-fuchsia-900/50 disabled:text-slate-400"
          disabled={isSigningUp}
          type="submit"
        >
          {isSigningUp ? "Creating your account..." : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}

export default SignUpPage;
