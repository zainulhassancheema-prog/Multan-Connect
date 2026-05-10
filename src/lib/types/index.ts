import { Timestamp } from 'firebase/firestore';

export type Role = 'buyer' | 'seller' | 'both';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: Role;
  isVerifiedArtisan?: boolean;
  craftType?: string;
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
  sellerName: string;
  sellerPhotoUrl: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  isAvailable: boolean;
  isFeatured: boolean;
  location: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  totalSold: number;
  views: number;
  createdAt: Timestamp | number | any;
  updatedAt: Timestamp | number | any;
}

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  imageUrl: string;
  sellerName: string;
  sellerId: string;
  quantity: number;
  addedAt: Timestamp | number | any;
}

export interface Order {
  id?: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  items: CartItem[];
  totalAmount: number;
  deliveryFee: number;
  grandTotal: number;
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    province: string;
    country: string;
    postalCode: string;
  };
  paymentMethod: 'cod' | 'card' | string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  createdAt: Timestamp | number | any;
  updatedAt?: Timestamp | number | any;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  image?: string;
  createdAt: Timestamp | number | any;
}
