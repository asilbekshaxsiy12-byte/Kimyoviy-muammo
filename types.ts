
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  SOLVER = 'SOLVER',
  PERIODIC_TABLE = 'PERIODIC_TABLE',
  CHAT = 'CHAT',
  FORMULAS = 'FORMULAS'
}

export interface ChemistryMessage {
  role: 'user' | 'model';
  text: string;
  image?: string;
}

export interface ElementData {
  number: number;
  symbol: string;
  name: string;
  atomic_mass: number;
  category: string;
  group: number;
  period: number;
}
