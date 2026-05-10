import AnimatedSection from '@/components/shared/AnimatedSection';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'sonner';

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  const handleBecomeSeller = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        role: 'both',
        isVerifiedArtisan: false
      });
      setUser({ ...user, role: 'both', isVerifiedArtisan: false });
      toast.success('You are now a seller! Please check the Seller Dashboard.');
    } catch (error: any) {
      toast.error('Failed to change role', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand pt-24 pb-12">
      <AnimatedSection className="container mx-auto px-4 max-w-4xl text-center">
        <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center mb-6 shadow-md border-4 border-white overflow-hidden">
             {user?.photoURL ? (
                 <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
             ) : (
                 <div className="text-4xl text-gold font-bold">{user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}</div>
             )}
        </div>
        <h1 className="text-4xl font-heading text-primary mb-2">My Profile</h1>
        <p className="text-xl font-serif italic text-muted-foreground mb-8">{user?.displayName || user?.email}</p>
        
        <div className="bg-white rounded-3xl p-8 border border-border text-left shadow-sm max-w-2xl mx-auto">
           <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-2xl">Account Details</h2>
              {user?.role === 'buyer' && (
                <Button 
                  onClick={handleBecomeSeller} 
                  disabled={loading}
                  className="bg-gold hover:bg-gold/90 text-white"
                >
                  {loading ? 'Updating...' : 'Become a Seller'}
                </Button>
              )}
           </div>
           
           <div className="space-y-4">
              <div>
                 <p className="text-sm tracking-widest uppercase font-sans text-muted-foreground">Email</p>
                 <p className="font-medium text-lg">{user?.email}</p>
              </div>
              <div>
                 <p className="text-sm tracking-widest uppercase font-sans text-muted-foreground">Role</p>
                 <p className="font-medium text-lg capitalize">{user?.role === 'both' ? 'Buyer & Seller' : (user?.role || 'Buyer')}</p>
              </div>
           </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
