import React, { useMemo, useState } from 'react';
import { molarMass, balanceEquation, AVOGADRO, MOLAR_VOLUME } from '../services/chemistry';

type Tab = 'mass' | 'balance';

const fmt = (x: number, digits = 3) =>
  Number.isFinite(x) ? (Math.abs(x) >= 1e6 || (x !== 0 && Math.abs(x) < 1e-3) ? x.toExponential(3) : x.toFixed(digits)) : '—';

/** "H2O" → H₂O ko'rinishida chiqaradi */
const Formula: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\d+)/);
  return (
    <span>
      {parts.map((part, i) =>
        // Harf yoki yopuvchi qavsdan keyingi raqam — indeks; boshqasi — koeffitsiyent
        /^\d+$/.test(part) && /[A-Za-z)\]}]$/.test(parts[i - 1] ?? '')
          ? <sub key={i}>{part}</sub>
          : <React.Fragment key={i}>{part}</React.Fragment>
      )}
    </span>
  );
};

const EXAMPLES_MASS = ['H2SO4', 'Ca(OH)2', 'C6H12O6', 'CuSO4·5H2O'];
const EXAMPLES_BALANCE = [
  'Fe + O2 = Fe2O3',
  'C3H8 + O2 = CO2 + H2O',
  'Al + HCl = AlCl3 + H2',
  'KMnO4 + HCl = KCl + MnCl2 + Cl2 + H2O',
];

const MolarMassTab: React.FC = () => {
  const [formula, setFormula] = useState('H2SO4');
  const [grams, setGrams] = useState('');

  const result = useMemo(() => {
    if (!formula.trim()) return null;
    try {
      return { ok: true as const, ...molarMass(formula) };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  }, [formula]);

  const m = parseFloat(grams.replace(',', '.'));
  const n = result?.ok && m > 0 ? m / result.total : null;

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-semibold text-slate-600">Modda formulasi</span>
        <input
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-lg outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="masalan: H2SO4"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        {EXAMPLES_MASS.map((ex) => (
          <button key={ex} onClick={() => setFormula(ex)} className="text-xs px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100">
            <Formula text={ex} />
          </button>
        ))}
      </div>

      {result && !result.ok && (
        <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">
          <i className="fa-solid fa-triangle-exclamation mr-2"></i>{result.error}
        </div>
      )}

      {result?.ok && (
        <>
          <div className="bg-emerald-600 text-white rounded-2xl p-5 text-center">
            <div className="text-sm opacity-80">M(<Formula text={formula.trim()} />)</div>
            <div className="text-3xl font-extrabold">{result.total.toFixed(3)} <span className="text-lg font-semibold">g/mol</span></div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 text-xs uppercase">
                  <th className="py-2">Element</th>
                  <th className="py-2 text-right">Soni</th>
                  <th className="py-2 text-right">Massa</th>
                  <th className="py-2 text-right">ω, %</th>
                </tr>
              </thead>
              <tbody>
                {result.parts.map((p) => (
                  <tr key={p.symbol} className="border-t border-slate-100">
                    <td className="py-2"><b>{p.symbol}</b> <span className="text-slate-400">{p.name}</span></td>
                    <td className="py-2 text-right">{p.count}</td>
                    <td className="py-2 text-right">{p.mass.toFixed(3)}</td>
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="hidden sm:block w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${p.percent}%` }} />
                        </div>
                        {p.percent.toFixed(2)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <label className="block">
              <span className="text-sm font-semibold text-slate-600">Massa (gramm) — mol hisoblash uchun</span>
              <input
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
                inputMode="decimal"
                className="mt-1 w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="masalan: 49"
              />
            </label>
            {n !== null && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                <Stat label="Modda miqdori (n = m/M)" value={`${fmt(n, 4)} mol`} />
                <Stat label="Zarrachalar soni (N = n·Nₐ)" value={fmt(n * AVOGADRO)} />
                <Stat label="Gaz hajmi, n.sh. (V = n·22.4)" value={`${fmt(n * MOLAR_VOLUME)} L`} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-white rounded-xl p-3 border border-slate-100">
    <div className="text-[11px] text-slate-400">{label}</div>
    <div className="font-bold text-slate-800">{value}</div>
  </div>
);

const BalanceTab: React.FC = () => {
  const [eq, setEq] = useState('');
  const [state, setState] = useState<{ text?: string; error?: string; parts?: ReturnType<typeof balanceEquation> } | null>(null);

  const run = (value = eq) => {
    if (!value.trim()) return;
    try {
      const res = balanceEquation(value);
      setState({ parts: res, text: res.text });
    } catch (e) {
      setState({ error: (e as Error).message });
    }
  };

  const Side: React.FC<{ items: { formula: string; coef: number }[] }> = ({ items }) => (
    <>
      {items.map((x, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="mx-1.5 text-emerald-200">+</span>}
          {x.coef !== 1 && <span className="text-yellow-300">{x.coef}</span>}
          <Formula text={x.formula} />
        </React.Fragment>
      ))}
    </>
  );

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-semibold text-slate-600">Reaksiya tenglamasi</span>
        <input
          value={eq}
          onChange={(e) => setEq(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && run()}
          className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="masalan: Fe + O2 = Fe2O3"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        {EXAMPLES_BALANCE.map((ex) => (
          <button key={ex} onClick={() => { setEq(ex); run(ex); }} className="text-xs px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100">
            {ex}
          </button>
        ))}
      </div>
      <button
        onClick={() => run()}
        disabled={!eq.trim()}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl shadow-md active:scale-[0.98]"
      >
        <i className="fa-solid fa-scale-balanced mr-2"></i>Tenglashtirish
      </button>

      {state?.error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">
          <i className="fa-solid fa-triangle-exclamation mr-2"></i>{state.error}
        </div>
      )}
      {state?.parts && (
        <div className="bg-emerald-600 text-white rounded-2xl p-5">
          <div className="text-xs opacity-80 mb-1">Tenglashtirilgan reaksiya</div>
          <div className="text-xl font-bold break-words leading-relaxed">
            <Side items={state.parts.reactants} />
            <span className="mx-2">→</span>
            <Side items={state.parts.products} />
          </div>
          <button
            onClick={() => navigator.clipboard?.writeText(state.text!)}
            className="mt-3 text-xs bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg"
          >
            <i className="fa-solid fa-copy mr-1"></i>Nusxa olish
          </button>
        </div>
      )}
      <p className="text-xs text-slate-400">
        Moddalarni "+" bilan, tomonlarni "=" yoki "→" bilan ajrating. Kristallogidratlar uchun "·" yoki "*" ishlating.
      </p>
    </div>
  );
};

const Calculator: React.FC = () => {
  const [tab, setTab] = useState<Tab>('mass');
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 space-y-5">
      <h2 className="text-xl font-bold text-slate-800 flex items-center">
        <i className="fa-solid fa-calculator text-emerald-500 mr-2"></i>
        Kalkulyator
        <span className="ml-auto text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-1 rounded-full">Internetsiz ishlaydi</span>
      </h2>
      <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl text-sm font-semibold">
        {([['mass', 'Molyar massa'], ['balance', 'Tenglashtirish']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`py-2 rounded-lg transition-all ${tab === id ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'mass' ? <MolarMassTab /> : <BalanceTab />}
    </div>
  );
};

export default Calculator;
