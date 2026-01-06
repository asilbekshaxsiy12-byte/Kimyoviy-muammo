
import React, { useState } from 'react';
import { ELEMENTS } from '../constants';
import { ElementData } from '../types';

const PeriodicTable: React.FC = () => {
  const [selected, setSelected] = useState<ElementData | null>(null);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'noble gas': return 'bg-purple-100 border-purple-300 text-purple-700';
      case 'alkali metal': return 'bg-red-100 border-red-300 text-red-700';
      case 'alkaline earth metal': return 'bg-orange-100 border-orange-300 text-orange-700';
      case 'metalloid': return 'bg-emerald-100 border-emerald-300 text-emerald-700';
      case 'diatomic nonmetal': return 'bg-blue-100 border-blue-300 text-blue-700';
      case 'polyatomic nonmetal': return 'bg-blue-200 border-blue-400 text-blue-800';
      case 'transition metal': return 'bg-yellow-100 border-yellow-300 text-yellow-700';
      case 'post-transition metal': return 'bg-teal-100 border-teal-300 text-teal-700';
      default: return 'bg-slate-100 border-slate-300 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 overflow-hidden">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
          <i className="fa-solid fa-table-cells text-emerald-500 mr-2"></i>
          Mendeleyev Jadvali
        </h2>
        
        <div className="periodic-grid gap-1 md:gap-2">
          {Array.from({ length: 7 }, (_, pIdx) => {
            const period = pIdx + 1;
            return Array.from({ length: 18 }, (_, gIdx) => {
              const group = gIdx + 1;
              const element = ELEMENTS.find(e => e.period === period && e.group === group);
              
              if (!element) return <div key={`empty-${period}-${group}`} className="w-full aspect-square md:aspect-auto h-12 md:h-16"></div>;

              return (
                <button
                  key={element.number}
                  onClick={() => setSelected(element)}
                  className={`element-box flex flex-col items-center justify-center rounded border shadow-sm transition-all hover:scale-110 active:scale-95 z-10 p-1 ${getCategoryColor(element.category)} h-12 md:h-16`}
                >
                  <span className="text-[8px] md:text-xs font-medium self-start">{element.number}</span>
                  <span className="text-xs md:text-xl font-bold">{element.symbol}</span>
                  <span className="hidden md:block text-[8px] truncate max-w-full">{element.name}</span>
                </button>
              );
            });
          })}
        </div>

        <p className="mt-4 text-xs text-slate-400 text-center italic">
          * Ushbu jadvalda asosiy elementlar ko'rsatilgan. To'liq ma'lumot olish uchun element ustiga bosing.
        </p>
      </div>

      {selected && (
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 animate-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className={`w-24 h-24 flex flex-col items-center justify-center rounded-2xl border-2 shadow-inner ${getCategoryColor(selected.category)}`}>
                <span className="text-sm font-bold opacity-70">{selected.number}</span>
                <span className="text-4xl font-black">{selected.symbol}</span>
                <span className="text-xs font-semibold">{selected.atomic_mass.toFixed(3)}</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">{selected.name}</h3>
                <p className="text-slate-500 capitalize">{selected.category}</p>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="block text-[10px] uppercase text-slate-400 font-bold">Guruh</span>
                    <span className="font-semibold">{selected.group}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="block text-[10px] uppercase text-slate-400 font-bold">Davr</span>
                    <span className="font-semibold">{selected.period}</span>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="text-slate-300 hover:text-slate-600">
              <i className="fa-solid fa-circle-xmark text-2xl"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodicTable;
