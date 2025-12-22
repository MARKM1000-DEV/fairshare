export type Money = number; 

export interface Person {
  id: string;
  name: string;
  avatarColor?: string;
}

export interface ExpenseItem {
  id: string;
  name: string;
  price: Money;
  quantity: number;
  assignedTo: string[];
}

export interface BillState {
  step: 'setup' | 'expenses' | 'distribution' | 'summary';
  config: {
    fixedCost: Money;
    serviceTax: number;
  };
  people: Person[];
  items: ExpenseItem[];
}