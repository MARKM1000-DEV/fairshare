import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BillStep = 'setup' | 'expenses' | 'distribution' | 'summary';

interface Person {
  id: string;
  name: string;
  avatarColor: string;
}

export interface Item {
  id: string;
  name: string;
  price: number;
  pricingMode: 'unit' | 'fixed'; 
  assignedTo: string[];
}

interface BillConfig {
  billMode: 'rodizio' | 'bar';
  fixedCost: number;
  couvert: number;
  couvertMode: 'person' | 'table';
  serviceTax: number;
}

interface BillState {
  step: BillStep;
  setStep: (step: BillStep) => void;

  people: Person[];
  setPeopleCount: (count: number) => void;
  updatePersonName: (id: string, newName: string) => void;
  resetAllNames: () => void; // <--- NOVO

  config: BillConfig;
  updateConfig: (mode: 'rodizio' | 'bar', fixed: number, couvert: number, couvertMode: 'person' | 'table', tax: number) => void;

  items: Item[];
  addItem: (name: string, price: number, pricingMode: 'unit' | 'fixed') => void;
  removeItem: (id: string) => void;

  incrementAssignment: (itemId: string, personId: string) => void;
  decrementAssignment: (itemId: string, personId: string) => void;

  manualPayments: Record<string, number | null>;
  setManualPayment: (personId: string, value: number | null) => void;

  reset: () => void;
}

export const useBillStore = create<BillState>()(
  persist(
    (set) => ({
      step: 'setup',
      setStep: (step) => set({ step }),

      people: [],
      setPeopleCount: (count) => {
        set((state) => {
           const currentPeople = state.people || [];
           if (count > currentPeople.length) {
               const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#FFD93D', '#6C5CE7', '#A8E6CF'];
               const added = Array.from({ length: count - currentPeople.length }, (_, i) => {
                   const idx = currentPeople.length + i;
                   return {
                       id: `p-${Math.random().toString(36).substr(2, 9)}`,
                       name: idx === 0 ? 'Eu' : `Pessoa ${idx + 1}`,
                       avatarColor: colors[idx % colors.length]
                   };
               });
               return { people: [...currentPeople, ...added] };
           } else {
               return { people: currentPeople.slice(0, count) };
           }
        });
      },

      updatePersonName: (id, newName) => set((state) => ({
        people: state.people.map(p => p.id === id ? { ...p, name: newName } : p)
      })),

      // --- NOVA FUNÇÃO: Reseta para "Eu, Pessoa 2, Pessoa 3..." ---
      resetAllNames: () => set((state) => ({
        people: state.people.map((p, index) => ({
            ...p,
            name: index === 0 ? 'Eu' : `Pessoa ${index + 1}`
        }))
      })),
      // -------------------------------------------------------------

      config: {
        billMode: 'rodizio',
        fixedCost: 0,
        couvert: 0,
        couvertMode: 'person',
        serviceTax: 0.1
      },
      updateConfig: (billMode, fixedCost, couvert, couvertMode, serviceTax) => 
        set({ config: { billMode, fixedCost, couvert, couvertMode, serviceTax } }),

      items: [],
      addItem: (name, price, pricingMode) => set((state) => ({
        items: [
          ...state.items, 
          { 
            id: Math.random().toString(36).substr(2, 9), 
            name, 
            price, 
            pricingMode,
            assignedTo: [] 
          }
        ]
      })),

      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id)
      })),

      incrementAssignment: (itemId, personId) => set((state) => ({
        items: state.items.map(item => {
          if (item.id !== itemId) return item;
          return { ...item, assignedTo: [...item.assignedTo, personId] };
        })
      })),

      decrementAssignment: (itemId, personId) => set((state) => ({
        items: state.items.map(item => {
          if (item.id !== itemId) return item;
          const idx = item.assignedTo.lastIndexOf(personId);
          if (idx === -1) return item;
          const newAssigned = [...item.assignedTo];
          newAssigned.splice(idx, 1);
          return { ...item, assignedTo: newAssigned };
        })
      })),

      manualPayments: {},
      setManualPayment: (personId, value) => set((state) => {
          const newPayments = { ...state.manualPayments };
          if (value === null) delete newPayments[personId];
          else newPayments[personId] = value;
          return { manualPayments: newPayments };
      }),

      reset: () => set({
        step: 'setup',
        items: [],
        manualPayments: {},
        // Não reseta pessoas/config automaticamente para preservar na próxima,
        // mas agora temos a função manual resetAllNames!
      })
    }),
    {
      name: 'fairshare-storage',
    }
  )
);