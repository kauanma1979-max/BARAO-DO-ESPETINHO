
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
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>(Category.TRADITIONAL);

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const categories = (Object.keys(CATEGORY_LABELS) as Category[]).filter(cat => cat !== Category.TIPS);

  return (
    <div className="space-y-6 md:space-y-10 py-6 overflow-hidden">
      {/* Hero Section - With Neon Blue Border as shown in screenshot */}
      <section className="relative h-64 md:h-[500px] rounded-[2rem] md:rounded-[3.5rem] overflow-hidden group shadow-2xl fade-in-up mx-2 md:mx-0">
        <img 
          src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
          alt="Banner Churrasco" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-16">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="bg-ferrari text-white px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest shadow-xl border border-white/20">
              EXPERIÊNCIA PREMIUM
            </span>
            <a 
              href="https://blog-bar-o-do-espetinho.vercel.app/" 
              target="_blank" 
              className="bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest border border-white/20 hover:bg-white hover:text-onyx transition-all flex items-center gap-2"
            >
              <i className="fas fa-newspaper"></i> BLOG DO BARÃO
            </a>
          </div>

          {/* Neon Slogan Box */}
          <div className="inline-block border-2 border-blue-500/80 p-4 md:p-8 rounded-sm shadow-[0_0_25px_rgba(59,130,246,0.5)] max-w-fit">
            <h2 className="text-white text-3xl md:text-7xl font-black font-heading tracking-tighter uppercase leading-tight drop-shadow-2xl">
              SABOR QUE VEM DA <br /> <span className="text-ferrari italic">BRASA</span>
            </h2>
          </div>
        </div>
      </section>

      {/* Category Filter - Capsule Style as per screenshot */}
      <div className="flex gap-2 md:gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sticky top-16 md:top-24 z-30 bg-slate-50/95 backdrop-blur-md pt-4 fade-in-up">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 md:px-8 py-3 md:py-4 rounded-full font-black uppercase text-[10px] md:text-sm tracking-tighter whitespace-nowrap shadow-sm border transition-all flex items-center gap-2 ${activeCategory === cat ? 'bg-onyx text-white border-onyx scale-105' : 'bg-gray-200/50 text-onyx hover:bg-gray-200 border-gray-100'}`}
          >
            {cat === Category.TRADITIONAL && <i className="fas fa-fire text-ferrari"></i>}
            {cat === Category.SPECIAL && <i className="fas fa-crown text-ferrari"></i>}
            {cat === Category.DRINK && <i className="fas fa-wine-glass text-ferrari"></i>}
            {cat === Category.SIDE && <i className="fas fa-mortar-pestle text-ferrari"></i>}
            {cat === Category.COAL && <i className="fas fa-fire-alt text-ferrari"></i>}
            {CATEGORY_LABELS[cat].toUpperCase()}
          </button>
        ))}
      </div>

      {/* Product Grid - Price and Button Aligned horizontally */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8 px-2 md:px-0">
        {filteredProducts.map((product, index) => {
          const cartItem = cart.find(i => i.id === product.id);
          const hasStock = product.stock > 0;
          
          return (
            <div 
              key={product.id} 
              className="bg-white rounded-[2rem] overflow-hidden shadow-lg border border-gray-100 group flex flex-col h-full transition-all hover:shadow-2xl fade-in-up"
              style={{animationDelay: `${0.03 * (index % 15)}s`}}
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                {!hasStock && (
                  <div className="absolute inset-0 bg-onyx/80 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="text-white font-black uppercase tracking-widest text-[8px] border border-white/40 px-3 py-1.5 rounded-xl">Esgotado</span>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="bg-gray-200/80 backdrop-blur-sm text-onyx px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm border border-white/50">
                    {CATEGORY_LABELS[product.category].toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="p-4 md:p-6 flex flex-col flex-grow">
                <h3 className="text-sm md:text-lg font-black text-onyx mb-1 leading-tight group-hover:text-ferrari transition-colors tracking-tighter uppercase">{product.name}</h3>
                <p className="text-gray-400 text-[8px] md:text-[10px] font-bold line-clamp-2 mb-4 flex-grow leading-tight uppercase tracking-wider">{product.description}</p>
                
                {/* Fixed horizontal alignment for Price and Action Button */}
                <div className="flex items-center justify-between gap-2 mt-auto pt-4 border-t border-gray-50">
                  <div className="flex flex-col">
                    <span className="text-sm md:text-xl font-black text-onyx tracking-tighter">
                      <span className="text-ferrari text-[10px] md:text-xs align-top mr-1">R$</span>
                      {product.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  {cartItem ? (
                    <div className="flex items-center gap-1 bg-onyx rounded-xl p-1 shadow-lg">
                      <button 
                        onClick={() => updateCartQuantity(product.id, -1)}
                        className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-lg bg-onyx text-white hover:text-ferrari transition-all"
                      >
                        <i className="fas fa-minus text-[8px]"></i>
                      </button>
                      <span className="font-black text-white min-w-[16px] text-center text-[10px]">{cartItem.quantity}</span>
                      <button 
                        onClick={() => updateCartQuantity(product.id, 1)}
                        className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-lg bg-onyx text-white hover:text-ferrari transition-all"
                        disabled={product.stock <= cartItem.quantity}
                      >
                        <i className="fas fa-plus text-[8px]"></i>
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => addToCart(product)}
                      disabled={!hasStock}
                      className={`h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-xl transition-all shadow-md ${hasStock ? 'bg-onyx text-white hover:bg-ferrari hover:-translate-y-1' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
                    >
                      <i className="fas fa-shopping-basket text-xs md:text-base"></i>
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
