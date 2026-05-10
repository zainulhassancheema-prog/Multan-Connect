import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-ink text-cream pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <h3 className="font-heading font-bold text-2xl text-gold mb-4 italic">Multan Connect</h3>
            <p className="text-sm text-cream/70 leading-relaxed font-serif">
              Connecting global buyers with Multan's master artisans. Discover ancient crafts, preserved and presented for the modern world.
            </p>
          </div>
          <div>
            <h4 className="font-sans font-semibold mb-4 tracking-widest uppercase text-sm">Shop</h4>
            <ul className="space-y-2 text-sm text-cream/70">
              <li><Link to="/explore?category=Blue%20Pottery" className="hover:text-gold transition-colors">Blue Pottery (Kashigari)</Link></li>
              <li><Link to="/explore?category=Khussa" className="hover:text-gold transition-colors">Handcrafted Khussa</Link></li>
              <li><Link to="/explore?category=Embroidery" className="hover:text-gold transition-colors">Multani Embroidery</Link></li>
              <li><Link to="/explore" className="hover:text-gold transition-colors">All Products</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-sans font-semibold mb-4 tracking-widest uppercase text-sm">About</h4>
            <ul className="space-y-2 text-sm text-cream/70">
              <li><Link to="/our-story" className="hover:text-gold transition-colors">Our Story</Link></li>
              <li><Link to="/artisans" className="hover:text-gold transition-colors">Meet the Artisans</Link></li>
              <li><Link to="/sustainability" className="hover:text-gold transition-colors">Sustainability</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-sans font-semibold mb-4 tracking-widest uppercase text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-cream/70">
              <li><Link to="/terms" className="hover:text-gold transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-gold transition-colors">Privacy Policy</Link></li>
              <li><Link to="/shipping" className="hover:text-gold transition-colors">Shipping & Returns</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-cream/10 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-cream/50">
          <p>&copy; {new Date().getFullYear()} Multan Connect. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span>Instagram</span>
            <span>Facebook</span>
            <span>Twitter</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
