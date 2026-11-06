import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState, ChatMessage, Comment, Kvant, Lesson, Report, ReportReason, Settings, User,
} from '../types';
import { createSeed, SEED_VERSION } from '../data/seed';
import { levelOf, REWARDS } from '../data/levels';
import { BAD_WORDS } from '../config';
import { clearMedia } from './media';

const KEY = 'kimyoviy-muammo-state';

const load = (): AppState => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as AppState;
      if (s.version === SEED_VERSION) return s;
    }
  } catch { /* yangi holat */ }
  return createSeed();
};

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export type Tab = 'home' | 'kvant' | 'lessons' | 'profile';
export type Screen =
  | { type: 'profile'; userId: string }
  | { type: 'classroom'; teacherId: string }
  | { type: 'lesson'; teacherId: string; lessonId: string }
  | { type: 'leaderboard' }
  | { type: 'topic'; id: string }
  | { type: 'adminChat'; userId: string }
  | { type: 'adminPanel' }
  | { type: 'kvantViewer'; ids: string[]; start: number };

export interface Toast { id: string; text: string; icon?: string }

export const containsBadWord = (text: string) => {
  const t = text.toLowerCase();
  return BAD_WORDS.some((w) => t.includes(w));
};

const playTone = (freq: number) => {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.2);
  } catch { /* ovoz yo'q */ }
};

