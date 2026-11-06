import { AppState, Classroom, Kvant, User } from '../types';

const H = 3600_000;
const now = Date.now();

const u = (id: string, firstName: string, lastName: string, atoms: number, extra: Partial<User> = {}): User => ({
  id, firstName, lastName, atoms, role: 'student', following: [], followers: [], warnings: 0, ...extra,
});

/** Namuna foydalanuvchilar (server ulanguncha) */
const USERS: User[] = [
  u('admin', 'Asilbek', 'Sunnatillayev', 4200, { role: 'admin', bio: "Ilova muallifi. Kimyo — bu muammo emas, sarguzasht!" }),
  u('t1', 'Dilnoza', 'Karimova', 3100, { role: 'teacher', premium: true, bio: "Organik kimyo bo'yicha 12 yillik tajriba. DTM tayyorlov." }),
  u('t2', 'Jasur', 'Toshmatov', 1950, { role: 'teacher', bio: "Noorganik kimyo, masalalar yechish sirlari." }),
  u('t3', 'Malika', 'Rahimova', 1320, { role: 'teacher', bio: "7-9 sinflar uchun kimyo asoslari — oddiy tilda." }),
  u('s1', 'Bekzod', 'Aliyev', 960),
  u('s2', 'Madina', 'Yusupova', 720),
  u('s3', 'Sardor', 'Qodirov', 540),
  u('s4', 'Nilufar', 'Ergasheva', 410),
  u('s5', 'Otabek', 'Nazarov', 260),
  u('s6', 'Shahzoda', 'Ismoilova', 180),
  u('s7', 'Javohir', 'Mirzayev', 95),
  u('s8', 'Zarina', 'Sobirova', 30),
];

// Bir nechta obunalar
const follow = (a: string, b: string) => {
  const ua = USERS.find((x) => x.id === a)!;
  const ub = USERS.find((x) => x.id === b)!;
  ua.following.push(b);
  ub.followers.push(a);
};
['s1', 's2', 's3', 's4', 's5', 's6', 't2', 't3'].forEach((s) => follow(s, 't1'));
['s1', 's2', 's4', 's7'].forEach((s) => follow(s, 't2'));
['s3', 's5', 's6', 's8'].forEach((s) => follow(s, 't3'));
['s1', 's2', 's3', 't1'].forEach((s) => follow(s, 'admin'));
follow('s2', 's1');

const post = (
  id: string, authorId: string, emoji: string, title: string, text: string, gradient: string,
  caption: string, hashtags: string[], likes: number, hoursAgo: number,
): Kvant => ({
  id, authorId, post: { emoji, title, text, gradient }, caption, hashtags,
  likes: USERS.slice(0, likes).map((x) => x.id), dislikes: [], views: likes * 7 + 13,
  comments: [], createdAt: now - hoursAgo * H,
});

