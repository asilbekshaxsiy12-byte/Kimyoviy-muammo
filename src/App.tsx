import React, { useEffect, useState } from 'react';
import { Screen, Tab, useStore } from './store/Store';
import { APP } from './config';
import { Logo } from './components/ui';
import Home from './views/Home';
import KvantFeed, { KvantViewer } from './views/Kvant';
import Lessons, { ClassroomView, LessonView } from './views/Lessons';
import Profile from './views/Profile';
import Leaderboard from './views/Leaderboard';
import TopicView from './views/Topic';
import { AdminChat, AdminPanel } from './views/Admin';
import UploadSheet from './views/Upload';

/** Zaxira splash: video ishlamasa ko'rsatiladi */
const FallbackSplash: React.FC = () => (
  <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-950 text-white flex flex-col items-center justify-center overflow-hidden">
    {['H₂O', 'NaCl', 'CO₂', 'C₆H₁₂O₆', 'H₂SO₄', 'NH₃', 'O₂', 'CH₄'].map((f, i) => (
      <span
        key={f}
        className="absolute font-bold animate-float select-none"
        style={{ left: `${(i * 37) % 90 + 3}%`, top: `${(i * 53) % 85 + 5}%`, animationDelay: `${i * 0.35}s`, fontSize: 14 + (i % 3) * 6 }}
      >
        {f}
      </span>
    ))}
    <div className="relative w-44 h-44 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-orbit" style={{ borderTopColor: 'white' }} />
      <div className="w-28 h-28 rounded-full overflow-hidden shadow-2xl"><Logo className="w-full h-full" /></div>
    </div>
    <h1 className="mt-8 text-3xl font-extrabold tracking-tight">{APP.name}</h1>
    <p className="mt-2 text-white/80 italic">“{APP.slogan}”</p>
  </div>
);

/** 4 soniyalik splash: muallifning animatsion videosi */
const Splash: React.FC = () => {
  const [failed, setFailed] = useState(false);
  return (
    <div className="fixed inset-0 z-[100] bg-[#040c0a]">
      {failed ? <FallbackSplash /> : (
        <video
          src="./splash.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          onError={() => setFailed(true)}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};

const Onboarding: React.FC = () => {
  const { register } = useStore();
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const ok = first.trim().length >= 2;
  return (
    <div className="min-h-full flex flex-col justify-center px-6 py-10 max-w-md mx-auto">
      <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-lg mb-6"><Logo className="w-full h-full" /></div>
      <h1 className="text-3xl font-extrabold">Xush kelibsiz!</h1>
      <p className="text-muted mt-2 mb-8">Kimyo sarguzashtini boshlash uchun ismingizni kiriting. Siz o'quvchi sifatida ro'yxatdan o'tasiz.</p>
      <div className="space-y-3">
        <input value={first} onChange={(e) => setFirst(e.target.value)} placeholder="Ism" className="w-full px-4 py-3.5 rounded-2xl bg-card border border-line outline-none focus:ring-2 focus:ring-emerald-500" />
        <input value={last} onChange={(e) => setLast(e.target.value)} placeholder="Familiya" className="w-full px-4 py-3.5 rounded-2xl bg-card border border-line outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>
      <button
        disabled={!ok}
        onClick={() => register(first.trim(), last.trim())}
        className="mt-6 w-full py-4 rounded-2xl bg-emerald-600 disabled:opacity-40 text-white font-bold text-lg shadow-lg shadow-emerald-600/30 active:scale-[.98]"
      >
        Boshlash <i className="fa-solid fa-arrow-right ml-1"></i>
      </button>
    </div>
  );
};

const NAV: { id: Tab; icon: string; label: string }[] = [
  { id: 'home', icon: 'fa-house', label: 'Asosiy' },
  { id: 'kvant', icon: 'fa-atom', label: 'Kvant' },
  { id: 'lessons', icon: 'fa-book-open', label: 'Darslar' },
  { id: 'profile', icon: 'fa-user', label: 'Profil' },
];

const BottomNav: React.FC<{ onPlus: () => void; dark: boolean }> = ({ onPlus, dark }) => {
  const { tab, goTab } = useStore();
  const item = (n: (typeof NAV)[number]) => {
    const active = tab === n.id;
    return (
      <button key={n.id} onClick={() => goTab(n.id)} className={`flex-1 flex flex-col items-center gap-1 py-2 ${active ? 'text-emerald-500' : dark ? 'text-white/60' : 'text-muted'}`}>
        <i className={`fa-solid ${n.icon} text-xl ${active ? 'animate-pop' : ''}`}></i>
        <span className="text-[10px] font-semibold">{n.label}</span>
      </button>
    );
  };
  return (
    <nav className={`fixed bottom-0 inset-x-0 z-40 safe-bottom border-t ${dark ? 'bg-black border-white/10' : 'bg-card/95 backdrop-blur border-line'}`}>
      <div className="max-w-xl mx-auto flex items-center px-2 h-16">
        {NAV.slice(0, 2).map(item)}
        <button onClick={onPlus} className="mx-1 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-white shadow-md active:scale-90 transition" aria-label="Qo'shish">
          <i className="fa-solid fa-plus"></i>
        </button>
        {NAV.slice(2).map(item)}
      </div>
    </nav>
  );
};

const renderScreen = (s: Screen) => {
  switch (s.type) {
    case 'profile': return <Profile userId={s.userId} />;
    case 'classroom': return <ClassroomView teacherId={s.teacherId} />;
    case 'lesson': return <LessonView teacherId={s.teacherId} lessonId={s.lessonId} />;
    case 'leaderboard': return <Leaderboard />;
    case 'topic': return <TopicView id={s.id} />;
    case 'adminChat': return <AdminChat userId={s.userId} />;
    case 'adminPanel': return <AdminPanel />;
    case 'kvantViewer': return <KvantViewer ids={s.ids} start={s.start} />;
  }
};

const Toasts: React.FC = () => {
  const { toasts } = useStore();
  return (
    <div className="fixed top-0 inset-x-0 z-[90] flex flex-col items-center gap-2 pt-3 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="animate-toast px-4 py-2.5 rounded-full bg-ink text-card text-sm font-semibold shadow-xl flex items-center gap-2">
          <i className={`fa-solid ${t.icon} text-emerald-400`}></i>{t.text}
        </div>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const { me, tab, stack, back } = useStore();
  const [splash, setSplash] = useState(true);
  const [upload, setUpload] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), APP.splashMs);
    return () => clearTimeout(t);
  }, []);

  // Android "orqaga" tugmasi
  useEffect(() => {
    const onPop = () => back();
    if (stack.length) {
      history.pushState(null, '');
      window.addEventListener('popstate', onPop);
    }
    return () => window.removeEventListener('popstate', onPop);
  }, [stack.length]); // eslint-disable-line

  if (splash) return <Splash />;
  if (!me) return <Onboarding />;

  const top = stack[stack.length - 1];
  const kvantMode = !top && tab === 'kvant';

  return (
    <div className="h-full">
      <div className={top ? 'hidden' : 'h-full'}>
        {tab === 'home' && <Home />}
        {tab === 'kvant' && <KvantFeed />}
        {tab === 'lessons' && <Lessons />}
        {tab === 'profile' && <Profile userId={me.id} />}
      </div>
      {top && <div key={stack.length} className="min-h-full pb-24 animate-fade-in">{renderScreen(top)}</div>}
      {top?.type !== 'kvantViewer' && <BottomNav onPlus={() => setUpload(true)} dark={kvantMode} />}
      <UploadSheet open={upload} onClose={() => setUpload(false)} />
      <Toasts />
    </div>
  );
};

export default App;
