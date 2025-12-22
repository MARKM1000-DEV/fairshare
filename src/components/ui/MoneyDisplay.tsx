import React from 'react';
import { cn, formatCurrency } from '../../lib/utils';

interface MoneyDisplayProps {
  value: number; // Em centavos
  className?: string;
  label?: string;
}

export const MoneyDisplay: React.FC<MoneyDisplayProps> = ({ value, className, label }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-6", className)}>
      {label && (
        <span className="text-sm font-medium text-gray-400 mb-1 tracking-wide uppercase">
          {label}
        </span>
      )}
      <div className={cn(
        "text-5xl font-bold tracking-tight transition-colors",
        value === 0 ? "text-gray-300" : "text-black"
      )}>
        {formatCurrency(value)}
      </div>
    </div>
  );
};