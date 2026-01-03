
export enum Category {
  TRADITIONAL = 'tradicional',
  SPECIAL = 'especial',
  DRINK = 'bebida',
  SIDE = 'acompanhamento'
}

// Fix: Adding PENDING and AWAITING_PAYMENT to OrderStatus enum as they are referenced in Checkout.tsx
export enum OrderStatus {
  PENDING = 'pendente',
  AWAITING_PAYMENT = 'aguardando_pagamento',
  PREPARING = 'preparando',
  SHIPPED = 'enviado',
  CANCELLED = 'cancelado'
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  PIX = 'pix'
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  cost: number;
  description: string;
  stock: number;
  image: string;
  weight?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Customer {
  name: string;
  phone: string;
  address: string;
  deliveryType: 'delivery' | 'pickup';
}

export interface Order {
  id: string;
  date: string;
  customer: Customer;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  payerName?: string;
  changeFor?: number;
  mapsUrl?: string;
}
