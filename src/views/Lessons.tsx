import React, { useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { fullName, timeAgo, useMe, useStore } from '../store/Store';
import { getMediaBlob, saveImage } from '../store/media';
import { Avatar, EmptyState, LevelBadge, MediaVideo, PageHeader, Sheet, TeacherBadge, useMedia } from '../components/ui';
import { PERMISSIONS, levelOf } from '../data/levels';
import { LessonFile, User } from '../types';
import { LessonUploadSheet } from './Upload';

const isLocked = (teacher: User, me: User) =>
  !!teacher.premium && me.atoms < PERMISSIONS.premiumTeachers && me.role === 'student' && teacher.id !== me.id;

const TeacherCard: React.FC<{ t: User }> = ({ t }) => {
  const { state, push, toast } = useStore();
  const me = useMe();
  const locked = isLocked(t, me);
  const lessons = state.classrooms[t.id]?.lessons.length ?? 0;
  return (
    <button
      onClick={() => (locked ? toast(`Premium ustoz: "${levelOf(PERMISSIONS.premiumTeachers).name}" darajasi kerak`, 'fa-lock') : push({ type: 'classroom', teacherId: t.id }))}
      className="w-full text-left bg-card border border-line rounded-3xl p-4 flex gap-3.5 items-start active:scale-[.99] transition relative overflow-hidden"
    >
      {t.premium && <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-yellow-300 text-amber-900 text-[10px] font-extrabold px-3 py-1 rounded-bl-2xl"><i className="fa-solid fa-crown mr-1"></i>PREMIUM</div>}
      <Avatar user={t} size={60} ring />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 font-bold text-[17px]">
          <span className="truncate">{fullName(t)}</span><TeacherBadge user={t} />
        </div>
        <div className="mt-1"><LevelBadge atoms={t.atoms} small /></div>
        {t.bio && <p className="text-sm text-muted mt-1.5 line-clamp-2">{t.bio}</p>}
        <div className="flex gap-4 mt-2 text-xs text-muted">
          <span><i className="fa-solid fa-user-graduate mr-1"></i>{t.followers.length} o'quvchi</span>
          <span><i className="fa-solid fa-book mr-1"></i>{lessons} mavzu</span>
        </div>
      </div>
      {locked && <div className="absolute inset-0 bg-card/60 backdrop-blur-[2px] flex items-center justify-center"><span className="bg-ink text-card text-xs font-bold px-3 py-1.5 rounded-full"><i className="fa-solid fa-lock mr-1"></i>{levelOf(PERMISSIONS.premiumTeachers).name} darajasidan</span></div>}
    </button>
  );
};

const Lessons: React.FC = () => {
  const { state, push } = useStore();
  const me = useMe();
  const [filter, setFilter] = useState<'all' | 'premium' | 'following'>('all');
  const teachers = Object.values(state.users)
    .filter((u) => u.role === 'teacher' || (u.role === 'admin' && state.classrooms[u.id]))
    .filter((u) => u.id !== me.id)
    .filter((u) => filter === 'all' || (filter === 'premium' ? u.premium : me.following.includes(u.id)))
    .sort((a, b) => b.atoms - a.atoms);
  const isTeacher = me.role !== 'student';

  return (
    <div className="min-h-full pb-24">
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur px-4 h-16 flex items-center">
        <h1 className="font-extrabold text-2xl">Darslar</h1>
      </header>
      <div className="max-w-xl mx-auto px-4 space-y-4">
        {isTeacher && (
          <button onClick={() => push({ type: 'classroom', teacherId: me.id })} className="w-full text-left rounded-3xl p-5 text-white bg-gradient-to-br from-indigo-600 to-sky-500 shadow-lg">
            <div className="text-xs font-bold uppercase opacity-80"><i className="fa-solid fa-chalkboard-user mr-1"></i>Siz o'qituvchisiz</div>
            <div className="text-xl font-extrabold mt-1">Mening o'quv xonam</div>
            <div className="text-sm opacity-90 mt-1">{state.classrooms[me.id]?.lessons.length ?? 0} ta mavzu · Mavzu yuklash va xonani sozlash</div>
          </button>
        )}
        <div className="flex gap-2">
          {([['all', 'Barchasi'], ['premium', 'Premium'], ['following', 'Obunalarim']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id)} className={`px-4 py-2 rounded-full text-sm font-semibold ${filter === id ? 'bg-emerald-600 text-white' : 'bg-card border border-line text-muted'}`}>{label}</button>
          ))}
        </div>
        <div className="space-y-3">
          {teachers.map((t) => <TeacherCard key={t.id} t={t} />)}
          {!teachers.length && <EmptyState icon="fa-chalkboard-user" text="Bu bo'limda ustozlar topilmadi" />}
        </div>
      </div>
    </div>
  );
};

