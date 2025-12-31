
import React, { useState } from 'react';
import { CartItem, Order, Customer, PaymentMethod, OrderStatus } from '../types';

interface CheckoutProps {
  items: CartItem[];
  subtotal: number;
  onSubmit: (order: Order) => void;
  onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ items, subtotal, onSubmit, onBack }) => {
  const [customer, setCustomer] = useState<Customer>({
    name: '',
    phone: '',
    address: '',
    deliveryType: 'delivery'
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.PIX);
  const [payerName, setPayerName] = useState('');
  const [changeFor, setChangeFor] = useState<string>('');

  const deliveryFee = customer.deliveryType === 'delivery' ? 5.0 : 0;
  const total = subtotal + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name || !customer.phone || (customer.deliveryType === 'delivery' && !customer.address)) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const order: Order = {
      id: Math.floor(Math.random() * 90000 + 10000).toString(),
      date: new Date().toISOString(),
      customer,
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

  const textClass = "text-onyx text-shadow-gray font-black uppercase";

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
       <button onClick={onBack} className="flex items-center gap-3 text-onyx font-black uppercase text-[10px] tracking-[0.3em] mb-10 hover:text-ferrari interactive-element group text-shadow-gray">
         <i className="fas fa-chevron-left transform group-hover:-translate-x-2 transition-transform"></i>
         Voltar ao Carrinho
       </button>

       <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-12">
         <div className="lg:col-span-3 space-y-10 fade-in-up">
           {/* Section 1: Customer Info */}
           <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
               <i className="fas fa-circle-user text-8xl"></i>
             </div>
             <div className="flex items-center gap-5 mb-10">
               <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-ferrari shadow-inner border border-gray-100">
                 <i className="fas fa-user-tie text-xl"></i>
               </div>
               <h3 className={`text-xl tracking-tight font-heading ${textClass}`}>Identificação</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                 <label className={`text-[10px] tracking-widest pl-4 flex items-center gap-2 ${textClass}`}>
                   <i className="fas fa-address-card text-ferrari"></i> Nome Completo
                 </label>
                 <input 
                  type="text" 
                  value={customer.name} 
                  onChange={e => setCustomer({...customer, name: e.target.value})}
                  required
                  placeholder="Seu nome"
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-5 font-bold text-onyx focus:ring-4 focus:ring-ferrari/5 transition-all outline-none form-input-premium shadow-inner" 
                 />
               </div>
               <div className="space-y-3">
                 <label className={`text-[10px] tracking-widest pl-4 flex items-center gap-2 ${textClass}`}>
                   <i className="fab fa-whatsapp text-green-500"></i> WhatsApp
                 </label>
                 <input 
                  type="tel" 
                  value={customer.phone} 
                  onChange={e => setCustomer({...customer, phone: e.target.value})}
                  required
                  placeholder="(00) 00000-0000"
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-5 font-bold text-onyx focus:ring-4 focus:ring-ferrari/5 transition-all outline-none form-input-premium shadow-inner" 
                 />
               </div>
             </div>
           </div>

           {/* Section 2: Delivery Method */}
           <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
             <div className="flex items-center gap-5 mb-10">
               <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-ferrari shadow-inner border border-gray-100">
                 <i className="fas fa-map-location-dot text-xl"></i>
               </div>
               <h3 className={`text-xl tracking-tight font-heading ${textClass}`}>Como Prefere?</h3>
             </div>
             
             <div className="grid grid-cols-2 gap-6 mb-8">
               <button 
                type="button"
                onClick={() => setCustomer({...customer, deliveryType: 'delivery'})}
                className={`p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${customer.deliveryType === 'delivery' ? 'border-ferrari bg-ferrari/5 shadow-lg shadow-ferrari/10 scale-105' : 'border-gray-50 bg-gray-50/50 hover:bg-gray-100 grayscale opacity-60'}`}
               >
                 <i className="fas fa-truck-fast text-4xl text-ferrari"></i>
                 <span className={textClass}>Entrega</span>
               </button>
               <button 
                type="button"
                onClick={() => setCustomer({...customer, deliveryType: 'pickup'})}
                className={`p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${customer.deliveryType === 'pickup' ? 'border-ferrari bg-ferrari/5 shadow-lg shadow-ferrari/10 scale-105' : 'border-gray-50 bg-gray-50/50 hover:bg-gray-100 grayscale opacity-60'}`}
               >
                 <i className="fas fa-shop text-4xl text-ferrari"></i>
                 <span className={textClass}>Retirada</span>
               </button>
             </div>

             {customer.deliveryType === 'delivery' && (
               <div className="space-y-3 animate-fade-in-up">
                 <label className={`text-[10px] tracking-widest pl-4 flex items-center gap-2 ${textClass}`}>
                   <i className="fas fa-house-chimney text-ferrari"></i> Endereço para Entrega
                 </label>
                 <textarea 
                  value={customer.address} 
                  onChange={e => setCustomer({...customer, address: e.target.value})}
                  required={customer.deliveryType === 'delivery'}
                  placeholder="Rua, Número, Bairro, Referência..."
                  rows={3}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-6 font-bold text-onyx focus:ring-4 focus:ring-ferrari/5 transition-all outline-none resize-none form-input-premium shadow-inner" 
                 />
               </div>
             )}
           </div>

           {/* Section 3: Payment */}
           <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
             <div className="flex items-center gap-5 mb-10">
               <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-ferrari shadow-inner border border-gray-100">
                 <i className="fas fa-sack-dollar text-xl"></i>
               </div>
               <h3 className={`text-xl tracking-tight font-heading ${textClass}`}>Pagamento</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {[
                  { id: PaymentMethod.PIX, label: 'PIX', icon: 'fa-pix' },
                  { id: PaymentMethod.CARD, label: 'Cartão', icon: 'fa-credit-card' },
                  { id: PaymentMethod.CASH, label: 'Dinheiro', icon: 'fa-hand-holding-dollar' }
                ].map(p => (
                  <button 
                    key={p.id}
                    type="button"
                    onClick={() => setPaymentMethod(p.id)}
                    className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all ${paymentMethod === p.id ? 'border-ferrari bg-ferrari/5 shadow-md shadow-ferrari/10 scale-105' : 'border-gray-50 hover:bg-gray-50'}`}
                  >
                    <i className={`fas ${p.icon} text-xl ${paymentMethod === p.id ? 'text-ferrari' : 'text-gray-300'}`}></i>
                    <span className={`${textClass} text-[10px] tracking-widest`}>{p.label}</span>
                  </button>
                ))}
             </div>

             {paymentMethod === PaymentMethod.PIX && (
               <div className="space-y-6 animate-fade-in-up p-8 glass-panel rounded-[2rem] border border-ferrari/10">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-white p-3 rounded-2xl shadow-xl border border-gray-100 shrink-0">
                      <img src="https://gerarqrcodepix.com.br/api/v1?nome=Barao%20do%20Espetinho&cidade=Sao%20Paulo&chave=CONTATO@BARAODOESPETINHO.COM&valor=&saida=qr" alt="PIX QR" className="w-full h-full" />
                    </div>
                    <div>
                      <p className={`text-[10px] tracking-[0.2em] mb-1 ${textClass} text-ferrari`}>Aprovação Imediata</p>
                      <p className={textClass + " text-sm tracking-tighter"}>Chave: 12.345.678/0001-90</p>
                      <button type="button" className={`text-[9px] mt-2 underline ${textClass}`}>Copiar Chave Pix</button>
                    </div>
                  </div>
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <label className={`text-[10px] tracking-widest pl-4 ${textClass}`}>Identificação do Pagamento</label>
                    <input 
                      type="text" 
                      value={payerName} 
                      onChange={e => setPayerName(e.target.value)}
                      placeholder="Nome de quem enviou o Pix"
                      className="w-full bg-white border-none rounded-2xl p-5 font-bold text-onyx focus:ring-4 focus:ring-ferrari/10 outline-none shadow-sm" 
                    />
                  </div>
               </div>
             )}

             {paymentMethod === PaymentMethod.CASH && (
                <div className="space-y-3 animate-fade-in-up">
                  <label className={`text-[10px] tracking-widest pl-4 ${textClass}`}>Troco para quanto?</label>
                  <div className="relative">
                    <i className="fas fa-coins absolute left-6 top-1/2 -translate-y-1/2 text-ferrari"></i>
                    <input 
                      type="number" 
                      value={changeFor} 
                      onChange={e => setChangeFor(e.target.value)}
                      placeholder="Ex: 100"
                      className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-5 pl-14 font-bold text-onyx focus:ring-4 focus:ring-ferrari/5 outline-none form-input-premium shadow-inner" 
                    />
                  </div>
                </div>
             )}
           </div>
         </div>

         {/* Summary Panel Modernized to light theme for black text */}
         <div className="lg:col-span-2">
            <div className="bg-white rounded-[3rem] p-10 text-onyx sticky top-24 shadow-2xl border border-gray-100 overflow-hidden fade-in-up" style={{animationDelay: '0.3s'}}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-ferrari opacity-5 rounded-full blur-3xl -mr-16 -mt-16"></div>
              
              <h3 className={`text-xl tracking-[0.2em] mb-8 flex items-center gap-3 ${textClass}`}>
                <i className="fas fa-file-invoice-dollar text-ferrari"></i> Resumo Final
              </h3>
              
              <div className="max-h-60 overflow-y-auto mb-10 pr-2 space-y-5 no-scrollbar border-b border-gray-100 pb-8">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-start text-sm group">
                    <div className="flex flex-col">
                      <span className={`font-black group-hover:text-ferrari transition-colors ${textClass.replace('text-[10px]', 'text-xs')}`}>{item.name}</span>
                      <span className={`text-[10px] ${textClass}`}>{item.quantity}x • R$ {item.price.toFixed(2)}</span>
                    </div>
                    <span className={textClass}>R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-5 mb-10">
                <div className="flex justify-between items-center">
                  <span className={`text-xs ${textClass}`}>Subtotal</span>
                  <span className={textClass}>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs ${textClass}`}>Entrega Premium</span>
                  <span className={textClass}>R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="pt-6 border-t border-gray-100 flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className={`text-[10px] tracking-[0.4em] mb-1 ${textClass} text-ferrari`}>TOTAL DO PEDIDO</span>
                    <span className={`text-4xl font-black tracking-tighter ${textClass.replace('text-onyx', '')}`}>R$ {total.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-onyx text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs hover:bg-ferrari transition-all shadow-xl shadow-onyx/20 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-4 group"
              >
                Confirmar & Preparar
                <i className="fas fa-check-double group-hover:scale-125 transition-transform"></i>
              </button>
              
              <div className="mt-8 p-5 bg-slate-50 rounded-2xl flex items-center gap-4 border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-lg shadow-inner">
                  <i className="fas fa-shield-halved"></i>
                </div>
                <p className={`text-[9px] leading-relaxed ${textClass}`}>
                  Pedido Seguro. O Barão garante a melhor brasa e entrega premium para você.
                </p>
              </div>
            </div>
         </div>
       </form>
    </div>
  );
};

export default Checkout;
