import { Link, useNavigate } from 'react-router-dom';
import { Star, Heart, Eye, Store, Plus } from 'lucide-react';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/lib/store/cartStore';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const navigate = useNavigate();
  // Using a mock favorited state since it's not in the simple type
  const isFavorited = false;
  
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = -((e.clientY - rect.top) / rect.height - 0.5) * 20;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      sellerName: product.shopName || product.sellerName || 'Artisan',
      imageUrl: product.images?.[0] || '',
      sellerId: product.sellerId,
      addedAt: Date.now()
    } as any);
  };

  return (
    <Link to={`/product/${product.id}`}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-warm-sm hover:shadow-warm-xl transition-all duration-500 ease-out hover:-translate-y-2 cursor-pointer border border-gray-100/80 hover:border-gold/20 flex flex-col h-full"
    >
      {/* Image container */}
      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative overflow-hidden bg-cream aspect-[4/5] sm:aspect-[4/3] flex items-center justify-center shrink-0"
        style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
      >
        {product.images && product.images.length > 0 ? (
          <motion.img
            src={product.images[0]}
            alt={`${product.title} by ${product.shopName || product.sellerName || 'Artisan'}`}
            animate={{
              rotateX: tilt.y,
              rotateY: tilt.x,
              scale: tilt.x !== 0 ? 1.04 : 1,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-full h-full object-cover"
            style={{ transformStyle: "preserve-3d" }}
          />
        ) : (
          <div className="text-navy font-heading font-bold text-2xl italic">MC</div>
        )}

        {/* Gradient overlay — appears on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Category chip */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm text-navy text-xs font-medium px-2.5 py-1 rounded-full shadow-warm-sm capitalize">
            {product.category?.replace("_", " ") || "Handicraft"}
          </span>
        </div>

        {/* Heart button */}
        <button
          onClick={(e) => e.preventDefault()}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gold hover:shadow-gold hover:scale-110 active:scale-95"
        >
          <Heart size={14} className={isFavorited ? "fill-gold text-gold" : "text-ink/60"} />
        </button>

        {/* Quick view button slides up on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <button
            onClick={(e) => { e.preventDefault(); navigate(`/product/${product.id}`); }}
            className="w-full bg-white/95 backdrop-blur-sm text-navy text-xs font-semibold py-2.5 rounded-xl hover:bg-gold hover:text-white transition-colors duration-200 shadow-warm-sm flex items-center justify-center gap-2"
          >
            <Eye size={13} />
            Quick View
          </button>
        </div>
      </div>

      {/* Card content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Shop name */}
        <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
            <Store size={9} className="text-navy" />
          </span>
          {product.shopName || product.sellerName || 'Artisan'}
        </p>

        {/* Title */}
        <h3 className="text-sm font-semibold text-navy leading-snug line-clamp-2 group-hover:text-gold transition-colors duration-300">
          {product.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map(star => (
              <Star key={star} size={11}
                className={star <= Math.round(product.rating || 5)
                  ? "fill-gold text-gold"
                  : "text-gray-200 fill-gray-200"} />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({product.reviewCount || 0})</span>
        </div>

        {/* flex spacer */}
        <div className="flex-1" />

        {/* Price row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div>
            <span className="text-lg font-bold text-navy font-heading">
              {formatPrice(product.price)}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            className="w-8 h-8 bg-navy hover:bg-gold text-white rounded-xl flex items-center justify-center transition-all duration-300 hover:shadow-gold hover:scale-110 active:scale-95"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>

      {/* Bottom gold accent line — reveals on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold via-gold-light to-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </Link>
  );
}
