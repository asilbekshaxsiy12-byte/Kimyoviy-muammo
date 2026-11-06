import React, { useRef, useState } from 'react';
import { fullName, useMe, useStore } from '../store/Store';
import { saveImage } from '../store/media';
import { AtomIcon, Avatar, EmptyState, LevelBadge, MediaVideo, PageHeader, Sheet, TeacherBadge, formatNum } from '../components/ui';
import { levelOf, levelProgress } from '../data/levels';
import { APP } from '../config';
import { Settings } from '../types';

const PeopleSheet: React.FC<{ ids: string[] | null; title: string; onClose: () => void }> = ({ ids, title, onClose }) => {
  const { state, openProfile } = useStore();
  return (
    <Sheet open={!!ids} onClose={onClose} title={title}>
      {ids?.length === 0 && <EmptyState icon="fa-users" text="Hozircha hech kim yo'q" />}
      <div className="space-y-1">
        {ids?.map((id) => {
          const u = state.users[id];
          if (!u) return null;
          return (
            <button key={id} onClick={() => { onClose(); openProfile(id); }} className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-soft text-left">
              <Avatar user={u} size={44} />
              <div className="min-w-0">
                <div className="font-semibold flex items-center gap-1.5">{fullName(u)} <TeacherBadge user={u} /></div>
                <LevelBadge atoms={u.atoms} small />
              </div>
            </button>
          );
        })}
      </div>
    </Sheet>
  );
};

const EditSheet: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const me = useMe();
  const { updateProfile, toast } = useStore();
  const [first, setFirst] = useState(me.firstName);
  const [last, setLast] = useState(me.lastName);
  const [bio, setBio] = useState(me.bio ?? '');
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <Sheet open={open} onClose={onClose} title="Profilni tahrirlash">
      <div className="flex flex-col items-center mb-5">
        <Avatar user={me} size={96} onClick={() => fileRef.current?.click()} />
        <button onClick={() => fileRef.current?.click()} className="mt-2 text-sm font-semibold text-emerald-600">Rasmni o'zgartirish</button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={async (e) => {
          const f = e.target.files?.[0]; if (f) { updateProfile({ avatar: await saveImage(f, 512) }); toast('Rasm yangilandi', 'fa-image'); }
        }} />
      </div>
      <div className="space-y-3">
        <input value={first} onChange={(e) => setFirst(e.target.value)} placeholder="Ism" className="w-full p-3.5 rounded-2xl bg-soft outline-none focus:ring-2 focus:ring-emerald-500" />
        <input value={last} onChange={(e) => setLast(e.target.value)} placeholder="Familiya" className="w-full p-3.5 rounded-2xl bg-soft outline-none focus:ring-2 focus:ring-emerald-500" />
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="O'zingiz haqingizda" className="w-full p-3.5 rounded-2xl bg-soft outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>
      <button
        disabled={first.trim().length < 2}
        onClick={() => { updateProfile({ firstName: first.trim(), lastName: last.trim(), bio: bio.trim() }); onClose(); }}
        className="mt-5 w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-bold disabled:opacity-40"
      >Saqlash</button>
    </Sheet>
  );
};

const Toggle: React.FC<{ on: boolean; onChange: () => void }> = ({ on, onChange }) => (
  <button onClick={onChange} className={`w-12 h-7 rounded-full p-1 transition ${on ? 'bg-emerald-500' : 'bg-line'}`} role="switch" aria-checked={on}>
    <span className={`block w-5 h-5 rounded-full bg-white shadow transition ${on ? 'translate-x-5' : ''}`} />
  </button>
);

