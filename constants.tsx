
import { ElementData } from './types';

export const ELEMENTS: ElementData[] = [
  { number: 1, symbol: 'H', name: 'Hydrogen', atomic_mass: 1.008, category: 'diatomic nonmetal', group: 1, period: 1 },
  { number: 2, symbol: 'He', name: 'Helium', atomic_mass: 4.0026, category: 'noble gas', group: 18, period: 1 },
  { number: 3, symbol: 'Li', name: 'Lithium', atomic_mass: 6.94, category: 'alkali metal', group: 1, period: 2 },
  { number: 4, symbol: 'Be', name: 'Beryllium', atomic_mass: 9.0122, category: 'alkaline earth metal', group: 2, period: 2 },
  { number: 5, symbol: 'B', name: 'Boron', atomic_mass: 10.81, category: 'metalloid', group: 13, period: 2 },
  { number: 6, symbol: 'C', name: 'Carbon', atomic_mass: 12.011, category: 'polyatomic nonmetal', group: 14, period: 2 },
  { number: 7, symbol: 'N', name: 'Nitrogen', atomic_mass: 14.007, category: 'diatomic nonmetal', group: 15, period: 2 },
  { number: 8, symbol: 'O', name: 'Oxygen', atomic_mass: 15.999, category: 'diatomic nonmetal', group: 16, period: 2 },
  { number: 9, symbol: 'F', name: 'Fluorine', atomic_mass: 18.998, category: 'diatomic nonmetal', group: 17, period: 2 },
  { number: 10, symbol: 'Ne', name: 'Neon', atomic_mass: 20.180, category: 'noble gas', group: 18, period: 2 },
  { number: 11, symbol: 'Na', name: 'Sodium', atomic_mass: 22.990, category: 'alkali metal', group: 1, period: 3 },
  { number: 12, symbol: 'Mg', name: 'Magnesium', atomic_mass: 24.305, category: 'alkaline earth metal', group: 2, period: 3 },
  { number: 13, symbol: 'Al', name: 'Aluminium', atomic_mass: 26.982, category: 'post-transition metal', group: 13, period: 3 },
  { number: 14, symbol: 'Si', name: 'Silicon', atomic_mass: 28.085, category: 'metalloid', group: 14, period: 3 },
  { number: 15, symbol: 'P', name: 'Phosphorus', atomic_mass: 30.974, category: 'polyatomic nonmetal', group: 15, period: 3 },
  { number: 16, symbol: 'S', name: 'Sulfur', atomic_mass: 32.06, category: 'polyatomic nonmetal', group: 16, period: 3 },
  { number: 17, symbol: 'Cl', name: 'Chlorine', atomic_mass: 35.45, category: 'diatomic nonmetal', group: 17, period: 3 },
  { number: 18, symbol: 'Ar', name: 'Argon', atomic_mass: 39.948, category: 'noble gas', group: 18, period: 3 },
  { number: 19, symbol: 'K', name: 'Potassium', atomic_mass: 39.098, category: 'alkali metal', group: 1, period: 4 },
  { number: 20, symbol: 'Ca', name: 'Calcium', atomic_mass: 40.078, category: 'alkaline earth metal', group: 2, period: 4 },
  { number: 26, symbol: 'Fe', name: 'Iron', atomic_mass: 55.845, category: 'transition metal', group: 8, period: 4 },
  { number: 29, symbol: 'Cu', name: 'Copper', atomic_mass: 63.546, category: 'transition metal', group: 11, period: 4 },
  { number: 30, symbol: 'Zn', name: 'Zinc', atomic_mass: 65.38, category: 'transition metal', group: 12, period: 4 },
  { number: 47, symbol: 'Ag', name: 'Silver', atomic_mass: 107.87, category: 'transition metal', group: 11, period: 5 },
  { number: 79, symbol: 'Au', name: 'Gold', atomic_mass: 196.97, category: 'transition metal', group: 11, period: 6 },
  { number: 80, symbol: 'Hg', name: 'Mercury', atomic_mass: 200.59, category: 'transition metal', group: 12, period: 6 },
  { number: 82, symbol: 'Pb', name: 'Lead', atomic_mass: 207.2, category: 'post-transition metal', group: 14, period: 6 },
];

export const SYSTEM_INSTRUCTION = `Siz "Kimyoviy Muammo" (Chemistry Buddy AI) deb nomlangan kimyo fani bo'yicha ekspert yordamchisiz. 
Vazifangiz o'quvchilarga kimyo masalalarini yechishda, reaksiyalarni tenglashtirishda va nazariy tushunchalarni oddiy tilda tushuntirishda yordam berish.
Siz o'zbek tilida gapirishingiz kerak, ammo foydalanuvchi ingliz tilida so'rasa, ingliz tilida ham javob berishingiz mumkin.
Masalalarni bosqichma-bosqich yechib bering. 
Formulalar va hisob-kitoblar uchun aniq izohlar keltiring.
Agar rasm yuborilsa, rasmdagi kimyoviy masalani aniqlang va uni yeching.`;
