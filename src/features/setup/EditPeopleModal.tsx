import { Modal } from '../../components/ui/Modal';
import { useBillStore } from '../../store/useBillStore';
import { X, RotateCcw } from 'lucide-react'; // Import RotateCcw

interface EditPeopleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditPeopleModal = ({ isOpen, onClose }: EditPeopleModalProps) => {
  const { people, updatePersonName, resetAllNames } = useBillStore(); // Pegue resetAllNames

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quem está na mesa?">
      <div className="flex flex-col gap-3 p-2">
        
        {/* BOTÃO DE RESETAR NOMES */}
        <div className="flex justify-end mb-1">
             <button 
                onClick={resetAllNames}
                className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full hover:bg-gray-200 hover:text-black transition-colors"
             >
                <RotateCcw size={10} />
                Resetar Nomes
             </button>
        </div>

        {/* LISTA DE PESSOAS */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {people.map((person, index) => (
            <div key={person.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0"
                    style={{ backgroundColor: person.avatarColor }}
                >
                    {person.name.charAt(0)}
                </div>
                
                <div className="flex-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">
                        {index === 0 ? "Você" : `Pessoa ${index + 1}`}
                    </label>
                    <input 
                        type="text"
                        value={person.name}
                        onChange={(e) => updatePersonName(person.id, e.target.value)}
                        className="w-full bg-transparent font-bold text-gray-800 text-lg focus:outline-none placeholder:text-gray-300 border-b border-transparent focus:border-black transition-colors"
                        placeholder="Nome"
                        autoFocus={index === 0 && person.name === 'Eu'} 
                    />
                </div>
                
                <button 
                    onClick={() => updatePersonName(person.id, '')}
                    className="text-gray-300 hover:text-gray-500 p-2"
                >
                    <X size={16} />
                </button>
            </div>
            ))}
        </div>
        
        <button 
            onClick={onClose}
            className="mt-4 w-full bg-black text-white py-3 rounded-xl font-bold active:scale-95 transition-transform"
        >
            Pronto
        </button>
      </div>
    </Modal>
  );
};