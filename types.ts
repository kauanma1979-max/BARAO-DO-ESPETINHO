
export enum Category {
  TRADITIONAL = 'tradicional',
  SPECIAL = 'especial',
  DRINK = 'bebida',
  SIDE = 'acompanhamento'
}

export enum OrderStatus {
  AWAITING_PAYMENT = 'awaiting_payment',
  PENDING = 'pending',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
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
