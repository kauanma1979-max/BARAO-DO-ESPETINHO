
import React from 'react';
import { Article } from '../types';

interface ArticleViewProps {
  article: Article;
  onBack: () => void;
}

const ArticleView: React.FC<ArticleViewProps> = ({ article, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-3 text-black font-black uppercase text-[10px] tracking-[0.3em] mb-12 hover:text-ferrari transition-all">
         <i className="fas fa-arrow-left"></i> Voltar às Dicas
      </button>
      <article className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100">
        <div className="relative h-64 md:h-[400px]">
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          <h1 className="absolute bottom-10 left-10 right-10 text-white text-3xl md:text-5xl font-black uppercase tracking-tighter drop-shadow-2xl">{article.title}</h1>
        </div>
        <div className="p-10 md:p-16">
          <div className="prose prose-xl max-w-none text-gray-600 font-medium leading-relaxed">
            {article.content.split('\n\n').map((paragraph, i) => <p key={i} className="mb-6">{paragraph}</p>)}
          </div>
          <div className="mt-16 pt-8 border-t flex flex-wrap gap-4">
            {article.tags.map(tag => <span key={tag} className="bg-slate-50 text-gray-400 px-4 py-2 rounded-full text-[10px] font-black uppercase">#{tag}</span>)}
          </div>
        </div>
      </article>
    </div>
  );
};

export default ArticleView;
