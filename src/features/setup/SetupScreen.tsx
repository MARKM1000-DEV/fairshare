import { useState, useEffect } from 'react';
import { Users, Percent, Music, Utensils, Beer, User, Pencil } from 'lucide-react'; // Adicionado Pencil
import { useBillStore } from '../../store/useBillStore';
import { NumericKeypad } from '../../components/ui/NumericKeypad';
import { MoneyDisplay } from '../../components/ui/MoneyDisplay';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// O IMPORT CORRETO (Certifique-se que o arquivo EditPeopleModal.tsx existe na mesma pasta)
import { EditPeopleModal } from './EditPeopleModal';

export const SetupScreen = () => {
  // Pegamos 'people' do store e renomeamos para 'storePeople' para usar na visualização
  const { config, setPeopleCount, updateConfig, setStep, people: storePeople } = useBillStore();
  const serviceOptions = [0, 0.1, 0.12, 0.13]; 

  const [peopleCount, setLocalPeopleCount] = useState(storePeople.length || 2);
  
  // ESTADO PARA CONTROLAR O MODAL DE NOMES
  const [isNamesModalOpen, setIsNamesModalOpen] = useState(false); 

  const [billMode, setBillMode] = useState<'rodizio' | 'bar'>('rodizio');
  const [activeField, setActiveField] = useState<'rodizio' | 'couvert' | 'customTax'>('rodizio');
  const [couvertMode, setCouvertMode] = useState<'person' | 'table'>('person');

  const [rodizioStr, setRodizioStr] = useState("0");
  const [couvertStr, setCouvertStr] = useState("0");
  const [customTaxStr, setCustomTaxStr] = useState("");

  const [selectedTax, setSelectedTax] = useState<number>(() => {
    if (serviceOptions.includes(config.serviceTax)) return config.serviceTax;
    return -1; 
  });

  // Atualiza contador local quando o store muda (ex: reset)
  useEffect(() => {
      if (storePeople.length > 0) setLocalPeopleCount(storePeople.length);
  }, [storePeople.length]);

  useEffect(() => {
    if (!serviceOptions.includes(config.serviceTax)) {
        setCustomTaxStr((config.serviceTax * 100).toFixed(0));
    }
    if (config.billMode) setBillMode(config.billMode);
  }, []);

  // Sincroniza contador com o store sempre que mudar
  useEffect(() => {
      setPeopleCount(peopleCount);
  }, [peopleCount]);

  useEffect(() => {
    if (billMode === 'bar' && activeField === 'rodizio') {
        setActiveField('couvert');
    } else if (billMode === 'rodizio' && activeField === 'couvert') {
        setActiveField('rodizio');
    }
  }, [billMode]);

  const handleKeypadPress = (digit: string) => {
    if (activeField === 'rodizio') {
      setRodizioStr(prev => (prev === "0" ? digit : prev.length < 8 ? prev + digit : prev));
    } else if (activeField === 'couvert') {
      setCouvertStr(prev => (prev === "0" ? digit : prev.length < 8 ? prev + digit : prev));
    } else if (activeField === 'customTax') {
      setCustomTaxStr(prev => {
         const newVal = prev + digit;
         if (parseInt(newVal) > 100) return prev;
         return newVal;
      });
    }
  };

  const handleKeypadDelete = () => {
    if (activeField === 'rodizio') setRodizioStr(p => (p.length <= 1 ? "0" : p.slice(0, -1)));
    else if (activeField === 'couvert') setCouvertStr(p => (p.length <= 1 ? "0" : p.slice(0, -1)));
    else if (activeField === 'customTax') setCustomTaxStr(p => p.slice(0, -1));
  };

  const handleStart = () => {
    const fixed = billMode === 'rodizio' ? parseInt(rodizioStr, 10) : 0;
    const couv = parseInt(couvertStr, 10);
    const finalTax = selectedTax === -1 
        ? (parseInt(customTaxStr || "0", 10) / 100) 
        : selectedTax;

    updateConfig(billMode, fixed, couv, couvertMode, finalTax);
    setStep('expenses'); 
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-4">
        
        {/* SELETOR DE MODO */}
        <div className="bg-gray-200 p-1 rounded-xl flex shrink-0">
            <button 
                onClick={() => setBillMode('rodizio')}
                className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all",
                    billMode === 'rodizio' ? "bg-white text-black shadow-sm" : "text-gray-500"
                )}
            >
                <Utensils size={16} /> Rodízio
            </button>
            <button 
                onClick={() => setBillMode('bar')}
                className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all",
                    billMode === 'bar' ? "bg-white text-black shadow-sm" : "text-gray-500"
                )}
            >
                <Beer size={16} /> Bar / A la Carte
            </button>
        </div>

        {/* CARD 1: PESSOAS E NOMES */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
            
            {/* Linha do Contador */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                    <div className="bg-blue-50 p-1.5 rounded-lg text-blue-500"><Users size={18} /></div>
                    <span className="font-medium text-sm">Participantes</span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setLocalPeopleCount(Math.max(1, peopleCount - 1))} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full font-bold text-lg active:scale-90">-</button>
                    <span className="w-4 text-center font-bold text-lg">{peopleCount}</span>
                    <button onClick={() => setLocalPeopleCount(peopleCount + 1)} className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-full font-bold text-lg active:scale-90">+</button>
                </div>
            </div>

            {/* BOTÃO DE EDITAR NOMES */}
            <button 
                onClick={() => setIsNamesModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors border border-gray-100"
            >
                <Pencil size={12} />
                Editar Nomes ({storePeople.map(p => p.name).slice(0, 2).join(", ")}{storePeople.length > 2 ? "..." : ""})
            </button>

            <div className="border-b border-gray-100" />

            {/* Linha da Taxa */}
            <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-gray-600">
                    <div className="bg-green-50 p-1.5 rounded-lg text-green-600"><Percent size={18} /></div>
                    <span className="font-medium text-sm">Taxa de Serviço</span>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg w-full">
                    {serviceOptions.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => { 
                                setSelectedTax(opt); 
                                setActiveField(billMode === 'rodizio' ? 'rodizio' : 'couvert'); 
                            }} 
                            className={cn(
                                "flex-1 py-2 text-xs font-bold rounded-md transition-all",
                                selectedTax === opt ? "bg-white text-black shadow-sm" : "text-gray-400"
                            )}
                        >
                            {opt === 0 ? 'Não' : `${opt * 100}%`}
                        </button>
                    ))}
                    <button
                        onClick={() => { setSelectedTax(-1); setActiveField('customTax'); }}
                        className={cn(
                            "flex-1 py-2 text-xs font-bold rounded-md transition-all ml-1 border-l border-gray-200",
                            selectedTax === -1 ? "bg-black text-white shadow-sm" : "text-gray-400 bg-white"
                        )}
                    >
                       {(selectedTax === -1 && customTaxStr) ? `${customTaxStr}%` : 'Outra'}
                    </button>
                </div>
            </div>
        </div>

        {/* CARD 2: VALORES */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <AnimatePresence initial={false}>
                {billMode === 'rodizio' && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <button 
                            onClick={() => setActiveField('rodizio')}
                            className={cn(
                                "w-full flex items-center justify-between p-4 border-b border-gray-100 transition-colors",
                                activeField === 'rodizio' ? "bg-blue-50/50" : "bg-white"
                            )}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="bg-orange-100 p-2 rounded-lg text-orange-600 shrink-0"><Utensils size={20} /></div>
                                <div className="text-left min-w-0">
                                    <span className="block font-medium text-gray-700 text-sm truncate">Rodízio</span>
                                    <span className="text-[10px] text-gray-400 truncate">Preço por pessoa</span>
                                </div>
                            </div>
                            
                            <div className="flex-shrink-0 ml-auto pl-2">
                                <MoneyDisplay 
                                    value={parseInt(rodizioStr, 10)} 
                                    className={cn(
                                        "justify-end transition-all",
                                        activeField === 'rodizio' ? "text-black scale-100" : "text-gray-400 scale-90"
                                    )} 
                                />
                            </div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={cn(
                    "w-full flex flex-col p-4 transition-colors gap-3",
                    activeField === 'couvert' ? "bg-blue-50/50" : "bg-white"
                )}>
                
                <button 
                    onClick={() => setActiveField('couvert')}
                    className="flex items-center justify-between w-full"
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-purple-100 p-2 rounded-lg text-purple-600 shrink-0"><Music size={20} /></div>
                        <div className="text-left min-w-0">
                            <span className="block font-medium text-gray-700 text-sm truncate">
                                {billMode === 'bar' ? 'Entrada / Couvert' : 'Outras Taxas'}
                            </span>
                            <span className="text-[10px] text-gray-400 truncate">
                                {couvertMode === 'person' ? 'Por Pessoa' : 'Total da Mesa'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex-shrink-0 ml-auto pl-2">
                        <MoneyDisplay 
                            value={parseInt(couvertStr, 10)} 
                            className={cn(
                                "justify-end transition-all",
                                activeField === 'couvert' ? "text-black scale-100" : "text-gray-400 scale-90"
                            )} 
                        />
                    </div>
                </button>

                {(activeField === 'couvert' || parseInt(couvertStr) > 0) && (
                    <div className="flex bg-white/50 p-1 rounded-lg border border-gray-200/50 self-end">
                         <button 
                            onClick={() => { setCouvertMode('person'); setActiveField('couvert'); }}
                            className={cn(
                                "px-3 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all",
                                couvertMode === 'person' ? "bg-black text-white shadow-sm" : "text-gray-500"
                            )}
                         >
                            <User size={12} /> Individual
                         </button>
                         <button 
                            onClick={() => { setCouvertMode('table'); setActiveField('couvert'); }}
                            className={cn(
                                "px-3 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all",
                                couvertMode === 'table' ? "bg-black text-white shadow-sm" : "text-gray-500"
                            )}
                         >
                            <Users size={12} /> Mesa
                         </button>
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="bg-white rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20 pb-safe">
         <div className="text-center text-[10px] font-bold uppercase tracking-wider text-gray-400 py-2 border-b border-gray-100">
             {activeField === 'customTax' 
                ? 'Digitando Taxa' 
                : activeField === 'couvert' ? 'Digitando Entrada/Couvert' : 'Digitando Rodízio'}
         </div>
         <NumericKeypad 
            onPress={handleKeypadPress}
            onDelete={handleKeypadDelete}
            onConfirm={handleStart}
            confirmLabel={billMode === 'bar' ? "Começar Pedidos" : "Começar Conta"}
            className="shadow-none"
         />
      </div>

      {/* RENDERIZAÇÃO DO MODAL */}
      <EditPeopleModal isOpen={isNamesModalOpen} onClose={() => setIsNamesModalOpen(false)} />
    </div>
  );
};