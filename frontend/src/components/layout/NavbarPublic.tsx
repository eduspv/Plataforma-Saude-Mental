 export function NavbarPublic() {
  return (
    <header className="absolute left-1/2 top-5 z-50 -translate-x-1/2">
      <nav
        className="
          flex items-center gap-2 rounded-[28px]
          border border-white/40 bg-white/80
          p-2 shadow-lg shadow-black/10 backdrop-blur-md
        "
      >
        <a
          href="/"
          className="
            inline-flex items-center gap-2 rounded-[20px]
            bg-emerald-50 px-5 py-3 text-sm font-semibold
            text-emerald-900 transition hover:bg-emerald-100
          "
        >
          <span className="text-base">✦</span>
          <span>Health-Care</span>
        </a>

        <a
          href="/company"
          className="
            rounded-[20px] px-5 py-3 text-sm font-medium
            text-slate-700 transition hover:bg-slate-100
          "
        >
          Company
        </a>

        <a
          href="/demo"
          className="
            rounded-[20px] px-5 py-3 text-sm font-medium
            text-slate-700 transition hover:bg-slate-100
          "
        >
          Demo
        </a>

        <a
          href="/login"
          className="
            rounded-[20px] bg-slate-200 px-5 py-3
            text-sm font-medium text-slate-700
            transition hover:bg-slate-300
          "
        >
          Login
        </a>
      </nav>
    </header>
  );
}