const SettingsSheet: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { state, setSettings, logout, deleteAccount, push, toast } = useStore();
  const s = state.settings;
  const row = 'flex items-center gap-3 p-3.5 rounded-2xl bg-soft';
  const link = (href: string, icon: string, color: string, label: string) => (
    <a href={href} target="_blank" rel="noreferrer" className={`${row} font-semibold`}>
      <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg" style={{ background: color }}><i className={`fa-brands ${icon}`}></i></span>
      {label}<i className="fa-solid fa-arrow-up-right-from-square ml-auto text-muted text-xs"></i>
    </a>
  );
  const set = (p: Partial<Settings>) => setSettings(p);

  return (
    <Sheet open={open} onClose={onClose} title="Sozlamalar" tall>
      <h4 className="text-xs font-bold uppercase text-muted mb-2">Ishlab chiquvchi bilan aloqa</h4>
      <p className="text-sm text-muted mb-2">{APP.author}</p>
      <div className="space-y-2">
        {link(APP.links.telegram, 'fa-telegram', '#229ED9', 'Telegram')}
        {link(APP.links.instagram, 'fa-instagram', 'linear-gradient(45deg,#f58529,#dd2a7b,#8134af)', 'Instagram')}
        {link(APP.links.youtube, 'fa-youtube', '#FF0000', 'YouTube')}
      </div>

      <h4 className="text-xs font-bold uppercase text-muted mt-6 mb-2">Ilova sozlamalari</h4>
      <div className="space-y-2">
        <div className={row}>
          <i className={`fa-solid ${s.theme === 'dark' ? 'fa-moon' : 'fa-sun'} w-6 text-center text-amber-500`}></i>
          <span className="font-medium">Qora rejim</span>
          <span className="ml-auto"><Toggle on={s.theme === 'dark'} onChange={() => set({ theme: s.theme === 'dark' ? 'light' : 'dark' })} /></span>
        </div>
        <div className={row}>
          <i className="fa-solid fa-language w-6 text-center text-sky-500"></i>
          <span className="font-medium">Til</span>
          <select
            value={s.language}
            onChange={(e) => { if (e.target.value !== 'uz') toast("Bu til tez orada qo'shiladi", 'fa-language'); else set({ language: 'uz' }); }}
            className="ml-auto bg-card border border-line rounded-xl px-2 py-1.5 text-sm"
          >
            <option value="uz">O'zbekcha</option>
            <option value="ru">Русский</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className={row}>
          <i className="fa-solid fa-bell w-6 text-center text-rose-500"></i>
          <span className="font-medium">Bildirishnomalar</span>
          <span className="ml-auto"><Toggle on={s.notifications} onChange={() => set({ notifications: !s.notifications })} /></span>
        </div>
        <div className={row}>
          <i className="fa-solid fa-volume-high w-6 text-center text-violet-500"></i>
          <span className="font-medium">Ovozli effektlar</span>
          <span className="ml-auto"><Toggle on={s.sounds} onChange={() => set({ sounds: !s.sounds })} /></span>
        </div>
      </div>

      <h4 className="text-xs font-bold uppercase text-muted mt-6 mb-2">Hisob</h4>
      <div className="space-y-2">
        <button onClick={() => { onClose(); push({ type: 'adminPanel' }); }} className={`${row} w-full text-left font-medium`}>
          <i className="fa-solid fa-user-shield w-6 text-center text-amber-500"></i>Admin panel <span className="text-xs text-muted">(sinov rejimi)</span>
          <i className="fa-solid fa-chevron-right ml-auto text-muted text-xs"></i>
        </button>
        <button onClick={() => { onClose(); logout(); }} className={`${row} w-full text-left font-medium`}>
          <i className="fa-solid fa-right-from-bracket w-6 text-center text-muted"></i>Ilovadan chiqish
        </button>
        <button onClick={() => { if (confirm("Hisobingiz va barcha ma'lumotlaringiz o'chiriladi. Davom etasizmi?")) { onClose(); deleteAccount(); } }} className={`${row} w-full text-left font-medium text-red-500`}>
          <i className="fa-solid fa-trash w-6 text-center"></i>Hisobni o'chirish
        </button>
      </div>
      <p className="text-center text-xs text-muted mt-6">{APP.name} · v1.0</p>
    </Sheet>
  );
};

