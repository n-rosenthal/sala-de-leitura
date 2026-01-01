"use client";

import { ReactNode, useState, createContext, useContext } from "react";
import { Menu, X } from "lucide-react";

// Create context for sidebar state
interface SidebarContextType {
  isOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a DashboardLayout");
  }
  return context;
};

interface DashboardLayoutProps {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
}

export function DashboardLayout({ sidebar, header, children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <SidebarContext.Provider value={{ isOpen: isSidebarOpen, toggleSidebar, closeSidebar }}>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Mobile sidebar overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed md:sticky top-0 left-0 z-50 h-screen w-64 transform
            bg-white shadow-xl transition-transform duration-300 ease-in-out
            md:translate-x-0 md:shadow-lg
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            border-r border-gray-200
          `}
        >
          {/* Mobile close button */}
          <div className="flex items-center justify-end p-4 md:hidden">
            <button
              onClick={closeSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Fechar menu"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>
          
          {/* Sidebar content */}
          <div className="h-full overflow-y-auto">
            {sidebar}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col w-full min-w-0">
          {/* Header with mobile menu button */}
          <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 md:px-6">
              {/* Mobile menu button */}
              <button
                onClick={toggleSidebar}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Abrir menu"
              >
                <Menu size={24} className="text-gray-700" />
              </button>

              {/* Header content - passed from parent */}
              <div className="flex-1 ml-4 md:ml-0">
                {header}
              </div>
            </div>
          </header>

          {/* Main content area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              {/* Animated container for page transitions */}
              <div className="animate-fadeIn">
                {children}
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 py-4 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} Sala de Leitura. Todos os direitos reservados.
              </p>
              <p className="text-sm text-gray-500 mt-2 md:mt-0">
                Sistema de Gestão de Biblioteca v1.0
              </p>
            </div>
          </footer>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}

// CSS animation for fade-in effect (add to your globals.css or component)
// @keyframes fadeIn {
//   from { opacity: 0; transform: translateY(10px); }
//   to { opacity: 1; transform: translateY(0); }
// }
// .animate-fadeIn {
//   animation: fadeIn 0.3s ease-out;
// }