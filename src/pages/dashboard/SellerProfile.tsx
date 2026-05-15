import { useState, useRef } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Loader2, ExternalLink, AlertCircle, Sparkles } from 'lucide-react';
import { BannerUpload } from '@/components/seller/BannerUpload';
import { Link } from 'react-router-dom';

export default function SellerProfile() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  // Shop Details
  const [shopName, setShopName] = useState(user?.shopName || '');
  const [shopHandle, setShopHandle] = useState(user?.shopHandle || '');
  const [craftType, setCraftType] = useState(user?.craftType || 'blue_pottery');
  const [shopBio, setShopBio] = useState(user?.shopBio || '');
  
  const MAX_BIO_LENGTH = 200;
  const remainingChars = MAX_BIO_LENGTH - (shopBio?.length ?? 0);
  const isNearLimit = remainingChars <= 30;
  const isAtLimit = remainingChars <= 0;
  
  const [storyText, setStoryText] = useState(user?.storyText || '');
  const [shopLocation, setShopLocation] = useState(user?.shopLocation || '');
  
  const [storyLoading, setStoryLoading] = useState(false);
  const generateStory = async () => {
    if (!shopName || !craftType) {
      toast.error("Please fill Shop Name and Craft Type first");
      return;
    }
    setStoryLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature: "craft-story",
          payload: { shopName, craftType, location: shopLocation, bio: storyText }
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.result) setStoryText(data.result);
    } catch (err: any) {
      const message = err.message ?? "";
      if (message.includes("429") || message.includes("quota")) {
        toast.error("AI is busy right now. Please try again in a moment.");
      } else if (message.includes("API key") || message.includes("API_KEY_INVALID")) {
        toast.error("AI service configuration error. Please contact support.");
      } else {
        toast.error("Failed to generate story");
      }
    } finally {
      setStoryLoading(false);
    }
  };

  // Logos tracking
  const [logoPreview, setLogoPreview] = useState(user?.shopLogoUrl || '');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleBannerChange = async (downloadUrl: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        shopBannerUrl: downloadUrl,
        updatedAt: serverTimestamp()
      });
      setUser({ ...user, shopBannerUrl: downloadUrl });
    } catch (error) {
      console.error("Failed to save banner URL:", error);
      toast.error("Banner uploaded but could not be saved. Please try again.");
    }
  };

  const handleBannerRemove = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        shopBannerUrl: "",
        updatedAt: serverTimestamp()
      });
      setUser({ ...user, shopBannerUrl: "" });
    } catch (error) {
      toast.error("Failed to remove banner. Please try again.");
    }
  };

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
    
    if (shopBio.length > MAX_BIO_LENGTH) {
      toast.error(`Shop bio cannot exceed ${MAX_BIO_LENGTH} characters`);
      return;
    }
    
    setLoading(true);

    try {
      const isHandleValid = await checkHandle(shopHandle);
      if (!isHandleValid) {
        toast.error('Shop handle is already taken');
        setLoading(false);
        return;
      }

      let newLogoUrl = user.shopLogoUrl;

      if (logoFile) {
        const imageRef = ref(storage, `users/${user.uid}/shop_logo_${Date.now()}`);
        const snapshot = await uploadBytes(imageRef, logoFile);
        newLogoUrl = await getDownloadURL(snapshot.ref);
      }

      const updates = {
        shopName: shopName.trim(),
        shopHandle: shopHandle.trim() || user.uid,
        craftType,
        shopBio: shopBio.trim(),
        storyText: storyText.trim(),
        shopLocation,
        ...(newLogoUrl && { shopLogoUrl: newLogoUrl }),
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
          
          <div className="mb-10 pb-10 border-b border-border/50">
            {user?.uid && (
              <BannerUpload
                currentBannerUrl={user?.shopBannerUrl || null}
                onBannerChange={handleBannerChange}
                onBannerRemove={handleBannerRemove}
                userId={user.uid}
              />
            )}
            <p className="text-xs text-muted-foreground italic mt-2">
              ✓ Banner saves automatically on upload — no need to click Save Changes below
            </p>

            {/* Live Preview Panel */}
            <div className="mt-8 p-5 bg-muted/20 rounded-2xl border border-border">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-4">
                Preview — How buyers will see your shop
              </p>
              
              {/* Miniature version of the artisan page header */}
              <div className="rounded-xl overflow-hidden border border-border bg-white shadow-sm">
                
                {/* Mini banner */}
                <div className="h-24 w-full relative overflow-hidden bg-muted">
                  {user?.shopBannerUrl ? (
                    <img
                      src={user.shopBannerUrl}
                      className="w-full h-full object-cover"
                      alt={`Banner preview for ${shopName ?? "your shop"}`}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-primary-light" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent" />
                </div>
                
                {/* Mini profile info */}
                <div className="px-5 pb-4 -mt-6 flex items-end gap-3 relative z-10">
                  <div className="w-14 h-14 rounded-full border-[3px] border-gold bg-primary 
                                  flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} className="w-full h-full object-cover" alt={`Logo preview for ${shopName ?? "your shop"}`} />
                    ) : (
                      <span className="text-white font-serif text-xl font-bold">
                        {(shopName || "A")?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="pb-1">
                    <p className="font-heading text-lg text-primary font-bold leading-tight">
                      {shopName || "Your Shop Name"}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                      {shopLocation || "Your Location"}
                    </p>
                  </div>
                </div>

              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                <Link to={`/artisan/${shopHandle || user?.uid}`}
                      target="_blank"
                      className="text-gold hover:text-primary font-medium transition-colors inline-flex items-center gap-1 border-b border-gold/30 hover:border-primary">
                  View your live public page <ExternalLink size={12} className="relative -top-[1px]" />
                </Link>
              </p>

            </div>
          </div>
          
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

            <div className="space-y-1.5">
              <label
                htmlFor="shopBio"
                className="text-sm font-medium text-navy flex items-center gap-1.5 font-bold uppercase tracking-widest text-muted-foreground"
              >
                Shop Tagline / Bio
                <span className="text-xs text-muted-foreground font-normal normal-case tracking-normal">(optional)</span>
              </label>

              <textarea
                id="shopBio"
                value={shopBio}
                onChange={e => setShopBio(e.target.value)}
                maxLength={MAX_BIO_LENGTH}
                rows={3}
                placeholder="Handcrafted in Multan since 1987 — tell buyers your story in one or two sentences."
                className={`w-full bg-background border rounded-xl px-4 py-3 text-sm text-ink
                            placeholder:text-muted-foreground/60 resize-none
                            focus:outline-none focus:ring-2 transition-all duration-200
                            ${isAtLimit
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                              : isNearLimit
                                ? "border-amber-400 focus:border-amber-400 focus:ring-amber-400/20"
                                : "border-input focus:border-gold focus:ring-gold/20"
                            }`}
              />

              {/* Progress bar */}
              <div className="w-full h-0.5 bg-muted rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full rounded-full transition-all duration-300 ease-out
                              ${isAtLimit
                                ? "bg-red-500"
                                : isNearLimit
                                  ? "bg-amber-400"
                                  : "bg-gold"
                              }`}
                  style={{
                    width: `${Math.min(
                      ((shopBio?.length ?? 0) / MAX_BIO_LENGTH) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>

              {/* Counter row */}
              <div className="flex items-start justify-between gap-2 mt-1.5">
                <div className="flex-1">
                  {isAtLimit ? (
                    <p className="flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle size={11} className="flex-shrink-0" />
                      Character limit reached
                    </p>
                  ) : isNearLimit ? (
                    <p className="text-xs text-amber-500">
                      {remainingChars} character{remainingChars !== 1 ? "s" : ""} remaining
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Shown on your public shop page and artisan story card.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <span
                    className={`text-xs font-medium tabular-nums transition-colors duration-200
                                ${isAtLimit
                                  ? "text-red-500 font-bold"
                                  : isNearLimit
                                    ? "text-amber-500"
                                    : "text-muted-foreground"
                                }`}
                  >
                    {shopBio?.length ?? 0}
                  </span>
                  <span className="text-xs text-muted-foreground opacity-60">/{MAX_BIO_LENGTH}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between mb-1.5">
                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Your Story (optional)</Label>
                <button
                  type="button"
                  onClick={generateStory}
                  disabled={storyLoading}
                  className="flex items-center gap-1.5 text-xs text-navy
                             hover:text-gold transition-colors border border-navy/20
                             hover:border-gold/40 px-3 py-1.5 rounded-xl"
                >
                  {storyLoading
                    ? <Loader2 size={11} className="animate-spin" />
                    : <Sparkles size={11} className="text-gold" />
                  }
                  Generate Story with AI
                </button>
              </div>
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

            <div className="pt-4 border-t border-border mt-6">
              <div>
                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Shop Logo</Label>
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-full border border-border overflow-hidden bg-muted flex items-center justify-center shrink-0">
                    {logoPreview ? <img src={logoPreview} className="w-full h-full object-cover" alt={`Shop logo preview for ${shopName ?? "your shop"}`} /> : <span className="text-xs text-muted-foreground">No Logo</span>}
                  </div>
                  <Input type="file" onChange={e => {
                    if (e.target.files?.[0]) {
                      setLogoFile(e.target.files[0]);
                      setLogoPreview(URL.createObjectURL(e.target.files[0]));
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
