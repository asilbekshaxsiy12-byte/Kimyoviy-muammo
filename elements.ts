import { ElementData, ElementCategory } from './types';

// Belgi, o'zbekcha nom, atom massasi — tartib raqami bo'yicha (1..118)
const RAW = `H Vodorod 1.008|He Geliy 4.0026|Li Litiy 6.94|Be Berilliy 9.0122|B Bor 10.81|C Uglerod 12.011|N Azot 14.007|O Kislorod 15.999|F Ftor 18.998|Ne Neon 20.180|Na Natriy 22.990|Mg Magniy 24.305|Al Alyuminiy 26.982|Si Kremniy 28.085|P Fosfor 30.974|S Oltingugurt 32.06|Cl Xlor 35.45|Ar Argon 39.948|K Kaliy 39.098|Ca Kalsiy 40.078|Sc Skandiy 44.956|Ti Titan 47.867|V Vanadiy 50.942|Cr Xrom 51.996|Mn Marganes 54.938|Fe Temir 55.845|Co Kobalt 58.933|Ni Nikel 58.693|Cu Mis 63.546|Zn Rux 65.38|Ga Galliy 69.723|Ge Germaniy 72.630|As Mishyak 74.922|Se Selen 78.971|Br Brom 79.904|Kr Kripton 83.798|Rb Rubidiy 85.468|Sr Stronsiy 87.62|Y Ittriy 88.906|Zr Sirkoniy 91.224|Nb Niobiy 92.906|Mo Molibden 95.95|Tc Texnetsiy 98|Ru Ruteniy 101.07|Rh Rodiy 102.91|Pd Palladiy 106.42|Ag Kumush 107.87|Cd Kadmiy 112.41|In Indiy 114.82|Sn Qalay 118.71|Sb Surma 121.76|Te Tellur 127.60|I Yod 126.90|Xe Ksenon 131.29|Cs Seziy 132.91|Ba Bariy 137.33|La Lantan 138.91|Ce Seriy 140.12|Pr Prazeodim 140.91|Nd Neodim 144.24|Pm Prometiy 145|Sm Samariy 150.36|Eu Yevropiy 151.96|Gd Gadoliniy 157.25|Tb Terbiy 158.93|Dy Disproziy 162.50|Ho Golmiy 164.93|Er Erbiy 167.26|Tm Tuliy 168.93|Yb Itterbiy 173.05|Lu Lyutetsiy 174.97|Hf Gafniy 178.49|Ta Tantal 180.95|W Volfram 183.84|Re Reniy 186.21|Os Osmiy 190.23|Ir Iridiy 192.22|Pt Platina 195.08|Au Oltin 196.97|Hg Simob 200.59|Tl Talliy 204.38|Pb Qo'rg'oshin 207.2|Bi Vismut 208.98|Po Poloniy 209|At Astat 210|Rn Radon 222|Fr Fransiy 223|Ra Radiy 226|Ac Aktiniy 227|Th Toriy 232.04|Pa Protaktiniy 231.04|U Uran 238.03|Np Neptuniy 237|Pu Plutoniy 244|Am Ametsiy 243|Cm Kyuriy 247|Bk Berkliy 247|Cf Kaliforniy 251|Es Eynshteyniy 252|Fm Fermiy 257|Md Mendeleviy 258|No Nobeliy 259|Lr Lourensiy 266|Rf Rezerfordiy 267|Db Dubniy 268|Sg Siborgiy 269|Bh Boriy 270|Hs Xassiy 269|Mt Meytneriy 278|Ds Darmshtadtiy 281|Rg Rentgeniy 282|Cn Kopernitsiy 285|Nh Nixoniy 286|Fl Fleroviy 289|Mc Moskoviy 290|Lv Livermoriy 293|Ts Tennessin 294|Og Oganeson 294`;

const ALKALI = [3, 11, 19, 37, 55, 87];
const ALKALINE = [4, 12, 20, 38, 56, 88];
const NOBLE = [2, 10, 18, 36, 54, 86, 118];
const HALOGEN = [9, 17, 35, 53, 85, 117];
const METALLOID = [5, 14, 32, 33, 51, 52];
const NONMETAL = [1, 6, 7, 8, 15, 16, 34];
const POST_TRANSITION = [13, 31, 49, 50, 81, 82, 83, 84, 113, 114, 115, 116];

const categoryOf = (z: number): ElementCategory => {
  if (ALKALI.includes(z)) return 'alkali';
  if (ALKALINE.includes(z)) return 'alkaline';
  if (NOBLE.includes(z)) return 'noble';
  if (HALOGEN.includes(z)) return 'halogen';
  if (METALLOID.includes(z)) return 'metalloid';
  if (NONMETAL.includes(z)) return 'nonmetal';
  if (POST_TRANSITION.includes(z)) return 'post-transition';
  if (z >= 57 && z <= 71) return 'lanthanide';
  if (z >= 89 && z <= 103) return 'actinide';
  return 'transition';
};

// Har bir davrning oxirgi elementi
const PERIOD_ENDS = [2, 10, 18, 36, 54, 86, 118];

/** Jadvaldagi joylashuv: davr, guruh va (f-blok uchun) alohida qator. */
const positionOf = (z: number) => {
  const period = PERIOD_ENDS.findIndex((end) => z <= end) + 1;
  const start = period === 1 ? 1 : PERIOD_ENDS[period - 2] + 1;
  const pos = z - start; // davr ichidagi o'rni (0 dan)
  let group: number;
  let fRow: number | undefined;

  if (period === 1) {
    group = z === 1 ? 1 : 18;
  } else if (period <= 3) {
    group = pos < 2 ? pos + 1 : pos + 11;
  } else if (period <= 5) {
    group = pos + 1;
  } else if (pos < 2) {
    group = pos + 1;
  } else if (pos <= 16) {
    group = 3;
    fRow = period === 6 ? 1 : 2; // lantanoidlar / aktinoidlar
  } else {
    group = pos - 13;
  }
  return { period, group, fRow, fIndex: fRow ? pos - 2 : undefined };
};

export const CATEGORY_LABELS: Record<ElementCategory, string> = {
  alkali: 'Ishqoriy metall',
  alkaline: 'Ishqoriy-yer metall',
  transition: "O'tish metali",
  'post-transition': "O'tishdan keyingi metall",
  metalloid: 'Metalloid',
  nonmetal: 'Nometall',
  halogen: 'Galogen',
  noble: 'Inert gaz',
  lanthanide: 'Lantanoid',
  actinide: 'Aktinoid',
};

export const ELEMENTS: ElementData[] = RAW.split('|').map((entry, i) => {
  const [symbol, name, mass] = entry.split(' ');
  const number = i + 1;
  return {
    number,
    symbol,
    name,
    atomic_mass: parseFloat(mass),
    category: categoryOf(number),
    ...positionOf(number),
  };
});

export const ELEMENT_BY_SYMBOL: Record<string, ElementData> = Object.fromEntries(
  ELEMENTS.map((e) => [e.symbol, e])
);
