import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logoSemFundo from "../../assets/logo/logosasgrande-semfundo.png";

const navItems = [
  {
    label: "Início",
    to: "/",
  },
  {
    label: "Planos",
    to: "/planos",
  },
  {
    label: "Contato",
    to: "/contato",
  },
];

export default function NavbarPublic() {
  const [isOpen, setIsOpen] = useState(false);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#047CAB] via-[#159A8D] to-[#30B057] shadow-md">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" onClick={closeMenu} className="flex items-center">
          <img
            src={logoSemFundo}
            alt="Logo SASBIO"
            className="h-22 w-auto object-contain"
          />
        </Link>

        {/* Links desktop */}
        <div className="hidden items-center gap-10 md:flex h-22">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-base font-semibold text-white transition hover:text-white ${
                  isActive ? "opacity-100" : "opacity-95"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Ações desktop */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Entrar
          </Link>

          <Link
            to="/cadastro"
            className="rounded-xl bg-[#30B057] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#26994B]"
          >
            Cadastrar
          </Link>
        </div>

        {/* Botão mobile */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-sm md:hidden"
          aria-label="Abrir menu"
        >
          {isOpen ? (
            <span className="text-2xl leading-none">×</span>
          ) : (
            <span className="text-2xl leading-none">☰</span>
          )}
        </button>
      </nav>

      {/* Menu mobile */}
      {isOpen && (
        <div className="border-t border-white/10 bg-[#047CAB] px-6 py-5 shadow-lg md:hidden">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="mt-3 grid gap-3 border-t border-white/10 pt-4">
              <Link
                to="/login"
                onClick={closeMenu}
                className="rounded-2xl border border-white/20 px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Entrar
              </Link>

              <Link
                to="/cadastro"
                onClick={closeMenu}
                className="rounded-2xl bg-[#30B057] px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Cadastrar
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}