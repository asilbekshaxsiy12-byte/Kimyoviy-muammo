import React from 'react';
import { fullName, useMe, useStore } from '../store/Store';
import { AtomIcon, Avatar, LevelBadge, PageHeader, TeacherBadge } from '../components/ui';

const MEDALS = ['#f59e0b', '#94a3b8', '#b45309'];

const Leaderboard: React.FC = () => {
  const { state, openProfile } = useStore();
  const me = useMe();
  const top = Object.values(state.users).sort((a, b) => b.atoms - a.atoms).slice(0, 100);
  const myRank = Object.values(state.users).sort((a, b) => b.atoms - a.atoms).findIndex((u) => u.id === me.id) + 1;
  const podium = top.slice(0, 3);

  return (
    <div>
      <PageHeader title="TOP-100 reyting" />
      <div className="max-w-xl mx-auto px-4 pb-6">
        {/* Shohsupa */}
        <div className="flex items-end justify-center gap-3 pt-4 pb-6">
          {[1, 0, 2].map((i) => podium[i] && (
            <button key={podium[i].id} onClick={() => openProfile(podium[i].id)} className="flex flex-col items-center w-24">
              {i === 0 && <i className="fa-solid fa-crown text-amber-400 text-2xl mb-1"></i>}
              <div className="rounded-full p-1" style={{ background: MEDALS[i] }}><Avatar user={podium[i]} size={i === 0 ? 76 : 60} /></div>
              <div className="text-sm font-bold mt-2 text-center leading-tight line-clamp-2">{fullName(podium[i])}</div>
              <div className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5"><AtomIcon className="w-3.5 h-3.5" />{podium[i].atoms}</div>
              <div className={`mt-2 w-full rounded-t-2xl flex items-start justify-center pt-2 text-white text-2xl font-extrabold ${i === 0 ? 'h-20' : i === 1 ? 'h-14' : 'h-10'}`} style={{ background: MEDALS[i] }}>{i + 1}</div>
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-emerald-600 text-white p-3.5 flex items-center gap-3 mb-4">
          <span className="font-extrabold text-lg w-10 text-center">#{myRank}</span>
          <Avatar user={me} size={40} />
          <span className="font-semibold flex-1">Siz</span>
          <span className="font-bold flex items-center gap-1"><AtomIcon className="w-4 h-4" />{me.atoms}</span>
        </div>

        <div className="space-y-1.5">
          {top.slice(3).map((u, i) => (
            <button key={u.id} onClick={() => openProfile(u.id)} className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-left ${u.id === me.id ? 'bg-emerald-500/10 border border-emerald-500/40' : 'bg-card border border-line'}`}>
              <span className="w-8 text-center font-bold text-muted">{i + 4}</span>
              <Avatar user={u} size={42} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate flex items-center gap-1.5">{fullName(u)} <TeacherBadge user={u} /></div>
                <LevelBadge atoms={u.atoms} small />
              </div>
              <span className="font-bold flex items-center gap-1 text-emerald-600"><AtomIcon className="w-4 h-4" />{u.atoms}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
