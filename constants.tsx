
import React from 'react';
import { Product, Category, Article } from './types';

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
    category: Category.COAL, 
    cost: 18.00, 
    price: 29.90, 
    description: "Carvão premium de acácia negra. Mais calor e durabilidade.", 
    stock: 30, 
    image: "https://images.unsplash.com/photo-1533630713315-99df856be306?auto=format&fit=crop&w=400&h=300&q=80" 
  }
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: "Como preparar o churrasco perfeito: Guia do Barão",
    excerpt: "Descubra os segredos para assar espetinhos suculentos e impressionar seus convidados com técnicas profissionais de brasa.",
    content: "Assar o churrasco perfeito exige mais do que apenas carne de qualidade; requer paciência, técnica e o domínio do fogo. Primeiro, comece pela brasa. O carvão de acácia negra, como o do Barão, é ideal por manter o calor constante por mais tempo. Evite as labaredas! O ponto ideal é o 'braseiro branco', quando o carvão está coberto por uma fina camada de cinzas.\n\nPara os espetinhos, o segredo está na altura. Mantenha os espetos a cerca de 15cm da brasa para selar a carne rapidamente, preservando o suco interno. Não vire a carne o tempo todo; deixe dourar bem de um lado antes de alternar. E lembre-se: o sal grosso deve ser usado com moderação em cortes menores para não ressecar.",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
    date: new Date().toISOString(),
    author: "Mestre Barão",
    tags: ["Dicas", "Técnica", "Brasa"]
  }
];

export const CATEGORY_LABELS = {
  [Category.TRADITIONAL]: 'Tradicionais',
  [Category.SPECIAL]: 'Especiais',
  [Category.DRINK]: 'Bebidas',
  [Category.SIDE]: 'Farofa do Barão',
  [Category.COAL]: 'Carvão do Barão',
  [Category.TIPS]: 'Dicas do Barão'
};
