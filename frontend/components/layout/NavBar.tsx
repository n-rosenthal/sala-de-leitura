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

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between">
          
          {/* Logo / Home */}
          <Link href="/" className="font-semibold text-lg">
            Sala de Leitura
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="hover:text-blue-600">
              Início
            </Link>

            <button
              onClick={handleLogout}
              className="text-red-600 hover:underline"
            >
              Sair
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden"
            aria-label="Abrir menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="flex flex-col px-4 py-2 gap-2">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="py-2"
            >
              Início
            </Link>

            <button
              onClick={handleLogout}
              className="py-2 text-left text-red-600"
            >
              Sair
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