const KVANTS: Kvant[] = [
  post('k1', 't1', '🧪', 'Fil tish pastasi', "H₂O₂ + KI + sovun = ko'pikli 'vulqon'. Kaliy yodid vodorod peroksidni tez parchalaydi: 2H₂O₂ → 2H₂O + O₂↑", 'from-fuchsia-600 to-orange-500', 'Eng mashhur tajriba — fil tish pastasi!', ['tajriba', 'reaksiya'], 9, 3),
  post('k2', 't2', '⚛️', 'Atom qancha kichik?', "Agar atomni futbol stadioni kattaligida tasavvur qilsak, yadro markazdagi no'xatdek bo'ladi. Atomning 99.9999% — bo'shliq!", 'from-indigo-600 to-cyan-500', 'Atom ichida nima bor?', ['atom', 'fakt'], 7, 8),
  post('k3', 'admin', '🧂', 'Osh tuzi = 2 ta xavfli modda', "Natriy suvda portlaydi, xlor — zaharli gaz. Birga esa — NaCl, dasturxonimizdagi tuz!", 'from-emerald-600 to-teal-400', 'Kimyo mo\'jizasi', ['noorganik', 'fakt'], 11, 14),
  post('k4', 't3', '🌈', 'Alanga rangi', "Li — qizil, Na — sariq, K — binafsha, Cu — yashil, Ba — och yashil. Salyut ranglari shu metallardan!", 'from-rose-600 to-amber-400', 'Salyut sirlari', ['metallar', 'tajriba'], 6, 20),
  post('k5', 's1', '💎', 'Olmos va grafit', "Ikkalasi ham faqat ugleroddan iborat! Farqi — atomlarning joylashuvida (kristall panjara).", 'from-slate-700 to-sky-500', 'Allotropiya haqida qisqacha', ['uglerod', 'organik'], 4, 26),
  post('k6', 't1', '🔬', 'Benzol halqasi', "Kekule benzol tuzilishini tushida — o'z dumini tishlagan ilonni ko'rib kashf qilgan ekan.", 'from-violet-700 to-pink-500', 'Organik kimyo tarixidan', ['organik', 'tarix'], 8, 32),
  post('k7', 's2', '🧊', "Muz nega suzadi?", "Muzda vodorod bog'lari molekulalarni 'ochiq' panjaraga teradi — zichligi suvdan ~9% kam.", 'from-sky-600 to-blue-400', "Suvning g'aroyib xossasi", ['suv', 'fakt'], 3, 40),
  post('k8', 't2', '⚖️', 'Mol nima?', "1 mol = 6.02·10²³ ta zarracha. Bu son qancha katta? 1 mol qum donasi butun O'zbekistonni 10 km qalinlikda qoplaydi!", 'from-amber-600 to-yellow-400', 'Avogadro soni', ['mol', 'masala'], 5, 50),
];
KVANTS[0].comments = [
  { id: 'c1', authorId: 's2', text: "Uyda ham qilsa bo'ladimi? 😍", createdAt: now - 2 * H },
  { id: 'c2', authorId: 't1', text: "Faqat kattalar nazoratida va 3% peroksid bilan!", createdAt: now - 1.5 * H },
];
KVANTS[2].comments = [{ id: 'c3', authorId: 's3', text: 'Zo\'r fakt!', createdAt: now - 10 * H }];

const room = (teacherId: string, background: string, description: string, lessons: Classroom['lessons']): Classroom =>
  ({ teacherId, background, description, lessons });

const CLASSROOMS: Record<string, Classroom> = {
  t1: room('t1', 'linear-gradient(135deg,#4c1d95,#be185d)', "Organik kimyo xonasiga xush kelibsiz! Har hafta yangi mavzu.", [
    {
      id: 'l1', title: 'Uglevodorodlar: alkanlar', description: "Alkanlarning umumiy formulasi, nomlanishi va xossalari.", pdfs: [], createdAt: now - 72 * H,
      tests: [
        { question: 'Alkanlarning umumiy formulasi qaysi?', options: ['CnH2n', 'CnH2n+2', 'CnH2n-2', 'CnH2n-6'], correct: 1 },
        { question: 'Metanning formulasi:', options: ['C2H6', 'CH4', 'C3H8', 'CH3OH'], correct: 1 },
        { question: "Alkanlar uchun xos reaksiya turi:", options: ["Birikish", "O'rin olish", 'Polimerlanish', 'Gidratlanish'], correct: 1 },
      ],
    },
    {
      id: 'l2', title: 'Spirtlar', description: "Bir atomli va ko'p atomli spirtlar.", pdfs: [], createdAt: now - 30 * H,
      tests: [
        { question: 'Etanol formulasi:', options: ['CH3OH', 'C2H5OH', 'C3H7OH', 'C6H5OH'], correct: 1 },
        { question: 'Glitserin necha atomli spirt?', options: ['1', '2', '3', '4'], correct: 2 },
      ],
    },
  ]),
  t2: room('t2', 'linear-gradient(135deg,#0f172a,#0369a1)', "Noorganik kimyo va masalalar. Savollar bo'lsa — chatga yozing.", [
    {
      id: 'l3', title: 'Mol va molyar massa', description: "n = m / M formulasi bilan masalalar.", pdfs: [], createdAt: now - 50 * H,
      tests: [
        { question: 'H2O ning molyar massasi:', options: ['16', '18', '20', '17'], correct: 1 },
        { question: '44 g CO2 necha mol?', options: ['0.5', '1', '2', '44'], correct: 1 },
        { question: "N.sh.da 1 mol gaz hajmi:", options: ['1 L', '11.2 L', '22.4 L', '44.8 L'], correct: 2 },
      ],
    },
  ]),
  t3: room('t3', 'linear-gradient(135deg,#065f46,#10b981)', "Kimyo asoslari — 7-9 sinflar uchun.", [
    {
      id: 'l4', title: 'Davriy jadval bilan tanishuv', description: 'Guruhlar, davrlar va element belgilari.', pdfs: [], createdAt: now - 90 * H,
      tests: [
        { question: 'Fe qaysi element?', options: ['Ftor', 'Temir', 'Fosfor', 'Fransiy'], correct: 1 },
        { question: 'Inert gazlar nechanchi guruhda?', options: ['1', '7', '8 (18)', '2'], correct: 2 },
      ],
    },
  ]),
};

