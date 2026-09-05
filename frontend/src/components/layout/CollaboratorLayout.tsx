import {
  NavLink,
  Outlet,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import { logout } from "../../lib/auth";

import sasLogo from "../../assets/logo/sasbio-logo-semfundo.png";

// ─────────────────────────────────────────────────────────────
// ÍCONES
// ─────────────────────────────────────────────────────────────

function DashboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-[19px] w-[19px]"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </svg>
  );
}

function DiagnosticIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-[19px] w-[19px]"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="5"
        y="4"
        width="14"
        height="17"
        rx="2"
      />

      <path d="M9 4.5V3h6v1.5" />
      <path d="M8 10h8" />
      <path d="M8 14h4" />
      <path d="m14 15 1.5 1.5L18 14" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-[19px] w-[19px]"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v6h6" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-[19px] w-[19px]"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21c0-4 3.1-7 7-7s7 3 7 7" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-[19px] w-[19px]"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 4H5v16h5" />
      <path d="M14 8l4 4-4 4" />
      <path d="M8 12h10" />
    </svg>
  );
}

function CollapseIcon({
  collapsed,
}: {
  collapsed: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`
        h-[17px]
        w-[17px]

        transition-transform
        duration-500

        ${collapsed ? "rotate-180" : ""}
      `}
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// MENU
// ─────────────────────────────────────────────────────────────

const navItems = [
  {
    label: "Dashboard",
    to: "/colaborador/dashboard",
    icon: <DashboardIcon />,
  },
  {
    label: "Diagnóstico",
    to: "/colaborador/diagnostico",
    icon: <DiagnosticIcon />,
  },
  {
    label: "Histórico",
    to: "/colaborador/historico",
    icon: <HistoryIcon />,
  },
  {
    label: "Perfil",
    to: "/colaborador/perfil",
    icon: <UserIcon />,
  },
];

// ─────────────────────────────────────────────────────────────
// LAYOUT
// ─────────────────────────────────────────────────────────────

export default function CollaboratorLayout() {
  const [collapsed, setCollapsed] =
    useState(false);

  // ───────────────────────────────────────────────────────────
  // PREFERÊNCIA DO MENU
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    const saved =
      localStorage.getItem(
        "collaborator_sidebar_collapsed"
      );

    if (saved === "true") {
      setCollapsed(true);
    }
  }, []);

  function toggleSidebar() {
    setCollapsed((previous) => {
      const next = !previous;

      localStorage.setItem(
        "collaborator_sidebar_collapsed",
        String(next)
      );

      return next;
    });
  }

  return (
    <div
      className="
        min-h-[100svh]

        bg-[#f8f9fa]

        font-['Manrope',sans-serif]
      "
    >
      {/* ===================================================== */}
      {/* SIDEBAR                                              */}
      {/* ===================================================== */}

      <aside
        className={`
          fixed

          bottom-3
          left-3
          top-3

          z-50

          hidden

          overflow-hidden

          rounded-[30px]

          border
          border-slate-200/70

          bg-white/95

          shadow-[0_20px_70px_rgba(15,23,42,0.07)]

          backdrop-blur-xl

          transition-[width]
          duration-500
          ease-[cubic-bezier(.22,1,.36,1)]

          md:flex
          md:flex-col

          ${
            collapsed
              ? "w-[92px]"
              : "w-[270px]"
          }
        `}
      >
        {/* =================================================== */}
        {/* GLOWS                                               */}
        {/* =================================================== */}

        <div
          className="
            pointer-events-none

            absolute
            -left-24
            top-20

            h-52
            w-52

            rounded-full

            bg-blue-200/20

            blur-[80px]
          "
        />

        <div
          className="
            pointer-events-none

            absolute
            -right-24
            bottom-20

            h-52
            w-52

            rounded-full

            bg-emerald-200/20

            blur-[80px]
          "
        />

        {/* =================================================== */}
        {/* CABEÇALHO SIDEBAR                                   */}
        {/* =================================================== */}

        <div
          className={`
            relative
            z-20

            flex
            h-[105px]
            shrink-0

            items-center

            border-b
            border-slate-100

            transition-all
            duration-500

            ${
              collapsed
                ? "justify-center px-3"
                : "justify-between px-6"
            }
          `}
        >
          {/* LOGO */}

          <NavLink
            to="/colaborador/dashboard"
            className="
              flex
              min-w-0
              items-center
            "
          >
            <img
              src={sasLogo}
              alt="SASBIO"
              className={`
                w-auto

                object-contain

                transition-all
                duration-500

                ${
                  collapsed
                    ? "h-9 max-w-[54px]"
                    : "h-14 max-w-[150px]"
                }
              `}
            />
          </NavLink>

          {/* RECOLHER */}

          {!collapsed && (
            <button
              type="button"
              onClick={toggleSidebar}
              title="Recolher menu"
              className="
                flex
                h-9
                w-9
                shrink-0

                cursor-pointer

                items-center
                justify-center

                rounded-[12px]

                border
                border-slate-200

                bg-white

                text-slate-400

                transition-all
                duration-300

                hover:border-blue-200
                hover:bg-blue-50
                hover:text-blue-600
              "
            >
              <CollapseIcon
                collapsed={false}
              />
            </button>
          )}

          {/* EXPANDIR */}

          {collapsed && (
            <button
              type="button"
              onClick={toggleSidebar}
              title="Expandir menu"
              className="
                absolute
                -right-3
                top-1/2

                flex
                h-7
                w-7

                -translate-y-1/2

                cursor-pointer

                items-center
                justify-center

                rounded-full

                border
                border-slate-200

                bg-white

                text-slate-400

                shadow-[0_6px_18px_rgba(15,23,42,0.08)]

                transition-all
                duration-300

                hover:border-blue-200
                hover:text-blue-600
              "
            >
              <CollapseIcon collapsed />
            </button>
          )}
        </div>

        {/* =================================================== */}
        {/* MENU                                                */}
        {/* =================================================== */}

        <nav
          className="
            relative
            z-10

            min-h-0
            flex-1

            overflow-y-auto
            overflow-x-hidden

            px-4
            py-7

            [&::-webkit-scrollbar]:w-1
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-slate-200
          "
        >
          {!collapsed && (
            <div className="mb-7 px-3">
              <p
                className="
                  text-[9px]
                  font-medium
                  uppercase

                  tracking-[0.22em]

                  text-slate-400
                "
              >
                Área do colaborador
              </p>

              <p
                className="
                  mt-2

                  text-[11px]
                  font-light
                  leading-5

                  text-slate-400
                "
              >
                Sua saúde e acompanhamento
              </p>
            </div>
          )}

          {/* OPÇÕES */}

          <div
            className="
              flex
              flex-col
              gap-4
            "
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                title={
                  collapsed
                    ? item.label
                    : undefined
                }
                className={({ isActive }) =>
                  `
                    group
                    relative

                    flex

                    h-[58px]
                    w-full

                    shrink-0

                    items-center

                    overflow-hidden

                    rounded-[18px]

                    transition-all
                    duration-300
                    ease-out

                    ${
                      collapsed
                        ? "justify-center px-2"
                        : "gap-4 px-3"
                    }

                    ${
                      isActive
                        ? `
                          bg-slate-950
                          text-white

                          shadow-[0_12px_30px_rgba(15,23,42,0.13)]
                        `
                        : `
                          text-slate-500

                          hover:bg-slate-50
                          hover:text-slate-950
                        `
                    }
                  `
                }
              >
                {({ isActive }) => (
                  <>
                    {/* GRADIENTE */}

                    <span
                      aria-hidden="true"
                      className={`
                        pointer-events-none

                        absolute
                        inset-0

                        bg-gradient-to-r

                        from-blue-500/10
                        via-transparent
                        to-emerald-500/10

                        transition-opacity
                        duration-300

                        ${
                          isActive
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        }
                      `}
                    />

                    {/* ÍCONE */}

                    <span
                      className={`
                        relative
                        z-10

                        flex

                        h-9
                        w-9
                        shrink-0

                        items-center
                        justify-center

                        rounded-[11px]

                        transition-all
                        duration-300

                        ${
                          isActive
                            ? `
                              bg-white/10
                              text-white
                            `
                            : `
                              bg-slate-100
                              text-slate-400

                              group-hover:bg-blue-50
                              group-hover:text-blue-600
                            `
                        }
                      `}
                    >
                      {item.icon}
                    </span>

                    {/* TEXTO */}

                    {!collapsed && (
                      <span
                        className="
                          relative
                          z-10

                          whitespace-nowrap

                          text-[13px]
                          font-normal
                        "
                      >
                        {item.label}
                      </span>
                    )}

                    {/* INDICADOR */}

                    {isActive &&
                      !collapsed && (
                        <span
                          className="
                            absolute
                            right-4

                            h-1.5
                            w-1.5

                            rounded-full

                            bg-emerald-400

                            shadow-[0_0_10px_rgba(52,211,153,0.8)]
                          "
                        />
                      )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* =================================================== */}
        {/* SAIR - SEMPRE VISÍVEL                              */}
        {/* =================================================== */}

        <div
          className="
            relative
            z-20

            shrink-0

            border-t
            border-slate-100

            bg-white/90

            p-4

            backdrop-blur-xl
          "
        >
          <button
            type="button"
            onClick={logout}
            title={
              collapsed
                ? "Sair"
                : undefined
            }
            className={`
              group

              flex
              h-[58px]
              w-full

              cursor-pointer

              items-center

              rounded-[18px]

              text-left

              text-[13px]
              font-normal

              text-slate-500

              transition-all
              duration-300

              hover:bg-red-50
              hover:text-red-600

              ${
                collapsed
                  ? "justify-center px-2"
                  : "gap-4 px-3"
              }
            `}
          >
            <span
              className="
                flex
                h-9
                w-9
                shrink-0

                items-center
                justify-center

                rounded-[11px]

                bg-slate-100

                text-slate-400

                transition-all
                duration-300

                group-hover:bg-red-100
                group-hover:text-red-500
              "
            >
              <LogoutIcon />
            </span>

            {!collapsed && (
              <span>Sair</span>
            )}
          </button>
        </div>
      </aside>

      {/* ===================================================== */}
      {/* CONTEÚDO                                             */}
      {/* ===================================================== */}

      <div
        className={`
          min-h-[100svh]

          transition-[margin]
          duration-500
          ease-[cubic-bezier(.22,1,.36,1)]

          ${
            collapsed
              ? "md:ml-[116px]"
              : "md:ml-[294px]"
          }
        `}
      >
        {/* =================================================== */}
        {/* HEADER                                              */}
        {/* =================================================== */}

        <header
          className="
            sticky
            top-0
            z-40

            flex
            h-[76px]

            items-center
            justify-between

            border-b
            border-slate-200/70

            bg-[#f8f9fa]/90

            px-5

            backdrop-blur-xl

            sm:px-7
            lg:px-8
          "
        >
          <div>
            <p
              className="
                text-[9px]
                font-medium
                uppercase

                tracking-[0.2em]

                text-slate-400
              "
            >
              Área do colaborador
            </p>

            <p
              className="
                mt-1

                text-sm
                font-normal

                text-slate-800
              "
            >
              Seu espaço de acompanhamento
            </p>
          </div>

          <NavLink
            to="/colaborador/perfil"
            className={({ isActive }) =>
              `
                group

                inline-flex
                h-[44px]

                items-center
                gap-3

                rounded-[14px]

                px-3

                text-sm
                font-normal

                transition-all
                duration-300

                ${
                  isActive
                    ? `
                      bg-slate-950
                      text-white
                    `
                    : `
                      text-slate-500

                      hover:bg-white
                      hover:text-slate-950

                      hover:shadow-[0_8px_25px_rgba(15,23,42,0.06)]
                    `
                }
              `
            }
          >
            <span
              className="
                flex
                h-8
                w-8

                items-center
                justify-center

                rounded-[10px]

                bg-gradient-to-br
                from-blue-50
                to-emerald-50

                text-blue-600
              "
            >
              <UserIcon />
            </span>

            <span className="hidden sm:block">
              Meu perfil
            </span>
          </NavLink>
        </header>

        {/* =================================================== */}
        {/* MOBILE                                             */}
        {/* =================================================== */}

        <div
          className="
            border-b
            border-slate-200

            bg-white

            px-4
            py-3

            md:hidden
          "
        >
          <div
            className="
              flex
              gap-3

              overflow-x-auto

              pb-1

              [&::-webkit-scrollbar]:hidden
              [-ms-overflow-style:none]
              [scrollbar-width:none]
            "
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `
                    flex
                    h-[44px]
                    shrink-0

                    items-center
                    gap-2.5

                    rounded-[14px]

                    px-4

                    text-xs
                    font-normal

                    transition-all

                    ${
                      isActive
                        ? `
                          bg-slate-950
                          text-white
                        `
                        : `
                          bg-slate-50
                          text-slate-500
                        `
                    }
                  `
                }
              >
                {item.icon}

                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* =================================================== */}
        {/* PÁGINAS                                            */}
        {/* =================================================== */}

        <main
          className="
            min-h-[calc(100svh-76px)]

            p-4

            sm:p-6
            lg:p-8
          "
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}