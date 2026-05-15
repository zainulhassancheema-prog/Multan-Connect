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
import { NavSearchBar } from './NavSearchBar';

export default function Navbar() {
  const { user, mode, setMode } = useAuthStore();
  const { items } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setMobileSearchOpen(false);
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
    <header className={`sticky top-0 z-50 w-full flex flex-col justify-center min-h-[72px] transition-all duration-500 ${scrolled ? "bg-white/90 backdrop-blur-xl shadow-warm-md border-b border-gold/10" : "bg-white border-b border-gray-100"}`}>
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
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <img src="/Logo.jpeg" alt="Multan Connect — go to homepage" className="h-10 w-10 object-cover mix-blend-multiply transition-transform duration-300 hover:scale-105 drop-shadow-sm rounded-full" />
          <div className="hidden md:flex flex-col ml-1">
            <span className="text-[16px] font-bold text-primary tracking-[0.1em] leading-none mb-1">MULTAN</span>
            <span className="text-[10px] text-gold uppercase tracking-[0.2em] font-bold leading-none">CONNECT</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-[32px] flex-shrink-0 mx-4">
          <Link to="/explore" className="relative text-sm text-ink/70 hover:text-navy transition-colors duration-200 py-1 group">The Marketplace<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full rounded-full" /></Link>
          <Link to="/stories" className="relative text-sm text-ink/70 hover:text-navy transition-colors duration-200 py-1 group">Stories<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full rounded-full" /></Link>
          <Link to="/sustainability" className="relative text-sm text-ink/70 hover:text-navy transition-colors duration-200 py-1 group">Sustainability<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full rounded-full" /></Link>
          <Link to="/artisans" className="relative text-sm text-ink/70 hover:text-navy transition-colors duration-200 py-1 group">Artisans<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full rounded-full" /></Link>
        </nav>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex flex-1 justify-center px-4 max-w-xl xl:max-w-3xl">
          <NavSearchBar />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 flex-shrink-0 ml-auto">
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

          {/* Mobile search toggle */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(prev => !prev)}
            aria-label="Toggle search"
            aria-expanded={mobileSearchOpen}
            className={`md:hidden w-9 h-9 rounded-xl flex items-center 
                        justify-center transition-colors duration-200
                        ${mobileSearchOpen
                          ? "bg-gold text-white"
                          : "bg-gray-100 text-navy hover:bg-gray-200"
                        }`}
          >
            <Search size={17} />
          </button>
          
          <Link to="/cart" className="relative w-9 h-9 rounded-xl bg-gray-50 hover:bg-gold/10 hover:shadow-gold flex items-center justify-center transition-all duration-300 group">
            <ShoppingBag size={17} className="text-ink/60 group-hover:text-gold transition-colors" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-gold shadow-gold">
                {cartItemCount}
              </span>
            )}
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
            className="fixed top-[72px] left-0 w-full bg-white z-40 overflow-y-auto md:hidden"
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

      {/* Mobile Search Bar — expands below navbar */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-visible border-t border-gray-100 md:hidden"
          >
            <div className="px-4 py-3 bg-white">
              <NavSearchBar />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
