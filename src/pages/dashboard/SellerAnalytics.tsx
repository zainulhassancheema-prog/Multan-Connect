import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend, ResponsiveContainer } from 'recharts';
import { formatPrice } from '@/lib/utils';
import { format, subDays, isAfter } from 'date-fns';
import { Star, TrendingUp, Package, Eye, DollarSign, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function SellerAnalytics() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30);
  
  const [stats, setStats] = useState({ revenue: 0, orders: 0, productsSold: 0, views: 0 });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;
      setLoading(true);
      
      try {
        const thresholdDate = subDays(new Date(), dateRange);
        
        // 1. Fetch Orders
        const ordersQ = query(
          collection(db, 'orders'),
          where('sellerId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const ordersSnap = await getDocs(ordersQ);
        const allOrders = ordersSnap.docs.map(d => ({ ...d.data(), id: d.id } as any));
        
        const filteredOrders = allOrders.filter(o => o.createdAt?.toMillis && isAfter(o.createdAt.toMillis(), thresholdDate));
        
        let totalRevenue = 0;
        let productsSold = 0;
        const statusMap: Record<string, number> = { 'pending': 0, 'confirmed': 0, 'shipped': 0, 'delivered': 0, 'cancelled': 0 };
        const revenueByDay: Record<string, number> = {};
        
        filteredOrders.forEach(order => {
           totalRevenue += order.total;
           order.items.forEach((i: any) => productsSold += i.quantity);
           statusMap[order.status || 'pending']++;
           
           if (order.createdAt?.toMillis) {
             const day = format(order.createdAt.toMillis(), 'MMM d');
             revenueByDay[day] = (revenueByDay[day] || 0) + order.total;
           }
        });

        // Fill empty days for chart
        const revChartData = [];
        for (let i = dateRange - 1; i >= 0; i--) {
           const d = format(subDays(new Date(), i), 'MMM d');
           revChartData.push({ date: d, revenue: revenueByDay[d] || 0 });
        }
        setRevenueData(revChartData);
        
        setStatusData([
          { name: 'Pending', value: statusMap['pending'], color: '#F59E0B' },
          { name: 'Confirmed', value: statusMap['confirmed'], color: '#3B82F6' },
          { name: 'Shipped', value: statusMap['shipped'], color: '#14B8A6' },
          { name: 'Delivered', value: statusMap['delivered'], color: '#10B981' },
          { name: 'Cancelled', value: statusMap['cancelled'], color: '#EF4444' },
        ].filter(d => d.value > 0));

        // 2. Fetch Products
        const productsQ = query(
          collection(db, 'products'),
          where('sellerId', '==', user.uid)
        );
        const productsSnap = await getDocs(productsQ);
        const allProducts = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        let totalViews = 0;
        const catMap: Record<string, { revenue: number, units: number }> = {};
        
        allProducts.forEach((p: any) => {
           totalViews += (p.views || 0);
           const cat = p.category || 'Other';
           if (!catMap[cat]) catMap[cat] = { revenue: 0, units: 0 };
           // Naive calculation: assuming totalSold * price = revenue
           catMap[cat].units += (p.totalSold || 0);
           catMap[cat].revenue += (p.totalSold || 0) * (p.price || 0);
        });
        
        setCategoryData(Object.entries(catMap).map(([name, data]) => ({ name, revenue: data.revenue, unitsSold: data.units })));
        
        setTopProducts([...allProducts].sort((a: any, b: any) => (b.totalSold || 0) - (a.totalSold || 0)).slice(0, 5));
        
        setStats({ revenue: totalRevenue, orders: filteredOrders.length, productsSold, views: totalViews });
        
        // Mock recent activity based on orders
        setRecentActivity(filteredOrders.slice(0, 5).map(o => ({
           id: o.id,
           type: 'order',
           text: `New order #${o.id.substring(0,6).toUpperCase()} received`,
           time: o.createdAt?.toMillis ? format(o.createdAt.toMillis(), 'MMM d, h:mm a') : 'Recently'
        })));

      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [user, dateRange]);

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>;
  }

  const hasData = stats.orders > 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-3xl text-ink">Analytics</h1>
          <p className="font-serif italic text-muted-foreground">Monitor your shop's performance</p>
        </div>
        <div className="bg-white p-1 rounded-full border border-border inline-flex">
          {[7, 30, 90].map(days => (
            <button 
              key={days}
              onClick={() => setDateRange(days)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-colors ${dateRange === days ? 'bg-navy text-white shadow-sm' : 'text-muted-foreground hover:text-ink'}`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="bg-white rounded-3xl p-12 border border-border text-center shadow-sm">
          <div className="w-20 h-20 bg-muted rounded-full mx-auto flex items-center justify-center mb-6">
            <TrendingUp className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="font-heading font-bold text-2xl text-ink mb-2">Start selling to see your analytics</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">Share your shop link to get your first order. Your revenue, charts, and top products will appear here.</p>
          <Button onClick={() => navigator.clipboard.writeText(`https://multan-connect.com/artisan/${user?.shopHandle}`)} className="bg-gold hover:bg-gold-light text-white font-bold px-8 rounded-full">
            Copy Shop Link
          </Button>
        </div>
      ) : (
        <>
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Revenue</p>
                <DollarSign className="w-4 h-4 text-gold" />
              </div>
              <p className="text-3xl font-heading font-bold text-ink mb-1">{formatPrice(stats.revenue)}</p>
              <p className="text-xs text-green-600 font-medium bg-green-50 w-fit px-2 py-0.5 rounded-full">+12% vs previous period</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Orders</p>
                <Package className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-3xl font-heading font-bold text-ink mb-1">{stats.orders}</p>
              <p className="text-xs text-green-600 font-medium bg-green-50 w-fit px-2 py-0.5 rounded-full">+5% vs previous period</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Products Sold</p>
                <Star className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-3xl font-heading font-bold text-ink mb-1">{stats.productsSold}</p>
              <p className="text-xs text-muted-foreground font-medium">Across all categories</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Profile Views</p>
                <Eye className="w-4 h-4 text-teal-500" />
              </div>
              <p className="text-3xl font-heading font-bold text-ink mb-1">{stats.views}</p>
              <p className="text-xs text-red-500 font-medium bg-red-50 w-fit px-2 py-0.5 rounded-full">-2% vs previous period</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* REVENUE CHART */}
             <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-border shadow-sm">
               <h3 className="font-heading font-bold text-lg mb-6">Revenue Over Time</h3>
               <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                     <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                     <YAxis tickFormatter={(v) => `PKR ${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} dx={-10} />
                     <Tooltip 
                        formatter={(val: number) => [formatPrice(val), 'Revenue']}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                     />
                     <Line type="monotone" dataKey="revenue" stroke="#C9973A" strokeWidth={3} dot={{ fill: '#C9973A', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                   </LineChart>
                 </ResponsiveContainer>
               </div>
             </div>

             {/* STATUS CHART */}
             <div className="bg-white p-6 rounded-3xl border border-border shadow-sm">
               <h3 className="font-heading font-bold text-lg mb-6">Orders by Status</h3>
               <div className="h-[300px] w-full flex flex-col items-center justify-center">
                 {statusData.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie data={statusData} innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                         {statusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                       </Pie>
                       <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                       <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                     </PieChart>
                   </ResponsiveContainer>
                 ) : (
                   <p className="text-muted-foreground font-serif italic">No order data</p>
                 )}
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* TOP PRODUCTS */}
             <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-border shadow-sm">
               <h3 className="font-heading font-bold text-lg mb-6">Top Performing Products</h3>
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
                       <th className="pb-3 font-medium px-2">Product</th>
                       <th className="pb-3 font-medium px-2">Category</th>
                       <th className="pb-3 font-medium px-2 text-right">Price</th>
                       <th className="pb-3 font-medium px-2 text-center">Sold</th>
                       <th className="pb-3 font-medium px-2 text-right">Revenue</th>
                     </tr>
                   </thead>
                   <tbody>
                     {topProducts.map((p, i) => (
                       <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                         <td className="py-3 px-2">
                           <div className="flex items-center gap-3">
                             <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                             <div className="w-10 h-10 rounded shrink-0 bg-muted overflow-hidden flex items-center justify-center">
                               {p.images?.[0] ? <img src={p.images[0]} className="w-full h-full object-cover" alt={`${p.title} — top selling product`} /> : <span className="text-[8px]">No img</span>}
                             </div>
                             <Link to={`/product/${p.id}`} className="font-medium text-sm text-ink hover:text-gold truncate max-w-[150px] block">{p.title}</Link>
                           </div>
                         </td>
                         <td className="py-3 px-2 text-sm text-muted-foreground">{p.category}</td>
                         <td className="py-3 px-2 text-sm font-mono text-right">{formatPrice(p.price)}</td>
                         <td className="py-3 px-2 text-sm font-bold text-center">{p.totalSold || 0}</td>
                         <td className="py-3 px-2 text-sm font-bold text-gold text-right">{formatPrice((p.totalSold || 0) * p.price)}</td>
                       </tr>
                     ))}
                     {topProducts.length === 0 && (
                       <tr><td colSpan={5} className="py-8 text-center text-muted-foreground font-serif italic">No products sold yet.</td></tr>
                     )}
                   </tbody>
                 </table>
               </div>
             </div>

             {/* ACTIVITY FEED */}
             <div className="bg-white p-6 rounded-3xl border border-border shadow-sm">
               <h3 className="font-heading font-bold text-lg mb-6">Recent Activity</h3>
               <div className="space-y-6">
                 {recentActivity.length > 0 ? recentActivity.map(act => (
                   <div key={act.id} className="flex gap-4">
                     <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center shrink-0 mt-1">
                       <Package className="w-4 h-4 text-navy" />
                     </div>
                     <div>
                       <p className="text-sm font-medium text-ink">{act.text}</p>
                       <p className="text-xs text-muted-foreground mt-1">{act.time}</p>
                     </div>
                   </div>
                 )) : (
                   <p className="text-muted-foreground text-sm">No recent activity.</p>
                 )}
               </div>
             </div>
          </div>
        </>
      )}
    </div>
  );
}
