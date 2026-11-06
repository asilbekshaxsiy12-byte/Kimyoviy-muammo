import { ELEMENT_BY_SYMBOL } from '../elements';

export type Composition = Record<string, number>;

const SUBSCRIPTS: Record<string, string> = {
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
  '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
};

const normalize = (s: string) =>
  s.replace(/[₀-₉]/g, (c) => SUBSCRIPTS[c]).replace(/\s+/g, '');

const add = (target: Composition, src: Composition, k = 1) => {
  for (const [el, n] of Object.entries(src)) target[el] = (target[el] || 0) + n * k;
};

/**
 * Kimyoviy formulani tahlil qiladi: H2O, Ca(OH)2, K4[Fe(CN)6], CuSO4·5H2O.
 * Noto'g'ri formula bo'lsa xato tashlaydi.
 */
export const parseFormula = (input: string): Composition => {
  const s = normalize(input);
  if (!s) throw new Error('Formula kiritilmagan');
  let i = 0;

  const readNumber = (): number | null => {
    const m = /^\d+/.exec(s.slice(i));
    if (!m) return null;
    i += m[0].length;
    return parseInt(m[0], 10);
  };

  const parseGroup = (closing?: string): Composition => {
    const result: Composition = {};
    while (i < s.length) {
      const ch = s[i];
      if (ch === '(' || ch === '[' || ch === '{') {
        const close = ch === '(' ? ')' : ch === '[' ? ']' : '}';
        i++;
        const inner = parseGroup(close);
        if (s[i] !== close) throw new Error(`"${close}" qavs yopilmagan`);
        i++;
        add(result, inner, readNumber() ?? 1);
      } else if (ch === ')' || ch === ']' || ch === '}') {
        if (!closing) throw new Error(`Ortiqcha "${ch}" qavs`);
        return result;
      } else if (/[A-Z]/.test(ch)) {
        const m = /^[A-Z][a-z]?/.exec(s.slice(i))!;
        let sym = m[0];
        // "Co" yo'q bo'lsa, lekin "C" bor bo'lsa — bitta harfli belgini olamiz
        if (!ELEMENT_BY_SYMBOL[sym] && sym.length === 2 && ELEMENT_BY_SYMBOL[sym[0]]) sym = sym[0];
        if (!ELEMENT_BY_SYMBOL[sym]) throw new Error(`Noma'lum element: ${sym}`);
        i += sym.length;
        result[sym] = (result[sym] || 0) + (readNumber() ?? 1);
      } else if (ch === '·' || ch === '*' || ch === '•' || ch === '.') {
        if (closing) throw new Error('Qavs ichida "·" ishlatib bo\'lmaydi');
        i++;
        const k = readNumber() ?? 1;
        add(result, parseGroup(), k);
      } else {
        throw new Error(`Tushunarsiz belgi: "${ch}"`);
      }
    }
    if (closing) throw new Error(`"${closing}" qavs yopilmagan`);
    return result;
  };

  // Boshida koeffitsiyent bo'lishi mumkin: 2H2O
  const lead = readNumber() ?? 1;
  const comp = parseGroup();
  if (Object.keys(comp).length === 0) throw new Error('Formulada element yo\'q');
  const out: Composition = {};
  add(out, comp, lead);
  return out;
};

export interface MassPart {
  symbol: string;
  name: string;
  count: number;
  atomicMass: number;
  mass: number;
  percent: number;
}

export const molarMass = (formula: string) => {
  const comp = parseFormula(formula);
  const parts: MassPart[] = Object.entries(comp).map(([symbol, count]) => {
    const el = ELEMENT_BY_SYMBOL[symbol];
    return { symbol, name: el.name, count, atomicMass: el.atomic_mass, mass: el.atomic_mass * count, percent: 0 };
  });
  const total = parts.reduce((sum, p) => sum + p.mass, 0);
  parts.forEach((p) => (p.percent = (p.mass / total) * 100));
  return { total, parts };
};

// ---- Tenglamani tenglashtirish (aniq kasrlar bilan, BigInt) ----

const gcd = (a: bigint, b: bigint): bigint => {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b) [a, b] = [b, a % b];
  return a;
};

