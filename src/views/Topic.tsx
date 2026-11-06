import React from 'react';
import { useStore } from '../store/Store';
import { PageHeader } from '../components/ui';

const TopicView: React.FC<{ id: string }> = ({ id }) => {
  const { state, goTab } = useStore();
  const t = state.topics.find((x) => x.id === id);
  if (!t) return <PageHeader title="Mavzu" />;
  return (
    <div>
      <PageHeader title="Kun mavzusi" />
      <div className="max-w-xl mx-auto p-4">
        <div className="rounded-[2rem] p-8 text-white text-center bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-700 shadow-xl">
          <div className="text-7xl">{t.emoji}</div>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight">{t.title}</h2>
          <p className="mt-2 text-white/85">{t.summary}</p>
        </div>
        <article className="mt-6 text-[16px] leading-relaxed whitespace-pre-wrap">{t.body}</article>
        <button onClick={() => goTab('home')} className="mt-8 w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-bold">
          <i className="fa-solid fa-comments mr-2"></i>Chatda muhokama qilish
        </button>
      </div>
    </div>
  );
};

export default TopicView;
