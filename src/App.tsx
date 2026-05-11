import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import SetupShop from '@/pages/dashboard/SetupShop';
import SellerProfile from '@/pages/dashboard/SellerProfile';
import SellerSettings from '@/pages/dashboard/SellerSettings';
import SellerReviews from '@/pages/dashboard/SellerReviews';
import SellerMessages from '@/pages/dashboard/SellerMessages';
import SellerAnalytics from '@/pages/dashboard/SellerAnalytics';

import ArtisansList from '@/pages/ArtisansList';

import Stories from '@/pages/Stories';
import StoryDetail from '@/pages/StoryDetail';
import Sustainability from '@/pages/Sustainability';
import OurStory from '@/pages/OurStory';
import StaticPage from '@/pages/StaticPage';
import Contact from '@/pages/Contact';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';

import Shipping from '@/pages/Shipping';

const queryClient = new QueryClient();

// Protected Route Wrapper for Seller Workspace
function RequireSeller({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  const location = useLocation();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login?redirect=/seller" replace />;
  if (user.role === 'buyer') {
     // User is not authorized to see seller space
     return <Navigate to="/" replace />;
  }

  if ((user.role === 'seller' || user.role === 'both') && (!user.shopName || user.shopName.trim() === '')) {
     if (location.pathname !== '/seller/setup-shop') {
       return <Navigate to="/seller/setup-shop" replace />;
     }
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
            <Route path="/stories" element={<Stories />} />
            <Route path="/stories/:handle" element={<StoryDetail />} />
            <Route path="/our-story" element={<OurStory />} />
            <Route path="/sustainability" element={<Sustainability />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/artisan/:handle" element={<ArtisanProfile />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<OrdersList />} />
            <Route path="/orders/:id/confirmation" element={<OrderConfirmation />} />
          </Route>
          
          {/* Standalone Setup Shop */}
          <Route path="/seller/setup-shop" element={
            <RequireSeller>
              <SetupShop />
            </RequireSeller>
          } />

          <Route path="/seller" element={<RequireSeller><DashboardLayout /></RequireSeller>}>
            <Route index element={<DashboardHome />} />
            <Route path="listings" element={<Listings />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="orders" element={<SellerOrders />} />
            <Route path="profile" element={<SellerProfile />} />
            <Route path="settings" element={<SellerSettings />} />
            <Route path="reviews" element={<SellerReviews />} />
            <Route path="messages" element={<SellerMessages />} />
            <Route path="analytics" element={<SellerAnalytics />} />
            <Route path="*" element={<div className="p-8">Page under construction...</div>} />
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}
