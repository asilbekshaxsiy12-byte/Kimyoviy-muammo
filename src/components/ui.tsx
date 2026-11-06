import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { resolveMedia } from '../store/media';
import { fullName, useStore } from '../store/Store';
import { levelOf } from '../data/levels';
import { ReportReason, User } from '../types';

export const useMedia = (ref?: string) => {
  const [url, setUrl] = useState<string | undefined>(ref && !ref.startsWith('media:') ? ref : undefined);
  useEffect(() => {
    let alive = true;
    resolveMedia(ref).then((u) => alive && setUrl(u));
    return () => { alive = false; };
  }, [ref]);
  return url;
};

const AVATAR_COLORS = ['#0ea5e9', '#10b981', '#8b5cf6', '#f97316', '#ec4899', '#14b8a6', '#6366f1', '#eab308'];
const colorFor = (id: string) => AVATAR_COLORS[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];

/** Dumaloq profil rasmi. Rasm bo'lmasa — bosh harflar. */
export const Avatar: React.FC<{ user?: User; size?: number; onClick?: () => void; ring?: boolean }> = ({ user, size = 36, onClick, ring }) => {
  const url = useMedia(user?.avatar);
  const lvl = user ? levelOf(user.atoms) : null;
  const style: React.CSSProperties = {
    width: size, height: size, fontSize: size * 0.38,
    boxShadow: ring && lvl ? `0 0 0 2px rgb(var(--card)), 0 0 0 4px ${lvl.color}` : undefined,
  };
  const inner = url ? (
    <img src={url} alt="" className="w-full h-full object-cover" />
  ) : (
    <span className="font-bold text-white">{(user?.firstName?.[0] ?? '?') + (user?.lastName?.[0] ?? '')}</span>
  );
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      style={{ ...style, background: url ? undefined : colorFor(user?.id ?? 'x') }}
      className="shrink-0 rounded-full overflow-hidden flex items-center justify-center select-none"
      aria-label={fullName(user)}
    >
      {inner}
    </button>
  );
};

export const MediaImage: React.FC<{ src?: string; className?: string; onClick?: () => void }> = ({ src, className, onClick }) => {
  const url = useMedia(src);
  return url ? <img src={url} alt="" className={className} onClick={onClick} /> : <div className={`${className} bg-soft animate-pulse`} />;
};

export const MediaVideo: React.FC<React.VideoHTMLAttributes<HTMLVideoElement> & { src?: string; videoRef?: React.Ref<HTMLVideoElement> }> = ({ src, videoRef, ...rest }) => {
  const url = useMedia(src);
  return url ? <video ref={videoRef} src={url} {...rest} /> : <div className={`${rest.className} bg-black`} />;
};

export const LevelBadge: React.FC<{ atoms: number; small?: boolean }> = ({ atoms, small }) => {
  const l = levelOf(atoms);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold ${small ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'}`}
      style={{ color: l.color, background: `${l.color}22` }}
    >
      <i className={`fa-solid ${l.icon}`}></i>{l.name}
    </span>
  );
};

export const TeacherBadge: React.FC<{ user: User }> = ({ user }) =>
  user.role === 'student' ? null : (
    <i
      className={`fa-solid fa-circle-check ${user.role === 'admin' ? 'text-amber-500' : 'text-sky-500'}`}
      title={user.role === 'admin' ? 'Admin' : "O'qituvchi"}
    ></i>
  );

/** Atom pul birligi belgisi */
export const AtomIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <ellipse cx="12" cy="12" rx="10" ry="4" />
    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
  </svg>
);

export const formatNum = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : String(n));

/** Pastdan chiqadigan oyna */
export const Sheet: React.FC<{ open: boolean; onClose: () => void; title?: string; children: React.ReactNode; tall?: boolean }> = ({ open, onClose, title, children, tall }) => {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[80] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />
      <div className={`relative bg-card text-ink rounded-t-3xl shadow-2xl animate-sheet-up flex flex-col safe-bottom ${tall ? 'h-[85vh]' : 'max-h-[85vh]'}`}>
        <div className="pt-2.5 pb-1 flex justify-center" onClick={onClose}>
          <div className="w-10 h-1.5 rounded-full bg-line" />
        </div>
        {title && (
          <div className="px-5 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-lg">{title}</h3>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-soft text-muted" aria-label="Yopish">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-5 pb-5 flex-1">{children}</div>
      </div>
    </div>,
    document.body,
  );
};

export const REPORT_REASONS: ReportReason[] = ["Nomaqbul so'z", 'Nomaqbul mavzu', 'Spam / Reklama', "Noto'g'ri ma'lumot", 'Boshqa'];

/**
 * Xabar yonidagi 3 nuqta: bosilganda "Shikoyat qilish" tugmasiga aylanadi,
 * u bosilganda pastdan sabablar oynasi chiqadi.
 */
export const ReportMenu: React.FC<{ onReport: (r: ReportReason) => void; light?: boolean }> = ({ onReport, light }) => {
  const [armed, setArmed] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);

  return (
    <>
      {armed ? (
        <button
          onClick={() => { setSheet(true); setArmed(false); }}
          className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-red-500 text-white animate-fade-in whitespace-nowrap"
        >
          <i className="fa-solid fa-flag mr-1"></i>Shikoyat qilish
        </button>
      ) : (
        <button onClick={() => setArmed(true)} className={`w-7 h-7 rounded-full ${light ? 'text-white/80' : 'text-muted'}`} aria-label="Ko'proq">
          <i className="fa-solid fa-ellipsis-vertical"></i>
        </button>
      )}
      <Sheet open={sheet} onClose={() => { setSheet(false); setDone(false); }} title={done ? undefined : 'Shikoyat sababi'}>
        {done ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-2xl mb-3">
              <i className="fa-solid fa-check"></i>
            </div>
            <p className="font-semibold">Rahmat! Shikoyatingiz moderatorga yuborildi.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {REPORT_REASONS.map((r) => (
              <button
                key={r}
                onClick={() => { onReport(r); setDone(true); setTimeout(() => setSheet(false), 1300); }}
                className="w-full text-left px-4 py-3.5 rounded-2xl bg-soft hover:bg-line font-medium flex items-center"
              >
                {r}
                <i className="fa-solid fa-chevron-right ml-auto text-muted text-xs"></i>
              </button>
            ))}
          </div>
        )}
      </Sheet>
    </>
  );
};

/** Ichki sahifalar uchun sarlavha (orqaga tugmasi bilan) */
export const PageHeader: React.FC<{ title: string; right?: React.ReactNode; transparent?: boolean }> = ({ title, right, transparent }) => {
  const { back } = useStore();
  return (
    <header className={`sticky top-0 z-30 flex items-center gap-2 px-3 h-14 ${transparent ? 'text-white' : 'bg-card/90 backdrop-blur border-b border-line'}`}>
      <button onClick={back} className={`w-10 h-10 rounded-full ${transparent ? 'bg-black/25' : 'hover:bg-soft'}`} aria-label="Orqaga">
        <i className="fa-solid fa-arrow-left"></i>
      </button>
      <h1 className="font-bold text-lg truncate flex-1">{title}</h1>
      {right}
    </header>
  );
};

export const EmptyState: React.FC<{ icon: string; text: string; children?: React.ReactNode }> = ({ icon, text, children }) => (
  <div className="text-center py-12 text-muted">
    <i className={`fa-solid ${icon} text-4xl mb-3 opacity-50`}></i>
    <p className="text-sm">{text}</p>
    {children}
  </div>
);

export const Logo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <img src="./logo.png" alt="Kimyoviy muammo" className={`${className} object-contain`} />
);
