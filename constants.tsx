
import React from 'react';
import { Product, Category } from './types';

export const FERRARI_RED = '#FF2800';
export const ONYX_BLACK = '#1A1A1A';

export const INITIAL_PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: "ESP. BOI", 
    category: Category.TRADITIONAL, 
    cost: 42.09, 
    price: 51.90, 
    description: "Espetinho de carne bovina premium selecionada.", 
    stock: 20, 
    image: "https://images.unsplash.com/photo-1628268909376-e8c44bb3153f?auto=format&fit=crop&w=400&h=300&q=80" 
  },
  { 
    id: '2', 
    name: "ESP. FRANGO", 
    category: Category.TRADITIONAL, 
    cost: 34.71, 
    price: 42.90, 
    description: "Peito de frango temperado em cubos suculentos.", 
    stock: 20, 
    image: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?auto=format&fit=crop&w=400&h=300&q=80" 
  },
  { 
    id: '3', 
    name: "ESP. LING. SUINA", 
    category: Category.TRADITIONAL, 
    cost: 37.87, 
    price: 46.90, 
    description: "Linguiça suína tradicional de alta qualidade.", 
    stock: 20, 
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&h=300&q=80" 
  },
  { 
    id: '4', 
    name: "ESP. LING. FRANGO", 
    category: Category.TRADITIONAL, 
    cost: 37.87, 
    price: 46.90, 
    description: "Linguiça de frango leve e bem temperada.", 
    stock: 20, 
    image: "https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?auto=format&fit=crop&w=400&h=300&q=80" 
  },
  { 
    id: '5', 
    name: "ESP. KAFTA", 
    category: Category.TRADITIONAL, 
    cost: 37.87, 
    price: 46.90, 
    description: "Carne moída temperada com especiarias árabes.", 
    stock: 20, 
    image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=400&h=300&q=80" 
  },
  { 
    id: '6', 
    name: "ESP. KAFTA C/QUEIJO", 
    category: Category.TRADITIONAL, 
    cost: 39.98, 
    price: 49.90, 
    description: "Kafta bovina recheada com queijo derretido.", 
    stock: 20, 
    image: "https://images.unsplash.com/photo-1594968973184-9140fa307f7f?auto=format&fit=crop&w=400&h=300&q=80" 
  },
  { 
    id: '7', 
    name: "ESP. PERNIL SUINO", 
    category: Category.TRADITIONAL, 
    cost: 32.60, 
    price: 40.90, 
    description: "Pernil suíno marinado em ervas finas.", 
    stock: 20, 
    image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=400&h=300&q=80" 
  },
  { 
    id: '8', 
    name: "ESP. CORAÇÃO", 
    category: Category.SPECIAL, 
    cost: 44.20, 
    price: 54.90, 
    description: "Coração de frango temperado no ponto perfeito.", 
    stock: 20, 
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&h=300&q=80" 
  },
  { 
    id: '9', 
    name: "ESP. BANANINHA", 
    category: Category.SPECIAL, 
    cost: 48.42, 
    price: 59.90, 
    description: "Corte entre-costela bovina, extremamente suculento.", 
    stock: 20, 
    image: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=400&h=300&q=80" 
  },
  { 
    id: '17', 
    name: "FAROFA DO BARÃO", 
    category: Category.SIDE, 
    cost: 12.50, 
    price: 19.90, 
    description: "A autêntica farofa crocante com bacon e temperos secretos.", 
    stock: 50, 
    image: "https://images.unsplash.com/photo-1599307734111-d922a96993a4?auto=format&fit=crop&w=400&h=300&q=80" 
  },
  { 
    id: '18', 
    name: "CARVÃO DO BARÃO", 
    category: Category.SIDE, 
    cost: 18.00, 
    price: 29.90, 
    description: "Carvão premium de acácia negra. Mais calor e durabilidade para seu churrasco.", 
    stock: 30, 
    image: "https://images.unsplash.com/photo-1533630713315-99df856be306?auto=format&fit=crop&w=400&h=300&q=80" 
  },
  { 
    id: '19', 
    name: "DICAS DO BARÃO", 
    category: Category.SPECIAL, 
    cost: 0, 
    price: 0, 
    description: "Aprenda os segredos do mestre: ponto da carne, preparo da brasa e muito mais.", 
    stock: 999, 
    image: "https://images.unsplash.com/photo-1529193591184-b1d58fab356c?auto=format&fit=crop&w=400&h=300&q=80" 
  },
  { 
    id: '10', 
    name: "ESP. FRALDINHA", 
    category: Category.SPECIAL, 
    cost: 49.48, 
    price: 60.90, 
    description: "Fraldinha premium com gordura equilibrada.", 
    stock: 20, 
    image: "https://images.unsplash.com/photo-1546241072-48010ad28c2c?auto=format&fit=crop&w=400&h=300&q=80" 
  }
];

export const CATEGORY_LABELS = {
  [Category.TRADITIONAL]: 'Tradicionais',
  [Category.SPECIAL]: 'Especiais',
  [Category.DRINK]: 'Bebidas',
  [Category.SIDE]: 'Farofa do Barão'
};
