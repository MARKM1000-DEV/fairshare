import { useState, useEffect } from 'react';
import { NumericKeypad } from '../../components/ui/NumericKeypad';
import { MoneyDisplay } from '../../components/ui/MoneyDisplay';
import { Modal } from '../../components/ui/Modal';
import { useBillStore } from '../../store/useBillStore';
import { cn, formatCurrency } from '../../lib/utils';
import { Users, User, Minus, Plus, Info } from 'lucide-react';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddItemModal = ({ isOpen, onClose }: AddItemModalProps) => {
  const addItem = useBillStore(state => state.addItem);
  
  const [amountString, setAmountString] = useState("0");
  const [name, setName] = useState("Cerveja");
  
  const [quantity, setQuantity] = useState(1);
  const [pricingMode, setPricingMode] = useState<'unit' | 'fixed'>('unit'); 
  
  useEffect(() => {
    if (isOpen) {
      setAmountString("0");
      setName("Cerveja");
      setQuantity(1);
      setPricingMode('unit'); 
    }
  }, [isOpen]);

  const handleModeChange = (mode: 'unit' | 'fixed') => {
      setPricingMode(mode);
      if (mode === 'unit') setQuantity(1);
  };

  const handleKeypadPress = (digit: string) => {
    setAmountString(prev => {
      if (prev.length >= 7) return prev;
      if (prev === "0") return digit;
      return prev + digit;
    });
  };

  const handleKeypadDelete = () => {
    setAmountString(prev => (prev.length <= 1 ? "0" : prev.slice(0, -1)));
  };

  const handleConfirm = () => {
    const unitPrice = parseInt(amountString, 10);
    if (unitPrice > 0) {
      if (pricingMode === 'fixed' && quantity > 1) {
        const totalPrice = unitPrice * quantity;
        const finalName = `${name} (${quantity}x)`;
        addItem(finalName, totalPrice, 'fixed');
      } else {
        addItem(name, unitPrice, pricingMode);
      }
      onClose();
    }
  };

  const quickNames = [
    "Cerveja", "Drink", "Água", "Refri", "Suco", 
    "Caipirinha", "Porção", "Pizza", "Vinho", "Outros"
  ];

  const totalPreview = parseInt(amountString, 10) * quantity;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Item Extra">
      {/* FIX CRÍTICO: h-[80vh] força o modal a ter altura fixa no mobile.
         Assim o flex-col sabe calcular o espaço restante para a rolagem.
      */}
      <div className="flex flex-col h-[80vh] sm:h-auto justify-between">
        
        {/* ÁREA DE CIMA (Scrollável se faltar espaço) */}
        <div className="flex-1 overflow-y-auto min-h-0 pb-2">
            
            {/* 1. Visualizador Compacto */}
            <div className="bg-gray-50 py-2 relative flex flex-col items-center justify-center transition-all shrink-0 rounded-b-2xl mb-2">
              <div className="flex items-center gap-4 mb-1">
                 <div className="flex flex-col items-center">
                    <span className="text-[9px] text-gray-400 uppercase font-bold">Valor Unitário</span>
                    {/* Money Display Reduzido */}
                    <MoneyDisplay value={parseInt(amountString, 10)} className="scale-75 origin-center -my-1" />
                 </div>

                 {pricingMode === 'fixed' && (
                     <>
                        <div className="text-gray-300 font-bold text-xs">X</div>
                        <div className="flex flex-col items-center animate-in fade-in slide-in-from-left-4 duration-300">
                            <span className="text-[9px] text-gray-400 uppercase font-bold">Qtd</span>
                            <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm h-8">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-8 h-full flex items-center justify-center text-gray-500 active:bg-gray-100 rounded-l-lg border-r border-gray-100"><Minus size={14} /></button>
                                <div className="w-8 text-center font-bold text-sm text-gray-800">{quantity}</div>
                                <button onClick={() => setQuantity(q => q + 1)} className="w-8 h-full flex items-center justify-center text-gray-500 active:bg-gray-100 rounded-r-lg border-l border-gray-100"><Plus size={14} /></button>
                            </div>
                        </div>
                     </>
                 )}
              </div>
              
              {/* Botões de Modo Compactos */}
              <div className="flex bg-white p-0.5 rounded-lg shadow-sm border border-gray-100 relative z-10">
                <button onClick={() => handleModeChange('unit')} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors", pricingMode === 'unit' ? "bg-black text-white" : "text-gray-500 hover:bg-gray-50")}>
                    <User size={14} /> Por Pessoa
                </button>
                <button onClick={() => handleModeChange('fixed')} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors", pricingMode === 'fixed' ? "bg-black text-white" : "text-gray-500 hover:bg-gray-50")}>
                    <Users size={14} /> Dividir
                </button>
              </div>
              
              <div className="mt-2 text-center px-4 h-5">
                 {pricingMode === 'fixed' && quantity > 1 ? (
                     <p className="text-[10px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded inline-block">
                        Total: <strong>{formatCurrency(totalPreview)}</strong> (Dividido)
                     </p>
                 ) : pricingMode === 'unit' ? (
                     <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                        <Info size={10} /> Quem consumiu? (Próxima tela)
                     </p>
                 ) : (
                     <p className="text-[10px] text-gray-400 uppercase tracking-wide">Dividido entre todos</p>
                 )}
              </div>
            </div>

            {/* 2. Chips (Sugestões) */}
            <div className="px-4 py-1 overflow-x-auto whitespace-nowrap hide-scrollbar shrink-0 mb-2">
              <div className="flex gap-2">
                {quickNames.map(n => (
                  <button
                    key={n}
                    onClick={() => {
                        setName(n);
                        if (['Pizza', 'Porção', 'Vinho'].includes(n)) handleModeChange('fixed');
                        else handleModeChange('unit');
                    }}
                    className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-colors border", name === n ? "bg-black text-white border-black" : "bg-white text-gray-600 border-gray-200")}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Input Nome */}
            <div className="px-6 py-1 shrink-0">
               <input 
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full text-center text-base font-medium text-gray-700 border-b border-transparent focus:border-black focus:outline-none placeholder:text-gray-300 pb-1"
                  placeholder="Nome do item..."
               />
            </div>
        </div>

        {/* 4. Teclado (FIXO NO FINAL) - shrink-0 impede que ele seja esmagado */}
        <div className="mt-auto bg-white pt-2 border-t border-gray-50 shrink-0">
            <NumericKeypad
              onPress={handleKeypadPress} onDelete={handleKeypadDelete} onConfirm={handleConfirm}
              confirmLabel={pricingMode === 'fixed' && quantity > 1 ? `Adicionar (${quantity}x)` : "Adicionar"}
              className="shadow-none bg-white pb-0" // pb-0 pois o modal já tem padding
            />
        </div>

      </div>
    </Modal>
  );
};