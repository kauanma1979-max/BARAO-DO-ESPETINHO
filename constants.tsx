
import React from 'react';
import { Product, Category } from './types';

export const FERRARI_RED = '#FF2800';
export const ONYX_BLACK = '#1A1A1A';

export const INITIAL_PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: "Espetinho de Alcatra", 
    category: Category.TRADITIONAL, 
    price: 6.50, 
    cost: 4.00, 
    description: "Corte nobre de alcatra selecionada, temperada com sal grosso marinho.", 
    stock: 100, 
    image: "https://picsum.photos/seed/alcatra/400/300" 
  },
  { 
    id: '2', 
    name: "Espetinho de Fraldinha", 
    category: Category.TRADITIONAL, 
    price: 5.80, 
    cost: 3.50, 
    description: "Fraldinha suculenta com manteiga de garrafa e alho.", 
    stock: 80, 
    image: "https://picsum.photos/seed/fraldinha/400/300" 
  },
  { 
    id: '3', 
    name: "Picanha Premium", 
    category: Category.SPECIAL, 
    price: 12.50, 
    cost: 7.00, 
    description: "O rei do churrasco. Picanha com capa de gordura perfeita.", 
    stock: 45, 
    image: "https://picsum.photos/seed/picanha/400/300" 
  },
  { 
    id: '4', 
    name: "Queijo Coalho com Mel", 
    category: Category.SPECIAL, 
    price: 8.00, 
    cost: 3.00, 
    description: "Queijo coalho tostado na brasa, finalizado com mel orgânico.", 
    stock: 60, 
    image: "https://picsum.photos/seed/queijo/400/300" 
  },
  { 
    id: '5', 
    name: "Cerveja Heineken 600ml", 
    category: Category.DRINK, 
    price: 15.00, 
    cost: 10.00, 
    description: "Cerveja premium gelada.", 
    stock: 120, 
    image: "https://picsum.photos/seed/beer/400/300" 
  },
];

export const CATEGORY_LABELS = {
  [Category.TRADITIONAL]: 'Tradicionais',
  [Category.SPECIAL]: 'Especiais',
  [Category.DRINK]: 'Bebidas',
  [Category.SIDE]: 'Acompanhamentos'
};
