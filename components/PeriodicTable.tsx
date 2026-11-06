import React, { useMemo, useState } from 'react';
import { ELEMENTS, CATEGORY_LABELS } from '../elements';
import { ElementCategory, ElementData } from '../types';

const CATEGORY_COLORS: Record<ElementCategory, string> = {
  alkali: 'bg-red-100 border-red-300 text-red-800',
  alkaline: 'bg-orange-100 border-orange-300 text-orange-800',
  transition: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  'post-transition': 'bg-teal-100 border-teal-300 text-teal-800',
  metalloid: 'bg-emerald-100 border-emerald-300 text-emerald-800',
  nonmetal: 'bg-blue-100 border-blue-300 text-blue-800',
  halogen: 'bg-cyan-100 border-cyan-300 text-cyan-800',
  noble: 'bg-purple-100 border-purple-300 text-purple-800',
  lanthanide: 'bg-pink-100 border-pink-300 text-pink-800',
  actinide: 'bg-rose-100 border-rose-300 text-rose-800',
};

const PeriodicTable: React.FC = () => {
  const [selected, setSelected] = useState<ElementData | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ElementCategory | null>(null);

  const q = query.trim().toLowerCase();
  const isDimmed = (e: ElementData) =>
    (filter !== null && e.category !== filter) ||
    (q !== '' && !e.symbol.toLowerCase().startsWith(q) && !e.name.toLowerCase().includes(q) && String(e.number) !== q);

  const searchHits = useMemo(() => (q ? ELEMENTS.filter((e) => !isDimmed(e)) : []), [q, filter]);

  const cell = (e: ElementData) => (
    <button
      key={e.number}
      onClick={() => setSelected(e)}
      style={e.fRow ? { gridColumn: e.fIndex! + 3, gridRow: e.fRow + 8 } : { gridColumn: e.group, gridRow: e.period }}
      className={`flex flex-col items-center justify-center rounded border leading-none h-12 md:h-14 transition-all hover:scale-110 hover:z-10 active:scale-95 ${CATEGORY_COLORS[e.category]} ${
        isDimmed(e) ? 'opacity-20' : ''
      } ${selected?.number === e.number ? 'ring-2 ring-emerald-600' : ''}`}
    >
      <span className="text-[8px] self-start pl-1 opacity-70">{e.number}</span>
      <span className="text-sm md:text-base font-bold">{e.symbol}</span>
      <span className="text-[7px] truncate max-w-full px-0.5 opacity-80">{e.atomic_mass < 200 ? e.atomic_mass.toFixed(2) : Math.round(e.atomic_mass)}</span>
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
          <i className="fa-solid fa-table-cells text-emerald-500 mr-2"></i>
          Mendeleyev Jadvali
        </h2>

        <div className="relative mb-4">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Element qidirish: Fe, temir, 26..."
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {searchHits.length > 0 && searchHits.length <= 6 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {searchHits.map((e) => (
                <button key={e.number} onClick={() => setSelected(e)} className={`text-xs px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[e.category]}`}>
                  {e.symbol} — {e.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-x-auto -mx-4 px-4 pb-2">
          <div
            className="grid gap-0.5 md:gap-1 min-w-[760px]"
            style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))', gridTemplateRows: 'repeat(7, auto) 12px repeat(2, auto)' }}
          >
            {ELEMENTS.map(cell)}
            {/* f-blok uchun ko'rsatkichlar */}
            <div style={{ gridColumn: 3, gridRow: 6 }} className="flex items-center justify-center rounded border border-dashed border-pink-300 text-[9px] text-pink-700 h-12 md:h-14">57–71</div>
            <div style={{ gridColumn: 3, gridRow: 7 }} className="flex items-center justify-center rounded border border-dashed border-rose-300 text-[9px] text-rose-700 h-12 md:h-14">89–103</div>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 md:hidden">
          <i className="fa-solid fa-arrows-left-right mr-1"></i>Jadvalni yon tomonga suring
        </p>

        <div className="flex flex-wrap gap-1.5 mt-4">
          {(Object.keys(CATEGORY_LABELS) as ElementCategory[]).map((c) => (
            <button
              key={c}
              onClick={() => setFilter(filter === c ? null : c)}
              className={`text-[11px] px-2 py-1 rounded-full border ${CATEGORY_COLORS[c]} ${filter && filter !== c ? 'opacity-40' : ''}`}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-100">
          <div className="flex items-start gap-4">
            <div className={`w-24 h-24 shrink-0 flex flex-col items-center justify-center rounded-2xl border-2 ${CATEGORY_COLORS[selected.category]}`}>
              <span className="text-sm font-bold opacity-70">{selected.number}</span>
              <span className="text-4xl font-black">{selected.symbol}</span>
              <span className="text-xs font-semibold">{selected.atomic_mass}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">{selected.name}</h3>
                  <p className="text-slate-500">{CATEGORY_LABELS[selected.category]}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-300 hover:text-slate-600" aria-label="Yopish">
                  <i className="fa-solid fa-circle-xmark text-2xl"></i>
                </button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Info label="Tartib raqami" value={selected.number} />
                <Info label="Guruh" value={selected.fRow ? '3 (f-blok)' : selected.group} />
                <Info label="Davr" value={selected.period} />
                <Info label="Atom massasi" value={selected.atomic_mass} />
                <Info label="Protonlar" value={selected.number} />
                <Info label="Neytronlar ≈" value={Math.round(selected.atomic_mass) - selected.number} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Info: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="bg-slate-50 p-2 rounded-lg">
    <span className="block text-[10px] uppercase text-slate-400 font-bold">{label}</span>
    <span className="font-semibold text-slate-700">{value}</span>
  </div>
);

export default PeriodicTable;
