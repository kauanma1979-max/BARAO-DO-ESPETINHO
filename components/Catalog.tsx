
import React, { useState } from 'react';
import { Product, Category, CartItem } from '../types';
import { CATEGORY_LABELS } from '../constants';

interface CatalogProps {
  products: Product[];
  cart: CartItem[];
  addToCart: (p: Product) => void;
  updateCartQuantity: (id: string, delta: number) => void;
}

const Catalog: React.FC<CatalogProps> = ({ products, cart, addToCart, updateCartQuantity }) => {
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const categories = Object.keys(CATEGORY_LABELS) as Category[];

  return (
    <div className="space-y-10 py-6 overflow-hidden">
      {/* Hero Section Modernized */}
      <section className="relative h-64 md:h-[450px] rounded-[3rem] overflow-hidden group shadow-2xl fade-in-up">
        <img 
          src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
          alt="Banner Churrasco" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-ferrari text-white px-6 py-2 rounded-full text-sm md:text-2xl font-black uppercase tracking-[0.2em] shadow-xl border border-white/20">
              EXPERIÊNCIA PREMIUM
            </span>
          </div>
          <div className="overflow-hidden">
            <h2 className="text-white text-3xl md:text-6xl lg:text-7xl font-black font-heading tracking-tighter uppercase leading-none drop-shadow-2xl whitespace-nowrap">
              Sabor que vem da <span className="text-ferrari italic">Brasa</span>
            </h2>
          </div>
          <div className="mt-8 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-2 border-onyx bg-gray-800 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden shadow-xl">
                  <img src={`https://i.pravatar.cc/100?u=${i*10}`} alt="user" />
                </div>
              ))}
            </div>
            <p className="text-white text-xs md:text-base font-black uppercase tracking-[0.2em] drop-shadow-lg">Aprovado por mais de 5.000 clientes</p>
          </div>
        </div>
      </section>

      {/* Category Filter with Animation */}
      <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4 sticky top-16 md:top-20 z-30 bg-slate-50/90 backdrop-blur-md pt-6 fade-in-up" style={{animationDelay: '0.2s'}}>
        <button 
          onClick={() => setActiveCategory('all')}
          className={`px-12 py-6 rounded-[2rem] font-black uppercase text-base lg:text-lg tracking-tighter whitespace-nowrap interactive-element shadow-xl border text-shadow-gray ${activeCategory === 'all' ? 'bg-onyx text-white border-onyx shadow-onyx/40 scale-105' : 'bg-white text-onyx hover:bg-gray-100 border-gray-100'}`}
        >
          <i className="fas fa-layer-group mr-3 text-ferrari"></i> Tudo
        </button>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-12 py-6 rounded-[2rem] font-black uppercase text-base lg:text-lg tracking-tighter whitespace-nowrap interactive-element shadow-xl border text-shadow-gray ${activeCategory === cat ? 'bg-onyx text-white border-onyx shadow-onyx/40 scale-105' : 'bg-white text-onyx hover:bg-gray-100 border-gray-100'}`}
          >
            {cat === Category.TRADITIONAL && <i className="fas fa-fire mr-3 text-ferrari"></i>}
            {cat === Category.SPECIAL && <i className="fas fa-crown mr-3 text-ferrari"></i>}
            {cat === Category.DRINK && <i className="fas fa-wine-glass mr-3 text-ferrari"></i>}
            {cat === Category.SIDE && <i className="fas fa-bowl-rice mr-3 text-ferrari"></i>}
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Product Grid with Micro-interactions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProducts.map((product, index) => {
          const cartItem = cart.find(i => i.id === product.id);
          const hasStock = product.stock > 0;
          const isDica = product.name === "DICAS DO BARÃO";
          
          return (
            <div 
              key={product.id} 
              className="bg-white rounded-[3rem] overflow-hidden shadow-sm border border-gray-100 group flex flex-col h-full interactive-element card-elevated fade-in-up"
              style={{animationDelay: `${0.1 * (index % 8)}s`}}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                {!hasStock && (
                  <div className="absolute inset-0 bg-onyx/90 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-white font-black uppercase tracking-[0.4em] text-[10px] border-2 border-white/40 px-6 py-3 rounded-2xl">Lote Esgotado</span>
                  </div>
                )}
                <div className="absolute top-6 left-6">
                  <span className="glass-panel text-onyx px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl border border-white/30">
                    {CATEGORY_LABELS[product.category]}
                  </span>
                </div>
              </div>

              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-2xl font-black text-onyx mb-2 leading-tight group-hover:text-ferrari transition-colors tracking-tighter">{product.name}</h3>
                <p className="text-gray-400 text-[11px] font-bold line-clamp-2 mb-6 flex-grow leading-relaxed uppercase tracking-wider">{product.description}</p>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    {product.price > 0 ? (
                      <span className="text-3xl font-black text-onyx tracking-tighter">
                        <span className="text-ferrari text-xs align-top mr-1">R$</span>
                        {product.price.toFixed(2).replace('.', ',')}
                      </span>
                    ) : (
                      <span className="text-2xl font-black text-ferrari tracking-tighter uppercase italic">
                        Grátis
                      </span>
                    )}
                  </div>

                  {isDica ? (
                    <button className="h-16 px-6 flex items-center justify-center rounded-[1.5rem] bg-onyx text-white font-black uppercase text-[10px] tracking-widest hover:bg-ferrari transition-all shadow-xl">
                      Ver Agora
                    </button>
                  ) : cartItem ? (
                    <div className="flex items-center gap-3 bg-slate-50 rounded-[1.25rem] p-2 border border-gray-100 shadow-inner">
                      <button 
                        onClick={() => updateCartQuantity(product.id, -1)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-onyx hover:text-ferrari shadow-sm interactive-element active:scale-90"
                      >
                        <i className="fas fa-minus text-xs"></i>
                      </button>
                      <span className="font-black text-onyx min-w-[28px] text-center text-base">{cartItem.quantity}</span>
                      <button 
                        onClick={() => updateCartQuantity(product.id, 1)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-onyx hover:text-ferrari shadow-sm interactive-element active:scale-90"
                        disabled={product.stock <= cartItem.quantity}
                      >
                        <i className="fas fa-plus text-xs"></i>
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => addToCart(product)}
                      disabled={!hasStock}
                      className={`h-16 w-16 flex items-center justify-center rounded-[1.5rem] transition-all shadow-xl ${hasStock ? 'bg-onyx text-white hover:bg-ferrari hover:shadow-ferrari/40 hover:-translate-y-1' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                      <i className="fas fa-basket-shopping text-xl"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Catalog;
