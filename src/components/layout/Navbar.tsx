import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, UserCircle, X } from 'lucide-react';
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
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';

export default function Navbar() {
  const { user, mode, setMode } = useAuthStore();
  const { items } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const handleModeSwitch = (newMode: 'buyer' | 'seller') => {
    setMode(newMode);
    if (newMode === 'buyer') {
      navigate('/', { replace: true });
    } else {
      navigate('/seller', { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-cream border-b border-primary/10 flex flex-col justify-center min-h-[72px]">
      <div className="w-full h-[72px] px-4 md:px-12 flex items-center justify-between">
        
        {/* Mobile Menu Icon */}
        <button 
          className="md:hidden text-ink p-1 -ml-1 flex-shrink-0 transition-colors hover:text-gold"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/Logo.jpeg" alt="Multan Connect — go to homepage" className="h-14 w-14 object-cover rounded-full mix-blend-multiply border border-transparent group-hover:border-gold/30 transition-all duration-300 shadow-sm" />
          <div className="hidden md:flex flex-col ml-1">
            <span className="text-[16px] font-bold text-primary tracking-[0.1em] leading-none mb-1">MULTAN</span>
            <span className="text-[10px] text-gold uppercase tracking-[0.2em] font-bold leading-none">CONNECT</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-[32px]">
          <Link to="/explore" className="text-[14px] font-medium text-ink uppercase tracking-[0.05em] hover:text-gold transition-colors hover-underline">The Marketplace</Link>
          <Link to="/stories" className="text-[14px] font-medium text-ink uppercase tracking-[0.05em] hover:text-gold transition-colors hover-underline">Stories</Link>
          <Link to="/sustainability" className="text-[14px] font-medium text-ink uppercase tracking-[0.05em] hover:text-gold transition-colors hover-underline">Sustainability</Link>
          <Link to="/artisans" className="text-[14px] font-medium text-ink uppercase tracking-[0.05em] hover:text-gold transition-colors hover-underline">Artisans</Link>
          <Link to="/explore?category=Blue%20Pottery" className="text-[14px] font-medium text-ink uppercase tracking-[0.05em] hover:text-gold transition-colors hover-underline">Blue Pottery</Link>
          <Link to="/explore?category=Khussa" className="text-[14px] font-medium text-ink uppercase tracking-[0.05em] hover:text-gold transition-colors hover-underline">Khussa</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {user?.role === 'both' && (
             <div className="hidden lg:flex bg-sand p-1 rounded-full items-center border border-border mr-2">
               <button 
                 onClick={() => handleModeSwitch('buyer')} 
                 className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-colors ${mode === 'buyer' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-primary'}`}
               >
                 🛍️ Buyer
               </button>
               <button 
                 onClick={() => handleModeSwitch('seller')} 
                 className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-colors ${mode === 'seller' ? 'bg-[#1A237E] shadow-sm text-white' : 'text-muted-foreground hover:text-primary'}`}
               >
                 🏪 Seller
               </button>
             </div>
          )}

          <button className="text-ink hover:text-gold transition-colors hidden sm:block">
            <Search className="w-5 h-5" />
          </button>
          
          <Link to="/cart" className="relative text-ink hover:text-gold transition-colors flex items-center font-semibold text-[13px] tracking-wide hover-underline">
            CART ({cartItemCount})
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full bg-cover overflow-hidden focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-cream">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={`Profile photo of ${user.displayName || "user"}`} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.email?.[0].toUpperCase() || 'M'}</span>
                  )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border border-primary/10 rounded-xl shadow-lg mt-2">
                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">My Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/orders')} className="cursor-pointer">My Orders</DropdownMenuItem>
                {user.role === 'seller' || user.role === 'both' ? (
                  <DropdownMenuItem onClick={() => navigate('/seller')} className="cursor-pointer font-bold text-gold">Seller Dashboard</DropdownMenuItem>
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

      {/* Mobile Menu Slide-in */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "calc(100vh - 72px)", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed top-[72px] left-0 w-full bg-cream z-40 overflow-y-auto md:hidden"
            style={{ height: 'calc(100vh - 72px)' }}
          >
            <div className="flex flex-col px-6 py-8 gap-6 border-t border-primary/5">
              <Link to="/explore" className="text-[17px] font-medium text-ink uppercase tracking-[0.05em] hover:text-gold transition-colors">The Marketplace</Link>
              <Link to="/stories" className="text-[17px] font-medium text-ink uppercase tracking-[0.05em] hover:text-gold transition-colors">Stories</Link>
              <Link to="/sustainability" className="text-[17px] font-medium text-ink uppercase tracking-[0.05em] hover:text-gold transition-colors">Sustainability</Link>
              <Link to="/artisans" className="text-[17px] font-medium text-ink uppercase tracking-[0.05em] hover:text-gold transition-colors">Artisans</Link>
              
              <div className="w-8 h-[2px] bg-gold/30 my-2" />
              
              <Link to="/explore?category=Blue%20Pottery" className="text-[17px] font-medium text-ink uppercase tracking-[0.05em] hover:text-gold transition-colors">Blue Pottery</Link>
              <Link to="/explore?category=Khussa" className="text-[17px] font-medium text-ink uppercase tracking-[0.05em] hover:text-gold transition-colors">Khussa</Link>
              
              {user?.role === 'both' && (
                <>
                  <div className="w-8 h-[2px] bg-gold/30 my-2" />
                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={() => handleModeSwitch('buyer')} 
                      className={`py-3 px-4 rounded-xl text-[13px] font-bold tracking-wider uppercase transition-colors text-center ${mode === 'buyer' ? 'bg-white shadow-sm border border-border text-primary' : 'bg-transparent text-muted-foreground hover:bg-white/50'}`}
                    >
                      🛍️ Switch to Buyer
                    </button>
                    <button 
                      onClick={() => handleModeSwitch('seller')} 
                      className={`py-3 px-4 rounded-xl text-[13px] font-bold tracking-wider uppercase transition-colors text-center ${mode === 'seller' ? 'bg-[#1A237E] shadow-sm text-white' : 'bg-transparent text-muted-foreground hover:bg-white/50'}`}
                    >
                      🏪 Switch to Seller
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