const BACKGROUNDS = [
  'linear-gradient(135deg,#065f46,#0ea5e9)',
  'linear-gradient(135deg,#4c1d95,#be185d)',
  'linear-gradient(135deg,#0f172a,#0369a1)',
  'linear-gradient(135deg,#7c2d12,#f59e0b)',
  'linear-gradient(135deg,#1e293b,#475569)',
  'linear-gradient(135deg,#134e4a,#84cc16)',
];

const ClassroomSettings: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { state, updateClassroom } = useStore();
  const me = useMe();
  const room = state.classrooms[me.id];
  const [desc, setDesc] = useState(room?.description ?? '');
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <Sheet open={open} onClose={onClose} title="O'quv xonani sozlash">
      <h4 className="font-semibold text-sm mb-2">Fon</h4>
      <div className="grid grid-cols-4 gap-2">
        {BACKGROUNDS.map((b) => (
          <button key={b} onClick={() => updateClassroom({ background: b })} className={`h-16 rounded-2xl ${room?.background === b ? 'ring-4 ring-emerald-500' : ''}`} style={{ background: b }} />
        ))}
        <button onClick={() => fileRef.current?.click()} className="h-16 rounded-2xl border-2 border-dashed border-line text-muted text-xs"><i className="fa-solid fa-image block text-lg mb-0.5"></i>Rasm</button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={async (e) => {
          const f = e.target.files?.[0]; if (f) updateClassroom({ background: await saveImage(f, 1600) });
        }} />
      </div>
      <h4 className="font-semibold text-sm mt-5 mb-2">Xona tavsifi</h4>
      <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} className="w-full p-3 rounded-2xl bg-soft outline-none focus:ring-2 focus:ring-emerald-500" placeholder="O'quvchilar uchun qisqa xabar..." />
      <button onClick={() => { updateClassroom({ description: desc }); onClose(); }} className="mt-4 w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-bold">Saqlash</button>
    </Sheet>
  );
};

