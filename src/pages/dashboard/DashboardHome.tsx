import { useAuthStore } from '@/lib/store/authStore';
import { Navigate } from 'react-router-dom';

export default function DashboardHome() {
  const { user } = useAuthStore();

  if (!user || (user.role !== 'seller' && user.role !== 'both')) {
    return <Navigate to="/" />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="font-heading font-bold text-4xl mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm">
           <h3 className="text-sm font-sans uppercase tracking-widest text-muted-foreground mb-2">Total Revenue</h3>
           <p className="text-3xl font-bold font-mono text-gold overflow-hidden text-ellipsis">PKR 0</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm">
           <h3 className="text-sm font-sans uppercase tracking-widest text-muted-foreground mb-2">Active Listings</h3>
           <p className="text-3xl font-bold font-mono">0</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm">
           <h3 className="text-sm font-sans uppercase tracking-widest text-muted-foreground mb-2">Pending Orders</h3>
           <p className="text-3xl font-bold font-mono">0</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm">
           <h3 className="text-sm font-sans uppercase tracking-widest text-muted-foreground mb-2">My Rating</h3>
           <p className="text-3xl font-bold font-mono flex items-center gap-1">0.0 <span className="text-gold text-2xl">★</span></p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-border/50 shadow-sm text-center py-24">
         <p className="font-serif italic text-xl text-muted-foreground">Setup your verified artisan profile to start selling.</p>
      </div>
    </div>
  );
}
