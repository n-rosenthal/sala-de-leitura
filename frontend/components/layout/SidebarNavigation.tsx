"use client";

import { 
  Home, 
  Book, 
  Users, 
  CalendarCheck,
  LogOut 
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { icon: <Home size={20} />, label: "Dashboard", href: "/dashboard" },
  { icon: <Book size={20} />, label: "Livros", href: "/livros" },
  { icon: <CalendarCheck size={20} />, label: "Empréstimos", href: "/emprestimos" },
  { icon: <Users size={20} />, label: "Associados", href: "/associados" },
];

export function SidebarNavigation({ userRole }: { userRole?: string }) {
  const pathname = usePathname();

  // Example of a modal trigger using search params[citation:2]
  const newBookUrl = `/livros?modal=novo`;

  return (
    <div className="flex flex-col h-full p-4">
      {/* Logo */}
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold text-blue-700">Sala de Leitura</h1>
        <p className="text-xs text-gray-500">Sistema de Gestão</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick Action for Gerente */}
      {userRole === "gerente" && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm font-medium text-blue-800 mb-2">Ações Rápidas</p>
          <Link
            href={newBookUrl}
            className="flex items-center justify-center gap-2 w-full bg-white text-blue-700 border border-blue-300 hover:bg-blue-50 py-2 px-3 rounded-md text-sm font-medium transition-colors"
          >
            <Book size={16} />
            Novo Livro
          </Link>
        </div>
      )}

      {/* User Footer */}
      <div className="pt-4 border-t border-gray-200">
        <button className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg w-full transition-colors">
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}
