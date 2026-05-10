import { useAuthStore } from '@/lib/store/authStore';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Package, ShoppingCart, User, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardHome() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl p-8 border border-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
            <h1 className="font-heading font-bold text-4xl text-primary mb-2 tracking-tight">
               Good morning, <span className="font-serif italic text-gold">{user?.shopName || user?.displayName?.split(' ')[0]}</span>
            </h1>
            <p className="text-muted-foreground font-sans uppercase tracking-widest text-sm">
               {user?.craftType?.replace('_', ' ') || 'Artisan'} • {user?.shopLocation || 'Multan'}
            </p>
         </div>
         <div className="flex flex-wrap gap-3">
             <Link to="/seller/add-product">
                 <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-white rounded-full px-6 font-semibold">
                    <PlusCircle className="w-4 h-4 mr-2" /> Add New Product
                 </Button>
             </Link>
             <Link to="/seller/orders">
                 <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-white rounded-full px-6 font-semibold">
                    View All Orders
                 </Button>
             </Link>
             <Link to="/seller/profile">
                 <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-white rounded-full px-6 font-semibold">
                    Edit Profile
                 </Button>
             </Link>
         </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
           <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-gray-400 mb-2">Total Revenue</h3>
           <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-primary">Rs 0</p>
              <span className="flex items-center text-green-500 text-sm font-semibold bg-green-50 px-2 py-1 rounded-md border border-green-100">
                 <ArrowUpRight className="w-4 h-4 mr-1" /> 0%
              </span>
           </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
           <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-gray-400 mb-2">Active Listings</h3>
           <p className="text-3xl font-bold text-primary">0</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
           <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-gray-400 mb-2">Pending Orders</h3>
           <div className="flex justify-between items-center">
              <p className="text-3xl font-bold text-primary">0</p>
           </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
           <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-gray-400 mb-2">Average Rating</h3>
           <p className="text-3xl font-bold text-primary flex items-center gap-2">
              0.0 <span className="text-gold">★</span>
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
               <h2 className="font-heading text-xl font-bold text-primary">Recent Orders</h2>
               <Link to="/seller/orders" className="text-gold text-sm font-semibold hover:underline border border-gold/20 px-4 py-1.5 rounded-full hover:bg-gold/5">View All</Link>
            </div>
            
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[200px]">
               <ShoppingCart className="w-12 h-12 text-gray-200 mb-4" />
               <p className="font-serif italic">No recent orders yet.</p>
            </div>
         </div>
         
         <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
               <h2 className="font-heading text-xl font-bold text-primary">Recent Listings</h2>
            </div>
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[200px]">
               <Package className="w-12 h-12 text-gray-200 mb-4" />
               <p className="font-serif italic">No listings added.</p>
               <Link to="/seller/add-product" className="text-gold mt-4 font-bold uppercase tracking-widest text-xs hover:underline">Add your first product</Link>
            </div>
         </div>
      </div>
    </div>
  );
}