const Profile: React.FC<{ userId: string }> = ({ userId }) => {
  const { state, push, toggleFollow } = useStore();
  const me = useMe();
  const user = state.users[userId];
  const own = userId === me.id;
  const [people, setPeople] = useState<{ ids: string[]; title: string } | null>(null);
  const [edit, setEdit] = useState(false);
  const [settings, setSettings] = useState(false);
  if (!user) return <><PageHeader title="Profil" /><EmptyState icon="fa-user-slash" text="Foydalanuvchi topilmadi" /></>;

  const kvants = state.kvants.filter((k) => k.authorId === userId);
  const lvl = levelOf(user.atoms);
  const { progress, next, need } = levelProgress(user.atoms);
  const app = state.applications[userId];
  const isTeacher = user.role !== 'student';

  return (
    <div className="min-h-full pb-24">
      {own ? (
        <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur px-4 h-16 flex items-center">
          <h1 className="font-extrabold text-2xl">Profil</h1>
          <button onClick={() => setSettings(true)} className="ml-auto w-11 h-11 rounded-full bg-card border border-line text-lg" aria-label="Sozlamalar"><i className="fa-solid fa-gear"></i></button>
        </header>
      ) : <PageHeader title={fullName(user)} />}

      <div className="max-w-xl mx-auto px-4 pt-2">
        {/* Yuqori qism: rasm chapda, ism va obunalar o'ngda */}
        <div className="flex items-start gap-4">
          <Avatar user={user} size={92} ring />
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-extrabold leading-tight flex items-center gap-1.5 flex-wrap">{user.firstName} {user.lastName} <TeacherBadge user={user} /></h2>
                <p className="text-xs text-muted mt-0.5">{user.role === 'admin' ? 'Admin' : isTeacher ? "O'qituvchi" : "O'quvchi"}{user.premium ? ' · Premium' : ''}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setPeople({ ids: user.following, title: 'Ergashganlarim' })} className="flex-1 rounded-2xl bg-card border border-line py-2 text-center">
                <div className="text-lg font-extrabold leading-none">{formatNum(user.following.length)}</div>
                <div className="text-[11px] text-muted mt-1">Ergashganlarim</div>
              </button>
              <button onClick={() => setPeople({ ids: user.followers, title: 'Ergashtirganlarim' })} className="flex-1 rounded-2xl bg-card border border-line py-2 text-center">
                <div className="text-lg font-extrabold leading-none">{formatNum(user.followers.length)}</div>
                <div className="text-[11px] text-muted mt-1">Ergashtirganlarim</div>
              </button>
            </div>
          </div>
        </div>

        {user.bio && <p className="mt-3 text-[15px]">{user.bio}</p>}

        {/* Tugmalar */}
        <div className="mt-4 space-y-2">
          {own ? (
            <>
              <button onClick={() => setEdit(true)} className="w-full py-3 rounded-2xl bg-card border border-line font-semibold"><i className="fa-solid fa-pen mr-2"></i>Tahrirlash</button>
              {!isTeacher && (
                <button onClick={() => push({ type: 'adminChat', userId: me.id })} className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-500 text-white font-semibold">
                  <i className="fa-solid fa-chalkboard-user mr-2"></i>{app?.status === 'pending' ? "Ariza ko'rib chiqilmoqda — chatni ochish" : "O'qituvchi bo'lish"}
                </button>
              )}
            </>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => toggleFollow(userId)} className={`flex-1 py-3 rounded-2xl font-semibold ${me.following.includes(userId) ? 'bg-card border border-line' : 'bg-emerald-600 text-white'}`}>
                {me.following.includes(userId) ? <><i className="fa-solid fa-check mr-2"></i>Ergashilgan</> : <><i className="fa-solid fa-user-plus mr-2"></i>Ergashish</>}
              </button>
              {isTeacher && state.classrooms[userId] && (
                <button onClick={() => push({ type: 'classroom', teacherId: userId })} className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white font-semibold"><i className="fa-solid fa-door-open mr-2"></i>O'quv xona</button>
              )}
            </div>
          )}
        </div>

        {/* Daraja — markazda, katta */}
        <div className="mt-5 rounded-3xl p-5 text-center border border-line bg-card relative overflow-hidden">
          <div className="absolute -right-6 -top-6 opacity-10" style={{ color: lvl.color }}><AtomIcon className="w-36 h-36" /></div>
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl text-white shadow-lg" style={{ background: lvl.color }}>
            <i className={`fa-solid ${lvl.icon}`}></i>
          </div>
          <div className="mt-3 text-2xl font-extrabold" style={{ color: lvl.color }}>{lvl.name}</div>
          <div className="mt-1 flex items-center justify-center gap-1.5 font-bold"><AtomIcon className="w-5 h-5 text-emerald-500" />{user.atoms.toLocaleString('uz')} atom</div>
          {next && (
            <>
              <div className="mt-4 h-2.5 rounded-full bg-soft overflow-hidden"><div className="h-full rounded-full" style={{ width: `${progress * 100}%`, background: lvl.color }} /></div>
              <div className="mt-1.5 text-xs text-muted">"{next.name}" darajasigacha {need} atom</div>
            </>
          )}
        </div>

        {/* Kvantlar */}
        <h3 className="font-bold mt-6 mb-3"><i className="fa-solid fa-atom text-emerald-500 mr-2"></i>Kvantlar ({kvants.length})</h3>
        {kvants.length ? (
          <div className="grid grid-cols-3 gap-1.5">
            {kvants.map((k, i) => (
              <button key={k.id} onClick={() => push({ type: 'kvantViewer', ids: kvants.map((x) => x.id), start: i })} className="relative aspect-[9/14] rounded-xl overflow-hidden bg-black">
                {k.video ? (
                  <MediaVideo src={k.video} muted playsInline preload="metadata" className="w-full h-full object-cover" />
                ) : k.post ? (
                  <div className={`w-full h-full bg-gradient-to-br ${k.post.gradient} flex flex-col items-center justify-center p-2 text-white`}>
                    <span className="text-3xl">{k.post.emoji}</span>
                    <span className="text-[10px] font-bold mt-1 line-clamp-2 text-center">{k.post.title}</span>
                  </div>
                ) : null}
                <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/70 text-white text-[10px] text-left">
                  <div className="line-clamp-1">{k.caption}</div>
                  <div><i className="fa-solid fa-heart mr-0.5"></i>{formatNum(k.likes.length)}</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState icon="fa-film" text={own ? "Hali kvant joylamadingiz. Pastdagi + tugmasini bosing!" : "Hali kvantlar yo'q"} />
        )}
      </div>

      <PeopleSheet ids={people?.ids ?? null} title={people?.title ?? ''} onClose={() => setPeople(null)} />
      {own && <EditSheet open={edit} onClose={() => setEdit(false)} />}
      {own && <SettingsSheet open={settings} onClose={() => setSettings(false)} />}
    </div>
  );
};

export default Profile;
