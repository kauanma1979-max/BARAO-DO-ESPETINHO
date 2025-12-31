
import React from 'react';
import { CartItem } from '../types';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  subtotal: number;
}

const Cart: React.FC<CartProps> = ({ items, onUpdateQuantity, onRemove, onCheckout, subtotal }) => {
  const deliveryFee = subtotal > 0 ? 5.00 : 0;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
        </div>
        <h2 className="text-3xl font-black font-heading text-onyx mb-2 uppercase italic tracking-tighter">Seu braseiro está vazio</h2>
        <p className="text-gray-400 max-w-sm font-medium">Você ainda não adicionou nenhum espetinho premium ao seu pedido.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-3xl font-black font-heading text-onyx uppercase mb-8 border-l-8 border-ferrari pl-4 tracking-tighter">Meu Pedido</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-3xl p-4 flex gap-4 items-center shadow-sm border border-gray-100 hover:border-ferrari/20 transition-all group">
              <img src={item.image} alt={item.name} className="w-20 h-20 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
              <div className="flex-grow">
                <h4 className="font-black text-onyx text-lg leading-none mb-1">{item.name}</h4>
                <p className="text-ferrari font-bold text-sm">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                <button onClick={() => onRemove(item.id)} className="text-gray-300 hover:text-red-500 text-xs font-black uppercase mt-2 transition-colors">Remover</button>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-1 border border-gray-100">
                <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white text-onyx shadow-sm hover:text-ferrari transition-all">-</button>
                <span className="font-black text-onyx min-w-[20px] text-center">{item.quantity}</span>
                <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white text-onyx shadow-sm hover:text-ferrari transition-all">+</button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-onyx rounded-[2rem] p-8 text-white h-fit sticky top-24 shadow-2xl shadow-onyx/30">
          <h3 className="text-xl font-black uppercase tracking-widest mb-6 text-ferrari border-b border-white/10 pb-4">Resumo</h3>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">Subtotal</span>
              <span className="font-black">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">Taxa de Entrega</span>
              <span className="font-black">R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-between items-end">
              <span className="text-white font-black uppercase text-sm tracking-[0.2em]">Total</span>
              <span className="text-3xl font-black text-ferrari">R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
          
          <button 
            onClick={onCheckout}
            className="w-full bg-ferrari text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-ferrari-light transition-all shadow-lg shadow-ferrari/20 hover:shadow-ferrari/40 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
          >
            Finalizar Pedido
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
