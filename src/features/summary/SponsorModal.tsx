import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { useBillStore } from '../../store/useBillStore';
import { NumericKeypad } from '../../components/ui/NumericKeypad';
import { MoneyDisplay } from '../../components/ui/MoneyDisplay';
import { cn, formatCurrency } from '../../lib/utils';
import { Eraser, AlertCircle, Pin } from 'lucide-react';

interface SponsorModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalBill: number;
}

export const SponsorModal = ({ isOpen, onClose, totalBill }: SponsorModalProps) => {
  const { people, manualPayments, setManualPayment } = useBillStore();
  
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [amountStr, setAmountStr] = useState("0");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedPerson = people.find(p => p.id === selectedPersonId);

  const handlePersonClick = (id: string) => {
    const currentVal = manualPayments[id] || 0;
    setAmountStr(currentVal.toString());
    setSelectedPersonId(id);
    setErrorMsg(null);
  };

  const handleKeypadPress = (d: string) => {
      setAmountStr(prev => (prev === "0" ? d : prev.length < 8 ? prev + d : prev));
      setErrorMsg(null);
  };

  const handleKeypadDelete = () => {
      setAmountStr(prev => (prev.length <= 1 ? "0" : prev.slice(0, -1)));
      setErrorMsg(null);
  };
  
  const handleSave = () => {
    if (selectedPersonId) {
        const val = parseInt(amountStr, 10);
        
        if (val > totalBill * 1.5) { 
             setErrorMsg("Valor muito alto");
             return;
        }

        if (val > 0) setManualPayment(selectedPersonId, val);
        else setManualPayment(selectedPersonId, null);
        
        setSelectedPersonId(null);
        setErrorMsg(null);
    }
  };

  const handleRemove = () => {
    if (selectedPersonId) {
        setManualPayment(selectedPersonId, null);
        setSelectedPersonId(null);
    }
  };

  return (
    <Modal 
        isOpen={isOpen} 
        onClose={() => { setSelectedPersonId(null); onClose(); }} 
        title={selectedPersonId ? `Valor fixo para ${selectedPerson?.name}` : "Ajuste Manual"}
        className="flex flex-col max-h-[95dvh]"
    >
      {selectedPersonId ? (
        // --- TELA DE DIGITAÇÃO ---
        <div className="flex flex-col h-full">
            <div className={cn(
                "py-4 flex flex-col items-center justify-center transition-colors shrink-0",
                errorMsg ? "bg-red-50" : "bg-blue-50"
            )}>
                <span className={cn(
                    "text-xs font-bold uppercase mb-1",
                    errorMsg ? "text-red-600" : "text-blue-700"
                )}>
                    {errorMsg || "Quanto essa pessoa vai pagar?"}
                </span>
                
                <MoneyDisplay 
                    value={parseInt(amountStr, 10)} 
                    className={errorMsg ? "text-red-600" : ""}
                />
                
                {errorMsg && (
                    <div className="flex items-center gap-1 text-red-500 text-xs mt-2 font-bold animate-pulse">
                        <AlertCircle size={12} />
                        {errorMsg}
                    </div>
                )}
            </div>
            
            <div className="flex justify-between px-6 pt-2 shrink-0">
                 <button onClick={handleRemove} className="text-red-500 text-sm font-bold flex items-center gap-1 active:opacity-50">
                    <Eraser size={14} /> Voltar ao proporcional
                 </button>
                 <div className="text-[10px] text-gray-400 font-medium text-right mt-1">
                     Total: {formatCurrency(totalBill)}
                 </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 mt-2">
                <NumericKeypad 
                    onPress={handleKeypadPress}
                    onDelete={handleKeypadDelete}
                    onConfirm={handleSave}
                    confirmLabel="Confirmar Valor"
                    className="shadow-none border-t border-gray-100"
                />
            </div>
        </div>
      ) : (
        // --- LISTA DE PESSOAS ---
        <div className="flex flex-col">
            <div className="p-4 shrink-0 bg-white shadow-sm z-10">
                <p className="text-sm text-gray-500">
                    Quem vai pagar um valor diferente? (Ex: Quem não bebeu)
                </p>
            </div>
            
            <div className="overflow-y-auto p-4 pt-2 space-y-3" style={{ maxHeight: '60vh' }}>
                {people.map(person => {
                    const payment = manualPayments[person.id];
                    return (
                        <button
                            key={person.id}
                            onClick={() => handlePersonClick(person.id)}
                            className={cn(
                                "w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all",
                                payment 
                                    ? "border-blue-400 bg-blue-50" 
                                    : "border-gray-100 bg-white hover:border-gray-200"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div 
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0"
                                    style={{ backgroundColor: person.avatarColor || '#ccc' }}
                                >
                                    {payment ? <Pin size={18} className="text-white" /> : person.name.charAt(0)}
                                </div>
                                <span className="font-bold text-gray-700 text-left line-clamp-1">{person.name}</span>
                            </div>

                            {payment ? (
                                <div className="text-blue-700 font-bold bg-blue-100 px-2 py-1 rounded text-xs whitespace-nowrap">
                                    {formatCurrency(payment)}
                                </div>
                            ) : (
                                <span className="text-gray-400 text-xs whitespace-nowrap">Auto</span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
      )}
    </Modal>
  );
};