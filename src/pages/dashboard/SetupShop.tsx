import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function SetupShop() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [shopName, setShopName] = useState('');
  const [shopHandle, setShopHandle] = useState('');
  const [shopBio, setShopBio] = useState('');
  const [shopLocation, setShopLocation] = useState('');
  const [craftType, setCraftType] = useState('blue_pottery');
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [checkingHandle, setCheckingHandle] = useState(false);
  const [handleError, setHandleError] = useState('');

  // Auto-generate handle from shop name
  useEffect(() => {
    if (shopName && !shopHandle) {
       const generated = shopName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
       setShopHandle(generated);
    }
  }, [shopName]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const checkHandle = async (handle: string) => {
    if (!handle) return true;
    setCheckingHandle(true);
    try {
      const q = query(collection(db, 'users'), where('shopHandle', '==', handle));
      const snap = await getDocs(q);
      if (!snap.empty && snap.docs[0].id !== user?.uid) {
        setHandleError('This handle is already taken');
        return false;
      }
      setHandleError('');
      return true;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setCheckingHandle(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!shopName.trim()) {
      toast.error('Shop Name is required');
      return;
    }

    const isHandleValid = await checkHandle(shopHandle);
    if (!isHandleValid) {
       toast.error('Please choose a different shop handle');
       return;
    }

    setLoading(true);
    try {
       let uploadedLogoUrl = '';
       if (logoFile) {
          const imageRef = ref(storage, `users/${user.uid}/shop_logo_${Date.now()}`);
          const snapshot = await uploadBytes(imageRef, logoFile);
          uploadedLogoUrl = await getDownloadURL(snapshot.ref);
       }

       await updateDoc(doc(db, "users", user.uid), {
          shopName: shopName.trim(),
          shopHandle: shopHandle.trim() || user.uid,
          shopBio: shopBio.trim(),
          craftType: craftType,
          shopLocation: shopLocation,
          ...(uploadedLogoUrl && { shopLogoUrl: uploadedLogoUrl }),
          shopCreatedAt: serverTimestamp()
       });

       toast.success("Shop set up successfully! Welcome.");
       await useAuthStore.getState().fetchAndSetUserData(user.uid);
       navigate('/seller', { replace: true });
    } catch (err: any) {
       toast.error("Failed to setup shop", { description: err.message });
       setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-auto shadow-2xl my-8">
        <div className="text-center mb-8">
          <div className="inline-block bg-cream rounded-full px-4 py-1 text-gold font-heading font-medium text-sm mb-4 tracking-widest uppercase">
            Multan Connect
          </div>
          <h1 className="font-heading font-bold text-4xl mb-2 text-ink">Set Up Your Shop</h1>
          <p className="font-serif text-muted-foreground italic">This is how buyers will discover you on Multan Connect</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="font-sans uppercase tracking-widest text-xs text-ink font-bold">Shop Name *</Label>
            <Input 
              value={shopName} 
              onChange={e => setShopName(e.target.value)} 
              placeholder="e.g. Ustad Alam's Blue Pottery" 
              className="text-lg py-6"
              required 
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Info className="w-3 h-3" /> This is the name buyers will see everywhere
            </p>
          </div>

          <div className="space-y-2">
            <Label className="font-sans uppercase tracking-widest text-xs text-ink font-bold">Shop Handle (URL) *</Label>
            <div className="flex items-center">
              <span className="bg-muted px-4 py-3 rounded-l-md border border-r-0 border-input text-muted-foreground text-sm whitespace-nowrap">
                multan-connect.com/artisan/
              </span>
              <Input 
                 value={shopHandle} 
                 onChange={e => {
                    setShopHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                    setHandleError('');
                 }} 
                 onBlur={(e) => checkHandle(e.target.value)}
                 placeholder="ustad-alam-pottery"
                 className={`rounded-l-none ${handleError ? 'border-destructive' : ''}`}
                 required
              />
            </div>
            {handleError && <p className="text-xs text-destructive">{handleError}</p>}
          </div>

          <div className="space-y-2">
             <Label className="font-sans uppercase tracking-widest text-xs text-ink font-bold">Craft Type *</Label>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
               {[
                 { id: 'blue_pottery', label: '🏺 Blue Pottery' },
                 { id: 'khussa', label: '👟 Khussa' },
                 { id: 'embroidery', label: '🧵 Embroidery' },
                 { id: 'mixed', label: '🎁 Mixed/Other' }
               ].map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setCraftType(type.id)}
                    className={`border rounded-xl p-3 text-sm flex items-center justify-center transition-colors ${craftType === type.id ? 'border-gold bg-gold/5 text-gold font-medium' : 'border-border text-ink hover:border-gold/30'}`}
                  >
                    {type.label}
                  </button>
               ))}
             </div>
          </div>

          <div className="space-y-2">
            <Label className="font-sans uppercase tracking-widest text-xs text-ink font-bold">Shop Tagline</Label>
            <Input 
              value={shopBio} 
              onChange={e => setShopBio(e.target.value)} 
              maxLength={100}
              placeholder="Handcrafted in Multan since 1987" 
            />
          </div>

          <div className="space-y-2">
            <Label className="font-sans uppercase tracking-widest text-xs text-ink font-bold">Shop Location *</Label>
            <select 
               value={shopLocation}
               onChange={(e) => setShopLocation(e.target.value)}
               className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
               required
            >
               <option value="" disabled>Select your shop location in Multan</option>
               <option value="Hussain Agahi">Hussain Agahi</option>
               <option value="Ghanta Ghar">Ghanta Ghar</option>
               <option value="Mumtazabad">Mumtazabad</option>
               <option value="Bahawalpur Road">Bahawalpur Road</option>
               <option value="Cantonment">Cantonment</option>
               <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="font-sans uppercase tracking-widest text-xs text-ink font-bold">Shop Logo (Optional)</Label>
            <div className="flex gap-4 items-center">
              <div className="w-20 h-20 rounded-full border border-dashed border-border flex items-center justify-center overflow-hidden bg-muted">
                 {logoPreview ? (
                   <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                 ) : (
                   <Upload className="w-6 h-6 text-muted-foreground" />
                 )}
              </div>
              <div className="flex-1">
                <Input type="file" accept="image/*" onChange={handleLogoChange} className="max-w-[250px]" />
                <p className="text-xs text-muted-foreground mt-2 font-serif italic">Skip for now if you don't have one</p>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Button 
               type="submit" 
               disabled={loading || checkingHandle} 
               className="w-full bg-gold hover:bg-gold-light text-white rounded-full py-6 text-lg font-bold"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Launch My Shop →"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
