import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, User, PlusCircle, MessageSquare, Star, BarChart, Settings, Bell } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth } from '@/lib/firebase/config';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, mode, setMode } = useAuthStore();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const handleModeSwitch = (newMode: 'buyer' | 'seller') => {
    setMode(newMode);
    if (newMode === 'buyer') {
      navigate('/', { replace: true });
    } else {
      navigate('/seller', { replace: true });
    }
  };

  const links = [
    { name: 'Overview', path: '/seller', icon: LayoutDashboard },
    { name: 'My Listings', path: '/seller/listings', icon: Package },
    { name: 'Add Product', path: '/seller/add-product', icon: PlusCircle },
    { name: 'Orders', path: '/seller/orders', icon: ShoppingCart },
    { name: 'Messages', path: '/seller/messages', icon: MessageSquare },
    { name: 'Reviews', path: '/seller/reviews', icon: Star },
    { name: 'Analytics', path: '/seller/analytics', icon: BarChart },
    { name: 'Seller Profile', path: '/seller/profile', icon: User },
    { name: 'Settings', path: '/seller/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <div className="w-64 bg-[#1A237E] h-screen sticky top-0 shadow-lg z-10 hidden md:block flex flex-col">
        <div className="p-6 border-b border-[#283593]">
          <Link to="/seller">
             <h2 className="text-xl font-heading font-bold text-white italic mb-4">Multan Connect</h2>
          </Link>
          <div className="flex items-center gap-3 mt-4">
             <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 shrink-0 flex items-center justify-center">
                {user?.shopLogoUrl ? (
                  <img src={user.shopLogoUrl} alt={`${user?.shopName ?? "Your shop"} logo`} className="w-full h-full object-cover" />
                ) : user?.photoURL ? (
                  <img src={user.photoURL} alt={`${user?.shopName ?? "Your shop"} logo`} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-heading font-bold text-white">{user?.shopName?.charAt(0) || user?.displayName?.charAt(0) || 'M'}</span>
                )}
             </div>
             <div className="overflow-hidden">
                <p className="font-heading font-bold text-white text-lg truncate" title={user?.shopName || user?.displayName}>{user?.shopName || user?.displayName}</p>
                <p className="text-[#00BCD4] text-[10px] font-sans uppercase tracking-wider truncate" title={`${user?.craftType || 'Seller'} • ${user?.shopLocation || 'Multan'}`}>{user?.craftType?.replace('_', ' ') || 'Seller'} • {user?.shopLocation || 'Multan'}</p>
             </div>
          </div>
        </div>
        <nav className="px-3 py-4 space-y-1 mt-2 flex-1 overflow-y-auto">
          {links.map(link => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-[#283593] text-[#FFC107] border-l-4 border-[#FFC107]' : 'text-white/80 hover:bg-white/10 hover:text-white border-l-4 border-transparent'}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {link.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="flex-1 flex flex-col min-h-screen relative pb-16 md:pb-0 border-l border-border/10">
          <header className="sticky top-0 z-10 w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
            <h1 className="font-heading text-xl text-primary font-bold hidden md:block">Seller Dashboard</h1>
            <div className="md:hidden">
              <Link to="/seller">
                 <h2 className="text-xl font-heading font-bold text-[#1A237E] italic">Multan Connect</h2>
              </Link>
            </div>
            
            <div className="flex items-center gap-4 ml-auto">
               {user?.role === 'both' && (
                 <div className="bg-sand p-1 rounded-full flex items-center border border-border">
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

               <button className="text-gray-500 hover:text-[#1A237E] transition-colors relative hidden sm:block">
                 <Bell className="w-5 h-5" />
                 <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
               </button>

               <DropdownMenu>
                 <DropdownMenuTrigger className="flex items-center justify-center w-9 h-9 bg-[#1A237E] text-white rounded-full bg-cover overflow-hidden focus:outline-none ring-2 ring-transparent focus:ring-[#FFC107]">
                     {user?.photoURL ? (
                       <img src={user.photoURL} alt={`Profile photo of ${user?.displayName || "user"}`} className="w-full h-full object-cover" />
                     ) : (
                       <span>{user?.email?.[0].toUpperCase() || 'M'}</span>
                     )}
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 rounded-xl shadow-lg mt-2">
                   <DropdownMenuItem className="text-muted-foreground text-xs">{user?.email}</DropdownMenuItem>
                   <DropdownMenuItem onClick={handleLogout} className="text-red-600 font-medium cursor-pointer">Logout</DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            <Outlet />
          </main>

          {/* Mobile Bottom Tab Bar */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-20 flex justify-around items-center h-16 pb-safe">
             {links.slice(0, 5).map((link, index) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path || (link.path === '/seller' && location.pathname === '/seller/');
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive ? 'text-[#1A237E]' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'fill-[#1A237E]/10' : ''}`} />
                    <span className="text-[10px] font-medium">{link.name.split(' ')[0]}</span>
                  </Link>
                )
             })}
          </nav>
      </div>
    </div>
  );
}
