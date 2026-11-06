import React, { useEffect, useRef, useState } from 'react';
import { fullName, timeAgo, useMe, useStore } from '../store/Store';
import { saveImage, saveMedia } from '../store/media';
import { AtomIcon, Avatar, LevelBadge, Logo, MediaImage, MediaVideo, ReportMenu, Sheet, TeacherBadge, formatNum } from '../components/ui';
import { LEVELS, PERMISSIONS, levelOf } from '../data/levels';
import { ChatMessage } from '../types';

const AtomCounter: React.FC = () => {
  const me = useMe();
  const { push } = useStore();
  return (
    <button
      onClick={() => push({ type: 'leaderboard' })}
      className="flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-bold shadow-md active:scale-95"
      aria-label="Reyting"
    >
      <AtomIcon className="w-5 h-5 animate-orbit-slow" />
      {formatNum(me.atoms)}
    </button>
  );
};

const DayTopicCard: React.FC = () => {
  const { state, push } = useStore();
  const topic = state.topics.find((t) => t.id === state.todayTopicId)!;
  return (
    <button
      onClick={() => push({ type: 'topic', id: topic.id })}
      className="relative w-full text-left overflow-hidden rounded-[2rem] p-6 text-white shadow-xl shadow-emerald-700/20 bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-700 active:scale-[.99] transition"
    >
      <div className="absolute -right-6 -top-6 text-[9rem] opacity-20 rotate-12 select-none">{topic.emoji}</div>
      <div className="absolute right-4 bottom-4 opacity-15"><AtomIcon className="w-28 h-28 animate-orbit-slow" /></div>
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
        <i className="fa-solid fa-fire"></i> Kun mavzusi
      </span>
      <h2 className="relative mt-4 text-[1.75rem] leading-tight font-extrabold max-w-[85%]">{topic.title}</h2>
      <p className="relative mt-2 text-white/85 max-w-[85%]">{topic.summary}</p>
      <span className="relative mt-5 inline-flex items-center gap-2 bg-white text-emerald-700 font-bold text-sm px-4 py-2 rounded-full">
        O'qish <i className="fa-solid fa-arrow-right"></i>
      </span>
    </button>
  );
};

