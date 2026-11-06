export type Role = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  /** Rasm manzili: data:..., media:<id> yoki bo'sh (bosh harflar ko'rsatiladi) */
  avatar?: string;
  bio?: string;
  atoms: number;
  role: Role;
  /** Faqat o'qituvchilar uchun: premium ustoz */
  premium?: boolean;
  following: string[];
  followers: string[];
  /** Moderatsiya: ogohlantirishlar soni va chat cheklovi tugash vaqti */
  warnings: number;
  mutedUntil?: number;
}

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  createdAt: number;
}

export interface Kvant {
  id: string;
  authorId: string;
  /** media:<id> — qurilmadan yuklangan video */
  video?: string;
  /** Video bo'lmasa — post ko'rinishi (fon va katta matn) */
  post?: { emoji: string; title: string; text: string; gradient: string };
  caption: string;
  hashtags: string[];
  likes: string[];
  dislikes: string[];
  comments: Comment[];
  views: number;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  authorId: string;
  text?: string;
  image?: string;
  video?: string;
  flagged?: boolean;
  createdAt: number;
}

export interface TestQuestion {
  question: string;
  options: [string, string, string, string];
  correct: number;
}

export interface LessonFile {
  name: string;
  ref: string; // media:<id>
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  video?: string;
  pdfs: LessonFile[];
  tests: TestQuestion[];
  createdAt: number;
}

export interface Classroom {
  teacherId: string;
  /** CSS rang/gradient yoki media:<id> rasm */
  background: string;
  description: string;
  lessons: Lesson[];
}

export interface DayTopic {
  id: string;
  title: string;
  emoji: string;
  summary: string;
  body: string;
  votes: string[];
}

export type ReportReason = "Nomaqbul so'z" | 'Nomaqbul mavzu' | 'Spam / Reklama' | "Noto'g'ri ma'lumot" | 'Boshqa';

export interface Report {
  id: string;
  reporterId: string;
  target: { type: 'chat' | 'comment' | 'kvant'; id: string; parentId?: string };
  reason: ReportReason;
  preview: string;
  createdAt: number;
  resolved?: boolean;
}

export interface AdminMessage {
  id: string;
  fromAdmin: boolean;
  text?: string;
  file?: LessonFile;
  createdAt: number;
}

export interface TeacherApplication {
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  messages: AdminMessage[];
}

export interface Settings {
  theme: 'light' | 'dark';
  language: 'uz' | 'ru' | 'en';
  notifications: boolean;
  sounds: boolean;
}

export interface AppState {
  version: number;
  currentUserId: string | null;
  users: Record<string, User>;
  kvants: Kvant[];
  chat: ChatMessage[];
  classrooms: Record<string, Classroom>;
  topics: DayTopic[];
  todayTopicId: string;
  reports: Report[];
  applications: Record<string, TeacherApplication>;
  settings: Settings;
  /** Bir martalik mukofotlar (masalan, kvant ko'rish) uchun belgilar */
  rewarded: Record<string, true>;
  chatCounter: number;
}
