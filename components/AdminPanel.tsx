import React, { useState, useMemo, useRef } from 'react';
import { Product, Order, OrderStatus, Category } from '../types';
import { CATEGORY_LABELS } from '../constants';
import { supabase } from '../supabaseClient';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  logo: string;
  setLogo: (url: string) => void;
  onLogout: () => void;
}

const resizeImage = (base64Str: string, maxWidth = 400, maxHeight = 400): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > height) { if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; } }
      else { if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; } }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => resolve(base64Str);
  });
};

const AdminPanel: React.FC<AdminPanelProps> = ({ products, orders, setProducts, setOrders, logo, setLogo, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'inventory' | 'store'>('dashboard');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    category: Category.TRADITIONAL,
    name: '',
    stock: 0,
    cost: 0,
    price: 0,
    description: '',
    image: 'https://picsum.photos/seed/espeto/400/300'
  });

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Mapeia para os nomes das colunas que estão no seu Supabase (Português)
    const dbData = {
      nome: newProduct.name,
      categoria: newProduct.category,
      preco: newProduct.price,
      custo: newProduct.cost,
      descricao: newProduct.description || '',
      estoque: newProduct.stock,
      imagem: newProduct.image
    };

    try {
      if (editingProductId) {
        // Atualizar produto existente
        const { error } = await supabase
          .from('produtos')
          .update(dbData)
          .eq('id', editingProductId);
        
        if (error) throw error;
        setProducts(prev => prev.map(p => p.id === editingProductId ? { ...p, ...newProduct as Product } : p));
      } else {
        // Inserir novo produto
        const { data, error } = await supabase
          .from('produtos')
          .insert([dbData])
          .select();
        
        if (error) throw error;
        if (data) {
          const inserted = data[0];
          setProducts(prev => [...prev, {
            ...newProduct as Product,
            id: inserted.id // Usa o ID gerado pelo Supabase
          }]);
        }
      }
      closeModal();
    } catch (err: any) {
      alert("Erro ao salvar no Supabase: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProductId(product.id);
    setNewProduct(product);
    setIsProductModalOpen(true);
  };

  const closeModal = () => {
    setIsProductModalOpen(false);
    setEditingProductId(null);
    setNewProduct({ category: Category.TRADITIONAL, name: '', stock: 0, cost: 0, price: 0, description: '', image: 'https://picsum.photos/seed/espeto/400/300' });
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await supabase.from('pedidos').update({ status }).eq('id', orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (err) {
      console.error("Erro status pedido:", err);
    }
  };

  const stats = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== OrderStatus.CANCELLED);
    const revenue = validOrders.reduce((acc, o) => acc + o.total, 0);
    return { revenue, totalOrders: orders.length };
  }, [orders]);

  // Fix: Explicitly typing the accumulator as Record<string, Product[]> to avoid 'unknown' issues during Object.entries mapping
  const groupedProducts = useMemo(() => {
    return products.reduce((acc: Record<string, Product[]>, product) => {
      const cat = product.category as string;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [products]);

  const textClass = "text-black text-shadow-gray font-black uppercase tracking-tighter";

  return (
    <div className="py-8 animate-fade-in px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-8">
          <div className="w-24 h-24 bg-ferrari rounded-[2rem] flex items-center justify-center text-white shadow-2xl">
             <i className="fas fa-sliders-h text-4xl"></i>
          </div>
          <div>
            <h2 className="text-5xl font-black font-heading text-onyx uppercase tracking-tighter italic">Gestão <span className="text-ferrari">Barão</span></h2>
          </div>
        </div>
        <button onClick={onLogout} className="px-8 py-5 bg-onyx text-white rounded-2xl font-black uppercase text-xs">SAIR</button>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar mb-12">
        {['dashboard', 'orders', 'inventory', 'store'].map(id => (
          <button key={id} onClick={() => setActiveTab(id as any)} className={`px-10 py-7 rounded-[2rem] font-black uppercase transition-all border-2 ${activeTab === id ? 'bg-onyx text-white' : 'bg-white text-gray-400'}`}>
            {id}
          </button>
        ))}
      </div>

      {activeTab === 'inventory' && (
        <div className="space-y-12 animate-fade-in-up">
          <div className="flex justify-between items-center bg-white p-12 rounded-[3.5rem] shadow-sm border border-gray-100">
            <h3 className="text-4xl font-black uppercase text-onyx">Estoque Cloud</h3>
            <button onClick={() => { setEditingProductId(null); setIsProductModalOpen(true); }} className="bg-ferrari text-white px-12 py-7 rounded-[2rem] font-black uppercase shadow-xl hover:scale-105 transition-all">NOVO ITEM</button>
          </div>

          {/* Fix: Casting Object.entries result to ensure productsInCategory is not inferred as unknown */}
          {(Object.entries(groupedProducts) as [string, Product[]][]).map(([category, productsInCategory]) => (
            <div key={category} className="space-y-6">
              <h4 className="text-3xl font-black text-onyx uppercase pl-8">{CATEGORY_LABELS[category as Category]}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {productsInCategory.map(product => (
                  <div key={product.id} className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex items-center gap-8 relative">
                    <img src={product.image} className="w-24 h-24 rounded-3xl object-cover" />
                    <div>
                      <h4 className="font-black text-onyx uppercase text-xl">{product.name}</h4>
                      <p className="text-ferrari font-black">Estoque: {product.stock}</p>
                    </div>
                    <button onClick={() => openEditModal(product)} className="absolute top-4 right-4 w-10 h-10 bg-onyx text-white rounded-xl flex items-center justify-center"><i className="fas fa-edit"></i></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white rounded-[4rem] p-8 shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-4 font-black">PEDIDO</th>
                <th className="p-4 font-black">CLIENTE</th>
                <th className="p-4 font-black">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice().reverse().map(order => (
                <tr key={order.id} className="border-b hover:bg-slate-50">
                  <td className="p-4 font-black text-ferrari">#{order.id}</td>
                  <td className="p-4 font-black">{order.customer.name}</td>
                  <td className="p-4">
                    <select value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)} className="p-2 bg-slate-100 rounded-lg font-black uppercase text-xs">
                      <option value={OrderStatus.PENDING}>PENDENTE</option>
                      <option value={OrderStatus.PREPARING}>PREPARANDO</option>
                      <option value={OrderStatus.SHIPPED}>ENVIADO</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isProductModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white w-full max-w-4xl rounded-[4rem] p-12 shadow-2xl">
            <form onSubmit={handleSaveProduct} className="space-y-10">
              <div className="flex justify-between items-center">
                <h3 className={`text-4xl ${textClass}`}>{editingProductId ? 'Editar Item' : 'Novo Item'}</h3>
                <button type="button" onClick={closeModal}><i className="fas fa-times text-4xl text-gray-300"></i></button>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <input type="text" placeholder="NOME DO PRODUTO" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="bg-slate-50 rounded-2xl p-6 font-black uppercase outline-none" />
                <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value as Category})} className="bg-slate-50 rounded-2xl p-6 font-black uppercase outline-none">
                  {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <input type="number" placeholder="PREÇO" step="0.01" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} className="bg-slate-50 rounded-2xl p-6 font-black outline-none" />
                <input type="number" placeholder="ESTOQUE" required value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} className="bg-slate-50 rounded-2xl p-6 font-black outline-none" />
              </div>

              <button type="submit" disabled={isSaving} className="w-full bg-onyx text-white py-8 rounded-[2.5rem] font-black uppercase text-sm hover:bg-ferrari transition-all flex items-center justify-center gap-4">
                {isSaving ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-cloud-upload-alt"></i>}
                {editingProductId ? 'SALVAR ALTERAÇÕES NA NUVEM' : 'CRIAR PRODUTO NO SUPABASE'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;