/** Ustozning virtual o'quv xonasi */
export const ClassroomView: React.FC<{ teacherId: string }> = ({ teacherId }) => {
  const { state, push, openProfile, toggleFollow, deleteLesson } = useStore();
  const me = useMe();
  const teacher = state.users[teacherId];
  const room = state.classrooms[teacherId];
  const isOwner = teacherId === me.id;
  const bgImage = useMedia(room?.background?.startsWith('media:') ? room.background : undefined);
  const [settings, setSettings] = useState(false);
  const [upload, setUpload] = useState(false);
  const bg = bgImage ? `center/cover url(${bgImage})` : room?.background ?? BACKGROUNDS[0];

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      <div className="min-h-screen bg-black/25">
        <PageHeader title="O'quv xona" transparent right={isOwner && (
          <button onClick={() => setSettings(true)} className="w-10 h-10 rounded-full bg-black/25 text-white" aria-label="Sozlash"><i className="fa-solid fa-sliders"></i></button>
        )} />
        <div className="max-w-xl mx-auto px-4 pb-28">
          {/* Doska */}
          <div className="relative rounded-2xl border-[10px] border-amber-800/90 bg-[#1f3a2e] text-white p-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <Avatar user={teacher} size={56} onClick={() => openProfile(teacherId)} ring />
              <div className="min-w-0">
                <div className="font-extrabold text-lg flex items-center gap-1.5" style={{ fontFamily: 'cursive' }}>{fullName(teacher)} {teacher && <TeacherBadge user={teacher} />}</div>
                {teacher && <LevelBadge atoms={teacher.atoms} small />}
              </div>
            </div>
            <p className="mt-3 text-white/85 text-[15px] leading-relaxed" style={{ fontFamily: 'cursive' }}>{room?.description || "O'quv xonamga xush kelibsiz!"}</p>
            {!isOwner && (
              <button onClick={() => toggleFollow(teacherId)} className={`mt-4 px-4 py-2 rounded-full text-sm font-bold ${me.following.includes(teacherId) ? 'bg-white/15' : 'bg-white text-emerald-800'}`}>
                {me.following.includes(teacherId) ? <><i className="fa-solid fa-check mr-1"></i>O'quvchisiz</> : <><i className="fa-solid fa-user-plus mr-1"></i>Xonaga qo'shilish</>}
              </button>
            )}
            <div className="absolute -bottom-[10px] left-6 right-6 h-2 bg-amber-900 rounded-b" />
          </div>

          {isOwner && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button onClick={() => setUpload(true)} className="py-3.5 rounded-2xl bg-white text-emerald-700 font-bold shadow-lg"><i className="fa-solid fa-upload mr-1.5"></i>Mavzu yuklash</button>
              <button onClick={() => setSettings(true)} className="py-3.5 rounded-2xl bg-white/20 backdrop-blur text-white font-bold"><i className="fa-solid fa-paintbrush mr-1.5"></i>Xonani sozlash</button>
            </div>
          )}

          <h3 className="text-white font-bold mt-6 mb-3 drop-shadow"><i className="fa-solid fa-layer-group mr-2"></i>Mavzular</h3>
          <div className="space-y-3">
            {room?.lessons.map((l) => (
              <div key={l.id} className="bg-card/95 backdrop-blur rounded-2xl p-4 shadow-lg flex items-start gap-3">
                <button onClick={() => push({ type: 'lesson', teacherId, lessonId: l.id })} className="flex-1 text-left min-w-0">
                  <div className="font-bold text-[17px]">{l.title}</div>
                  {l.description && <p className="text-sm text-muted line-clamp-2 mt-0.5">{l.description}</p>}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted">
                    {l.video && <span><i className="fa-solid fa-circle-play text-rose-500 mr-1"></i>Video</span>}
                    {l.pdfs.length > 0 && <span><i className="fa-solid fa-file-pdf text-red-500 mr-1"></i>{l.pdfs.length} PDF</span>}
                    {l.tests.length > 0 && <span><i className="fa-solid fa-list-check text-emerald-500 mr-1"></i>{l.tests.length} test</span>}
                    <span>{timeAgo(l.createdAt)}</span>
                  </div>
                </button>
                {isOwner && <button onClick={() => confirm("Mavzuni o'chirasizmi?") && deleteLesson(l.id)} className="w-9 h-9 rounded-full text-muted hover:text-red-500" aria-label="O'chirish"><i className="fa-solid fa-trash"></i></button>}
              </div>
            ))}
            {!room?.lessons.length && <div className="bg-card/90 rounded-2xl"><EmptyState icon="fa-book-open" text={isOwner ? "Birinchi mavzuni yuklang!" : "Hali mavzular yo'q"} /></div>}
          </div>
        </div>
      </div>
      {isOwner && <ClassroomSettings open={settings} onClose={() => setSettings(false)} />}
      {isOwner && <LessonUploadSheet open={upload} onClose={() => setUpload(false)} />}
    </div>
  );
};

const blobToBase64 = (b: Blob) => new Promise<string>((res) => {
  const r = new FileReader();
  r.onloadend = () => res((r.result as string).split(',')[1]);
  r.readAsDataURL(b);
});

const downloadFile = async (file: LessonFile, toast: (t: string, i?: string) => void) => {
  const blob = await getMediaBlob(file.ref);
  if (!blob) return toast('Fayl topilmadi', 'fa-triangle-exclamation');
  if (Capacitor.isNativePlatform()) {
    await Filesystem.writeFile({ path: `KimyoviyMuammo/${file.name}`, data: await blobToBase64(blob), directory: Directory.Documents, recursive: true });
    toast(`Saqlandi: Documents/KimyoviyMuammo/${file.name}`, 'fa-download');
  } else {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = file.name;
    a.click();
  }
};

