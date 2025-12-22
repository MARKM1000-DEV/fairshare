import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { useBillStore } from '../../store/useBillStore';
import { NumericKeypad } from '../../components/ui/NumericKeypad';
import { MoneyDisplay } from '../../components/ui/MoneyDisplay';
import { cn, formatCurrency } from '../../lib/utils';
// Removi 'Crown' pois não é usado aqui. Mantive os outros.
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
        
        const otherSponsorsTotal = Object.entries(manualPayments)
            .filter(([id]) => id !== selectedPersonId)
            .reduce((sum, [_, amount]) => sum + (amount || 0), 0);

        const maxAllowed = totalBill - otherSponsorsTotal;

        if (val > maxAllowed) {
            setErrorMsg(`Máximo possível: ${formatCurrency(maxAllowed)}`);
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
    >
      {selectedPersonId ? (
        // --- TELA DE DIGITAÇÃO DE VALOR ---
        <div className="flex flex-col">
            <div className={cn(
                "py-6 flex flex-col items-center justify-center transition-colors",
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

                {/* Uso do ícone AlertCircle */}
                {errorMsg && (
                    <div className="flex items-center gap-1 text-red-500 text-xs mt-2 font-bold animate-pulse">
                        <AlertCircle size={12} />
                        {errorMsg}
                    </div>
                )}
            </div>
            
            <div className="flex justify-between px-6 pt-2">
                 {/* Uso do ícone Eraser */}
                 <button onClick={handleRemove} className="text-red-500 text-sm font-bold flex items-center gap-1 active:opacity-50">
                    <Eraser size={14} /> Voltar ao proporcional
                 </button>
                 <div className="text-[10px] text-gray-400 font-medium text-right mt-1">
                     Total da Conta: {formatCurrency(totalBill)}
                 </div>
            </div>

            <NumericKeypad 
                onPress={handleKeypadPress}
                onDelete={handleKeypadDelete}
                onConfirm={handleSave}
                confirmLabel="Confirmar Valor"
                className="shadow-none"
            />
        </div>
      ) : (
        // --- LISTA DE PESSOAS ---
        <div className="p-4 space-y-3 pb-8">
            <p className="text-sm text-gray-500 mb-4">
                Defina um valor exato para alguém. O restante será dividido entre os outros.
            </p>
            
            <div className="grid grid-cols-1 gap-3">
                {people.map(person => {
                    const payment = manualPayments[person.id];
                    return (
                        <button
                            key={person.id}
                            onClick={() => handlePersonClick(person.id)}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                                payment 
                                    ? "border-blue-400 bg-blue-50" 
                                    : "border-gray-100 bg-white hover:border-gray-200"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div 
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
                                    style={{ backgroundColor: person.avatarColor || '#ccc' }}
                                >
                                    {/* Uso do ícone Pin */}
                                    {payment ? <Pin size={18} className="text-white" /> : person.name.charAt(0)}
                                </div>
                                <span className="font-bold text-gray-700">{person.name}</span>
                            </div>

                            {payment ? (
                                <div className="text-blue-700 font-bold bg-blue-100 px-2 py-1 rounded text-sm">
                                    Fixo: {formatCurrency(payment)}
                                </div>
                            ) : (
                                <span className="text-gray-400 text-sm">Paga proporcional</span>
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