const msg = (id: string, authorId: string, text: string, minsAgo: number) =>
  ({ id, authorId, text, createdAt: now - minsAgo * 60_000 });

export const SEED_VERSION = 1;

export const createSeed = (): AppState => ({
  version: SEED_VERSION,
  currentUserId: null,
  users: Object.fromEntries(USERS.map((x) => [x.id, structuredClone(x)])),
  kvants: structuredClone(KVANTS),
  chat: [
    msg('m1', 's1', 'Salom hammaga! 👋', 95),
    msg('m2', 's2', "Kim 'mol' mavzusidagi masalani tushuntirib bera oladi?", 80),
    msg('m3', 't2', "n = m / M. Masalan, 36 g suv: 36 / 18 = 2 mol 🙂", 76),
    msg('m4', 's2', 'Rahmat ustoz!', 74),
    msg('m5', 's3', "Bugungi kun mavzusi zo'r ekan", 30),
    msg('m6', 's4', 'Ertaga test bor, omad hammaga 🍀', 12),
  ],
  classrooms: structuredClone(CLASSROOMS),
  topics: [
    { id: 'd1', emoji: '🧬', title: 'Mendeleyev jadvali sirlari', summary: "Nega elementlar aynan shunday tartiblangan?", body: "1869-yilda Dmitriy Mendeleyev 63 ta ma'lum elementni atom massasi bo'yicha tartiblab, xossalarning davriy takrorlanishini payqadi. U hali kashf qilinmagan elementlar uchun bo'sh joy qoldirdi va ularning xossalarini oldindan aytib berdi — galliy, skandiy va germaniy keyinroq aynan u aytgandek topildi!\n\nBugun jadvalda 118 ta element bor. Davr — elektron qavatlar soni, guruh — tashqi qavatdagi elektronlar soni.", votes: [] },
    { id: 'd2', emoji: '🔥', title: 'Yonish reaksiyalari', summary: 'Olov aslida nima?', body: 'Yonish — moddaning kislorod bilan tez oksidlanishi, issiqlik va yorug\'lik ajralishi.', votes: ['s1', 's2'] },
    { id: 'd3', emoji: '💧', title: "Suvning g'aroyib xossalari", summary: 'Nega suv hayot manbai?', body: "Suv molekulasi qutbli, vodorod bog'lari hosil qiladi.", votes: ['s3'] },
    { id: 'd4', emoji: '🧫', title: 'Kislota va asoslar', summary: 'pH nima va u nimaga kerak?', body: 'pH — eritmadagi vodorod ionlari konsentratsiyasining ko\'rsatkichi.', votes: ['s4', 's5', 's6'] },
  ],
  todayTopicId: 'd1',
  reports: [],
  applications: {},
  settings: { theme: 'light', language: 'uz', notifications: true, sounds: true },
  rewarded: {},
  chatCounter: 0,
});
