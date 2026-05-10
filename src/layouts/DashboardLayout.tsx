import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, User } from 'lucide-react';

export default function DashboardLayout() {
  const location = useLocation();

  const links = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Listings', path: '/dashboard/listings', icon: Package },
    { name: 'Incoming Orders', path: '/dashboard/orders', icon: ShoppingCart },
    { name: 'Seller Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="flex min-h-screen bg-muted/30">
      <div className="w-64 border-r border-border/50 bg-white h-screen sticky top-0 shadow-sm z-10">
        <div className="p-6">
          <Link to="/">
             <h2 className="text-xl font-heading font-bold text-ink italic mb-2">Multan Connect</h2>
          </Link>
          <p className="text-xs font-sans text-muted-foreground uppercase tracking-widest">Seller Dashboard</p>
        </div>
        <nav className="px-4 py-4 space-y-2 mt-4">
          {links.map(link => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive ? 'bg-navy text-white' : 'text-muted-foreground hover:bg-muted hover:text-ink'}`}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            )
          })}
        </nav>
      </div>
      <main className="flex-1 p-8 lg:p-12">
        <Outlet />
      </main>
    </div>
  );
}
