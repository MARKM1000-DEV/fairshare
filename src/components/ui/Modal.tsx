import { X } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '../../lib/utils'; // Agora será usado lá embaixo!

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string; // Permite passar estilos extras
}

export const Modal = ({ isOpen, onClose, title, children, className }: ModalProps) => {
  
  // Bloqueia a rolagem do fundo quando o modal abre
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Área clicável fora do modal para fechar */}
      <div className="absolute inset-0" onClick={onClose} />

      <div 
        className={cn(
          "bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 relative z-10",
          className // Aqui aplicamos as classes extras se houver
        )}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="h-full">
            {children}
        </div>
      </div>
    </div>
  );
};