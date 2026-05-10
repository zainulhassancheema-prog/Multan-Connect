import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import RootLayout from '@/layouts/RootLayout';
import DashboardLayout from '@/layouts/DashboardLayout';

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

// Pages - Dashboard
import DashboardHome from '@/pages/dashboard/DashboardHome';
import Listings from '@/pages/dashboard/Listings';

import ArtisansList from '@/pages/ArtisansList';
import OurStory from '@/pages/OurStory';
import StaticPage from '@/pages/StaticPage';

const queryClient = new QueryClient();

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
          
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="listings" element={<Listings />} />
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}
