import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/product/${product.id}`} className="group flex flex-col justify-start text-left bg-white rounded-2xl overflow-hidden border border-border pb-4 hover:shadow-lg transition-shadow">
      <div className="aspect-[4/5] overflow-hidden bg-navy/5 flex items-center justify-center relative border-b border-border">
        {product.images && product.images.length > 0 ? (
            <img src={product.images[0]} alt={`${product.title} — handmade ${product.category} by ${product.shopName || product.sellerName || 'Artisan'} from Multan`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
            <div className="text-navy font-heading font-bold text-2xl italic">MC</div>
        )}
      </div>
      <div className="p-4 bg-white flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1 gap-2">
            <h3 className="font-sans font-medium text-ink truncate group-hover:text-gold transition-colors">{product.title}</h3>
            <div className="flex items-center text-gold shrink-0">
            <span className="text-xs font-bold mr-1">{product.rating || 5.0}</span>
            <Star className="w-3 h-3 fill-current" />
            </div>
        </div>
        <p className="font-serif italic text-muted-foreground text-sm truncate mb-3">By {product.shopName || product.sellerName || 'Artisan'} &bull; {product.category}</p>
        <p className="font-heading font-semibold text-gold mt-auto">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
