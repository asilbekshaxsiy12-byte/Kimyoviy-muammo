import React, { useEffect, useRef, useState } from 'react';
import { fullName, timeAgo, useMe, useStore } from '../store/Store';
import { Avatar, EmptyState, LevelBadge, PageHeader } from '../components/ui';

/** O'qituvchi bo'lish arizasi: foydalanuvchi va admin o'rtasidagi chat */
export const AdminChat: React.FC<{ userId: string }> = ({ userId }) => {
  const { state, sendToAdmin } = useStore();
  const me = useMe();
  const app = state.applications[userId];
  const admin = state.users.admin;
  const asAdmin = me.id !== userId;
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [app?.messages.length]);
  const send = () => { if (text.trim()) { sendToAdmin(userId, text.trim(), asAdmin); setText(''); } };

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title={asAdmin ? fullName(state.users[userId]) : 'Admin bilan chat'} />
      <div className="flex-1 max-w-xl w-full mx-auto p-4 space-y-3 pb-40">
        {!asAdmin && (
          <div className="rounded-3xl p-5 bg-card border border-line text-center">
            <Avatar user={admin} size={64} />
            <div className="font-bold mt-2">{fullName(admin)}</div>
            <p className="text-sm text-muted mt-1">O'qituvchi bo'lish uchun o'zingiz haqingizda, nima uchun o'qituvchi bo'lmoqchi ekaningiz va sertifikatlaringiz haqida yozing.</p>
            {app && <div className={`inline-block mt-3 text-xs font-bold px-3 py-1 rounded-full ${app.status === 'approved' ? 'bg-emerald-500/15 text-emerald-600' : app.status === 'rejected' ? 'bg-red-500/15 text-red-500' : 'bg-amber-500/15 text-amber-600'}`}>
              {app.status === 'approved' ? 'Tasdiqlangan' : app.status === 'rejected' ? 'Rad etilgan' : "Ko'rib chiqilmoqda"}
            </div>}
          </div>
        )}
        {app?.messages.map((m) => {
          const mineSide = m.fromAdmin === asAdmin;
          return (
            <div key={m.id} className={`flex ${mineSide ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${mineSide ? 'bg-emerald-600 text-white rounded-br-md' : 'bg-card border border-line rounded-bl-md'}`}>
                <p className="whitespace-pre-wrap text-[15px]">{m.text}</p>
                <p className={`text-[10px] mt-1 ${mineSide ? 'text-white/70' : 'text-muted'}`}>{timeAgo(m.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] bg-surface/95 backdrop-blur border-t border-line">
        <div className="max-w-xl mx-auto p-3 flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Xabar yozing..." className="flex-1 h-11 px-4 rounded-full bg-soft outline-none focus:ring-2 focus:ring-emerald-500" />
          <button onClick={send} disabled={!text.trim()} className="w-11 h-11 rounded-full bg-emerald-600 text-white disabled:opacity-40"><i className="fa-solid fa-paper-plane"></i></button>
        </div>
      </div>
    </div>
  );
};

/** Admin paneli: arizalar, shikoyatlar, premium ustozlar, kun mavzusi */
export const AdminPanel: React.FC = () => {
  const { state, push, decideApplication, resolveReport, togglePremium, setTodayTopic } = useStore();
  const [tab, setTab] = useState<'apps' | 'reports' | 'teachers' | 'topic'>('apps');
  const apps = Object.values(state.applications);
  const reports = state.reports.filter((r) => !r.resolved);
  const teachers = Object.values(state.users).filter((u) => u.role === 'teacher');

  return (
    <div>
      <PageHeader title="Admin panel" />
      <div className="max-w-xl mx-auto p-4">
        <p className="text-xs text-muted mb-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
          <i className="fa-solid fa-flask mr-1"></i>Sinov rejimi: server ulangach bu panel faqat adminga ko'rinadi.
        </p>
        <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-soft text-xs font-semibold mb-4">
          {([['apps', `Arizalar (${apps.filter((a) => a.status === 'pending').length})`], ['reports', `Shikoyat (${reports.length})`], ['teachers', 'Ustozlar'], ['topic', 'Mavzu']] as const).map(([id, l]) => (
            <button key={id} onClick={() => setTab(id)} className={`py-2 rounded-xl ${tab === id ? 'bg-card shadow' : 'text-muted'}`}>{l}</button>
          ))}
        </div>

        {tab === 'apps' && (apps.length ? apps.map((a) => {
          const u = state.users[a.userId];
          return (
            <div key={a.userId} className="p-4 rounded-2xl bg-card border border-line mb-2">
              <div className="flex items-center gap-3">
                <Avatar user={u} size={44} />
                <div className="flex-1 min-w-0"><div className="font-semibold">{fullName(u)}</div><LevelBadge atoms={u?.atoms ?? 0} small /></div>
                <span className="text-xs text-muted">{a.status === 'pending' ? 'Kutilmoqda' : a.status === 'approved' ? 'Tasdiqlangan' : 'Rad etilgan'}</span>
              </div>
              <p className="text-sm text-muted mt-2 line-clamp-2">{[...a.messages].reverse().find((m) => !m.fromAdmin)?.text}</p>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <button onClick={() => push({ type: 'adminChat', userId: a.userId })} className="py-2 rounded-xl bg-soft text-sm font-semibold">Chat</button>
                <button disabled={a.status !== 'pending'} onClick={() => decideApplication(a.userId, true)} className="py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-40">Tasdiqlash</button>
                <button disabled={a.status !== 'pending'} onClick={() => decideApplication(a.userId, false)} className="py-2 rounded-xl bg-red-500 text-white text-sm font-semibold disabled:opacity-40">Rad etish</button>
              </div>
            </div>
          );
        }) : <EmptyState icon="fa-inbox" text="Arizalar yo'q" />)}

        {tab === 'reports' && (reports.length ? reports.map((r) => (
          <div key={r.id} className="p-4 rounded-2xl bg-card border border-line mb-2">
            <div className="text-xs text-muted">{r.target.type === 'chat' ? 'Chat xabari' : r.target.type === 'kvant' ? 'Kvant' : 'Izoh'} · {timeAgo(r.createdAt)} · {fullName(state.users[r.reporterId])}</div>
            <div className="font-semibold text-red-500 mt-1"><i className="fa-solid fa-flag mr-1"></i>{r.reason}</div>
            <p className="mt-1 p-2.5 rounded-xl bg-soft text-sm">{r.preview}</p>
            <div className="grid grid-cols-3 gap-2 mt-3 text-sm font-semibold">
              <button onClick={() => resolveReport(r.id, false, false)} className="py-2 rounded-xl bg-soft">E'tiborsiz</button>
              <button onClick={() => resolveReport(r.id, true, false)} className="py-2 rounded-xl bg-orange-500 text-white">O'chirish</button>
              <button onClick={() => resolveReport(r.id, true, true)} className="py-2 rounded-xl bg-red-500 text-white">O'chir + ogohlantir</button>
            </div>
          </div>
        )) : <EmptyState icon="fa-shield-halved" text="Yangi shikoyatlar yo'q" />)}

        {tab === 'teachers' && teachers.map((t) => (
          <div key={t.id} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-line mb-2">
            <Avatar user={t} size={42} />
            <div className="flex-1 font-semibold">{fullName(t)}</div>
            <button onClick={() => togglePremium(t.id)} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${t.premium ? 'bg-amber-400 text-amber-900' : 'bg-soft text-muted'}`}>
              <i className="fa-solid fa-crown mr-1"></i>{t.premium ? 'Premium' : 'Oddiy'}
            </button>
          </div>
        ))}

        {tab === 'topic' && state.topics.map((t) => (
          <button key={t.id} onClick={() => setTodayTopic(t.id)} className={`w-full flex items-center gap-3 p-3 rounded-2xl mb-2 text-left border ${state.todayTopicId === t.id ? 'border-emerald-500 bg-emerald-500/10' : 'border-line bg-card'}`}>
            <span className="text-2xl">{t.emoji}</span>
            <span className="flex-1 font-semibold">{t.title}</span>
            <span className="text-xs text-muted">{t.votes.length} ovoz</span>
            {state.todayTopicId === t.id && <i className="fa-solid fa-circle-check text-emerald-500"></i>}
          </button>
        ))}
      </div>
    </div>
  );
};
