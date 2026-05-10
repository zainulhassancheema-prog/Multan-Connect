import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Store, Bell, Truck, CreditCard, Shield, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function SellerSettings() {
  const { user } = useAuthStore();
  const [loadingSection, setLoadingSection] = useState<string | null>(null);

  // Section 1: Shop Settings (some synced from profile, but handles vacation mode)
  const [shopName, setShopName] = useState(user?.shopName || '');
  const [shopHandle, setShopHandle] = useState(user?.shopHandle || '');
  const [shopBio, setShopBio] = useState(user?.shopBio || '');
  const [craftType, setCraftType] = useState(user?.craftType || 'blue_pottery');
  const [shopLocation, setShopLocation] = useState(user?.shopLocation || '');
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);

  // Section 2: Notification Preferences
  const [notifications, setNotifications] = useState({
    newOrderEmail: true,
    newOrderInApp: true,
    orderStatusInApp: true,
    newReviewEmail: true,
    newReviewInApp: true,
    newMessageInApp: true,
    lowStockEmail: true,
    lowStockInApp: true,
    weeklySummaryEmail: false,
    promoEmail: false,
  });

  // Section 3: Shipping Settings
  const [shipping, setShipping] = useState({
    defaultLocalFee: 250,
    internationalFee: 1500,
    localTime: '3-5 business days',
    internationalTime: '10-15 business days',
    freeShippingThreshold: 5000,
  });

  // Section 4: Payment Settings
  const [payments, setPayments] = useState({
    cod: true,
    bankTransfer: false,
    jazzCash: false,
    accountName: '',
    accountNumber: '',
    bankName: '',
    iban: '',
  });

  // Section 5: Account & Security
  const [deleteConfirm, setDeleteConfirm] = useState('');

  // Fetch true state from Firestore
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'users', user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setIsAcceptingOrders(data.isAcceptingOrders ?? true);
          if (data.notificationPrefs) setNotifications(prev => ({ ...prev, ...data.notificationPrefs }));
          if (data.shippingSettings) setShipping(prev => ({ ...prev, ...data.shippingSettings }));
          if (data.paymentSettings) setPayments(prev => ({ ...prev, ...data.paymentSettings }));
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };
    fetchSettings();
  }, [user]);

  const handleSaveShopSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSection('shop');
    try {
      if (!user) return;
      await updateDoc(doc(db, 'users', user.uid), {
        shopName,
        shopHandle,
        shopBio,
        craftType,
        shopLocation,
        isAcceptingOrders,
      });
      toast.success('Shop settings updated');
    } catch (err: any) {
      toast.error('Failed to save shop settings', { description: err.message });
    } finally {
      setTimeout(() => setLoadingSection(null), 500);
    }
  };

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSection('notifications');
    try {
      if (!user) return;
      await updateDoc(doc(db, 'users', user.uid), {
        notificationPrefs: notifications,
      });
      toast.success('Notification preferences updated');
    } catch (err: any) {
      toast.error('Failed to save notification preferences', { description: err.message });
    } finally {
      setTimeout(() => setLoadingSection(null), 500);
    }
  };

  const handleSaveShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSection('shipping');
    try {
      if (!user) return;
      await updateDoc(doc(db, 'users', user.uid), {
        shippingSettings: shipping,
      });
      toast.success('Shipping settings updated');
    } catch (err: any) {
      toast.error('Failed to save shipping settings', { description: err.message });
    } finally {
      setTimeout(() => setLoadingSection(null), 500);
    }
  };

  const handleSavePayments = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSection('payments');
    try {
      if (!user) return;
      await updateDoc(doc(db, 'users', user.uid), {
        paymentSettings: payments,
      });
      toast.success('Payment settings updated');
    } catch (err: any) {
      toast.error('Failed to save payment settings', { description: err.message });
    } finally {
      setTimeout(() => setLoadingSection(null), 500);
    }
  };

  const handleDeactivate = async () => {
     if (!user) return;
     if (!confirm('Your shop and listings will be hidden. You can reactivate anytime. Continue?')) return;
     try {
       await updateDoc(doc(db, 'users', user.uid), { isActive: false });
       toast.success('Shop deactivated');
     } catch(err) {
       toast.error('Failed to deactivate shop');
     }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== 'DELETE') {
      toast.error('Type DELETE to confirm');
      return;
    }
    toast.error('Account deletion not completely implemented in preview', { description: 'This requires cloud functions to clean up listings and images.' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="font-heading font-bold text-3xl text-ink">Settings</h1>
        <p className="font-serif italic text-muted-foreground">Manage your shop preferences, shipping, and payments.</p>
      </div>

      {/* SHOP SETTINGS */}
      <section className="bg-white rounded-3xl p-6 md:p-8 border border-border shadow-sm">
        <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
          <Store className="w-6 h-6 text-primary" />
          <h2 className="font-heading font-bold text-xl text-primary">Shop Settings</h2>
        </div>
        <form onSubmit={handleSaveShopSettings} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Shop Name</Label>
              <Input value={shopName} onChange={e => setShopName(e.target.value)} required />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Shop Handle</Label>
              <div className="flex">
                <span className="bg-muted px-3 py-2 border border-r-0 border-input rounded-l-md text-sm text-muted-foreground">/artisan/</span>
                <Input value={shopHandle} onChange={e => setShopHandle(e.target.value)} className="rounded-l-none" required />
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Shop Tagline</Label>
              <Input value={shopBio} onChange={e => setShopBio(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Craft Type</Label>
              <select value={craftType} onChange={e => setCraftType(e.target.value)} className="mt-1 w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="blue_pottery">🏺 Blue Pottery</option>
                <option value="khussa">👟 Khussa</option>
                <option value="embroidery">🧵 Embroidery</option>
                <option value="mixed">🎁 Mixed/Other</option>
              </select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Location</Label>
              <Input value={shopLocation} onChange={e => setShopLocation(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2 block">Shop Status</Label>
              <div className="flex items-center gap-4 p-3 border border-border rounded-lg bg-sand/30">
                <div className="flex-1 flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isAcceptingOrders ? 'bg-green-500' : 'bg-amber-500'}`} />
                  <div>
                    <p className="font-medium text-sm">{isAcceptingOrders ? 'Open' : 'On Vacation'}</p>
                    <p className="text-xs text-muted-foreground">{isAcceptingOrders ? 'Accepting orders' : 'Shop paused'}</p>
                  </div>
                </div>
                <Switch checked={isAcceptingOrders} onCheckedChange={setIsAcceptingOrders} />
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loadingSection === 'shop'} className="bg-gold hover:bg-gold-light text-white font-bold w-full md:w-auto px-8 rounded-full">
              {loadingSection === 'shop' ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Shop Settings"}
            </Button>
          </div>
        </form>
      </section>

      {/* NOTIFICATION PREFERENCES */}
      <section className="bg-white rounded-3xl p-6 md:p-8 border border-border shadow-sm">
        <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
          <Bell className="w-6 h-6 text-primary" />
          <h2 className="font-heading font-bold text-xl text-primary">Notification Preferences</h2>
        </div>
        <form onSubmit={handleSaveNotifications} className="space-y-6">
          <div className="space-y-4">
             <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
               <div>
                 <p className="font-medium text-sm">New order received</p>
                 <p className="text-xs text-muted-foreground">Email + In-app notification</p>
               </div>
               <Switch checked={notifications.newOrderEmail} onCheckedChange={c => setNotifications(p => ({ ...p, newOrderEmail: c, newOrderInApp: c }))} />
             </div>
             <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
               <div>
                 <p className="font-medium text-sm">Order status updated</p>
                 <p className="text-xs text-muted-foreground">In-app only</p>
               </div>
               <Switch checked={notifications.orderStatusInApp} onCheckedChange={c => setNotifications(p => ({ ...p, orderStatusInApp: c }))} />
             </div>
             <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
               <div>
                 <p className="font-medium text-sm">New review posted</p>
                 <p className="text-xs text-muted-foreground">Email + In-app</p>
               </div>
               <Switch checked={notifications.newReviewEmail} onCheckedChange={c => setNotifications(p => ({ ...p, newReviewEmail: c, newReviewInApp: c }))} />
             </div>
             <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
               <div>
                 <p className="font-medium text-sm">New message from buyer</p>
                 <p className="text-xs text-muted-foreground">In-app only</p>
               </div>
               <Switch checked={notifications.newMessageInApp} onCheckedChange={c => setNotifications(p => ({ ...p, newMessageInApp: c }))} />
             </div>
             <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
               <div>
                 <p className="font-medium text-sm">Low stock alert</p>
                 <p className="text-xs text-muted-foreground">&lt; 3 remaining (Email + In-app)</p>
               </div>
               <Switch checked={notifications.lowStockEmail} onCheckedChange={c => setNotifications(p => ({ ...p, lowStockEmail: c, lowStockInApp: c }))} />
             </div>
             <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
               <div>
                 <p className="font-medium text-sm">Weekly sales summary</p>
                 <p className="text-xs text-muted-foreground">Email only</p>
               </div>
               <Switch checked={notifications.weeklySummaryEmail} onCheckedChange={c => setNotifications(p => ({ ...p, weeklySummaryEmail: c }))} />
             </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-border mt-4">
            <Button type="submit" disabled={loadingSection === 'notifications'} className="bg-gold hover:bg-gold-light text-white font-bold w-full md:w-auto px-8 rounded-full">
              {loadingSection === 'notifications' ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Notifications"}
            </Button>
          </div>
        </form>
      </section>

      {/* SHIPPING SETTINGS */}
      <section className="bg-white rounded-3xl p-6 md:p-8 border border-border shadow-sm">
        <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
          <Truck className="w-6 h-6 text-primary" />
          <h2 className="font-heading font-bold text-xl text-primary">Shipping Settings</h2>
        </div>
        <form onSubmit={handleSaveShipping} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Default Delivery Fee (PKR)</Label>
              <Input type="number" value={shipping.defaultLocalFee} onChange={e => setShipping(p => ({ ...p, defaultLocalFee: Number(e.target.value)}))} required />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Free Shipping Threshold (PKR)</Label>
              <Input type="number" value={shipping.freeShippingThreshold} onChange={e => setShipping(p => ({ ...p, freeShippingThreshold: Number(e.target.value)}))} required />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Estimated Delivery Time (Local)</Label>
              <Input value={shipping.localTime} onChange={e => setShipping(p => ({ ...p, localTime: e.target.value}))} placeholder="3-5 business days" required />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">International Delivery Time</Label>
              <Input value={shipping.internationalTime} onChange={e => setShipping(p => ({ ...p, internationalTime: e.target.value}))} placeholder="10-15 business days" required />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loadingSection === 'shipping'} className="bg-gold hover:bg-gold-light text-white font-bold w-full md:w-auto px-8 rounded-full">
              {loadingSection === 'shipping' ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Shipping Settings"}
            </Button>
          </div>
        </form>
      </section>

      {/* PAYMENT SETTINGS */}
      <section className="bg-white rounded-3xl p-6 md:p-8 border border-border shadow-sm">
        <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
          <CreditCard className="w-6 h-6 text-primary" />
          <h2 className="font-heading font-bold text-xl text-primary">Payment Settings</h2>
        </div>
        <form onSubmit={handleSavePayments} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-sm">Preferred Payment Methods</h3>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="cod" checked={payments.cod} onChange={e => setPayments(p => ({ ...p, cod: e.target.checked }))} className="w-4 h-4 rounded border-border" />
              <Label htmlFor="cod" className="font-medium">Cash on Delivery (COD)</Label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="bank" checked={payments.bankTransfer} onChange={e => setPayments(p => ({ ...p, bankTransfer: e.target.checked }))} className="w-4 h-4 rounded border-border" />
              <Label htmlFor="bank" className="font-medium">Bank Transfer</Label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="jazz" checked={payments.jazzCash} onChange={e => setPayments(p => ({ ...p, jazzCash: e.target.checked }))} className="w-4 h-4 rounded border-border" />
              <Label htmlFor="jazz" className="font-medium">JazzCash / EasyPaisa</Label>
            </div>
          </div>

          {payments.bankTransfer && (
            <div className="mt-6 pt-6 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6 bg-sand/30 p-6 rounded-xl">
              <div className="md:col-span-2">
                <h3 className="font-bold text-sm mb-4">Bank Account Details (For Transfers)</h3>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Account Name</Label>
                <Input value={payments.accountName} onChange={e => setPayments(p => ({ ...p, accountName: e.target.value}))} />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Account Number</Label>
                <Input value={payments.accountNumber} onChange={e => setPayments(p => ({ ...p, accountNumber: e.target.value}))} />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Bank Name</Label>
                <Input value={payments.bankName} onChange={e => setPayments(p => ({ ...p, bankName: e.target.value}))} />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">IBAN</Label>
                <Input value={payments.iban} onChange={e => setPayments(p => ({ ...p, iban: e.target.value}))} />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loadingSection === 'payments'} className="bg-gold hover:bg-gold-light text-white font-bold w-full md:w-auto px-8 rounded-full">
              {loadingSection === 'payments' ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Payment Settings"}
            </Button>
          </div>
        </form>
      </section>

      {/* ACCOUNT & SECURITY */}
      <section className="bg-white rounded-3xl p-6 md:p-8 border border-border shadow-sm">
        <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
          <Shield className="w-6 h-6 text-primary" />
          <h2 className="font-heading font-bold text-xl text-primary">Account & Security</h2>
        </div>
        <div className="space-y-6">
           <div>
             <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Email Address</Label>
             <Input value={user?.email || ''} disabled className="bg-muted opacity-60 mt-1 max-w-md" />
             <p className="text-xs text-muted-foreground mt-1">Linked to Google account. Cannot be changed.</p>
           </div>
           
           <div className="pt-6 border-t border-border mt-6">
             <div className="flex items-center gap-3 mb-4 text-destructive">
               <AlertTriangle className="w-5 h-5" />
               <h3 className="font-bold">Danger Zone</h3>
             </div>
             
             <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 border border-destructive/20 bg-destructive/5 rounded-xl">
               <div className="flex-1">
                 <p className="font-bold text-sm">Deactivate Shop</p>
                 <p className="text-xs text-muted-foreground">Your shop and listings will be hidden.</p>
               </div>
               <Button variant="outline" onClick={handleDeactivate} className="border-destructive/30 text-destructive hover:bg-destructive hover:text-white transition-colors">
                 Deactivate
               </Button>
             </div>
             
             <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 border border-destructive/20 bg-destructive/5 rounded-xl mt-4">
               <div className="flex-1">
                 <p className="font-bold text-sm">Delete Account</p>
                 <p className="text-xs text-muted-foreground">Permanently delete your shop, listings, and history.</p>
               </div>
               <div className="flex gap-2 w-full sm:w-auto">
                 <Input 
                   placeholder="Type DELETE" 
                   className="w-32" 
                   value={deleteConfirm}
                   onChange={e => setDeleteConfirm(e.target.value)}
                 />
                 <Button 
                   variant="destructive" 
                   disabled={deleteConfirm !== 'DELETE'}
                   onClick={handleDelete} 
                   className="w-full sm:w-auto font-bold"
                 >
                   Delete Account
                 </Button>
               </div>
             </div>
           </div>
        </div>
      </section>

    </div>
  );
}
