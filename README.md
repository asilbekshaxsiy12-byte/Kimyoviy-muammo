<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Pxk6FGgP9le1hzgOqEgTV-PHHeihznSG

## Ishga tushirish

```
npm install
npm run dev
```

## Bo'limlar (ssenariy bo'yicha)

- **Splash ekran** — 4 soniya, logotip (`public/logo.png`) va shior
- **Asosiy** — kun mavzusi, ertangi mavzu uchun ovoz berish, atom hisobi (bosilsa TOP-100), umumiy chat
  (rasm — Leytenant, video — Mayor darajasidan), har xabarda shikoyat qilish, nomaqbul so'z filtri
- **Kvant** — Reels/Shorts uslubidagi vertikal lenta: like, dislike, fikrlar, ulashish
- **Darslar** — ustozlar ro'yxati (premium ustozlar Kapitan darajasidan), o'quv xona: fon, mavzular, video, PDF, testlar
- **Profil** — rasm, ergashganlar/ergashtirganlar, daraja, kvantlar, tahrirlash, o'qituvchi bo'lish (admin chat), sozlamalar
- **"+" tugmasi** — kvant joylash, o'qituvchilar uchun dars yuklash
- **Admin panel** — arizalar, shikoyatlar, premium ustozlar, kun mavzusini tanlash

> Hozircha ma'lumotlar telefonda saqlanadi (namuna foydalanuvchilar bilan). Keyingi bosqich — server (Supabase) ulash.

Muallif havolalari: `src/config.ts`
