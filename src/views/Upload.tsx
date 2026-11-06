import React, { useEffect, useRef, useState } from 'react';
import { useMe, useStore } from '../store/Store';
import { saveMedia } from '../store/media';
import { Sheet } from '../components/ui';
import { LessonFile, TestQuestion } from '../types';

const MAX_VIDEO = 100 * 1024 * 1024;

const parseTags = (s: string) =>
  [...new Set(s.split(/[\s,#]+/).map((t) => t.trim().toLowerCase()).filter(Boolean))].slice(0, 10);

const KvantUpload: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const { postKvant, toast, goTab } = useStore();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>();
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.click(); }, []);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const pick = (f?: File) => {
    if (!f) return;
    if (f.size > MAX_VIDEO) return toast('Video 100 MB dan kichik bo\'lishi kerak', 'fa-triangle-exclamation');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const publish = async () => {
    if (!file) return;
    setBusy(true);
    const ref = await saveMedia(file);
    postKvant({ video: ref, caption: caption.trim(), hashtags: parseTags(tags) });
    setBusy(false);
    toast('Kvant joylandi! +10 atom', 'fa-circle-check');
    onDone();
    goTab('kvant');
  };

  return (
    <div className="space-y-4">
      <input ref={inputRef} type="file" accept="video/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
      {preview ? (
        <div className="relative mx-auto w-44 aspect-[9/16] rounded-2xl overflow-hidden bg-black">
          <video src={preview} className="w-full h-full object-cover" muted autoPlay loop playsInline />
          <button onClick={() => inputRef.current?.click()} className="absolute bottom-2 inset-x-2 py-1.5 rounded-full bg-black/60 text-white text-xs font-semibold">Boshqa video</button>
        </div>
      ) : (
        <button onClick={() => inputRef.current?.click()} className="w-full aspect-[16/9] rounded-2xl border-2 border-dashed border-line text-muted flex flex-col items-center justify-center gap-2">
          <i className="fa-solid fa-film text-3xl"></i>
          <span className="font-semibold">Qurilmadan video tanlang</span>
          <span className="text-xs">Vertikal (9:16) videolar eng yaxshi ko'rinadi</span>
        </button>
      )}
      <div>
        <label className="text-sm font-semibold">Taglavha</label>
        <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={2} maxLength={300} placeholder='Masalan: "Mendeleyev jadvalining siri"' className="mt-1 w-full p-3 rounded-2xl bg-soft outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>
      <div>
        <label className="text-sm font-semibold">#Heshteglar</label>
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="#organik #tajriba #molekula" className="mt-1 w-full p-3 rounded-2xl bg-soft outline-none focus:ring-2 focus:ring-emerald-500" />
        {parseTags(tags).length > 0 && <p className="mt-1.5 text-sm text-emerald-600 font-semibold">{parseTags(tags).map((t) => `#${t}`).join(' ')}</p>}
      </div>
      <p className="text-xs text-muted"><i className="fa-solid fa-circle-info mr-1"></i>Kvantlar faqat kimyoviy mavzularda bo'lishi kerak. Qoidaga zid kontent o'chiriladi.</p>
      <button disabled={!file || !caption.trim() || busy} onClick={publish} className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-bold disabled:opacity-40">
        {busy ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>Joylanmoqda...</> : <><i className="fa-solid fa-paper-plane mr-2"></i>Joylash</>}
      </button>
    </div>
  );
};

const emptyQ = (): TestQuestion => ({ question: '', options: ['', '', '', ''], correct: 0 });

export const LessonUploadSheet: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { addLesson, toast, push } = useStore();
  const me = useMe();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [video, setVideo] = useState<File | null>(null);
  const [pdfs, setPdfs] = useState<File[]>([]);
  const [tests, setTests] = useState<TestQuestion[]>([]);
  const [busy, setBusy] = useState(false);
  const vRef = useRef<HTMLInputElement>(null);
  const pRef = useRef<HTMLInputElement>(null);

  const reset = () => { setTitle(''); setDesc(''); setVideo(null); setPdfs([]); setTests([]); };
  const testsValid = tests.every((t) => t.question.trim() && t.options.every((o) => o.trim()));

  const publish = async () => {
    setBusy(true);
    const videoRef = video ? await saveMedia(video) : undefined;
    const files: LessonFile[] = [];
    for (const f of pdfs) files.push({ name: f.name, ref: await saveMedia(f) });
    addLesson({ title: title.trim(), description: desc.trim() || undefined, video: videoRef, pdfs: files, tests });
    setBusy(false);
    toast('Dars joylandi!', 'fa-circle-check');
    reset();
    onClose();
    push({ type: 'classroom', teacherId: me.id });
  };

  const setQ = (i: number, patch: Partial<TestQuestion>) => setTests((ts) => ts.map((t, j) => (j === i ? { ...t, ...patch } : t)));

  return (
    <Sheet open={open} onClose={onClose} title="Dars yuklash" tall>
      <div className="space-y-4">
        <Field n={1} label="Mavzu sarlavhasi">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Masalan: Alkenlar" className="w-full p-3 rounded-2xl bg-soft outline-none focus:ring-2 focus:ring-emerald-500" />
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} placeholder="Qisqa tavsif (ixtiyoriy)" className="mt-2 w-full p-3 rounded-2xl bg-soft outline-none focus:ring-2 focus:ring-emerald-500" />
        </Field>
        <Field n={2} label="Video (ixtiyoriy)">
          <input ref={vRef} type="file" accept="video/*" hidden onChange={(e) => setVideo(e.target.files?.[0] ?? null)} />
          <button onClick={() => vRef.current?.click()} className="w-full p-3 rounded-2xl border-2 border-dashed border-line text-sm text-muted text-left truncate">
            <i className="fa-solid fa-circle-play text-rose-500 mr-2"></i>{video ? video.name : 'Video tanlash'}
          </button>
        </Field>
        <Field n={3} label="PDF fayllar (darslik, qo'llanma)">
          <input ref={pRef} type="file" accept="application/pdf" multiple hidden onChange={(e) => setPdfs((p) => [...p, ...Array.from(e.target.files ?? [])])} />
          {pdfs.map((f, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5 mb-2 rounded-xl bg-soft text-sm">
              <i className="fa-solid fa-file-pdf text-red-500"></i><span className="flex-1 truncate">{f.name}</span>
              <button onClick={() => setPdfs((p) => p.filter((_, j) => j !== i))} className="text-muted"><i className="fa-solid fa-xmark"></i></button>
            </div>
          ))}
          <button onClick={() => pRef.current?.click()} className="w-full p-3 rounded-2xl border-2 border-dashed border-line text-sm text-muted text-left"><i className="fa-solid fa-plus mr-2"></i>PDF qo'shish</button>
        </Field>
        <Field n={4} label="Testlar">
          {tests.map((t, i) => (
            <div key={i} className="p-3 mb-3 rounded-2xl border border-line space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{i + 1}-savol</span>
                <button onClick={() => setTests((ts) => ts.filter((_, j) => j !== i))} className="ml-auto text-xs text-red-500">O'chirish</button>
              </div>
              <input value={t.question} onChange={(e) => setQ(i, { question: e.target.value })} placeholder="Savol matni" className="w-full p-2.5 rounded-xl bg-soft outline-none" />
              {t.options.map((o, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <button onClick={() => setQ(i, { correct: oi })} className={`w-8 h-8 shrink-0 rounded-full text-xs font-bold ${t.correct === oi ? 'bg-emerald-600 text-white' : 'bg-soft text-muted'}`} title="To'g'ri javob">{'ABCD'[oi]}</button>
                  <input value={o} onChange={(e) => setQ(i, { options: t.options.map((x, k) => (k === oi ? e.target.value : x)) as TestQuestion['options'] })} placeholder={`${'ABCD'[oi]} variant`} className="flex-1 min-w-0 p-2 rounded-xl bg-soft outline-none" />
                </div>
              ))}
              <p className="text-[11px] text-muted">Yashil harf — to'g'ri javob. Belgilash uchun harfni bosing.</p>
            </div>
          ))}
          <button onClick={() => setTests((ts) => [...ts, emptyQ()])} className="w-full p-3 rounded-2xl border-2 border-dashed border-line text-sm text-muted text-left"><i className="fa-solid fa-plus mr-2"></i>Test qo'shish</button>
        </Field>
        <button disabled={!title.trim() || !testsValid || busy} onClick={publish} className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-bold disabled:opacity-40">
          {busy ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>Joylanmoqda...</> : <><i className="fa-solid fa-paper-plane mr-2"></i>Darsni joylash</>}
        </button>
      </div>
    </Sheet>
  );
};

