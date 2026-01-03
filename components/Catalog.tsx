
import React, { useState } from 'react';
import { Product, Category, CartItem, Article } from '../types';
import { CATEGORY_LABELS } from '../constants';

interface CatalogProps {
  products: Product[];
  articles: Article[];
  cart: CartItem[];
  addToCart: (p: Product) => void;
  updateCartQuantity: (id: string, delta: number) => void;
  onArticleClick: (article: Article) => void;
}

const Catalog: React.FC<CatalogProps> = ({ products, articles, cart, addToCart, updateCartQuantity, onArticleClick }) => {
  const [activeCategory, setActiveCategory] = useState<Category>(Category.TRADITIONAL);

  const filteredProducts = products.filter(p => p.category === activeCategory);
  const categories = Object.keys(CATEGORY_LABELS) as Category[];

  return (
    <div className="space-y-6 md:space-y-10 py-6 overflow-hidden">
      <section className="relative h-48 md:h-[400px] rounded-[2rem] md:rounded-[3rem] overflow-hidden group shadow-xl fade-in-up">
        <img 
          src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
          alt="Banner Churrasco" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-16">
          <h2 className="text-white text-2xl md:text-5xl lg:text-6xl font-black font-heading tracking-tighter uppercase leading-none drop-shadow-2xl">
            Sabor que vem da <span className="text-ferrari italic">Brasa</span>
          </h2>
        </div>
      </section>

      <div className="flex gap-2 md:gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sticky top-16 md:top-20 z-30 bg-slate-50/95 backdrop-blur-md pt-4 fade-in-up">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-[2rem] font-black uppercase text-xs md:text-base tracking-tighter whitespace-nowrap shadow-md border text-shadow-gray transition-all ${activeCategory === cat ? 'bg-onyx text-white border-onyx scale-105' : 'bg-white text-onyx hover:bg-gray-100 border-gray-100'}`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {activeCategory === Category.TIPS ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <div 
              key={article.id} 
              onClick={() => onArticleClick(article)}
              className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 group flex flex-col h-full cursor-pointer hover:shadow-2xl transition-all fade-in-up"
              style={{animationDelay: `${0.05 * index}s`}}
            >
              <div className="relative aspect-video overflow-hidden">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-8 space-y-4">
                <h3 className="text-xl font-black text-onyx uppercase tracking-tighter group-hover:text-ferrari transition-colors">{article.title}</h3>
                <p className="text-gray-400 text-xs font-bold leading-relaxed line-clamp-2 uppercase tracking-wider">{article.excerpt}</p>
                <span className="text-ferrari font-black text-xs uppercase tracking-widest">Ler Completo <i className="fas fa-arrow-right ml-2"></i></span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
          {filteredProducts.map((product, index) => {
            const cartItem = cart.find(i => i.id === product.id);
            const hasStock = product.stock > 0;
            return (
              <div key={product.id} className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 group flex flex-col h-full transition-all hover:shadow-xl fade-in-up" style={{animationDelay: `${0.03 * (index % 15)}s`}}>
                <div className="relative aspect-square overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-2 left-2 md:top-4 md:left-4"><span className="glass-panel text-onyx px-2 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl text-[6px] md:text-[8px] font-black uppercase tracking-widest shadow-lg border border-white/30">{CATEGORY_LABELS[product.category]}</span></div>
                </div>
                <div className="p-2.5 md:p-5 flex flex-col flex-grow">
                  <h3 className="text-xs md:text-lg font-black text-onyx mb-1 leading-tight group-hover:text-ferrari transition-colors truncate uppercase">{product.name}</h3>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5 mt-auto">
                    <span className="text-xs md:text-xl font-black text-onyx tracking-tighter">R$ {product.price.toFixed(2).replace('.', ',')}</span>
                    {cartItem ? (
                      <div className="flex items-center gap-1 md:gap-2 bg-slate-50 rounded-lg md:rounded-xl p-0.5 md:p-1 border border-gray-100">
                        <button onClick={() => updateCartQuantity(product.id, -1)} className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-md md:rounded-lg bg-white shadow-sm">-</button>
                        <span className="font-black text-onyx min-w-[14px] text-center text-[10px] md:text-xs">{cartItem.quantity}</span>
                        <button onClick={() => updateCartQuantity(product.id, 1)} className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-md md:rounded-lg bg-white shadow-sm" disabled={product.stock <= cartItem.quantity}>+</button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(product)} disabled={!hasStock} className="h-8 w-full md:w-12 md:h-12 flex items-center justify-center rounded-lg md:rounded-xl bg-onyx text-white hover:bg-ferrari shadow-md"><i className="fas fa-basket-shopping text-[10px] md:text-base"></i></button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Catalog;
