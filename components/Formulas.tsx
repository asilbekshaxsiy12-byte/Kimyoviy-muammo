
import React from 'react';

const Formulas: React.FC = () => {
  const sections = [
    {
      title: 'Modda miqdori (Mol)',
      items: [
        { name: 'Mol massasi', formula: 'n = m / M', desc: 'n - mol, m - massa, M - molyar massa' },
        { name: 'Gazlar hajmi', formula: 'n = V / Vm', desc: 'Vm = 22.4 L/mol (n.sh.da)' },
        { name: 'Molekulalar soni', formula: 'n = N / Na', desc: 'Na = 6.02 * 10^23' }
      ]
    },
    {
      title: 'Eritmalar',
      items: [
        { name: 'Massa ulushi', formula: 'w = (m_erigan / m_eritma) * 100%', desc: 'm_eritma = m_erigan + m_erituvchi' },
        { name: 'Molyar konsentratsiya', formula: 'Cm = n / V', desc: 'V - eritma hajmi (litrda)' }
      ]
    },
    {
      title: 'Termodinamika',
      items: [
        { name: 'Ideal gaz qonuni', formula: 'PV = nRT', desc: 'R = 8.314 J/(mol*K)' },
        { name: 'Zichlik', formula: 'ρ = m / V', desc: 'ρ - zichlik' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
          <i className="fa-solid fa-book-bookmark text-emerald-500 mr-2"></i>
          Asosiy Kimyoviy Formulalar
        </h2>

        <div className="grid gap-6">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{section.title}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {section.items.map((item, iIdx) => (
                  <div key={iIdx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-emerald-300 transition-colors">
                    <h4 className="font-bold text-slate-700 mb-1">{item.name}</h4>
                    <div className="bg-white p-2 rounded-lg border border-slate-100 mb-2 font-mono text-emerald-600 font-bold text-center">
                      {item.formula}
                    </div>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-emerald-900 text-emerald-50 rounded-2xl p-6 shadow-lg">
        <h3 className="font-bold text-lg mb-2">Qidiruv yordamchisi</h3>
        <p className="text-sm text-emerald-100 mb-4 opacity-80">Xohlagan mavzuingiz bo'yicha ma'lumotni chat yordamchisidan so'rab olishingiz mumkin.</p>
        <div className="flex items-center space-x-2 bg-white/10 p-3 rounded-xl border border-white/20">
          <i className="fa-solid fa-lightbulb text-yellow-400"></i>
          <span className="text-xs italic">"Organik kimyo asoslari haqida gapirib ber" deb yozing.</span>
        </div>
      </div>
    </div>
  );
};

export default Formulas;
