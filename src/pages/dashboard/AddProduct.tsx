import { useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { db } from '@/lib/firebase/config';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, AlertCircle, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/shared/BackButton';
import { ProductImageUpload } from '@/components/seller/ProductImageUpload';
import { AIDescriptionGenerator } from '@/components/seller/AIDescriptionGenerator';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function AddProduct() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [productId] = useState(() => `prod-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [materials, setMaterials] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [priceSuggestion, setPriceSuggestion] = useState<any>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  
  const addListingMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in');
      if (imageUrls.length === 0) {
        throw new Error('Please upload at least one product image');
      }
      
      const nPrice = parseFloat(price);
      const nStock = parseInt(stock, 10);

      await setDoc(doc(db, 'products', productId), {
        id: productId,
        sellerId: user.uid,
        sellerName: user.shopName || user.displayName, // fallback
        shopName: user.shopName || user.displayName, // ensure product has shopName
        sellerPhotoUrl: user.shopLogoUrl || user.photoURL || '',
        title,
        titleLower: title.toLowerCase().trim(),
        description,
        price: nPrice,
        stock: nStock,
        category,
        location,
        materials,
        tags,
        images: imageUrls,
        primaryImage: imageUrls[0] ?? null,
        isAvailable: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      return productId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings', user?.uid] });
      toast.success('Product listed successfully');
      navigate('/seller/listings');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to list product');
    }
  });

  const getPriceSuggestion = async () => {
    if (!title || !category) {
      toast.error("Please fill title and category first");
      return;
    }
    setPriceLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature: "price-suggestion",
          payload: { title, category, materials, description }
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.result) setPriceSuggestion(data.result);
    } catch (err: any) {
      const message = err.message ?? "";
      if (message.includes("429") || message.includes("quota")) {
        toast.error("AI is busy right now. Please try again in a moment.");
      } else if (message.includes("API key") || message.includes("API_KEY_INVALID")) {
        toast.error("AI service configuration error. Please contact support.");
      } else {
        toast.error("Failed to get price suggestion");
      }
    } finally {
      setPriceLoading(false);
    }
  };

  const generateTags = async () => {
    if (!title || !category) return;
    setTagsLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature: "tag-generator",
          payload: { title, category, description }
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.result?.tags) setSuggestedTags(data.result.tags);
    } catch (err: any) {
      const message = err.message ?? "";
      if (message.includes("429") || message.includes("quota")) {
        toast.error("AI is busy right now. Please try again in a moment.");
      } else if (message.includes("API key") || message.includes("API_KEY_INVALID")) {
        toast.error("AI service configuration error. Please contact support.");
      } else {
        toast.error("Failed to generate tags");
      }
    } finally {
      setTagsLoading(false);
    }
  };

  const addTag = (tag: string) => {
    if (!tags.includes(tag)) setTags([...tags, tag]);
    setSuggestedTags(prev => prev.filter(t => t !== tag));
  };
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !category) return;
    if (imageUrls.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }
    addListingMutation.mutate();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <BackButton label="Back to Listings" href="/seller/listings" />
        <h1 className="font-heading font-bold text-4xl">Add New Product</h1>
      </div>
      
      <div className="bg-white rounded-3xl p-8 border border-border flex flex-col items-start gap-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title" className="font-sans tracking-widest uppercase text-xs text-ink">Product Title</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required className="rounded-xl border-border bg-white" placeholder="e.g. Handpainted Blue Pottery Vase" />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description" className="font-sans tracking-widest uppercase text-xs text-ink">Description</Label>
              <textarea 
                id="description" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className="w-full rounded-xl border border-border bg-white p-3 min-h-[100px] outline-none focus:border-gold transition-colors font-serif" 
                placeholder="Tell the story of this piece..."
              />
              <AIDescriptionGenerator
                title={title}
                category={category}
                materials={materials}
                price={parseFloat(price) || 0}
                location={location}
                onApply={(desc) => setDescription(desc)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="price" className="font-sans tracking-widest uppercase text-xs text-ink">Price (Rs)</Label>
                <button type="button" onClick={getPriceSuggestion} disabled={priceLoading} className="text-xs text-gold flex items-center gap-1 hover:underline">
                  {priceLoading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                  Suggest Price
                </button>
              </div>
              <Input id="price" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required className="rounded-xl border-border bg-white" placeholder="0.00" />
              {priceSuggestion && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 bg-teal/5 border border-teal/20 rounded-xl p-3 mt-2"
                >
                  <Sparkles size={13} className="text-teal flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-navy font-medium">
                      AI Suggested: PKR {priceSuggestion.minPrice?.toLocaleString()}
                      {" – "}
                      {priceSuggestion.maxPrice?.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{priceSuggestion.reasoning}</p>
                    <button
                      type="button"
                      onClick={() => setPrice(priceSuggestion.recommendedPrice?.toString() || '')}
                      className="text-xs text-teal hover:underline mt-1 font-medium"
                    >
                      Use PKR {priceSuggestion.recommendedPrice?.toLocaleString()} →
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stock" className="font-sans tracking-widest uppercase text-xs text-ink">Stock Quantity</Label>
              <Input id="stock" type="number" value={stock} onChange={e => setStock(e.target.value)} required className="rounded-xl border-border bg-white" placeholder="1" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category" className="font-sans tracking-widest uppercase text-xs text-ink">Category</Label>
              <Input id="category" value={category} onChange={e => setCategory(e.target.value)} required className="rounded-xl border-border bg-white" placeholder="e.g. Blue Pottery, Khussa" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location" className="font-sans tracking-widest uppercase text-xs text-ink">Origin Location</Label>
              <Input id="location" value={location} onChange={e => setLocation(e.target.value)} className="rounded-xl border-border bg-white" placeholder="e.g. Multan, Pakistan" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="materials" className="font-sans tracking-widest uppercase text-xs text-ink">Materials</Label>
              <Input id="materials" value={materials} onChange={e => setMaterials(e.target.value)} className="rounded-xl border-border bg-white" placeholder="e.g. Clay, Leather, Cotton" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label className="font-sans tracking-widest uppercase text-xs text-ink">Search Tags</Label>
                <button
                  type="button"
                  onClick={generateTags}
                  disabled={tagsLoading}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors"
                >
                  {tagsLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} className="text-gold" />}
                  Suggest tags with AI
                </button>
              </div>

              {/* Tag Input */}
              <Input
                placeholder="Type a tag and press Enter"
                className="rounded-xl border-border bg-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const val = e.currentTarget.value.trim().toLowerCase();
                    if (val && !tags.includes(val)) {
                      addTag(val);
                      e.currentTarget.value = "";
                    }
                  }
                }}
              />

              {/* Active Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 bg-white border border-border text-ink px-2.5 py-1 rounded-full text-xs">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Suggested Tags */}
              {suggestedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {suggestedTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="text-xs bg-gold/10 text-gold border border-gold/20 hover:bg-gold hover:text-white px-2.5 py-1 rounded-full transition-all duration-200"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t border-border mt-4">
            <ProductImageUpload
              productId={productId}
              initialImages={[]}
              onChange={(urls) => setImageUrls(urls)}
              maxImages={6}
            />
            {imageUrls.length === 0 && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-2">
                <AlertCircle size={12} />
                At least one image is required
              </p>
            )}
          </div>
          
          <div className="flex justify-end gap-4 pt-4 border-t border-border">
             <Button type="button" variant="ghost" onClick={() => navigate('/seller/listings')} className="rounded-full rounded-xl">Cancel</Button>
             <Button type="submit" disabled={addListingMutation.isPending || imageUrls.length === 0} className="bg-gold hover:bg-gold-light text-white rounded-full px-8 disabled:opacity-50 disabled:cursor-not-allowed">
               {addListingMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</> : 'Publish Listing'}
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
