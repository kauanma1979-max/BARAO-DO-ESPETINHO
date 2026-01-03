
import React from 'react';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  onLogoClick: () => void;
  onAboutClick: () => void;
  onAdminClick: () => void;
  isAdmin: boolean;
  logo?: string;
}

const Header: React.FC<HeaderProps> = ({ cartCount, onCartClick, onLogoClick, onAboutClick, onAdminClick, isAdmin, logo }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="h-1.5 header-animated w-full"></div>
      
      <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer group interactive-element" onClick={onLogoClick}>
          {logo ? (
            <img src={logo} alt="Logo" className="w-10 h-10 md:w-14 md:h-14 rounded-2xl object-cover shadow-lg group-hover:rotate-3 transition-transform" />
          ) : (
            <div className="w-10 h-10 md:w-12 md:h-12 bg-ferrari rounded-2xl flex items-center justify-center text-white shadow-lg shadow-ferrari/30 group-hover:rotate-6 transition-transform">
              <i className="fas fa-fire-alt text-xl md:text-2xl"></i>
            </div>
          )}
          <div>
            <h1 className="text-lg md:text-2xl font-black font-heading text-onyx tracking-tighter uppercase leading-none">Casa de Carnes <span className="text-ferrari">Tomasini</span></h1>
            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">ESPETINHOS PREMIUM PARA ASSAR</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <nav className="flex items-center gap-10">
            <button onClick={onLogoClick} className="font-black text-onyx hover:text-ferrari interactive-element uppercase text-lg lg:text-xl tracking-tighter flex items-center gap-2 text-shadow-gray">
              <i className="fas fa-utensils text-sm text-ferrari"></i> Cardápio
            </button>
            <button onClick={onAboutClick} className="font-black text-onyx hover:text-ferrari interactive-element uppercase text-lg lg:text-xl tracking-tighter flex items-center gap-2 text-shadow-gray">
              <i className="fas fa-star text-sm text-ferrari"></i> Sobre
            </button>
            <button className="font-black text-onyx hover:text-ferrari interactive-element uppercase text-lg lg:text-xl tracking-tighter flex items-center gap-2 text-shadow-gray">
              <i className="fas fa-paper-plane text-sm text-ferrari"></i> Contato
            </button>
          </nav>
          
          <div className="h-8 w-px bg-gray-100"></div>

          <div className="flex items-center gap-4">
            <button 
              onClick={onCartClick}
              className="relative p-2 text-onyx hover:text-ferrari interactive-element transform hover:scale-110"
            >
              <i className="fas fa-shopping-basket text-2xl"></i>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-ferrari text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
            
            <button 
              onClick={onAdminClick}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest interactive-element ${isAdmin ? 'bg-onyx text-white hover:bg-ferrari' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'}`}
            >
              <i className={`fas ${isAdmin ? 'fa-sliders' : 'fa-user-lock'} text-xs`}></i>
              {isAdmin ? 'Configurações' : 'Admin'}
            </button>
          </div>
        </div>
        
        <div className="md:hidden flex items-center gap-3">
          <button onClick={onCartClick} className="flex items-center gap-2 bg-slate-50 border border-gray-100 px-4 py-2 rounded-2xl font-bold text-onyx text-xs interactive-element shadow-sm">
            <i className="fas fa-shopping-cart text-ferrari"></i>
            <span>{cartCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

// Fix: Adding missing default export for Header component
export default Header;
