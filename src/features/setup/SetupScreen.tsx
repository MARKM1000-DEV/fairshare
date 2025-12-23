import { useState, useEffect } from 'react';
import { Users, Percent, Music, Utensils, Beer, ChevronDown, ChevronRight, User, Settings2 } from 'lucide-react';
import { useBillStore } from '../../store/useBillStore';
import { NumericKeypad } from '../../components/ui/NumericKeypad';
import { MoneyDisplay } from '../../components/ui/MoneyDisplay';
import { cn } from '../../lib/utils';
import { EditPeopleModal } from './EditPeopleModal';
import { motion, AnimatePresence } from 'framer-motion';

const SERVICE_OPTIONS = [0, 0.1, 0.12, 0.13]; 

export const SetupScreen = () => {
  const { config, setPeopleCount, updateConfig, setStep, people: storePeople } = useBillStore();
  
  const [peopleCount, setLocalPeopleCount] = useState(storePeople.length || 2);
  const [isNamesModalOpen, setIsNamesModalOpen] = useState(false); 
  const [billMode, setBillMode] = useState<'rodizio' | 'bar'>('rodizio');
  
  const [rodizioStr, setRodizioStr] = useState("0");
  const [couvertStr, setCouvertStr] = useState("0");
  const [customTaxStr, setCustomTaxStr] = useState("");
  const [couvertMode, setCouvertMode] = useState<'person' | 'table'>('person');

  const [selectedTax, setSelectedTax] = useState<number>(() => {
    if (SERVICE_OPTIONS.includes(config.serviceTax)) return config.serviceTax;
    return -1; 
  });

  const [activeInput, setActiveInput] = useState<'rodizio' | 'couvert' | 'customTax' | null>(null);

  useEffect(() => {
      if (storePeople.length > 0) setLocalPeopleCount(storePeople.length);
  }, [storePeople.length]);

  useEffect(() => {
    if (!SERVICE_OPTIONS.includes(config.serviceTax)) {
        setCustomTaxStr((config.serviceTax * 100).toFixed(0));
    }
    if (config.billMode) setBillMode(config.billMode);
  }, [config.serviceTax, config.billMode]);

  useEffect(() => {
      setPeopleCount(peopleCount);
  }, [peopleCount, setPeopleCount]);

  const handleKeypadPress = (digit: string) => {
    if (activeInput === 'rodizio') {
      setRodizioStr(prev => (prev === "0" ? digit : prev.length < 8 ? prev + digit : prev));
    } else if (activeInput === 'couvert') {
      setCouvertStr(prev => (prev === "0" ? digit : prev.length < 8 ? prev + digit : prev));
    } else if (activeInput === 'customTax') {
      setCustomTaxStr(prev => {
         const newVal = prev + digit;
         if (parseInt(newVal) > 100) return prev;
         return newVal;
      });
    }
  };

  const handleKeypadDelete = () => {
    if (activeInput === 'rodizio') setRodizioStr(p => (p.length <= 1 ? "0" : p.slice(0, -1)));
    else if (activeInput === 'couvert') setCouvertStr(p => (p.length <= 1 ? "0" : p.slice(0, -1)));
    else if (activeInput === 'customTax') setCustomTaxStr(p => p.slice(0, -1));
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
    <div className="flex flex-col h-[100dvh] bg-gray-50 relative overflow-hidden">
      
      {/* HEADER */}
      <div className="px-6 pt-12 pb-6 bg-white shadow-sm z-10 shrink-0">
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Settings2 className="text-black" />
            Configurar Mesa
        </h1>
        <p className="text-gray-500 text-sm mt-1">Preencha os dados iniciais para começar.</p>
      </div>

      {/* MENU LIST */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        
        {/* PESSOAS */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3 shrink-0">
                <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                    <Users size={20} />
                </div>
                <div>
                    <span className="block font-bold text-gray-800 whitespace-nowrap">Pessoas</span>
                    <button onClick={() => setIsNamesModalOpen(true)} className="text-xs text-blue-600 font-bold hover:underline">
                        Ver/Editar Nomes
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1 shrink-0">
                <button onClick={() => setLocalPeopleCount(Math.max(1, peopleCount - 1))} className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-lg font-bold active:scale-90 transition-transform">-</button>
                <span className="w-6 text-center font-bold text-lg">{peopleCount}</span>
                <button onClick={() => setLocalPeopleCount(peopleCount + 1)} className="w-10 h-10 flex items-center justify-center bg-black text-white rounded-lg shadow-sm text-lg font-bold active:scale-90 transition-transform">+</button>
            </div>
        </div>

        {/* MODO */}
        <div className="bg-gray-200 p-1 rounded-2xl flex shrink-0">
            <button 
                onClick={() => setBillMode('rodizio')}
                className={cn(
                    "flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap",
                    billMode === 'rodizio' ? "bg-white text-black shadow-sm" : "text-gray-500"
                )}
            >
                <Utensils size={16} /> Rodízio
            </button>
            <button 
                onClick={() => setBillMode('bar')}
                className={cn(
                    "flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap",
                    billMode === 'bar' ? "bg-white text-black shadow-sm" : "text-gray-500"
                )}
            >
                <Beer size={16} /> Bar / A la Carte
            </button>
        </div>

        {/* TAXA DE SERVIÇO */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
             <div className="flex items-center gap-3 mb-1">
                <div className="bg-green-50 p-2.5 rounded-xl text-green-600">
                    <Percent size={20} />
                </div>
                <span className="font-bold text-gray-800 whitespace-nowrap">Taxa de Serviço</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {SERVICE_OPTIONS.map((opt) => (
                    <button
                        key={opt}
                        onClick={() => { setSelectedTax(opt); setActiveInput(null); }} 
                        className={cn(
                            "flex-1 min-w-[60px] py-2.5 text-xs font-bold rounded-xl transition-all border whitespace-nowrap",
                            selectedTax === opt 
                                ? "bg-black text-white border-black shadow-md" 
                                : "bg-gray-50 text-gray-500 border-transparent"
                        )}
                    >
                        {opt === 0 ? 'Não' : `${opt * 100}%`}
                    </button>
                ))}
                <button
                    onClick={() => { setSelectedTax(-1); setActiveInput('customTax'); }}
                    className={cn(
                        "flex-1 min-w-[70px] py-2.5 text-xs font-bold rounded-xl transition-all border whitespace-nowrap",
                        selectedTax === -1 
                            ? "bg-black text-white border-black shadow-md" 
                            : "bg-gray-50 text-gray-500 border-transparent"
                    )}
                >
                    {(selectedTax === -1 && customTaxStr) ? `${customTaxStr}%` : 'Outra'}
                </button>
            </div>
        </div>

        {/* RODÍZIO (LAYOUT VERTICAL/EMPILHADO) */}
        {billMode === 'rodizio' && (
            <button 
                onClick={() => setActiveInput('rodizio')}
                // flex-col aqui faz a mágica: coloca um item embaixo do outro
                className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-start gap-2 active:scale-[0.98] transition-transform"
            >
                {/* Linha Superior: Ícone + Título + Seta */}
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
                            <Utensils size={18} />
                        </div>
                        <div className="text-left">
                            <span className="block font-bold text-gray-800 text-sm">Preço do Rodízio</span>
                            <span className="text-[10px] text-gray-400 font-medium">POR PESSOA</span>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
                </div>

                {/* Linha Inferior: Valor Grande */}
                <div className="w-full text-left pl-1">
                    <MoneyDisplay 
                        value={parseInt(rodizioStr)} 
                        className="text-3xl font-extrabold text-gray-900 tracking-tight" 
                    />
                </div>
            </button>
        )}

        {/* COUVERT (LAYOUT VERTICAL/EMPILHADO) */}
        <button 
            onClick={() => setActiveInput('couvert')}
            className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-start gap-2 active:scale-[0.98] transition-transform"
        >
            {/* Linha Superior: Ícone + Título + Seta */}
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                    <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
                        <Music size={18} />
                    </div>
                    <div className="text-left">
                        <span className="block font-bold text-gray-800 text-sm">
                            {billMode === 'bar' ? 'Entrada / Couvert' : 'Outras Taxas'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">OPCIONAL</span>
                    </div>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
            </div>

            {/* Linha Inferior: Valor Grande */}
            <div className="w-full text-left pl-1">
                <MoneyDisplay 
                    value={parseInt(couvertStr)} 
                    className="text-3xl font-extrabold text-gray-900 tracking-tight" 
                />
            </div>
            
            {/* Sub-opções (Botões pequenos) */}
            {(parseInt(couvertStr) > 0 || activeInput === 'couvert') && (
                 <div className="w-full flex gap-2 pt-3 mt-1 border-t border-gray-50" onClick={(e) => e.stopPropagation()}>
                    <button 
                        onClick={() => setCouvertMode('person')}
                        className={cn("flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors whitespace-nowrap", 
                        couvertMode === 'person' ? "bg-purple-100 text-purple-700" : "bg-gray-50 text-gray-400")}
                    >
                        <User size={12} /> Por Pessoa
                    </button>
                    <button 
                        onClick={() => setCouvertMode('table')}
                        className={cn("flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors whitespace-nowrap", 
                        couvertMode === 'table' ? "bg-purple-100 text-purple-700" : "bg-gray-50 text-gray-400")}
                    >
                        <Users size={12} /> Total Mesa
                    </button>
                 </div>
            )}
        </button>

      </div>

      {/* BOTÃO START */}
      {!activeInput && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
            <button 
                onClick={handleStart}
                className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
                {billMode === 'bar' ? "Começar Pedidos" : "Começar Conta"}
                <ChevronRight size={20} />
            </button>
        </div>
      )}

      {/* KEYPAD DRAWER */}
      <AnimatePresence>
        {activeInput && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setActiveInput(null)}
                    className="absolute inset-0 bg-black/40 z-40 backdrop-blur-sm"
                />
                
                <motion.div 
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
                >
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <span className="font-bold text-gray-500 text-sm uppercase tracking-wide pl-2">
                            {activeInput === 'rodizio' && "Valor do Rodízio"}
                            {activeInput === 'couvert' && "Valor do Couvert"}
                            {activeInput === 'customTax' && "Taxa (%)"}
                        </span>
                        <button onClick={() => setActiveInput(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                            <ChevronDown size={20} className="text-gray-600" />
                        </button>
                    </div>

                    <div className="p-4 bg-gray-50 flex justify-center">
                         {activeInput === 'customTax' ? (
                             <span className="text-4xl font-bold text-gray-900">{customTaxStr}%</span>
                         ) : (
                             <MoneyDisplay 
                                value={parseInt(activeInput === 'rodizio' ? rodizioStr : couvertStr)} 
                                className="text-4xl font-bold text-gray-900" 
                             />
                         )}
                    </div>

                    <NumericKeypad 
                        onPress={handleKeypadPress}
                        onDelete={handleKeypadDelete}
                        onConfirm={() => setActiveInput(null)}
                        confirmLabel="Confirmar"
                        className="bg-white pb-safe shadow-none"
                    />
                </motion.div>
            </>
        )}
      </AnimatePresence>

      <EditPeopleModal isOpen={isNamesModalOpen} onClose={() => setIsNamesModalOpen(false)} />
    </div>
  );
};