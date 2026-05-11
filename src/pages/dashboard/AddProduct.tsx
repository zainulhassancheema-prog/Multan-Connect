import { useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { db } from '@/lib/firebase/config';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/shared/BackButton';
import { ProductImageUpload } from '@/components/seller/ProductImageUpload';
import { toast } from 'sonner';

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
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
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
        description,
        price: nPrice,
        stock: nStock,
        category,
        location,
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
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price" className="font-sans tracking-widest uppercase text-xs text-ink">Price (Rs)</Label>
              <Input id="price" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required className="rounded-xl border-border bg-white" placeholder="0.00" />
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
