import React from 'react';
import { Delete } from 'lucide-react'; 
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion'; 

interface NumericKeypadProps {
  onPress: (digit: string) => void;
  onDelete: () => void;
  onConfirm: () => void;
  className?: string;
  confirmLabel?: string;
}

const Key: React.FC<{ 
  children: React.ReactNode; onClick: () => void; variant?: 'default' | 'action'; className?: string;
}> = ({ children, onClick, variant = 'default', className }) => {
  const handleTap = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
    onClick();
  };
  return (
    <motion.button whileTap={{ scale: 0.9 }} onClick={handleTap}
      className={cn("flex-1 h-16 text-2xl font-medium rounded-xl flex items-center justify-center transition-colors select-none", variant === 'default' ? "bg-transparent hover:bg-gray-100 text-slate-800" : "bg-black text-white shadow-sm", className)}>
      {children}
    </motion.button>
  );
};

export const NumericKeypad: React.FC<NumericKeypadProps> = ({ onPress, onDelete, onConfirm, className, confirmLabel = "OK" }) => {
  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0"];
  return (
    <div className={cn("w-full bg-slate-50 p-4 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]", className)}>
      <div className="grid grid-cols-3 gap-3">
        {digits.map(d => <Key key={d} onClick={() => onPress(d)}>{d}</Key>)}
        <Key onClick={onDelete} className="text-slate-500"><Delete size={28} /></Key>
      </div>
      <div className="mt-4"><Key onClick={onConfirm} variant="action" className="w-full h-14 rounded-2xl text-lg font-semibold">{confirmLabel}</Key></div>
    </div>
  );
};