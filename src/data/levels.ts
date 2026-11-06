export interface Level {
  name: string;
  min: number;
  icon: string;
  color: string;
}

// Ssenariy 9.3 bo'limi bo'yicha
export const LEVELS: Level[] = [
  { name: 'Soldat', min: 0, icon: 'fa-chevron-up', color: '#94a3b8' },
  { name: 'Kichik serjant', min: 51, icon: 'fa-angle-up', color: '#64748b' },
  { name: 'Serjant', min: 151, icon: 'fa-angles-up', color: '#0ea5e9' },
  { name: 'Leytenant', min: 301, icon: 'fa-star', color: '#06b6d4' },
  { name: 'Kapitan', min: 501, icon: 'fa-star-half-stroke', color: '#10b981' },
  { name: 'Mayor', min: 801, icon: 'fa-medal', color: '#22c55e' },
  { name: 'Podpolkovnik', min: 1201, icon: 'fa-award', color: '#eab308' },
  { name: 'Polkovnik', min: 1801, icon: 'fa-shield-halved', color: '#f97316' },
  { name: 'General-mayor', min: 2501, icon: 'fa-crown', color: '#ef4444' },
  { name: 'Marshal', min: 3501, icon: 'fa-gem', color: '#a855f7' },
];

export const levelIndex = (atoms: number) => {
  let i = 0;
  LEVELS.forEach((l, idx) => { if (atoms >= l.min) i = idx; });
  return i;
};

export const levelOf = (atoms: number) => LEVELS[levelIndex(atoms)];

/** Keyingi darajagacha progress (0..1) */
export const levelProgress = (atoms: number) => {
  const i = levelIndex(atoms);
  const next = LEVELS[i + 1];
  if (!next) return { progress: 1, next: null as Level | null, need: 0 };
  const cur = LEVELS[i];
  return { progress: (atoms - cur.min) / (next.min - cur.min), next, need: next.min - atoms };
};

// Ssenariy 9.4: daraja nimalarga ta'sir qiladi
export const PERMISSIONS = {
  chatImage: 301, // Leytenant
  chatVideo: 801, // Mayor
  premiumTeachers: 501, // Kapitan
};

// Ssenariy 9.2: atom mukofotlari
export const REWARDS = {
  viewKvant: 1,
  likeKvant: 1,
  ownKvantLiked: 5,
  postKvant: 10,
  watchLesson: 2,
  testGood: 5,
  testExcellent: 10,
  chatEvery5: 1,
  newFollower: 3,
};