const useStoreValue = () => {
  const [state, setState] = useState<AppState>(load);
  const [tab, setTab] = useState<Tab>('home');
  const [stack, setStack] = useState<Screen[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* joy yetmadi */ }
  }, [state]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.settings.theme === 'dark');
  }, [state.settings.theme]);

  const toast = useCallback((text: string, icon = 'fa-atom') => {
    const id = uid();
    setToasts((t) => [...t, { id, text, icon }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  const sound = useCallback((freq = 660) => {
    if (stateRef.current.settings.sounds) playTone(freq);
  }, []);

  /** Holatni o'zgartirish: nusxa ustida ishlaydi */
  const update = useCallback((fn: (s: AppState) => void) => {
    setState((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  }, []);

  const me = state.currentUserId ? state.users[state.currentUserId] : null;

  /** Atom berish. Joriy foydalanuvchi darajasi oshsa — tabrik */
  const award = (s: AppState, userId: string, amount: number, key?: string) => {
    if (key) {
      if (s.rewarded[key]) return;
      s.rewarded[key] = true;
    }
    const user = s.users[userId];
    if (!user) return;
    const before = levelOf(user.atoms).name;
    user.atoms += amount;
    const after = levelOf(user.atoms).name;
    if (userId === s.currentUserId) {
      setTimeout(() => {
        if (before !== after) {
          toast(`Tabriklaymiz! Yangi daraja: ${after}`, 'fa-medal');
          sound(880);
        } else if (stateRef.current.settings.notifications) {
          toast(`+${amount} atom`);
        }
      });
    }
  };

  // ---------- Navigatsiya ----------
  const push = (screen: Screen) => setStack((s) => [...s, screen]);
  const back = () => setStack((s) => s.slice(0, -1));
  const goTab = (t: Tab) => { setStack([]); setTab(t); };
  const openProfile = (userId: string) => {
    if (userId === state.currentUserId) goTab('profile');
    else push({ type: 'profile', userId });
  };

  // ---------- Hisob ----------
  const register = (firstName: string, lastName: string) => update((s) => {
    const id = uid();
    s.users[id] = { id, firstName, lastName, atoms: 0, role: 'student', following: [], followers: [], warnings: 0 };
    s.currentUserId = id;
  });

  const updateProfile = (patch: Partial<Pick<User, 'firstName' | 'lastName' | 'avatar' | 'bio'>>) =>
    update((s) => { Object.assign(s.users[s.currentUserId!], patch); });

  const logout = () => { update((s) => { s.currentUserId = null; }); setStack([]); setTab('home'); };

  const deleteAccount = async () => {
    await clearMedia().catch(() => undefined);
    localStorage.removeItem(KEY);
    setState(createSeed());
    setStack([]);
    setTab('home');
  };

  const setSettings = (patch: Partial<Settings>) => update((s) => { Object.assign(s.settings, patch); });

  // ---------- Obuna ----------
  const toggleFollow = (targetId: string) => update((s) => {
    const meU = s.users[s.currentUserId!];
    const target = s.users[targetId];
    if (meU.following.includes(targetId)) {
      meU.following = meU.following.filter((x) => x !== targetId);
      target.followers = target.followers.filter((x) => x !== meU.id);
    } else {
      meU.following.push(targetId);
      target.followers.push(meU.id);
      award(s, targetId, REWARDS.newFollower, `follow:${meU.id}:${targetId}`);
    }
  });

  // ---------- Chat ----------
  const sendChat = (m: Pick<ChatMessage, 'text' | 'image' | 'video'>) => {
    const s0 = stateRef.current;
    const meU = s0.users[s0.currentUserId!];
    if (meU.mutedUntil && meU.mutedUntil > Date.now()) return 'muted' as const;
    const flagged = !!m.text && containsBadWord(m.text);
    update((s) => {
      const u = s.users[s.currentUserId!];
      s.chat.push({ id: uid(), authorId: u.id, ...m, flagged, createdAt: Date.now() });
      if (s.chat.length > 500) s.chat = s.chat.slice(-500);
      if (flagged) {
        u.warnings += 1;
        if (u.warnings >= 3) { u.mutedUntil = Date.now() + 24 * 3600_000; u.warnings = 0; }
        return;
      }
      s.chatCounter += 1;
      if (s.chatCounter % 5 === 0) award(s, u.id, REWARDS.chatEvery5);
    });
    sound(520);
    return flagged ? ('flagged' as const) : ('ok' as const);
  };

  const report = (target: Report['target'], reason: ReportReason, preview: string) => update((s) => {
    s.reports.push({ id: uid(), reporterId: s.currentUserId!, target, reason, preview, createdAt: Date.now() });
  });

  // ---------- Kun mavzusi ----------
  const voteTopic = (id: string) => update((s) => {
    const meId = s.currentUserId!;
    s.topics.forEach((t) => { t.votes = t.votes.filter((v) => v !== meId); });
    s.topics.find((t) => t.id === id)!.votes.push(meId);
  });

  const setTodayTopic = (id: string) => update((s) => { s.todayTopicId = id; });

  // ---------- Kvant ----------
  const kvantAction = (id: string, kind: 'like' | 'dislike') => update((s) => {
    const k = s.kvants.find((x) => x.id === id)!;
    const meId = s.currentUserId!;
    const had = k[kind === 'like' ? 'likes' : 'dislikes'].includes(meId);
    k.likes = k.likes.filter((x) => x !== meId);
    k.dislikes = k.dislikes.filter((x) => x !== meId);
    if (!had) {
      (kind === 'like' ? k.likes : k.dislikes).push(meId);
      if (kind === 'like') {
        award(s, meId, REWARDS.likeKvant, `like:${meId}:${id}`);
        if (k.authorId !== meId) award(s, k.authorId, REWARDS.ownKvantLiked, `liked:${meId}:${id}`);
      }
    }
  });

  const viewKvant = (id: string) => update((s) => {
    const meId = s.currentUserId!;
    const key = `view:${meId}:${id}`;
    if (s.rewarded[key]) return;
    s.kvants.find((x) => x.id === id)!.views += 1;
    award(s, meId, REWARDS.viewKvant, key);
  });

  const commentKvant = (id: string, text: string) => update((s) => {
    const c: Comment = { id: uid(), authorId: s.currentUserId!, text, createdAt: Date.now() };
    s.kvants.find((x) => x.id === id)!.comments.push(c);
  });

  const postKvant = (k: Pick<Kvant, 'video' | 'caption' | 'hashtags'>) => update((s) => {
    s.kvants.unshift({
      id: uid(), authorId: s.currentUserId!, ...k, likes: [], dislikes: [], comments: [], views: 0, createdAt: Date.now(),
    });
    award(s, s.currentUserId!, REWARDS.postKvant);
  });

  const deleteKvant = (id: string) => update((s) => { s.kvants = s.kvants.filter((k) => k.id !== id); });

  // ---------- Darslar ----------
  const addLesson = (lesson: Omit<Lesson, 'id' | 'createdAt'>) => update((s) => {
    const meId = s.currentUserId!;
    s.classrooms[meId] ??= { teacherId: meId, background: 'linear-gradient(135deg,#065f46,#0ea5e9)', description: '', lessons: [] };
    s.classrooms[meId].lessons.unshift({ ...lesson, id: uid(), createdAt: Date.now() });
  });

  const updateClassroom = (patch: { background?: string; description?: string }) => update((s) => {
    const meId = s.currentUserId!;
    s.classrooms[meId] ??= { teacherId: meId, background: 'linear-gradient(135deg,#065f46,#0ea5e9)', description: '', lessons: [] };
    Object.assign(s.classrooms[meId], patch);
  });

  const deleteLesson = (lessonId: string) => update((s) => {
    const c = s.classrooms[s.currentUserId!];
    if (c) c.lessons = c.lessons.filter((l) => l.id !== lessonId);
  });

  const watchLesson = (lessonId: string) => update((s) => {
    award(s, s.currentUserId!, REWARDS.watchLesson, `lesson:${s.currentUserId}:${lessonId}`);
  });

  const finishTest = (lessonId: string, ratio: number) => update((s) => {
    const amount = ratio >= 0.9 ? REWARDS.testExcellent : ratio >= 0.6 ? REWARDS.testGood : 0;
    if (amount) award(s, s.currentUserId!, amount, `test:${s.currentUserId}:${lessonId}`);
  });

  // ---------- O'qituvchi bo'lish ----------
  const sendToAdmin = (userId: string, text: string, fromAdmin = false) => update((s) => {
    s.applications[userId] ??= { userId, status: 'pending', messages: [] };
    const app = s.applications[userId];
    app.messages.push({ id: uid(), fromAdmin, text, createdAt: Date.now() });
    if (!fromAdmin && app.messages.filter((m) => !m.fromAdmin).length === 1) {
      app.messages.push({
        id: uid(), fromAdmin: true, createdAt: Date.now() + 1,
        text: "Assalomu alaykum! Arizangiz qabul qilindi. O'zingiz haqingizda, tajribangiz va sertifikatlaringiz haqida yozib qoldiring — tez orada javob beraman.",
      });
    }
  });

  const decideApplication = (userId: string, approve: boolean) => update((s) => {
    const app = (s.applications[userId] ??= { userId, status: 'pending', messages: [] });
    app.status = approve ? 'approved' : 'rejected';
    app.messages.push({
      id: uid(), fromAdmin: true, createdAt: Date.now(),
      text: approve
        ? "🎉 Tabriklayman! Siz endi o'qituvchisiz. Darslar bo'limida o'quv xonangizni sozlang va dars joylang."
        : "Afsuski, hozircha arizangiz rad etildi. Keyinroq qayta urinib ko'ring.",
    });
    if (approve) {
      const u = s.users[userId];
      if (u.role === 'student') u.role = 'teacher';
      s.classrooms[userId] ??= { teacherId: userId, background: 'linear-gradient(135deg,#065f46,#0ea5e9)', description: "O'quv xonamga xush kelibsiz!", lessons: [] };
    }
  });

  // ---------- Moderatsiya (admin) ----------
  const resolveReport = (id: string, removeContent: boolean, warnAuthor: boolean) => update((s) => {
    const r = s.reports.find((x) => x.id === id);
    if (!r) return;
    r.resolved = true;
    let authorId: string | undefined;
    if (r.target.type === 'chat') {
      authorId = s.chat.find((m) => m.id === r.target.id)?.authorId;
      if (removeContent) s.chat = s.chat.filter((m) => m.id !== r.target.id);
    } else if (r.target.type === 'kvant') {
      authorId = s.kvants.find((k) => k.id === r.target.id)?.authorId;
      if (removeContent) s.kvants = s.kvants.filter((k) => k.id !== r.target.id);
    } else {
      const k = s.kvants.find((x) => x.id === r.target.parentId);
      authorId = k?.comments.find((c) => c.id === r.target.id)?.authorId;
      if (k && removeContent) k.comments = k.comments.filter((c) => c.id !== r.target.id);
    }
    if (warnAuthor && authorId) {
      const u = s.users[authorId];
      u.warnings += 1;
      if (u.warnings >= 3) { u.mutedUntil = Date.now() + 24 * 3600_000; u.warnings = 0; }
    }
  });

  const togglePremium = (teacherId: string) => update((s) => {
    const u = s.users[teacherId];
    u.premium = !u.premium;
  });

  return {
    state, me, tab, stack, toasts, toast, sound,
    push, back, goTab, openProfile,
    register, updateProfile, logout, deleteAccount, setSettings, toggleFollow,
    sendChat, report, voteTopic, setTodayTopic,
    kvantAction, viewKvant, commentKvant, postKvant, deleteKvant,
    addLesson, updateClassroom, deleteLesson, watchLesson, finishTest,
    sendToAdmin, decideApplication, resolveReport, togglePremium,
  };
};

type StoreValue = ReturnType<typeof useStoreValue>;
const Ctx = createContext<StoreValue | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useStoreValue();
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useStore = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('StoreProvider yo\'q');
  return v;
};

/** Joriy foydalanuvchi (ro'yxatdan o'tgandan keyin doim mavjud) */
export const useMe = () => useStore().me!;

export const useUser = (id: string) => useStore().state.users[id];

export const fullName = (u?: User) => (u ? `${u.firstName} ${u.lastName}`.trim() : "Noma'lum");

export const timeAgo = (t: number) => {
  const d = (Date.now() - t) / 1000;
  if (d < 60) return 'hozirgina';
  if (d < 3600) return `${Math.floor(d / 60)} daq oldin`;
  if (d < 86400) return `${Math.floor(d / 3600)} soat oldin`;
  return `${Math.floor(d / 86400)} kun oldin`;
};

export const useMemoSorted = <T,>(items: T[], score: (x: T) => number) =>
  useMemo(() => [...items].sort((a, b) => score(b) - score(a)), [items]); // eslint-disable-line
