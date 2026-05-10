import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import RootLayout from '@/layouts/RootLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuthStore } from '@/lib/store/authStore';
import { useEffect } from 'react';

// Pages - Auth
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';

// Pages - Main
import Home from '@/pages/Home';
import Explore from '@/pages/Explore';
import ProductDetail from '@/pages/ProductDetail';
import ArtisanProfile from '@/pages/ArtisanProfile';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Profile from '@/pages/Profile';
import OrdersList from '@/pages/orders/OrdersList';
import OrderConfirmation from '@/pages/orders/OrderConfirmation';

// Pages - Dashboard (Seller Workspace)
import DashboardHome from '@/pages/dashboard/DashboardHome';
import Listings from '@/pages/dashboard/Listings';
import AddProduct from '@/pages/dashboard/AddProduct';
import SellerOrders from '@/pages/dashboard/SellerOrders';

import ArtisansList from '@/pages/ArtisansList';
import OurStory from '@/pages/OurStory';
import StaticPage from '@/pages/StaticPage';

const queryClient = new QueryClient();

// Protected Route Wrapper for Seller Workspace
function RequireSeller({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login?redirect=/seller" replace />;
  if (user.role === 'buyer') {
     // User is not authorized to see seller space
     return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<RootLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/artisans" element={<ArtisansList />} />
            <Route path="/our-story" element={<OurStory />} />
            <Route path="/sustainability" element={<StaticPage title="Sustainability" />} />
            <Route path="/contact" element={<StaticPage title="Contact Us" />} />
            <Route path="/terms" element={<StaticPage title="Terms of Service" />} />
            <Route path="/privacy" element={<StaticPage title="Privacy Policy" />} />
            <Route path="/shipping" element={<StaticPage title="Shipping & Returns" />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/artisan/:id" element={<ArtisanProfile />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<OrdersList />} />
            <Route path="/orders/:id/confirmation" element={<OrderConfirmation />} />
          </Route>
          
          <Route path="/seller" element={<RequireSeller><DashboardLayout /></RequireSeller>}>
            <Route index element={<DashboardHome />} />
            <Route path="listings" element={<Listings />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="orders" element={<SellerOrders />} />
            {/* Additional seller routes to be built: profile, settings, etc */}
            <Route path="*" element={<div className="p-8">Page under construction...</div>} />
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}
