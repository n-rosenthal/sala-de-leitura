// frontend/components/dashboard/SalaDeLeituraCard.tsx

import { ReactNode } from 'react';

interface SalaDeLeituraCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actionText?: string;
  actionLink?: string;
}

export function SalaDeLeituraCard({ 
  title, 
  subtitle, 
  children, 
  actionText, 
  actionLink 
}: SalaDeLeituraCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header do card */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {actionText && actionLink && (
            <a
              href={actionLink}
              className="text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors"
            >
              {actionText} →
            </a>
          )}
        </div>
      </div>
      
      {/* Conteúdo do card */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}