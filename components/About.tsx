
import React from 'react';

interface AboutProps {
  onBack: () => void;
}

const About: React.FC<AboutProps> = ({ onBack }) => {
  const textClass = "text-black text-shadow-gray font-black uppercase tracking-tighter";

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-3 text-black font-black uppercase text-[10px] tracking-[0.3em] mb-12 hover:text-ferrari transition-all group text-shadow-gray">
         <i className="fas fa-arrow-left-long transform group-hover:-translate-x-2 transition-transform"></i>
         Voltar ao Cardápio
      </button>

      <div className="space-y-16">
        {/* Hero Section Sobre */}
        <section className="relative rounded-[3rem] overflow-hidden shadow-2xl h-[400px]">
          <img 
            src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80" 
            className="absolute inset-0 w-full h-full object-cover" 
            alt="Churrasco de Elite" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/40 to-transparent"></div>
          <div className="absolute inset-0 flex flex-col justify-end p-12 md:p-16">
            <span className="bg-ferrari text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] w-fit mb-4">
              Nossa Essência
            </span>
            <h2 className="text-white text-4xl md:text-6xl font-black font-heading uppercase tracking-tighter leading-none drop-shadow-2xl">
              A Nobreza da Brasa <br /> <span className="text-ferrari italic">em sua Casa</span>
            </h2>
          </div>
        </section>

        {/* Conteúdo Persuasivo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div className="space-y-8">
            <div>
              <h3 className={`text-2xl mb-4 ${textClass}`}>O Segredo do Barão</h3>
              <p className="text-gray-500 font-bold text-sm leading-relaxed uppercase tracking-wider">
                No Barão do Espetinho, acreditamos que o churrasco é o coração de qualquer celebração brasileira. Não entregamos apenas carne; entregamos o protagonista do seu momento especial. 
                Nossa missão é elevar o nível do seu churrasco doméstico com o padrão das melhores boutiques de carnes.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h4 className={`text-lg mb-4 text-ferrari ${textClass.replace('text-black', '')}`}>Qualidade Premium</h4>
              <p className="text-gray-400 font-bold text-[11px] leading-loose uppercase tracking-widest">
                Trabalhamos exclusivamente com <span className="text-onyx">cortes selecionados</span>. Cada espetinho é montado artesanalmente, garantindo que a proporção de gordura e suculência seja perfeita. 
                Nossos espetos crus são preparados diariamente, mantendo o frescor que você só encontra aqui.
              </p>
            </div>
          </div>

          <div className="space-y-12">
            <div className="flex gap-6 items-start">
              <div className="w-16 h-16 bg-ferrari/10 rounded-3xl flex items-center justify-center text-ferrari shrink-0 shadow-inner">
                <i className="fas fa-fire-flame-curved text-3xl"></i>
              </div>
              <div>
                <h4 className={`text-base mb-2 ${textClass}`}>Prontos para o Mestre</h4>
                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                  Nós cuidamos de toda a preparação difícil. Você fica com a parte divertida: ser o mestre da brasa. Praticidade absoluta para sua festa ou jantar casual.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-16 h-16 bg-onyx/5 rounded-3xl flex items-center justify-center text-onyx shrink-0 shadow-inner">
                <i className="fas fa-award text-3xl text-ferrari"></i>
              </div>
              <div>
                <h4 className={`text-base mb-2 ${textClass}`}>Diferencial Exclusivo</h4>
                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                  Nossos temperos são fórmulas secretas que realçam o sabor natural da carne, sem mascará-lo. Uma explosão de sabor em cada mordida.
                </p>
              </div>
            </div>

            {/* Contato Section */}
            <div className="pt-8 border-t border-gray-100">
              <h4 className={`text-xs mb-6 ${textClass} text-gray-400`}>Fale com o Barão</h4>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-onyx rounded-2xl flex items-center justify-center text-white group-hover:bg-ferrari transition-colors">
                    <i className="fas fa-phone-volume"></i>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">Central de Atendimento</span>
                    <p className="text-xl font-black text-onyx tracking-tighter uppercase">(11) 98765-4321</p>
                  </div>
                </div>
                
                <a 
                  href="https://wa.me/5511987654321" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-green-500 text-white p-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-green-600 transition-all shadow-xl shadow-green-500/20 active:scale-95"
                >
                  <i className="fab fa-whatsapp text-xl"></i>
                  Chamar no WhatsApp agora
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Final */}
        <div className="bg-onyx p-12 rounded-[3.5rem] text-center space-y-8 relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-ferrari/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
           <h3 className="text-white text-3xl font-black font-heading uppercase tracking-tighter leading-none relative z-10">
             Pronto para o <br /> <span className="text-ferrari">Melhor Churrasco?</span>
           </h3>
           <button 
             onClick={onBack}
             className="px-12 py-6 bg-ferrari text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] hover:scale-105 transition-all shadow-xl shadow-ferrari/30 relative z-10"
           >
             Explorar Cardápio Premium
           </button>
        </div>
      </div>
    </div>
  );
};

export default About;