class Frac {
  constructor(public n: bigint, public d: bigint = 1n) {
    if (d < 0n) { this.n = -n; this.d = -d; }
    const g = gcd(this.n, this.d) || 1n;
    this.n /= g;
    this.d /= g;
  }
  sub(o: Frac) { return new Frac(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o: Frac) { return new Frac(this.n * o.n, this.d * o.d); }
  div(o: Frac) { return new Frac(this.n * o.d, this.d * o.n); }
  isZero() { return this.n === 0n; }
}

export interface BalanceResult {
  reactants: { formula: string; coef: number }[];
  products: { formula: string; coef: number }[];
  text: string;
}

const splitSide = (side: string) =>
  side.split('+').map((x) => x.trim()).filter(Boolean)
    // foydalanuvchi yozgan koeffitsiyentlarni olib tashlaymiz
    .map((x) => x.replace(/^\d+\s*/, ''));

export const balanceEquation = (equation: string): BalanceResult => {
  const sides = equation.split(/=|→|->|⟶|⇌/);
  if (sides.length !== 2) throw new Error('Tenglamada bitta "=" yoki "→" bo\'lishi kerak');
  const reactants = splitSide(sides[0]);
  const products = splitSide(sides[1]);
  if (!reactants.length || !products.length) throw new Error('Ikkala tomonda ham modda bo\'lishi kerak');

  const species = [...reactants, ...products];
  const comps = species.map(parseFormula);
  const elements = [...new Set(comps.flatMap((c) => Object.keys(c)))];

  // Har element tenglamaning ikkala tomonida ham bo'lishi kerak
  for (const el of elements) {
    const left = comps.slice(0, reactants.length).some((c) => c[el]);
    const right = comps.slice(reactants.length).some((c) => c[el]);
    if (!left || !right) throw new Error(`${el} elementi faqat bir tomonda bor`);
  }

  const cols = species.length;
  const M: Frac[][] = elements.map((el) =>
    comps.map((c, j) => new Frac(BigInt((c[el] || 0) * (j < reactants.length ? 1 : -1))))
  );

  // Qatorli pog'onali shaklga keltirish (RREF)
  const pivots: number[] = [];
  let row = 0;
  for (let col = 0; col < cols && row < M.length; col++) {
    const p = M.findIndex((r, idx) => idx >= row && !r[col].isZero());
    if (p === -1) continue;
    [M[row], M[p]] = [M[p], M[row]];
    const pv = M[row][col];
    M[row] = M[row].map((x) => x.div(pv));
    for (let r = 0; r < M.length; r++) {
      if (r !== row && !M[r][col].isZero()) {
        const f = M[r][col];
        M[r] = M[r].map((x, k) => x.sub(f.mul(M[row][k])));
      }
    }
    pivots.push(col);
    row++;
  }

  const free = [...Array(cols).keys()].filter((c) => !pivots.includes(c));
  if (free.length === 0) throw new Error('Bu reaksiyani tenglashtirib bo\'lmaydi');
  if (free.length > 1) throw new Error('Tenglama bir xil yechimga ega emas (moddalarni tekshiring)');

  const f = free[0];
  const sol: Frac[] = Array(cols).fill(null);
  sol[f] = new Frac(1n);
  pivots.forEach((pc, r) => (sol[pc] = new Frac(-M[r][f].n, M[r][f].d)));

  const lcm = sol.reduce((acc, x) => (acc * x.d) / gcd(acc, x.d), 1n);
  let ints = sol.map((x) => (x.n * lcm) / x.d);
  if (ints.every((x) => x <= 0n)) ints = ints.map((x) => -x);
  if (ints.some((x) => x <= 0n)) throw new Error('Bu reaksiyani tenglashtirib bo\'lmaydi');
  const g = ints.reduce((a, b) => gcd(a, b));
  const coefs = ints.map((x) => Number(x / g));

  const fmt = (list: string[], offset: number) =>
    list.map((formula, i) => ({ formula, coef: coefs[i + offset] }));
  const r = fmt(reactants, 0);
  const p = fmt(products, reactants.length);
  const side = (xs: { formula: string; coef: number }[]) =>
    xs.map((x) => `${x.coef === 1 ? '' : x.coef}${x.formula}`).join(' + ');

  return { reactants: r, products: p, text: `${side(r)} → ${side(p)}` };
};

export const AVOGADRO = 6.02214076e23;
export const MOLAR_VOLUME = 22.4;