const Field: React.FC<{ n: number; label: string; children: React.ReactNode }> = ({ n, label, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-2 font-semibold text-sm">
      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">{n}</span>{label}
    </div>
    {children}
  </div>
);

const UploadSheet: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const me = useMe();
  const { toast } = useStore();
  const [mode, setMode] = useState<'menu' | 'kvant'>('menu');
  const [lesson, setLesson] = useState(false);
  const isTeacher = me.role !== 'student';
  const close = () => { setMode('menu'); onClose(); };

  return (
    <>
      <Sheet open={open} onClose={close} title={mode === 'kvant' ? 'Kvant joylash' : 'Qo\'shish'}>
        {mode === 'menu' ? (
          <div className="space-y-3">
            <button onClick={() => setMode('kvant')} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-soft text-left">
              <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-orange-400 text-white flex items-center justify-center text-xl"><i className="fa-solid fa-atom"></i></span>
              <span><b className="block">Kvant joylash</b><span className="text-sm text-muted">Qisqa kimyoviy video · +10 atom</span></span>
            </button>
            <button
              onClick={() => (isTeacher ? (close(), setLesson(true)) : toast("Dars yuklash faqat o'qituvchilar uchun", 'fa-lock'))}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl bg-soft text-left ${isTeacher ? '' : 'opacity-60'}`}
            >
              <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-400 text-white flex items-center justify-center text-xl"><i className={`fa-solid ${isTeacher ? 'fa-chalkboard-user' : 'fa-lock'}`}></i></span>
              <span><b className="block">Dars yuklash</b><span className="text-sm text-muted">{isTeacher ? "O'quv xonangizga mavzu: video, PDF, testlar" : "Profil → O'qituvchi bo'lish"}</span></span>
            </button>
          </div>
        ) : (
          <KvantUpload onDone={close} />
        )}
      </Sheet>
      <LessonUploadSheet open={lesson} onClose={() => setLesson(false)} />
    </>
  );
};

export default UploadSheet;
