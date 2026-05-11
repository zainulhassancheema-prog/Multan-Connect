import { useState, useRef } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

export default function SellerProfile() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  // Shop Details
  const [shopName, setShopName] = useState(user?.shopName || '');
  const [shopHandle, setShopHandle] = useState(user?.shopHandle || '');
  const [craftType, setCraftType] = useState(user?.craftType || 'blue_pottery');
  const [shopBio, setShopBio] = useState(user?.shopBio || '');
  const [storyText, setStoryText] = useState(user?.storyText || '');
  const [shopLocation, setShopLocation] = useState(user?.shopLocation || '');
  
  // Logos tracking
  const [logoPreview, setLogoPreview] = useState(user?.shopLogoUrl || '');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  const [bannerPreview, setBannerPreview] = useState(user?.shopBannerUrl || '');
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  // Personal Details
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email] = useState(user?.email || '');

  const checkHandle = async (handle: string) => {
    if (!handle || handle === user?.shopHandle) return true;
    try {
      const q = query(collection(db, 'users'), where('shopHandle', '==', handle));
      const snap = await getDocs(q);
      if (!snap.empty && snap.docs[0].id !== user?.uid) {
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const isHandleValid = await checkHandle(shopHandle);
      if (!isHandleValid) {
        toast.error('Shop handle is already taken');
        setLoading(false);
        return;
      }

      let newLogoUrl = user.shopLogoUrl;
      let newBannerUrl = user.shopBannerUrl;

      if (logoFile) {
        const imageRef = ref(storage, `users/${user.uid}/shop_logo_${Date.now()}`);
        const snapshot = await uploadBytes(imageRef, logoFile);
        newLogoUrl = await getDownloadURL(snapshot.ref);
      }

      if (bannerFile) {
        const imageRef = ref(storage, `users/${user.uid}/shop_banner_${Date.now()}`);
        const snapshot = await uploadBytes(imageRef, bannerFile);
        newBannerUrl = await getDownloadURL(snapshot.ref);
      }

      const updates = {
        shopName: shopName.trim(),
        shopHandle: shopHandle.trim() || user.uid,
        craftType,
        shopBio: shopBio.trim(),
        storyText: storyText.trim(),
        shopLocation,
        ...(newLogoUrl && { shopLogoUrl: newLogoUrl }),
        ...(newBannerUrl && { shopBannerUrl: newBannerUrl }),
        displayName: displayName.trim(),
      };

      await updateDoc(doc(db, 'users', user.uid), updates);
      
      setUser({ ...user, ...updates });
      toast.success('Shop details updated!');
    } catch (error: any) {
      toast.error('Failed to update details', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <h1 className="font-heading font-bold text-3xl text-ink border-b border-border pb-4 mb-8">Refine Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Shop Details Section */}
        <div className="space-y-6 bg-white p-8 rounded-3xl border border-border shadow-sm">
          <h2 className="font-heading font-bold text-xl text-primary border-b border-border pb-2">── Shop Details ──────────────────────────────</h2>
          
          <div className="space-y-4">
            <div>
              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Shop Name *</Label>
              <Input value={shopName} onChange={e => setShopName(e.target.value)} required className="mt-1" />
            </div>

            <div>
              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Shop Handle *</Label>
              <div className="flex mt-1">
                <span className="bg-muted px-3 py-2 border border-r-0 border-input rounded-l-md text-sm text-muted-foreground whitespace-nowrap">multan-connect.com/artisan/</span>
                <Input value={shopHandle} onChange={e => setShopHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} className="rounded-l-none" required />
              </div>
            </div>

            <div>
              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Craft Type *</Label>
              <select value={craftType} onChange={e => setCraftType(e.target.value)} className="mt-1 w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="blue_pottery">🏺 Blue Pottery</option>
                <option value="khussa">👟 Khussa</option>
                <option value="embroidery">🧵 Embroidery</option>
                <option value="mixed">🎁 Mixed/Other</option>
              </select>
            </div>

            <div>
              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Shop Tagline</Label>
              <Input value={shopBio} onChange={e => setShopBio(e.target.value)} maxLength={100} className="mt-1" placeholder="Handcrafted in Multan since 1987" />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Your Story (optional)</Label>
              <p className="text-xs text-muted-foreground font-serif italic text-gold">
                Tell buyers about your craft, your family history, your process. 
                This appears on your public story page. Write as much as you like.
              </p>
              <textarea
                value={storyText}
                onChange={e => setStoryText(e.target.value)}
                rows={8}
                placeholder="I learned this craft from my father, who learned it from his father before him..."
                className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:border-gold focus:ring-1 focus:ring-gold resize-none mt-1"
              />
            </div>

            <div>
              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Shop Location *</Label>
              <select value={shopLocation} onChange={e => setShopLocation(e.target.value)} className="mt-1 w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                <option value="" disabled>Select Location</option>
                <option value="Hussain Agahi">Hussain Agahi</option>
                <option value="Ghanta Ghar">Ghanta Ghar</option>
                <option value="Mumtazabad">Mumtazabad</option>
                <option value="Bahawalpur Road">Bahawalpur Road</option>
                <option value="Cantonment">Cantonment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border mt-6">
              <div>
                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Shop Logo</Label>
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-full border border-border overflow-hidden bg-muted flex items-center justify-center shrink-0">
                    {logoPreview ? <img src={logoPreview} className="w-full h-full object-cover" /> : <span className="text-xs text-muted-foreground">No Logo</span>}
                  </div>
                  <Input type="file" onChange={e => {
                    if (e.target.files?.[0]) {
                      setLogoFile(e.target.files[0]);
                      setLogoPreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }} accept="image/*" />
                </div>
              </div>
              
              <div>
                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Shop Banner Photo</Label>
                <div className="flex gap-4 items-center">
                  <div className="w-24 h-16 rounded-md border border-border overflow-hidden bg-muted flex items-center justify-center shrink-0">
                    {bannerPreview ? <img src={bannerPreview} className="w-full h-full object-cover" /> : <span className="text-[10px] text-muted-foreground">No Banner</span>}
                  </div>
                  <Input type="file" onChange={e => {
                    if (e.target.files?.[0]) {
                      setBannerFile(e.target.files[0]);
                      setBannerPreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }} accept="image/*" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Details Section */}
        <div className="space-y-6 bg-white p-8 rounded-3xl border border-border shadow-sm">
          <h2 className="font-heading font-bold text-xl text-primary border-b border-border pb-2">── Personal Details ──────────────────────────</h2>
          
          <div className="space-y-4">
            <div>
              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Personal Name</Label>
              <Input value={displayName} onChange={e => setDisplayName(e.target.value)} className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1 font-serif italic text-gold">Only visible to you — buyers see your Shop Name</p>
            </div>

            <div>
              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Email</Label>
              <Input value={email} disabled className="mt-1 opacity-60 bg-muted" />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={loading} className="bg-gold hover:bg-gold-light text-white font-bold w-full md:w-auto px-12 py-6 rounded-full text-lg">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
