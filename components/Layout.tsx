
import React from 'react';
import { AppView } from '../types';

interface LayoutProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setView, children }) => {
  const navItems = [
    { id: AppView.DASHBOARD, icon: 'fa-house', label: 'Asosiy' },
    { id: AppView.SOLVER, icon: 'fa-vial-circle-check', label: 'Yechish' },
    { id: AppView.PERIODIC_TABLE, icon: 'fa-table-cells', label: 'Jadval' },
    { id: AppView.CHAT, icon: 'fa-comment-dots', label: 'Chat' },
    { id: AppView.FORMULAS, icon: 'fa-book-bookmark', label: 'Bilimlar' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-emerald-700 text-white shadow-lg px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-white p-1.5 rounded-lg">
            <i className="fa-solid fa-flask text-emerald-700 text-xl"></i>
          </div>
          <h1 className="font-bold text-lg tracking-tight">Kimyoviy Muammo</h1>
        </div>
        <button className="text-white/80 hover:text-white">
          <i className="fa-solid fa-gear text-xl"></i>
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 pb-24 md:pb-0 md:pt-4">
        <div className="max-w-4xl mx-auto px-4">
          {children}
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center py-2 px-1 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:hidden">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex flex-col items-center space-y-1 w-full py-1 transition-colors ${
              currentView === item.id ? 'text-emerald-600 font-semibold' : 'text-slate-400'
            }`}
          >
            <i className={`fa-solid ${item.icon} text-lg`}></i>
            <span className="text-[10px]">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Sidebar Navigation (Desktop) */}
      <div className="hidden md:flex fixed left-0 top-16 bottom-0 w-20 bg-white border-r border-slate-200 flex-col items-center py-8 space-y-8 shadow-sm">
         {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            title={item.label}
            className={`p-3 rounded-xl transition-all ${
              currentView === item.id 
                ? 'bg-emerald-50 text-emerald-600 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <i className={`fa-solid ${item.icon} text-2xl`}></i>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Layout;
