export type TransactionType = 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';

export interface Category {
  id: number;
  name: string;
}

export interface Supplier {
  id: number;
  name: string;
  phone?: string;
  email?: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  unit: string;
  costPrice: number;
  salePrice: number;
  stockQty: number;
  lowStockAt?: number;
  categoryId: number;
  category?: Category;
  deletedAt?: string;
  createdAt: string;
}

export interface Transaction {
  id: number;
  type: TransactionType;
  productId: number;
  product?: Product;
  quantity: number;
  note?: string;
  supplierId?: number;
  supplier?: Supplier;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}
