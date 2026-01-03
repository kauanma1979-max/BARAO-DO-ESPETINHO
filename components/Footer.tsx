
import React from 'react';

interface FooterProps {
  logo?: string;
}

const Footer: React.FC<FooterProps> = ({ logo }) => {
  return (
    <footer className="bg-onyx text-white py-20">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-16">
        <div className="col-span-1 md:col-span-2">
           <div className="flex items-center gap-4 mb-8">
            {logo ? (
              <img src={logo} alt="Logo" className="w-12 h-12 rounded-xl object-cover" />
            ) : (
              <div className="w-12 h-12 bg-ferrari rounded-xl flex items-center justify-center">
                <i className="fas fa-fire-alt text-2xl"></i>
              </div>
            )}
            <h2 className="text-3xl font-black font-heading tracking-tighter uppercase leading-none">Barão do <span className="text-ferrari">Espetinho</span></h2>
          </div>
          <p className="text-gray-500 max-w-sm font-bold text-xs leading-loose uppercase tracking-[0.2em]">
            Liderando a arte do churrasco artesanal. Qualidade premium, cortes selecionados e o verdadeiro sabor da brasa direto para você.
          </p>
        </div>

        <div>
          <h4 className="text-ferrari font-black uppercase tracking-[0.3em] text-[10px] mb-8">Horários</h4>
          <ul className="space-y-4 text-xs text-gray-400 font-black uppercase tracking-widest">
            <li className="flex justify-between border-b border-white/5 pb-2"><span>Seg - Sex:</span> <span className="text-white">18:00 - 23:30</span></li>
            <li className="flex justify-between border-b border-white/5 pb-2"><span>Sáb - Dom:</span> <span className="text-white">11:00 - 00:00</span></li>
            <li className="text-green-500 flex items-center gap-2 pt-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
              Atendimento Aberto
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-20 pt-10 border-t border-white/5 text-center">
        <p className="text-[10px] text-gray-700 font-black uppercase tracking-[0.4em]">
          &copy; {new Date().getFullYear()} Barão do Espetinho - Excelência em Churrasco.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
