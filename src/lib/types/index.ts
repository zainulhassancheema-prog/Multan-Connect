export type Role = 'buyer' | 'seller' | 'both';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: Role;
  isVerifiedArtisan?: boolean;
  craftSpecialty?: string;
  workshopLocation?: string;
  yearsActive?: number;
  followerCount?: number;
  totalSales?: number;
  bio?: string;
  workshopDescription?: string;
  createdAt: number;
}

export interface Product {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  location: string;
  tags: string[];
  images: string[];
  isAvailable: boolean;
  totalSold: number;
  rating: number;
  reviewCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: {
    productId: string;
    sellerId: string;
    quantity: number;
    price: number;
    title: string;
    image: string;
  }[];
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    province: string;
    country: string;
    postalCode: string;
  };
  paymentMethod: 'cod' | 'card';
  grandTotal: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  createdAt: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  image?: string;
  createdAt: number;
}
