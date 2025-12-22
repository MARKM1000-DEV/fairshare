import React from 'react';
import { cn } from '../../lib/utils'; 

export const MobileShell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <div className="min-h-screen w-full bg-gray-50 flex justify-center overflow-hidden">
      <main className={cn("w-full max-w-md h-[100dvh] bg-white flex flex-col relative shadow-2xl overflow-hidden", className)}>
        {children}
      </main>
    </div>
  );
};