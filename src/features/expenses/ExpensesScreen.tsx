import { useState } from 'react';
import { Plus, ArrowRight, ArrowLeft, Trash2 } from 'lucide-react'; // Import Trash2
import { useBillStore } from '../../store/useBillStore';
import { formatCurrency, cn } from '../../lib/utils';
import { AddItemModal } from './AddItemModal';
import { motion } from 'framer-motion';

export const ExpensesScreen = () => {
  const { items, removeItem, setStep, config, people } = useBillStore(); // Adicione removeItem
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- CÁLCULOS MATEMÁTICOS ---
  const totalExtras = items.reduce((acc, item) => acc + item.price, 0);
  
  const rodizioTotal = config.fixedCost * people.length;
  
  const couvertTotal = config.couvertMode === 'person' 
      ? config.couvert * people.length 
      : config.couvert; 

  const totalFixed = rodizioTotal + couvertTotal;

  // Lógica de navegação
  const handleNextStep = () => {
    if (items.length === 0) {
        setStep('summary'); 
    } else {
        setStep('distribution');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      
      {/* HEADER */}
      <div className="bg-white px-6 pt-6 pb-4 shadow-sm z-10 rounded-b-2xl">
        <div className="flex items-center justify-between mb-4">
            <button 
                onClick={() => setStep('setup')} 
                className="p-2 -ml-2 text-gray-400 hover:text-black transition-colors rounded-full active:bg-gray-100"
            >
                <ArrowLeft size={24} />
            </button>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Módulo 2</span>
            <div className="w-8" /> 
        </div>

        <h1 className="text-2xl font-bold mb-1 text-gray-900">O que foi pedido?</h1>
        <p className="text-gray-500 text-sm">Adicione tudo que não faz parte do rodízio.</p>
        
        <div className="mt-6 flex justify-between items-end bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Total Extras</span>
                <div className="text-xl font-bold text-ios-blue">{formatCurrency(totalExtras)}</div>
            </div>
            <div className="text-right">
                 <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Total da Base</span>
                 <div className="text-lg font-semibold text-gray-600">
                    {formatCurrency(totalFixed)}
                 </div>
            </div>
        </div>
      </div>

      {/* LISTA DE ITENS */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-32">
        {items.length === 0 ? (
          <div className="text-center mt-20 opacity-40 select-none">
            <div className="text-6xl mb-4 grayscale">🍽️</div>
            <p className="mt-2 font-medium">Só o básico por enquanto.</p>
            <p className="text-sm">Se ninguém pediu extra, pode avançar.</p>
          </div>
        ) : (
          items.map((item) => (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={item.id}
                className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center border border-gray-100"
            >
                <div className="flex-1">
                    <span className="font-bold text-gray-800 text-lg">{item.name}</span>
                    <div className="flex gap-2 mt-1">
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold uppercase">
                            {item.pricingMode === 'unit' ? 'Individual' : 'Dividido'}
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="font-semibold text-gray-900 text-lg">
                        {formatCurrency(item.price)}
                    </div>
                    {/* BOTÃO DE EXCLUIR */}
                    <button 
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </motion.div>
          ))
        )}
      </div>

      {/* BOTÕES FLUTUANTES */}
      <div className="absolute bottom-6 left-6 right-6 flex gap-3 pointer-events-none">
        <button 
            onClick={() => setIsModalOpen(true)}
            className="pointer-events-auto flex-1 bg-black text-white h-14 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
            <Plus strokeWidth={3} size={20} />
            <span className="text-sm sm:text-lg">Novo Item</span>
        </button>

        <button 
            onClick={handleNextStep}
            className={cn(
                "pointer-events-auto h-14 rounded-2xl flex items-center justify-center shadow-xl active:scale-95 transition-transform px-6 font-bold gap-2",
                items.length === 0 
                    ? "bg-white text-gray-800 border-2 border-gray-200"
                    : "bg-ios-blue text-white w-20"
            )}
        >
            {items.length === 0 ? (
                <>
                    <span className="whitespace-nowrap text-sm">Sem Extras</span>
                    <ArrowRight strokeWidth={3} size={18} />
                </>
            ) : (
                <ArrowRight strokeWidth={3} size={24} />
            )}
        </button>
      </div>

      <AddItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};