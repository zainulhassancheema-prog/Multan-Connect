import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, UserCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useCartStore } from '@/lib/store/cartStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth } from '@/lib/firebase/config';

export default function Navbar() {
  const { user } = useAuthStore();
  const { items } = useCartStore();
  const navigate = useNavigate();
  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full h-[72px] border-b border-primary/10 bg-cream flex items-center">
      <div className="w-full px-4 md:px-12 flex items-center justify-between">
        
        {/* Mobile Menu Icon */}
        <button className="md:hidden text-ink">
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/Logo.jpeg" alt="Multan Connect Logo" className="h-14 w-14 object-cover rounded-full mix-blend-multiply border border-transparent group-hover:border-gold/30 transition-all duration-300 shadow-sm" />
          <div className="hidden md:flex flex-col ml-1">
            <span className="text-[16px] font-bold text-primary tracking-[0.1em] leading-none mb-1">MULTAN</span>
            <span className="text-[10px] text-gold uppercase tracking-[0.2em] font-bold leading-none">CONNECT</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-[32px]">
          <Link to="/explore" className="text-[14px] font-medium text-ink uppercase tracking-[0.05em] hover:text-gold transition-colors hover-underline">The Marketplace</Link>
          <Link to="/artisans" className="text-[14px] font-medium text-ink uppercase tracking-[0.05em] hover:text-gold transition-colors hover-underline">Artisans</Link>
          <Link to="/explore?category=Blue%20Pottery" className="text-[14px] font-medium text-ink uppercase tracking-[0.05em] hover:text-gold transition-colors hover-underline">Blue Pottery</Link>
          <Link to="/explore?category=Khussa" className="text-[14px] font-medium text-ink uppercase tracking-[0.05em] hover:text-gold transition-colors hover-underline">Khussa</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-5">
          <button className="text-ink hover:text-gold transition-colors">
            <Search className="w-5 h-5" />
          </button>
          
          <Link to="/cart" className="relative text-ink hover:text-gold transition-colors flex items-center font-semibold text-[13px] tracking-wide hover-underline">
            CART ({cartItemCount})
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <button className="flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full bg-cover overflow-hidden focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-cream">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.email?.[0].toUpperCase() || 'M'}</span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border border-primary/10 rounded-xl shadow-lg mt-2">
                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">My Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/orders')} className="cursor-pointer">My Orders</DropdownMenuItem>
                {user.role === 'seller' || user.role === 'both' ? (
                  <DropdownMenuItem onClick={() => navigate('/dashboard')} className="cursor-pointer">Seller Dashboard</DropdownMenuItem>
                ) : null}
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" size="sm" onClick={() => navigate('/login')} className="bg-primary hover:bg-navy-light text-white font-bold uppercase tracking-widest text-[11px] rounded-full px-6 py-4">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
