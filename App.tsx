
import React, { useState } from 'react';
import Layout from './components/Layout';
import ProblemSolver from './components/ProblemSolver';
import PeriodicTable from './components/PeriodicTable';
import ChemistryChat from './components/ChemistryChat';
import Formulas from './components/Formulas';
import { AppView } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);

  const renderView = () => {
    switch (view) {
      case AppView.DASHBOARD:
        return (
          <div className="space-y-6">
            <div className="relative overflow-hidden bg-emerald-700 text-white rounded-3xl p-8 shadow-2xl">
              <div className="relative z-10">
                <h2 className="text-3xl font-extrabold mb-2">Xush kelibsiz!</h2>
                <p className="text-emerald-100 opacity-90 mb-6 max-w-md">
                  Kimyo fanini oson va qiziqarli o'rganing. Sun'iy intellekt yordamida har qanday masalani yechish endi juda oddiy.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => setView(AppView.SOLVER)}
                    className="bg-white text-emerald-700 font-bold px-6 py-3 rounded-2xl hover:bg-emerald-50 transition-colors flex items-center shadow-md"
                  >
                    <i className="fa-solid fa-bolt mr-2"></i>
                    Boshlash
                  </button>
                  <button 
                    onClick={() => setView(AppView.CHAT)}
                    className="bg-emerald-600/50 backdrop-blur-sm text-white font-bold px-6 py-3 rounded-2xl hover:bg-emerald-600 transition-colors flex items-center border border-white/20"
                  >
                    <i className="fa-solid fa-comment mr-2"></i>
                    Savol so'rash
                  </button>
                </div>
              </div>
              <div className="absolute top-[-20%] right-[-10%] opacity-20 transform rotate-12 pointer-events-none">
                 <i className="fa-solid fa-vials text-[12rem]"></i>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickAction 
                onClick={() => setView(AppView.SOLVER)}
                icon="fa-calculator" 
                label="Masala yechish" 
                color="bg-blue-500" 
              />
              <QuickAction 
                onClick={() => setView(AppView.PERIODIC_TABLE)}
                icon="fa-table-cells" 
                label="Davriy jadval" 
                color="bg-purple-500" 
              />
              <QuickAction 
                onClick={() => setView(AppView.FORMULAS)}
                icon="fa-square-root-variable" 
                label="Formulalar" 
                color="bg-orange-500" 
              />
              <QuickAction 
                onClick={() => setView(AppView.CHAT)}
                icon="fa-robot" 
                label="AI Yordamchi" 
                color="bg-indigo-500" 
              />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                <i className="fa-solid fa-newspaper text-emerald-500 mr-2"></i>
                Kunlik Ma'lumot
              </h3>
              <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-emerald-400 italic text-slate-600">
                "Kimyo - bu barcha fanlarning asosi. Har bir nafasimizda va harakatimizda kimyoviy jarayonlar yotadi."
              </div>
            </div>
          </div>
        );
      case AppView.SOLVER:
        return <ProblemSolver />;
      case AppView.PERIODIC_TABLE:
        return <PeriodicTable />;
      case AppView.CHAT:
        return <ChemistryChat />;
      case AppView.FORMULAS:
        return <Formulas />;
      default:
        return <div>Sahifa topilmadi.</div>;
    }
  };

  return (
    <Layout currentView={view} setView={setView}>
      {renderView()}
    </Layout>
  );
};

interface QuickActionProps {
  icon: string;
  label: string;
  color: string;
  onClick: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, label, color, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group flex flex-col items-center justify-center space-y-3 active:scale-95"
  >
    <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform`}>
      <i className={`fa-solid ${icon} text-xl`}></i>
    </div>
    <span className="text-xs font-bold text-slate-700">{label}</span>
  </button>
);

export default App;
