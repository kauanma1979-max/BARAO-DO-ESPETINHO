
import React from 'react';
import { Article } from '../types';

interface ArticleViewProps {
  article: Article;
  onBack: () => void;
}

const ArticleView: React.FC<ArticleViewProps> = ({ article, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-3 text-black font-black uppercase text-[10px] tracking-[0.3em] mb-12 hover:text-ferrari transition-all group">
         <i className="fas fa-arrow-left-long transform group-hover:-translate-x-2 transition-transform"></i>
         Voltar às Dicas
      </button>

      <article className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100">
        <div className="relative h-64 md:h-[450px]">
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-10 left-10 right-10">
            <h1 className="text-white text-3xl md:text-5xl font-black font-heading uppercase tracking-tighter leading-tight drop-shadow-2xl">{article.title}</h1>
          </div>
        </div>
        
        <div className="p-8 md:p-16">
          <div className="flex items-center gap-6 mb-12 pb-8 border-b border-gray-100">
            <div className="w-14 h-14 bg-ferrari text-white rounded-2xl flex items-center justify-center shadow-lg"><i className="fas fa-user-shield text-2xl"></i></div>
            <div>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Escrito por</p>
              <p className="text-xl font-black text-onyx tracking-tighter uppercase">{article.author}</p>
            </div>
            <div className="ml-auto text-right hidden md:block">
               <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Publicado em</p>
               <p className="text-lg font-black text-onyx tracking-tighter">{new Date(article.date).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          <div className="prose prose-xl max-w-none">
            {article.content.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-gray-600 font-medium text-lg md:text-xl leading-relaxed mb-8 uppercase tracking-wide">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-16 pt-12 border-t border-gray-100 flex flex-wrap gap-4">
            {article.tags.map(tag => (
              <span key={tag} className="bg-slate-50 text-gray-400 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-gray-100">#{tag}</span>
            ))}
          </div>
        </div>
      </article>

      <div className="mt-16 bg-onyx p-12 rounded-[3.5rem] text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-ferrari"></div>
        <h3 className="text-white text-2xl font-black font-heading uppercase tracking-tighter mb-8">Gostou da dica? Peça o melhor espeto agora!</h3>
        <button onClick={onBack} className="bg-ferrari text-white px-12 py-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] hover:scale-105 transition-all shadow-xl">Ver Cardápio Premium</button>
      </div>
    </div>
  );
};

export default ArticleView;