const VoteStrip: React.FC = () => {
  const { state, voteTopic } = useStore();
  const me = useMe();
  const candidates = state.topics.filter((t) => t.id !== state.todayTopicId);
  const total = candidates.reduce((s, t) => s + t.votes.length, 0) || 1;
  return (
    <div>
      <h3 className="font-bold text-sm text-muted mb-2 px-1"><i className="fa-solid fa-square-poll-vertical mr-1.5"></i>Ertangi mavzu uchun ovoz bering</h3>
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
        {candidates.map((t) => {
          const mine = t.votes.includes(me.id);
          const pct = Math.round((t.votes.length / total) * 100);
          return (
            <button
              key={t.id}
              onClick={() => voteTopic(t.id)}
              className={`relative overflow-hidden shrink-0 w-40 text-left p-3 rounded-2xl border ${mine ? 'border-emerald-500 bg-emerald-500/10' : 'border-line bg-card'}`}
            >
              <div className="absolute inset-y-0 left-0 bg-emerald-500/10" style={{ width: `${pct}%` }} />
              <div className="relative">
                <div className="text-2xl">{t.emoji}</div>
                <div className="text-sm font-semibold leading-tight mt-1 line-clamp-2">{t.title}</div>
                <div className="text-[11px] text-muted mt-1">{mine && <i className="fa-solid fa-check text-emerald-500 mr-1"></i>}{t.votes.length} ovoz · {pct}%</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const Message: React.FC<{ m: ChatMessage }> = ({ m }) => {
  const { state, openProfile, report } = useStore();
  const me = useMe();
  const author = state.users[m.authorId];
  const mine = m.authorId === me.id;
  const [zoom, setZoom] = useState(false);
  if (m.flagged && !mine) return null;
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <Avatar user={author} size={34} onClick={() => openProfile(m.authorId)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-bold truncate">{fullName(author)}</span>
          {author && <TeacherBadge user={author} />}
          {author && <LevelBadge atoms={author.atoms} small />}
          <span className="text-muted ml-auto shrink-0">{timeAgo(m.createdAt)}</span>
        </div>
        <div className={`mt-1 inline-block max-w-full rounded-2xl rounded-tl-md px-3.5 py-2 ${m.flagged ? 'bg-emerald-500/15 border border-emerald-500/40' : mine ? 'bg-emerald-600 text-white' : 'bg-card border border-line'}`}>
          {m.image && <MediaImage src={m.image} className="rounded-xl max-h-60 mb-1 object-cover" onClick={() => setZoom(true)} />}
          {m.video && <MediaVideo src={m.video} controls playsInline className="rounded-xl max-h-72 mb-1" />}
          {m.text && <p className="text-[15px] whitespace-pre-wrap break-words">{m.text}</p>}
          {m.flagged && <p className="text-[11px] text-emerald-600 mt-1"><i className="fa-solid fa-shield-halved mr-1"></i>Admin tekshiruvida — boshqalarga ko'rinmaydi</p>}
        </div>
      </div>
      {!mine && <ReportMenu onReport={(r) => report({ type: 'chat', id: m.id }, r, m.text ?? (m.image ? '[rasm]' : '[video]'))} />}
      {zoom && m.image && (
        <div className="fixed inset-0 z-[90] bg-black/95 flex items-center justify-center" onClick={() => setZoom(false)}>
          <MediaImage src={m.image} className="max-w-full max-h-full" />
        </div>
      )}
    </div>
  );
};

const ChatInput: React.FC = () => {
  const { sendChat, toast } = useStore();
  const me = useMe();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);
  const muted = me.mutedUntil && me.mutedUntil > Date.now();
  const canImage = me.atoms >= PERMISSIONS.chatImage;
  const canVideo = me.atoms >= PERMISSIONS.chatVideo;

  const handleResult = (r: ReturnType<typeof sendChat>) => {
    if (r === 'muted') toast('Siz 24 soatga chatdan cheklangansiz', 'fa-ban');
    if (r === 'flagged') toast("Nomaqbul so'z aniqlandi — ogohlantirish berildi", 'fa-triangle-exclamation');
  };

  const send = () => {
    if (!text.trim()) return;
    handleResult(sendChat({ text: text.trim() }));
    setText('');
  };

  const locked = (min: number, what: string) =>
    toast(`${what} uchun "${levelOf(min).name}" darajasi kerak`, 'fa-lock');

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>, kind: 'image' | 'video') => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (kind === 'video' && f.size > 50 * 1024 * 1024) return toast('Video 50 MB dan kichik bo\'lishi kerak', 'fa-triangle-exclamation');
    setBusy(true);
    try {
      const ref = kind === 'image' ? await saveImage(f) : await saveMedia(f);
      handleResult(sendChat({ [kind]: ref, text: text.trim() || undefined }));
      setText('');
    } finally { setBusy(false); }
  };

  if (muted) {
    return (
      <div className="p-3 text-center text-sm text-red-500 bg-red-500/10 rounded-2xl">
        <i className="fa-solid fa-ban mr-1"></i>3 ta ogohlantirish sababli chat {new Date(me.mutedUntil!).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' })} gacha cheklangan
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2">
      <button onClick={() => (canImage ? imgRef.current?.click() : locked(PERMISSIONS.chatImage, 'Rasm yuborish'))} className="w-10 h-10 shrink-0 rounded-full bg-soft text-muted relative" aria-label="Rasm">
        <i className="fa-solid fa-image"></i>
        {!canImage && <i className="fa-solid fa-lock absolute -right-0.5 -bottom-0.5 text-[9px] bg-card rounded-full p-0.5"></i>}
      </button>
      <button onClick={() => (canVideo ? vidRef.current?.click() : locked(PERMISSIONS.chatVideo, 'Video yuborish'))} className="w-10 h-10 shrink-0 rounded-full bg-soft text-muted relative" aria-label="Video">
        <i className="fa-solid fa-video"></i>
        {!canVideo && <i className="fa-solid fa-lock absolute -right-0.5 -bottom-0.5 text-[9px] bg-card rounded-full p-0.5"></i>}
      </button>
      <input ref={imgRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e, 'image')} />
      <input ref={vidRef} type="file" accept="video/*" hidden onChange={(e) => onFile(e, 'video')} />
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && send()}
        placeholder={busy ? 'Yuklanmoqda...' : 'Xabar yozing...'}
        disabled={busy}
        className="flex-1 min-w-0 h-10 px-4 rounded-full bg-soft outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <button onClick={send} disabled={!text.trim()} className="w-10 h-10 shrink-0 rounded-full bg-emerald-600 disabled:opacity-40 text-white" aria-label="Yuborish">
        <i className="fa-solid fa-paper-plane"></i>
      </button>
    </div>
  );
};

const LevelsInfo: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => (
  <Sheet open={open} onClose={onClose} title="Daraja imkoniyatlari">
    <ul className="space-y-2 text-sm">
      <li className="p-3 rounded-2xl bg-soft"><i className="fa-solid fa-image text-sky-500 mr-2"></i>Chatda rasm — <b>{levelOf(PERMISSIONS.chatImage).name}</b> ({PERMISSIONS.chatImage}+ atom)</li>
      <li className="p-3 rounded-2xl bg-soft"><i className="fa-solid fa-video text-rose-500 mr-2"></i>Chatda video — <b>{levelOf(PERMISSIONS.chatVideo).name}</b> ({PERMISSIONS.chatVideo}+ atom)</li>
      <li className="p-3 rounded-2xl bg-soft"><i className="fa-solid fa-crown text-amber-500 mr-2"></i>Premium ustozlar — <b>{levelOf(PERMISSIONS.premiumTeachers).name}</b> ({PERMISSIONS.premiumTeachers}+ atom)</li>
    </ul>
    <h4 className="font-bold mt-5 mb-2">Barcha darajalar</h4>
    <div className="grid grid-cols-2 gap-2">
      {LEVELS.map((l) => (
        <div key={l.name} className="p-2.5 rounded-xl border border-line text-sm flex items-center gap-2">
          <i className={`fa-solid ${l.icon}`} style={{ color: l.color }}></i>
          <span className="font-semibold">{l.name}</span>
          <span className="ml-auto text-muted text-xs">{l.min}+</span>
        </div>
      ))}
    </div>
  </Sheet>
);

const Home: React.FC = () => {
  const { state } = useStore();
  const endRef = useRef<HTMLDivElement>(null);
  const [info, setInfo] = useState(false);
  const count = state.chat.length;

  // Faqat yangi xabar kelganda pastga tushamiz — kirishda kun mavzusi ko'rinib tursin
  const prevCount = useRef(count);
  useEffect(() => {
    if (count > prevCount.current) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    prevCount.current = count;
  }, [count]);

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur px-4 h-16 flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow"><Logo className="w-full h-full" /></div>
        <h1 className="font-extrabold text-lg">Kimyoviy muammo</h1>
        <div className="ml-auto"><AtomCounter /></div>
      </header>

      <div className="max-w-xl mx-auto px-4 space-y-5 pb-40">
        <DayTopicCard />
        <VoteStrip />

        <section>
          <div className="flex items-center mb-2 px-1">
            <h3 className="font-bold"><i className="fa-solid fa-comments text-emerald-500 mr-2"></i>Umumiy chat</h3>
            <button onClick={() => setInfo(true)} className="ml-auto text-xs text-muted"><i className="fa-solid fa-circle-info mr-1"></i>Daraja imkoniyatlari</button>
          </div>
          <div className="space-y-0.5">
            {state.chat.slice(-80).map((m) => <Message key={m.id} m={m} />)}
          </div>
          <div ref={endRef} style={{ scrollMarginBottom: 150 }} />
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-30 bg-surface/95 backdrop-blur border-t border-line">
        <div className="max-w-xl mx-auto px-3 py-2.5"><ChatInput /></div>
      </div>
      <LevelsInfo open={info} onClose={() => setInfo(false)} />
    </div>
  );
};

export default Home;
