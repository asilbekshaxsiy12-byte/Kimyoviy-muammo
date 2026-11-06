// Rasm, video va PDF fayllarni qurilmaning IndexedDB bazasida saqlaydi.
// Havola ko'rinishi: "media:<id>"

const DB_NAME = 'kimyoviy-media';
const STORE = 'files';

let dbPromise: Promise<IDBDatabase> | null = null;
const db = () =>
  (dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));

const tx = async <T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>) => {
  const d = await db();
  return new Promise<T>((resolve, reject) => {
    const r = fn(d.transaction(STORE, mode).objectStore(STORE));
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
};

export const saveMedia = async (blob: Blob): Promise<string> => {
  const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
  await tx('readwrite', (s) => s.put(blob, id));
  return `media:${id}`;
};

const urlCache = new Map<string, string>();

export const getMediaBlob = async (ref: string): Promise<Blob | undefined> =>
  ref.startsWith('media:') ? tx<Blob | undefined>('readonly', (s) => s.get(ref.slice(6))) : undefined;

/** Havolani <img>/<video> uchun URL'ga aylantiradi */
export const resolveMedia = async (ref?: string): Promise<string | undefined> => {
  if (!ref) return undefined;
  if (!ref.startsWith('media:')) return ref;
  if (urlCache.has(ref)) return urlCache.get(ref);
  const blob = await getMediaBlob(ref);
  if (!blob) return undefined;
  const url = URL.createObjectURL(blob);
  urlCache.set(ref, url);
  return url;
};

export const clearMedia = () => tx('readwrite', (s) => s.clear());

/** Rasmni kichraytirib saqlaydi (profil, chat rasmlari uchun) */
export const saveImage = async (file: File, maxSize = 1080): Promise<string> => {
  const bitmap = await createImageBitmap(file);
  const k = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * k);
  canvas.height = Math.round(bitmap.height * k);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.85));
  return saveMedia(blob);
};
