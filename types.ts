
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  SOLVER = 'SOLVER',
  CALCULATOR = 'CALCULATOR',
  PERIODIC_TABLE = 'PERIODIC_TABLE',
  CHAT = 'CHAT',
  FORMULAS = 'FORMULAS'
}

export interface ChemistryMessage {
  role: 'user' | 'model';
  text: string;
  image?: string;
}

export type ElementCategory =
  | 'alkali'
  | 'alkaline'
  | 'transition'
  | 'post-transition'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble'
  | 'lanthanide'
  | 'actinide';

export interface ElementData {
  number: number;
  symbol: string;
  name: string;
  atomic_mass: number;
  category: ElementCategory;
  group: number;
  period: number;
  /** 1 = lantanoidlar qatori, 2 = aktinoidlar qatori */
  fRow?: number;
  fIndex?: number;
}
