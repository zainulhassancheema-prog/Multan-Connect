import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter } from 'lucide-react';

const socialLinks = [
  { label: 'Instagram', href: '#', icon: <Instagram size={14} /> },
  { label: 'Facebook', href: '#', icon: <Facebook size={14} /> },
  { label: 'Twitter', href: '#', icon: <Twitter size={14} /> }
];

const footerColumns = [
  {
    title: 'Shop',
    links: [
      { label: 'Blue Pottery (Kashigari)', href: '/explore?category=Blue%20Pottery' },
      { label: 'Handcrafted Khussa', href: '/explore?category=Khussa' },
      { label: 'Multani Embroidery', href: '/explore?category=Embroidery' },
      { label: 'All Products', href: '/explore' }
    ]
  },
  {
    title: 'About',
    links: [
      { label: 'Our Story', href: '/our-story' },
      { label: 'Meet the Artisans', href: '/artisans' },
      { label: 'Sustainability', href: '/sustainability' },
      { label: 'Contact Us', href: '/contact' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Shipping & Returns', href: '/shipping' }
    ]
  }
];

export default function Footer() {
  return (
    <footer className="relative bg-navy overflow-hidden">
      {/* Top arabesque border */}
      <div className="h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />

      {/* Background decorations */}
      <div className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(ellipse 60% 40% at 20% 80%, rgba(201,151,58,0.06) 0%, transparent 60%), radial-gradient(ellipse 40% 60% at 80% 20%, rgba(41,182,197,0.04) 0%, transparent 50%)"
        }}
      />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')", backgroundSize: "300px" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 py-16">
        {/* Footer grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex flex-col mb-4">
              <img src="/Logo.jpeg" alt="Multan Connect logo" className="h-12 w-12 rounded-full object-cover shadow-lg border border-gold/30 mb-2 mix-blend-lighten" />
              <span className="font-heading font-bold text-lg text-gold italic">Multan Connect</span>
            </Link>
            <p className="text-white/40 text-xs leading-relaxed font-serif">
              Connecting Pakistan's finest traditional artisans with buyers who value authentic handmade craft.
            </p>
            {/* Social links with hover glow */}
            <div className="flex gap-3 mt-4">
              {socialLinks.map(social => (
                <a key={social.label} href={social.href}
                  target="_blank" rel="noopener noreferrer"
                  aria-label={`Follow Multan Connect on ${social.label}`}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-gold/20 hover:shadow-gold flex items-center justify-center text-white/40 hover:text-gold border border-white/5 hover:border-gold/30 transition-all duration-300">
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map(col => (
            <div key={col.title}>
              <h4 className="text-white text-xs uppercase tracking-widest font-semibold mb-4 flex items-center gap-2">
                <span className="w-3 h-px bg-gold" />
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map(link => (
                  <li key={link.href}>
                    <Link to={link.href}
                      className="text-white/40 hover:text-gold text-sm transition-colors duration-200 flex items-center gap-1.5 group font-sans">
                      <span className="w-0 group-hover:w-2 h-px bg-gold transition-all duration-300" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-xs">
            &copy; {new Date().getFullYear()} Multan Connect. All rights reserved. Made with <span className="text-red-500">❤️</span> in Multan.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-white/20 text-xs">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
