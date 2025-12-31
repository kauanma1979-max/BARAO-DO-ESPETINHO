
import React, { useState } from 'react';

interface LoginModalProps {
  onLogin: (password: string) => void;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onClose }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay animate-fade-in">
      <div className="bg-white/95 backdrop-blur-xl w-full max-w-sm rounded-[3rem] p-12 shadow-2xl relative overflow-hidden border border-white/20">
        <div className="absolute top-0 left-0 w-full h-2 header-animated"></div>
        
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-300 hover:text-ferrari interactive-element transform hover:rotate-90"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-ferrari shadow-inner border border-gray-100">
            <i className="fas fa-shield-halved text-3xl"></i>
          </div>
          <h2 className="text-2xl font-black font-heading text-onyx uppercase tracking-tighter">Acesso Restrito</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 border-t border-gray-100 pt-2 mx-8">Área Administrativa</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 pl-4">Senha do Sistema</label>
            <div className="relative">
              <i className="fas fa-key absolute left-6 top-1/2 -translate-y-1/2 text-gray-300"></i>
              <input 
                type="password" 
                autoFocus
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-ferrari rounded-2xl p-6 pl-14 text-center font-black tracking-[0.8em] text-onyx outline-none transition-all shadow-inner form-input-premium"
              />
            </div>
          </div>
          <button 
            type="submit"
            className="w-full bg-onyx text-white py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-xs hover:bg-ferrari transition-all shadow-xl hover:shadow-ferrari/40 transform active:scale-95 flex items-center justify-center gap-3"
          >
            Entrar no Sistema
            <i className="fas fa-arrow-right"></i>
          </button>
        </form>
        
        <div className="mt-10 pt-6 border-t border-gray-50 text-center">
            <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest">
              Nível de Segurança: <span className="text-green-500">Alto</span>
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