const Quiz: React.FC<{ lessonId: string; tests: import('../types').TestQuestion[] }> = ({ lessonId, tests }) => {
  const { finishTest } = useStore();
  const [answers, setAnswers] = useState<(number | null)[]>(() => tests.map(() => null));
  const [checked, setChecked] = useState(false);
  const correct = answers.filter((a, i) => a === tests[i].correct).length;
  const ratio = correct / tests.length;
  return (
    <div className="space-y-4">
      {tests.map((t, qi) => (
        <div key={qi} className="bg-card border border-line rounded-2xl p-4">
          <div className="font-semibold mb-3">{qi + 1}. {t.question}</div>
          <div className="grid gap-2">
            {t.options.map((o, oi) => {
              const sel = answers[qi] === oi;
              const state = checked ? (oi === t.correct ? 'right' : sel ? 'wrong' : '') : sel ? 'sel' : '';
              return (
                <button
                  key={oi}
                  disabled={checked}
                  onClick={() => setAnswers((a) => a.map((x, i) => (i === qi ? oi : x)))}
                  className={`text-left px-4 py-3 rounded-xl border font-medium flex items-center gap-3 ${
                    state === 'right' ? 'border-emerald-500 bg-emerald-500/15' : state === 'wrong' ? 'border-red-500 bg-red-500/10' : state === 'sel' ? 'border-emerald-500 bg-emerald-500/10' : 'border-line'
                  }`}
                >
                  <span className="w-7 h-7 rounded-full bg-soft flex items-center justify-center text-xs font-bold shrink-0">{'ABCD'[oi]}</span>{o}
                  {state === 'right' && <i className="fa-solid fa-check text-emerald-500 ml-auto"></i>}
                  {state === 'wrong' && <i className="fa-solid fa-xmark text-red-500 ml-auto"></i>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {checked ? (
        <div className={`rounded-2xl p-5 text-center text-white ${ratio >= 0.6 ? 'bg-emerald-600' : 'bg-orange-500'}`}>
          <div className="text-3xl font-extrabold">{correct} / {tests.length}</div>
          <div className="mt-1">{ratio >= 0.9 ? "Ajoyib! +10 atom" : ratio >= 0.6 ? 'Yaxshi! +5 atom' : "Yana bir bor urinib ko'ring"}</div>
          <button onClick={() => { setAnswers(tests.map(() => null)); setChecked(false); }} className="mt-3 px-4 py-2 rounded-full bg-white/20 font-semibold text-sm">Qayta ishlash</button>
        </div>
      ) : (
        <button disabled={answers.some((a) => a === null)} onClick={() => { setChecked(true); finishTest(lessonId, ratio); }} className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-bold disabled:opacity-40">
          Natijani tekshirish
        </button>
      )}
    </div>
  );
};

export const LessonView: React.FC<{ teacherId: string; lessonId: string }> = ({ teacherId, lessonId }) => {
  const { state, watchLesson, toast } = useStore();
  const lesson = state.classrooms[teacherId]?.lessons.find((l) => l.id === lessonId);
  React.useEffect(() => { if (lesson) watchLesson(lesson.id); }, []); // eslint-disable-line
  if (!lesson) return <><PageHeader title="Mavzu" /><EmptyState icon="fa-circle-question" text="Mavzu topilmadi" /></>;
  return (
    <div>
      <PageHeader title={lesson.title} />
      <div className="max-w-xl mx-auto p-4 space-y-5">
        {lesson.video && <MediaVideo src={lesson.video} controls playsInline className="w-full rounded-2xl bg-black aspect-video" />}
        {lesson.description && <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{lesson.description}</p>}
        {lesson.pdfs.length > 0 && (
          <section>
            <h3 className="font-bold mb-2"><i className="fa-solid fa-file-pdf text-red-500 mr-2"></i>Materiallar</h3>
            <div className="space-y-2">
              {lesson.pdfs.map((f) => (
                <div key={f.ref} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-line">
                  <i className="fa-solid fa-file-pdf text-2xl text-red-500"></i>
                  <span className="flex-1 truncate font-medium">{f.name}</span>
                  <button onClick={() => downloadFile(f, toast)} className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold"><i className="fa-solid fa-download mr-1"></i>Yuklab olish</button>
                </div>
              ))}
            </div>
          </section>
        )}
        {lesson.tests.length > 0 && (
          <section>
            <h3 className="font-bold mb-2"><i className="fa-solid fa-list-check text-emerald-500 mr-2"></i>Testlar</h3>
            <Quiz lessonId={lesson.id} tests={lesson.tests} />
          </section>
        )}
      </div>
    </div>
  );
};

export default Lessons;
