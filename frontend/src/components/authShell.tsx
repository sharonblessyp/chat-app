import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type AuthShellProps = {
  title: string;
  hint: string;
  hintLink: string;
  hintHref: string;
  children: ReactNode;
};

function AuthShell({
  title,
  hint,
  hintLink,
  hintHref,
  children,
}: AuthShellProps) {
  return (
    <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60 shadow-[0_30px_90px_rgba(2,8,23,0.55)] backdrop-blur xl:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden border-r border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.24),_transparent_32%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.95))] p-10 text-slate-100 xl:flex xl:flex-col xl:justify-between">
        <div>
          <div className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Chatify workspace
          </div>
          <h1 className="mt-8 max-w-md text-5xl font-black leading-tight text-white">
            Conversations that feel fast, calm, and personal.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-8 text-slate-300">
            Keep every message, profile update, and contact in one focused place.
            This frontend is already wired to your auth and messaging backend.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Built-in flow</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-200">
            <li>JWT cookie auth with refresh-safe check route</li>
            <li>Profile photo updates through Cloudinary</li>
            <li>Contact list, chats, and message history</li>
          </ul>
        </div>
      </section>

      <section className="p-6 sm:p-10 xl:p-12">
        <div className="mx-auto max-w-md">
          <h2 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-4xl">
            {title}
          </h2>
          
          <div className="mt-8">{children}</div>

          <p className="mt-6 text-sm text-slate-400">
            {hint}{" "}
            <Link className="font-semibold text-cyan-300 transition hover:text-cyan-200" to={hintHref}>
              {hintLink}
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default AuthShell;
