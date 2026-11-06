import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fullName, timeAgo, useMe, useStore } from '../store/Store';
import { Avatar, EmptyState, LevelBadge, MediaVideo, ReportMenu, Sheet, TeacherBadge, formatNum } from '../components/ui';
import { levelIndex } from '../data/levels';
import { Kvant } from '../types';

/** Algoritm: ko'p like + yuqori darajali muallif + yangilik => yuqoriroq */
const score = (k: Kvant, authorAtoms: number) => {
  const ageH = (Date.now() - k.createdAt) / 3600_000;
  return k.likes.length * 3 - k.dislikes.length * 2 + k.comments.length + levelIndex(authorAtoms) * 2 + Math.max(0, 24 - ageH) * 0.5;
};

const SideButton: React.FC<{ icon: string; label: string | number; active?: boolean; activeColor?: string; onClick: () => void }> = ({ icon, label, active, activeColor = 'text-rose-500', onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 text-white drop-shadow">
    <span className={`w-12 h-12 rounded-full bg-black/30 backdrop-blur flex items-center justify-center text-2xl ${active ? `${activeColor} animate-pop` : ''}`}>
      <i className={`fa-solid ${icon}`}></i>
    </span>
    <span className="text-xs font-semibold">{label}</span>
  </button>
);

const Comments: React.FC<{ kvant: Kvant; open: boolean; onClose: () => void }> = ({ kvant, open, onClose }) => {
  const { state, commentKvant, report, openProfile } = useStore();
  const me = useMe();
  const [text, setText] = useState('');
  const send = () => { if (text.trim()) { commentKvant(kvant.id, text.trim()); setText(''); } };
  return (
    <Sheet open={open} onClose={onClose} title={`Fikrlar (${kvant.comments.length})`} tall>
      <div className="flex flex-col h-full">
        <div className="flex-1 space-y-3">
          {kvant.comments.length === 0 && <EmptyState icon="fa-comment-dots" text="Hali fikr yo'q. Birinchi bo'ling!" />}
          {kvant.comments.map((c) => {
            const a = state.users[c.authorId];
            return (
              <div key={c.id} className="flex items-start gap-2.5">
                <Avatar user={a} size={34} onClick={() => { onClose(); openProfile(c.authorId); }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs"><b>{fullName(a)}</b> <span className="text-muted">· {timeAgo(c.createdAt)}</span></div>
                  <p className="text-[15px] break-words">{c.text}</p>
                </div>
                {c.authorId !== me.id && <ReportMenu onReport={(r) => report({ type: 'comment', id: c.id, parentId: kvant.id }, r, c.text)} />}
              </div>
            );
          })}
        </div>
        <div className="sticky bottom-0 bg-card pt-3 flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Fikr yozing..." className="flex-1 h-11 px-4 rounded-full bg-soft outline-none focus:ring-2 focus:ring-emerald-500" />
          <button onClick={send} disabled={!text.trim()} className="w-11 h-11 rounded-full bg-emerald-600 text-white disabled:opacity-40"><i className="fa-solid fa-paper-plane"></i></button>
        </div>
      </div>
    </Sheet>
  );
};

const KvantItem: React.FC<{ k: Kvant; active: boolean; height: string }> = ({ k, active, height }) => {
  const { state, kvantAction, viewKvant, openProfile, toggleFollow, report, toast } = useStore();
  const me = useMe();
  const author = state.users[k.authorId];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [comments, setComments] = useState(false);
  const liked = k.likes.includes(me.id);
  const disliked = k.dislikes.includes(me.id);
  const following = me.following.includes(k.authorId);

  useEffect(() => {
    const v = videoRef.current;
    if (active) {
      const t = setTimeout(() => viewKvant(k.id), 1500);
      if (v) { v.currentTime = 0; v.play().then(() => setPaused(false)).catch(() => setPaused(true)); }
      return () => clearTimeout(t);
    }
    v?.pause();
  }, [active]); // eslint-disable-line

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPaused(false); } else { v.pause(); setPaused(true); }
  };

  const share = async () => {
    const text = `${k.caption} ${k.hashtags.map((h) => `#${h}`).join(' ')} — Kimyoviy muammo ilovasida`;
    try {
      if (navigator.share) await navigator.share({ title: 'Kimyoviy muammo', text });
      else { await navigator.clipboard.writeText(text); toast('Nusxa olindi', 'fa-copy'); }
    } catch { /* bekor qilindi */ }
  };

  return (
    <section className="relative snap-start snap-always w-full overflow-hidden bg-black" style={{ height }}>
      {k.video ? (
        <MediaVideo videoRef={videoRef} src={k.video} loop playsInline muted={muted} className="absolute inset-0 w-full h-full object-contain" onClick={togglePlay} />
      ) : k.post ? (
        <div className={`absolute inset-0 bg-gradient-to-br ${k.post.gradient} flex flex-col items-center justify-center text-white text-center pl-6 pr-20 pb-48 pt-14`} onDoubleClick={() => !liked && kvantAction(k.id, 'like')}>
          <div className="text-7xl mb-5 drop-shadow-lg">{k.post.emoji}</div>
          <h2 className="text-3xl font-extrabold leading-tight drop-shadow">{k.post.title}</h2>
          <p className="mt-4 text-lg text-white/90 leading-relaxed max-w-sm">{k.post.text}</p>
        </div>
      ) : null}

      {k.video && paused && (
        <button onClick={togglePlay} className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-black/40 text-white text-3xl" aria-label="Ijro"><i className="fa-solid fa-play ml-1"></i></button>
      )}

      {/* Video boshqaruvlari */}
      {k.video && (
        <div className="absolute top-16 right-3 flex flex-col gap-2">
          <button onClick={() => setMuted((m) => !m)} className="w-10 h-10 rounded-full bg-black/30 text-white" aria-label="Ovoz"><i className={`fa-solid ${muted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i></button>
          <button onClick={() => videoRef.current?.requestFullscreen?.()} className="w-10 h-10 rounded-full bg-black/30 text-white" aria-label="To'liq ekran"><i className="fa-solid fa-expand"></i></button>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

      {/* O'ng tarafdagi tugmalar */}
      <div className="absolute right-2.5 bottom-6 flex flex-col items-center gap-4">
        <SideButton icon="fa-heart" label={formatNum(k.likes.length)} active={liked} onClick={() => kvantAction(k.id, 'like')} />
        <SideButton icon="fa-heart-crack" label={formatNum(k.dislikes.length)} active={disliked} activeColor="text-sky-400" onClick={() => kvantAction(k.id, 'dislike')} />
        <SideButton icon="fa-comment-dots" label={formatNum(k.comments.length)} onClick={() => setComments(true)} />
        <SideButton icon="fa-share" label="Ulashish" onClick={share} />
        {k.authorId !== me.id && <ReportMenu light onReport={(r) => report({ type: 'kvant', id: k.id }, r, k.caption)} />}
      </div>

      {/* Muallif va taglavha */}
      <div className="absolute left-3 right-20 bottom-6 text-white">
        <div className="flex items-center gap-2.5">
          <Avatar user={author} size={40} onClick={() => openProfile(k.authorId)} ring />
          <button onClick={() => openProfile(k.authorId)} className="font-bold text-left truncate">{fullName(author)}</button>
          {author && <TeacherBadge user={author} />}
          {k.authorId !== me.id && (
            <button onClick={() => toggleFollow(k.authorId)} className={`ml-1 text-xs font-bold px-3 py-1 rounded-full border ${following ? 'border-white/50 text-white/80' : 'border-white bg-white text-black'}`}>
              {following ? 'Obunadasiz' : "Ergashish"}
            </button>
          )}
        </div>
        {author && <div className="mt-1.5"><LevelBadge atoms={author.atoms} small /></div>}
        <p className="mt-2 text-[15px] leading-snug">{k.caption}</p>
        <p className="mt-1 text-sm font-semibold text-emerald-300">{k.hashtags.map((h) => `#${h}`).join(' ')}</p>
        <p className="mt-1 text-[11px] text-white/60"><i className="fa-solid fa-eye mr-1"></i>{formatNum(k.views)} · {timeAgo(k.createdAt)}</p>
      </div>

      <Comments kvant={k} open={comments} onClose={() => setComments(false)} />
    </section>
  );
};

const Feed: React.FC<{ items: Kvant[]; height: string; startIndex?: number }> = ({ items, height, startIndex = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(startIndex);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (startIndex) el.scrollTop = startIndex * el.clientHeight;
    const onScroll = () => setActive(Math.round(el.scrollTop / el.clientHeight));
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []); // eslint-disable-line

  return (
    <div ref={ref} className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black" style={{ height }}>
      {items.map((k, i) => <KvantItem key={k.id} k={k} active={i === active} height={height} />)}
    </div>
  );
};

const KvantFeed: React.FC = () => {
  const { state } = useStore();
  // Tartib faqat bo'limga kirilganda hisoblanadi — like bosilganda videolar sakramasligi uchun
  const order = useMemo(
    () => [...state.kvants].sort((a, b) => score(b, state.users[b.authorId]?.atoms ?? 0) - score(a, state.users[a.authorId]?.atoms ?? 0)).map((k) => k.id),
    [state.kvants.length], // eslint-disable-line
  );
  const items = order.map((id) => state.kvants.find((k) => k.id === id)).filter(Boolean) as Kvant[];
  const height = 'calc(100dvh - 64px - env(safe-area-inset-bottom))';

  return (
    <div className="relative">
      <div className="absolute top-0 inset-x-0 z-20 h-14 flex items-center justify-center text-white font-extrabold text-lg bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
        <i className="fa-solid fa-atom mr-2 text-emerald-400"></i>Kvant
      </div>
      {items.length ? <Feed items={items} height={height} /> : (
        <div className="bg-black text-white flex items-center justify-center" style={{ height }}>
          <EmptyState icon="fa-film" text="Hali kvantlar yo'q. Pastdagi + tugmasi bilan birinchisini joylang!" />
        </div>
      )}
    </div>
  );
};

/** Profildagi kvantni ochganda — orqaga tugmasi bilan to'liq ekran */
export const KvantViewer: React.FC<{ ids: string[]; start: number }> = ({ ids, start }) => {
  const { state, back } = useStore();
  const items = ids.map((id) => state.kvants.find((k) => k.id === id)).filter(Boolean) as Kvant[];
  return (
    <div className="fixed inset-0 z-50 bg-black">
      <button onClick={back} className="absolute top-3 left-3 z-20 w-10 h-10 rounded-full bg-black/40 text-white" aria-label="Orqaga"><i className="fa-solid fa-arrow-left"></i></button>
      <Feed items={items} height="100dvh" startIndex={start} />
    </div>
  );
};

export default KvantFeed;
