import { useState, useEffect } from 'react';
import { useBillStore } from '../../store/useBillStore';
import { formatCurrency, cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { ArrowRight, Users, User, Minus, Plus, ArrowLeft, CheckCircle2, Circle } from 'lucide-react';

export const DistributionScreen = () => {
  const { items, people, incrementAssignment, decrementAssignment, setStep } = useBillStore();
  
  const [activeItemId, setActiveItemId] = useState<string | null>(items.length > 0 ? items[0].id : null);
  const activeItem = items.find(i => i.id === activeItemId);

  useEffect(() => {
    if (!activeItem && items.length > 0) {
        setActiveItemId(items[0].id);
    }
  }, [items, activeItem]);

  // --- LÓGICA DE TOGGLE SIMPLIFICADA (SIM/NÃO) ---
  const handleTogglePerson = (personId: string) => {
      if (!activeItem) return;

      // Verifica se a pessoa JÁ está na lista
      const isSelected = activeItem.assignedTo.includes(personId);

      if (isSelected) {
          // SE JÁ ESTÁ: Remove TOTALMENTE (Não importa quantas cotas tinha, zera tudo)
          const count = activeItem.assignedTo.filter(id => id === personId).length;
          for(let i=0; i<count; i++) decrementAssignment(activeItem.id, personId);
      } else {
          // SE NÃO ESTÁ: Adiciona 1 vez
          incrementAssignment(activeItem.id, personId);
      }
  };

  const handleSelectAll = () => {
    if (!activeItem) return;
    const allSelected = people.every(p => activeItem.assignedTo.includes(p.id));

    if (allSelected) {
        // Desmarcar todos
        people.forEach(p => {
             const count = activeItem.assignedTo.filter(id => id === p.id).length;
             for(let i=0; i<count; i++) decrementAssignment(activeItem.id, p.id);
        });
    } else {
        // Marcar quem falta (apenas 1 vez)
        people.forEach(p => {
            if (!activeItem.assignedTo.includes(p.id)) {
                incrementAssignment(activeItem.id, p.id);
            }
        });
    }
  };

  const isItemAssigned = (itemIds: string[]) => itemIds.length > 0;

  if (items.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p>Nenhum item para distribuir.</p>
              <button onClick={() => setStep('expenses')} className="mt-4 text-blue-500 font-bold">Voltar</button>
          </div>
      );
  }

  // Verifica o modo do item atual
  const isUnitMode = activeItem?.pricingMode === 'unit';

  return (
    <div className="flex flex-col h-full bg-gray-50">
      
      {/* 1. HEADER & CARROSSEL */}
      <div className="bg-white shadow-sm pt-6 pb-2 z-10 rounded-b-2xl">
         <div className="px-6 flex items-center justify-between mb-4">
             <button onClick={() => setStep('expenses')} className="p-2 -ml-2 text-gray-400 hover:text-black transition-colors rounded-full active:bg-gray-100">
                <ArrowLeft size={24} />
            </button>
            <div className="text-center">
                <h1 className="text-lg font-bold text-gray-900">Quem consumiu?</h1>
                <p className="text-xs text-gray-500">
                   {isUnitMode ? "Defina a quantidade por pessoa" : "Selecione quem vai dividir"}
                </p>
            </div>
            <div className="w-8" />
         </div>

         <div className="flex overflow-x-auto gap-3 px-6 pb-4 hide-scrollbar snap-x">
             {items.map((item) => {
                 const isActive = item.id === activeItemId;
                 const hasAssignment = isItemAssigned(item.assignedTo);
                 
                 return (
                     <button
                        key={item.id}
                        onClick={() => setActiveItemId(item.id)}
                        className={cn(
                            "flex flex-col items-start p-3 rounded-xl min-w-[120px] border-2 transition-all snap-start",
                            isActive 
                                ? "border-black bg-black text-white shadow-md scale-105" 
                                : hasAssignment 
                                    ? "border-green-500 bg-green-50 text-gray-800" 
                                    : "border-gray-100 bg-white text-gray-400"
                        )}
                     >
                        <div className="flex justify-between w-full mb-1">
                            {item.pricingMode === 'unit' ? <User size={14}/> : <Users size={14}/>}
                            {hasAssignment && !isActive && <div className="w-2 h-2 rounded-full bg-green-500" />}
                        </div>
                        <span className="font-bold text-sm truncate w-full text-left">{item.name}</span>
                        <span className={cn("text-xs", isActive ? "text-gray-300" : "text-gray-500")}>
                            {formatCurrency(item.price)}
                        </span>
                     </button>
                 );
             })}
         </div>
      </div>

      {/* 2. ÁREA PRINCIPAL */}
      {activeItem && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-32">
            
            <div className="flex items-center justify-between px-2 mb-2">
                <div>
                    <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                        {isUnitMode ? 'Quantidade' : 'Divisão Igualitária'}
                    </span>
                    <div className="text-xs text-blue-600 font-medium">
                        {isUnitMode 
                            ? `Total de itens: ${activeItem.assignedTo.length}`
                            : `Dividido por: ${activeItem.assignedTo.length} pessoas`
                        }
                    </div>
                </div>

                {/* No modo DIVIDIR, botão Marcar Todos é muito útil */}
                {!isUnitMode && (
                    <button 
                        onClick={handleSelectAll}
                        className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg active:bg-blue-100 transition-colors"
                    >
                        {people.every(p => activeItem.assignedTo.includes(p.id)) ? "Desmarcar Todos" : "Marcar Todos"}
                    </button>
                )}
            </div>

            {people.map(person => {
                const qtyAssigned = activeItem.assignedTo.filter(id => id === person.id).length;
                const isSelected = qtyAssigned > 0;

                return (
                    <motion.div 
                        layoutId={person.id}
                        key={person.id}
                        // SE FOR MODO DIVIDIR (FIXED), O CARD INTEIRO CLICA (TOGGLE)
                        // SE FOR UNITÁRIO, O CARD NÃO CLICA (SÓ OS BOTÕES +/-)
                        onClick={() => !isUnitMode && handleTogglePerson(person.id)}
                        className={cn(
                            "relative flex items-center justify-between p-4 rounded-xl border transition-all shadow-sm",
                            !isUnitMode && "active:scale-[0.98] cursor-pointer", // Efeito de clique só no modo dividir
                            isSelected 
                                ? "bg-white border-blue-500 ring-1 ring-blue-500 shadow-md" 
                                : "bg-white border-gray-100"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div 
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm transition-opacity"
                                    style={{ backgroundColor: person.avatarColor || '#ccc' }}
                                >
                                    {person.name.charAt(0)}
                                </div>
                                {/* Check visual apenas no modo DIVIDIR */}
                                {!isUnitMode && isSelected && (
                                    <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white">
                                        <CheckCircle2 size={12} />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col">
                                <span className={cn("font-bold text-lg", isSelected ? "text-gray-900" : "text-gray-500")}>
                                    {person.name}
                                </span>
                            </div>
                        </div>

                        {/* RENDERIZAÇÃO CONDICIONAL DOS CONTROLES */}
                        
                        {isUnitMode ? (
                            // --- MODO UNITÁRIO (CONTADOR) ---
                            <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200" onClick={e => e.stopPropagation()}>
                                <button 
                                    onClick={() => decrementAssignment(activeItem.id, person.id)}
                                    className={cn(
                                        "w-8 h-8 flex items-center justify-center rounded-md transition-colors",
                                        qtyAssigned === 0 ? "text-gray-300 cursor-not-allowed" : "bg-white text-red-500 shadow-sm"
                                    )}
                                    disabled={qtyAssigned === 0}
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="w-8 text-center font-bold text-gray-800 text-lg">
                                    {qtyAssigned}
                                </span>
                                <button 
                                    onClick={() => incrementAssignment(activeItem.id, person.id)}
                                    className="w-8 h-8 flex items-center justify-center text-blue-600 bg-blue-50 rounded-full active:bg-blue-100 transition-colors"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        ) : (
                            // --- MODO DIVIDIR (CHECKBOX GIGANTE) ---
                            <div className="pr-2">
                                {isSelected ? (
                                    <CheckCircle2 size={28} className="text-blue-500 fill-blue-50" />
                                ) : (
                                    <Circle size={28} className="text-gray-200" />
                                )}
                            </div>
                        )}
                        
                    </motion.div>
                );
            })}
        </div>
      )}

      {/* 3. FOOTER */}
      <div className="bg-white p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20 pb-safe">
          <div className="flex items-center justify-between mb-4 px-2">
             <div className="flex flex-col">
                 <span className="text-xs text-gray-400 uppercase font-bold">Progresso</span>
                 <span className="text-sm font-medium text-gray-700">
                     {items.filter(i => i.assignedTo.length > 0).length} de {items.length} itens distribuídos
                 </span>
             </div>
          </div>
          <button 
            onClick={() => setStep('summary')}
            className="w-full h-14 bg-black text-white rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <span>Finalizar Conta</span>
            <ArrowRight strokeWidth={3} />
          </button>
      </div>
    </div>
  );
};