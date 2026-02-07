"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout/`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    router.replace("/login");
  }

  const NavLink = ({
    href,
    children,
    onClick,
  }: {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <Link
      href={href}
      onClick={onClick}
      className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
    >
      {children}
    </Link>
  );

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="text-lg font-semibold text-gray-900"
          >
            Sala de Leitura
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/livros">Livros</NavLink>
            <NavLink href="/associados">Associados</NavLink>
            <NavLink href="/emprestimos">Empréstimos</NavLink>

            <button
              onClick={handleLogout}
              className="ml-4 text-sm font-medium text-red-600 hover:underline"
            >
              Sair
            </button>
          </div>

          {/* Mobile button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-xl"
            aria-label="Abrir menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="flex flex-col px-4 py-3 gap-3">
            <NavLink href="/dashboard" onClick={() => setOpen(false)}>
              Dashboard
            </NavLink>
            <NavLink href="/livros" onClick={() => setOpen(false)}>
              Livros
            </NavLink>
            <NavLink href="/associados" onClick={() => setOpen(false)}>
              Associados
            </NavLink>
            <NavLink href="/emprestimos" onClick={() => setOpen(false)}>
              Empréstimos
            </NavLink>

            <hr className="my-2" />

            <button
              onClick={handleLogout}
              className="text-left text-sm font-medium text-red-600"
            >
              Sair
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

