import { useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { db, storage } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Upload, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/shared/BackButton';

export default function AddProduct() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(prev => [...prev, ...filesArray]);
      
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const addListingMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in');
      
      const imageUrls: string[] = [];
      
      // Upload images
      for (const image of images) {
        // Optional: you can compress or resize the image before uploading
        const imageRef = ref(storage, `products/${user.uid}/${Date.now()}_${image.name}`);
        const snapshot = await uploadBytes(imageRef, image);
        const url = await getDownloadURL(snapshot.ref);
        imageUrls.push(url);
      }
      
      const nPrice = parseFloat(price);
      const nStock = parseInt(stock, 10);

      const docRef = await addDoc(collection(db, 'products'), {
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
        isAvailable: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      return docRef.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings', user?.uid] });
      navigate('/seller/listings');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !category) return;
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
          
          <div className="space-y-2">
            <Label className="font-sans tracking-widest uppercase text-xs text-ink">Product Images</Label>
            <div className="border border-dashed border-gold/50 rounded-2xl p-8 bg-white text-center cursor-pointer hover:bg-gold/5 transition-colors relative">
               <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
               />
               <Upload className="w-8 h-8 text-gold mx-auto mb-2" />
               <p className="font-serif italic text-muted-foreground text-sm">Click or drag images to upload</p>
            </div>
            
            {imagePreviews.length > 0 && (
              <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-border">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-destructive hover:bg-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-4 pt-4 border-t border-border">
             <Button type="button" variant="ghost" onClick={() => navigate('/seller/listings')} className="rounded-full rounded-xl">Cancel</Button>
             <Button type="submit" disabled={addListingMutation.isPending} className="bg-gold hover:bg-gold-light text-white rounded-full px-8">
               {addListingMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</> : 'Publish Listing'}
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
