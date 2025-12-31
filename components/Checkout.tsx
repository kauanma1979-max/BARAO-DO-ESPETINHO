
import React, { useState } from 'react';
import { CartItem, Order, Customer, PaymentMethod, OrderStatus } from '../types';

interface CheckoutProps {
  items: CartItem[];
  subtotal: number;
  onSubmit: (order: Order) => void;
  onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ items, subtotal, onSubmit, onBack }) => {
  const [customer, setCustomer] = useState<Customer & { houseNumber?: string, complement?: string }>({
    name: '',
    phone: '',
    address: '',
    deliveryType: 'delivery',
    houseNumber: '',
    complement: ''
  });
  const [cep, setCep] = useState('');
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepFound, setCepFound] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.PIX);
  const [payerName, setPayerName] = useState('');
  const [changeFor, setChangeFor] = useState<string>('');

  const deliveryFee = customer.deliveryType === 'delivery' ? 5.0 : 0;
  const total = subtotal + deliveryFee;

  const handleCepSearch = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      alert('Por favor, insira um CEP válido com 8 dígitos.');
      return;
    }

    setIsSearchingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        alert('CEP não encontrado. Por favor, digite o endereço manualmente.');
        setCepFound(false);
      } else {
        const baseAddress = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
        setCustomer(prev => ({ ...prev, address: baseAddress }));
        setCepFound(true);
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      alert('Erro ao buscar o CEP. Tente novamente ou preencha manualmente.');
    } finally {
      setIsSearchingCep(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name || !customer.phone || (customer.deliveryType === 'delivery' && !customer.address)) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Concatenar número e complemento se existirem
    let finalAddress = customer.address;
    if (cepFound && customer.houseNumber) {
      finalAddress = `${customer.address}, Nº ${customer.houseNumber}${customer.complement ? ` (${customer.complement})` : ''}`;
    }

    const order: Order = {
      id: Math.floor(Math.random() * 90000 + 10000).toString(),
      date: new Date().toISOString(),
      customer: { ...customer, address: finalAddress },
      items,
      subtotal,
      deliveryFee,
      total,
      status: paymentMethod === PaymentMethod.PIX ? OrderStatus.AWAITING_PAYMENT : OrderStatus.PENDING,
      paymentMethod,
      payerName: paymentMethod === PaymentMethod.PIX ? payerName : undefined,
      changeFor: paymentMethod === PaymentMethod.CASH ? parseFloat(changeFor) : undefined
    };

    onSubmit(order);
  };

  const textClass = "text-black text-shadow-gray font-black uppercase tracking-tighter";

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
       <button onClick={onBack} className="flex items-center gap-3 text-black font-black uppercase text-[10px] tracking-[0.3em] mb-10 hover:text-ferrari transition-all group text-shadow-gray">
         <i className="fas fa-arrow-left-long transform group-hover:-translate-x-2 transition-transform"></i>
         Ajustar Pedido
       </button>

       <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-12">
         <div className="lg:col-span-3 space-y-10 fade-in-up">
           
           {/* Card: Dados do Cliente */}
           <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 relative overflow-hidden">
             <div className="flex items-center gap-5 mb-10">
               <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-ferrari shadow-inner border border-gray-100">
                 <i className="fas fa-user-tag text-2xl"></i>
               </div>
               <h3 className={`text-xl font-heading ${textClass}`}>Identificação</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                 <label className={`text-[10px] tracking-widest pl-4 flex items-center gap-2 ${textClass}`}>Nome Completo</label>
                 <input 
                  type="text" 
                  value={customer.name} 
                  onChange={e => setCustomer({...customer, name: e.target.value})}
                  required
                  placeholder="DIGITE SEU NOME"
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-5 font-black text-black uppercase focus:border-ferrari outline-none transition-all shadow-inner" 
                 />
               </div>
               <div className="space-y-3">
                 <label className={`text-[10px] tracking-widest pl-4 flex items-center gap-2 ${textClass}`}>WhatsApp</label>
                 <input 
                  type="tel" 
                  value={customer.phone} 
                  onChange={e => setCustomer({...customer, phone: e.target.value})}
                  required
                  placeholder="(00) 00000-0000"
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-5 font-black text-black focus:border-ferrari outline-none transition-all shadow-inner" 
                 />
               </div>
             </div>
           </div>

           {/* Card: Entrega com Busca por CEP */}
           <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
             <div className="flex items-center gap-5 mb-10">
               <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-ferrari shadow-inner border border-gray-100">
                 <i className="fas fa-route text-2xl"></i>
               </div>
               <h3 className={`text-xl font-heading ${textClass}`}>Onde Entregamos?</h3>
             </div>
             
             <div className="grid grid-cols-2 gap-6 mb-8">
               <button 
                type="button"
                onClick={() => setCustomer({...customer, deliveryType: 'delivery'})}
                className={`p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 ${customer.deliveryType === 'delivery' ? 'border-ferrari bg-ferrari/5 shadow-lg scale-105' : 'border-gray-50 grayscale opacity-30'}`}
               >
                 <i className="fas fa-motorcycle text-4xl text-ferrari"></i>
                 <span className={textClass}>Delivery</span>
               </button>
               <button 
                type="button"
                onClick={() => setCustomer({...customer, deliveryType: 'pickup'})}
                className={`p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 ${customer.deliveryType === 'pickup' ? 'border-ferrari bg-ferrari/5 shadow-lg scale-105' : 'border-gray-50 grayscale opacity-30'}`}
               >
                 <i className="fas fa-shop-lock text-4xl text-ferrari"></i>
                 <span className={textClass}>Retirada</span>
               </button>
             </div>

             {customer.deliveryType === 'delivery' && (
               <div className="space-y-6 animate-fade-in-up">
                 <div className="space-y-3">
                    <label className={`text-[10px] tracking-widest pl-4 flex items-center gap-2 ${textClass}`}>Buscar CEP</label>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={cep} 
                        onChange={e => setCep(e.target.value)}
                        placeholder="00000-000"
                        maxLength={9}
                        className="flex-grow bg-slate-50 border-2 border-transparent rounded-2xl p-5 font-black text-black focus:border-ferrari outline-none transition-all shadow-inner" 
                      />
                      <button 
                        type="button"
                        onClick={handleCepSearch}
                        disabled={isSearchingCep}
                        className="bg-onyx text-white px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-ferrari transition-all flex items-center justify-center gap-2"
                      >
                        {isSearchingCep ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-search"></i>}
                        Buscar
                      </button>
                    </div>
                 </div>

                 {cepFound ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
                     <div className="md:col-span-2 p-5 bg-slate-50 rounded-2xl border border-gray-100">
                        <p className={`text-[10px] mb-1 ${textClass} text-gray-400`}>Endereço Identificado</p>
                        <p className="font-black text-black uppercase">{customer.address}</p>
                     </div>
                     <div className="space-y-3">
                       <label className={`text-[10px] tracking-widest pl-4 ${textClass}`}>Número</label>
                       <input 
                        type="text" 
                        value={customer.houseNumber} 
                        onChange={e => setCustomer({...customer, houseNumber: e.target.value})}
                        required
                        placeholder="Nº"
                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-5 font-black text-black uppercase focus:border-ferrari outline-none transition-all shadow-inner" 
                       />
                     </div>
                     <div className="space-y-3">
                       <label className={`text-[10px] tracking-widest pl-4 ${textClass}`}>Complemento</label>
                       <input 
                        type="text" 
                        value={customer.complement} 
                        onChange={e => setCustomer({...customer, complement: e.target.value})}
                        placeholder="APT, BLOCO, ETC"
                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-5 font-black text-black uppercase focus:border-ferrari outline-none transition-all shadow-inner" 
                       />
                     </div>
                   </div>
                 ) : (
                   <div className="space-y-3">
                     <label className={`text-[10px] tracking-widest pl-4 ${textClass}`}>Endereço Manual</label>
                     <textarea 
                      value={customer.address} 
                      onChange={e => setCustomer({...customer, address: e.target.value})}
                      required={customer.deliveryType === 'delivery'}
                      placeholder="DIGITE O ENDEREÇO COMPLETO COM NÚMERO..."
                      rows={3}
                      className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-6 font-black text-black uppercase focus:border-ferrari outline-none transition-all shadow-inner resize-none" 
                     />
                   </div>
                 )}
               </div>
             )}
           </div>

           {/* Card: Pagamento - Aumentado conforme solicitado */}
           <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
             <div className="flex items-center gap-5 mb-10">
               <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-ferrari shadow-inner border border-gray-100">
                 <i className="fas fa-credit-card text-2xl"></i>
               </div>
               <h3 className={`text-xl font-heading ${textClass}`}>Forma de Pagamento</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { id: PaymentMethod.PIX, label: 'PIX', icon: 'fa-brands fa-pix' },
                  { id: PaymentMethod.CARD, label: 'Cartão', icon: 'fa-solid fa-credit-card' },
                  { id: PaymentMethod.CASH, label: 'Dinheiro', icon: 'fa-solid fa-money-bill-1' }
                ].map(p => (
                  <button 
                    key={p.id}
                    type="button"
                    onClick={() => setPaymentMethod(p.id)}
                    className={`flex flex-col items-center justify-center gap-5 p-12 rounded-[2.5rem] border-4 transition-all ${paymentMethod === p.id ? 'border-ferrari bg-ferrari/5 shadow-2xl scale-105' : 'border-slate-50 grayscale opacity-40 hover:grayscale-0 hover:opacity-100'}`}
                  >
                    <i className={`${p.icon} text-5xl ${paymentMethod === p.id ? 'text-ferrari' : 'text-gray-400'}`}></i>
                    <span className={`${textClass} text-xl lg:text-2xl`}>{p.label}</span>
                  </button>
                ))}
             </div>

             {paymentMethod === PaymentMethod.PIX && (
               <div className="space-y-6 animate-fade-in-up p-8 bg-slate-50 rounded-[2rem] border border-gray-100">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-white p-2 rounded-2xl shadow-md border border-gray-100">
                      <img src="https://gerarqrcodepix.com.br/api/v1?nome=Barao%20do%20Espetinho&cidade=Sao%20Paulo&chave=CONTATO@BARAODOESPETINHO.COM&valor=&saida=qr" alt="PIX" className="w-full h-full" />
                    </div>
                    <div>
                      <p className={`text-[10px] mb-1 ${textClass} text-ferrari`}>Pague agora</p>
                      <p className={textClass + " text-sm"}>CNPJ: 12.345.678/0001-90</p>
                    </div>
                  </div>
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <label className={`text-[10px] pl-4 ${textClass}`}>Nome do Pagador</label>
                    <input 
                      type="text" 
                      value={payerName} 
                      onChange={e => setPayerName(e.target.value)}
                      placeholder="NOME DO COMPROVANTE"
                      className="w-full bg-white border-none rounded-2xl p-5 font-black text-black uppercase focus:ring-4 focus:ring-ferrari/10 outline-none" 
                    />
                  </div>
               </div>
             )}

             {paymentMethod === PaymentMethod.CASH && (
                <div className="space-y-3 animate-fade-in-up">
                  <label className={`text-[10px] pl-4 ${textClass}`}>Troco para quanto?</label>
                  <input 
                    type="number" 
                    value={changeFor} 
                    onChange={e => setChangeFor(e.target.value)}
                    placeholder="EX: 100"
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-5 font-black text-black uppercase focus:border-ferrari outline-none transition-all shadow-inner" 
                  />
                </div>
             )}
           </div>
         </div>

         {/* Painel Lateral */}
         <div className="lg:col-span-2">
            <div className="bg-white rounded-[3rem] p-10 text-black sticky top-24 shadow-2xl border border-gray-100 overflow-hidden fade-in-up">
              <h3 className={`text-xl mb-8 flex items-center gap-3 ${textClass}`}>
                <i className="fas fa-receipt text-ferrari"></i> Fechamento
              </h3>
              
              <div className="max-h-60 overflow-y-auto mb-10 pr-2 space-y-5 no-scrollbar border-b border-gray-100 pb-8">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-start text-sm group">
                    <div className="flex flex-col">
                      <span className={`font-black ${textClass.replace('text-[10px]', 'text-xs')}`}>{item.name}</span>
                      <span className={`text-[10px] font-bold text-gray-400 ${textClass.replace('text-black', '')}`}>{item.quantity}x • R$ {item.price.toFixed(2)}</span>
                    </div>
                    <span className={textClass}>R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-5 mb-10">
                <div className="flex justify-between items-center">
                  <span className={`text-xs ${textClass}`}>Produtos</span>
                  <span className={textClass}>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs ${textClass}`}>Taxa Logística</span>
                  <span className={textClass}>R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="pt-6 border-t-2 border-onyx flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className={`text-[10px] mb-1 ${textClass} text-ferrari`}>TOTAL</span>
                    <span className={`text-4xl font-black ${textClass.replace('text-black', '')}`}>R$ {total.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-black text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs hover:bg-ferrari transition-all shadow-xl shadow-black/30 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-4 group"
              >
                Concluir Pedido
                <i className="fas fa-fire-flame-simple group-hover:scale-125 transition-transform"></i>
              </button>
            </div>
         </div>
       </form>
    </div>
  );
};

export default Checkout;
