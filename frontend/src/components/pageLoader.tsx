function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-slate-950/60 px-6 py-5 text-sm text-slate-200 shadow-2xl shadow-slate-950/40 backdrop-blur">
        <span className="size-4 animate-spin rounded-full border-2 border-cyan-300/30 border-t-cyan-300" />
        <span>Loading...</span>
      </div>
    </div>
  );
}

export default PageLoader;
