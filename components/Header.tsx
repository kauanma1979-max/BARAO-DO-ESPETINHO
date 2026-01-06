
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

const Header: React.FC<HeaderProps> = ({ 
  cartCount, 
  onCartClick, 
  onLogoClick, 
  onAboutClick, 
  onAdminClick, 
  isAdmin, 
  logo 
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="h-1.5 header-animated w-full"></div>
      
      <div className="max-w-7xl mx-auto px-4 h-16 md:h-24 flex items-center justify-between">
        {/* Logo e Nome */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={onLogoClick}>
          {logo ? (
            <img src={logo} alt="Logo" className="w-10 h-10 md:w-16 md:h-16 rounded-2xl object-cover shadow-lg group-hover:rotate-3 transition-transform" />
          ) : (
            <div className="w-10 h-10 md:w-14 md:h-14 bg-ferrari rounded-2xl flex items-center justify-center text-white shadow-lg shadow-ferrari/30 group-hover:rotate-6 transition-transform">
              <i className="fas fa-fire-alt text-xl md:text-3xl"></i>
            </div>
          )}
          <div>
            <h1 className="text-lg md:text-3xl font-black font-heading text-onyx tracking-tighter uppercase leading-none">
              Barão do <span className="text-ferrari">Espetinho</span>
            </h1>
            <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-1 text-shadow-gray">O Melhor Churrasco da Região</p>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex items-center gap-8">
            <a 
              href="https://blog-bar-o-do-espetinho.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-black text-ferrari hover:text-onyx uppercase text-sm tracking-widest transition-all flex items-center gap-2"
            >
              <i className="fas fa-newspaper"></i>
              Blog do Barão
            </a>
            <button onClick={onAboutClick} className="font-black text-onyx hover:text-ferrari uppercase text-sm tracking-widest transition-colors">
              Nossa História
            </button>
          </nav>
          
          <div className="h-8 w-px bg-gray-100"></div>

          <div className="flex items-center gap-4">
            <button 
              onClick={onCartClick}
              className="relative p-3 bg-slate-50 rounded-2xl text-onyx hover:text-ferrari transition-all hover:scale-110 border border-gray-100 shadow-sm"
            >
              <i className="fas fa-shopping-basket text-xl"></i>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-ferrari text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
            
            <button 
              onClick={onAdminClick}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                isAdmin ? 'bg-onyx text-white hover:bg-ferrari' : 'bg-white border-2 border-gray-100 text-gray-400 hover:border-ferrari hover:text-ferrari shadow-sm'
              }`}
            >
              <i className={`fas ${isAdmin ? 'fa-sliders' : 'fa-lock'} text-xs`}></i>
              {isAdmin ? 'Painel Gestão' : 'Admin'}
            </button>
          </div>
        </div>
        
        {/* Mobile Cart/Blog */}
        <div className="md:hidden flex items-center gap-3">
          <a href="https://blog-bar-o-do-espetinho.vercel.app/" target="_blank" className="p-2.5 bg-onyx rounded-xl text-white shadow-lg">
            <i className="fas fa-newspaper"></i>
          </a>
          <button onClick={onCartClick} className="relative p-2.5 bg-ferrari rounded-xl text-white shadow-lg shadow-ferrari/30">
            <i className="fas fa-shopping-cart"></i>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-onyx text-white text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
