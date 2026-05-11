import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { BackButton } from '@/components/shared/BackButton';

const sections = [
  { id: "overview", label: "1. Overview" },
  { id: "domestic-shipping", label: "2. Domestic Shipping" },
  { id: "delivery-timeline", label: "3. Delivery Timeline" },
  { id: "packaging", label: "4. Packaging" },
  { id: "order-tracking", label: "5. Order Tracking" },
  { id: "failed-delivery", label: "6. Failed Delivery" },
  { id: "returns-eligibility", label: "7. Returns Eligibility" },
  { id: "return-process", label: "8. How to Return" },
  { id: "refunds", label: "9. Refunds" },
  { id: "damaged-items", label: "10. Damaged Items" },
  { id: "non-returnable", label: "11. Non-Returnable Items" },
  { id: "seller-responsibilities", label: "12. Seller Responsibilities" },
  { id: "contact", label: "13. Contact & Support" },
];

const quickStats = [
  {
    icon: "📦",
    value: "PKR 250",
    label: "Flat delivery fee across Pakistan",
    color: "border-gold text-gold"
  },
  {
    icon: "🚚",
    value: "3–5 Days",
    label: "Standard delivery within Pakistan",
    color: "border-teal text-teal"
  },
  {
    icon: "🔄",
    value: "7 Days",
    label: "Return window after delivery",
    color: "border-navy text-navy"
  },
  {
    icon: "💰",
    value: "Full Refund",
    label: "On eligible returns, no questions asked",
    color: "border-gold text-gold"
  },
];

const deliveryStages = [
  {
    icon: "✅",
    stage: "Order Placed",
    timing: "Day 0",
    description: "You place your order and receive an order confirmation email. The seller is notified immediately."
  },
  {
    icon: "🔨",
    stage: "Order Confirmed & Prepared",
    timing: "Day 1–2",
    description: "The seller confirms your order and prepares it for dispatch. Handmade items may require additional preparation time — the seller will communicate this through the messaging feature if needed."
  },
  {
    icon: "📬",
    stage: "Dispatched",
    timing: "Day 2–3",
    description: "Your order is handed to the courier and marked as Shipped in your orders page. A tracking number may be provided by the seller via the chat feature."
  },
  {
    icon: "🚚",
    stage: "In Transit",
    timing: "Day 3–5",
    description: "Your package is on its way. Delivery typically takes 3–5 business days within Pakistan. Remote areas may take up to 7 business days."
  },
  {
    icon: "🏠",
    stage: "Delivered",
    timing: "Day 3–7",
    description: "Your order arrives. The order status updates to Delivered. Your 7-day return window begins from this date."
  },
];

const orderStatuses = [
  { status: "Pending", color: "bg-amber-100 text-amber-800", description: "Order placed, awaiting seller confirmation" },
  { status: "Confirmed", color: "bg-blue-100 text-blue-800", description: "Seller has accepted your order and is preparing it" },
  { status: "Shipped", color: "bg-teal/10 text-teal", description: "Order dispatched to courier — check chat for tracking number" },
  { status: "Delivered", color: "bg-green-100 text-green-800", description: "Order delivered — your 7-day return window starts now" },
  { status: "Cancelled", color: "bg-red-100 text-red-800", description: "Order cancelled by buyer or seller" },
];

const returnSteps = [
  {
    step: "1",
    title: "Contact Support",
    description: "Email support@multanconnect.com within 7 days of delivery. Include your order number, a description of the issue, and clear photographs of the item received.",
    timing: "Day 1"
  },
  {
    step: "2",
    title: "Review & Approval",
    description: "Our support team reviews your request and photographs within 48 hours. We may contact the seller for their response. You will receive an email confirming whether your return is approved.",
    timing: "Within 48 hours"
  },
  {
    step: "3",
    title: "Pack & Ship the Item",
    description: "Once approved, pack the item securely in its original packaging if possible. Ship to the seller's address which will be provided by our support team. Use a trackable courier service and share the tracking number with us.",
    timing: "Within 3 days of approval"
  },
  {
    step: "4",
    title: "Seller Receives & Confirms",
    description: "The seller inspects the returned item and confirms receipt. This typically takes 2–3 business days after the courier delivers to the seller.",
    timing: "2–3 days after delivery"
  },
  {
    step: "5",
    title: "Refund Processed",
    description: "Once the seller confirms receipt, your refund is processed within 5–7 business days to your original payment method. You will receive a confirmation email when the refund is issued.",
    timing: "5–7 business days"
  },
];

const refundMethods = [
  {
    method: "Cash on Delivery (COD)",
    process: "Refunded via bank transfer or mobile payment (JazzCash/EasyPaisa) to the account details you provide to our support team.",
    timeline: "5–7 business days after return confirmed"
  },
  {
    method: "Card Payment",
    process: "Refunded to the original card used for payment. Depending on your bank, it may take additional time to appear on your statement.",
    timeline: "5–10 business days after return confirmed"
  },
];

const nonReturnableItems = [
  {
    icon: "🎨",
    title: "Custom & Personalised Items",
    description: "Items made to your specific instructions — custom painted names on pottery, specific Khussa size requests, personalised embroidery — cannot be returned as they cannot be resold."
  },
  {
    icon: "🧴",
    title: "Items Used or Washed",
    description: "Items that have been used, worn, or washed after delivery cannot be returned. Please inspect all items before use."
  },
  {
    icon: "🎁",
    title: "Gift Sets (Opened)",
    description: "Gift sets that have been opened and partially used cannot be returned. Unopened gift sets in original packaging may be returned if eligible under the returns policy."
  },
  {
    icon: "📐",
    title: "Made-to-Measure Khussa",
    description: "Khussa pairs made to a custom size specification provided by the buyer cannot be returned for size reasons. Please use the standard size guide available on each listing."
  },
];

export default function Shipping() {
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [tocOpen, setTocOpen] = useState(false);

  useEffect(() => {
    document.title = "Shipping & Returns | Multan Connect";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Everything you need to know about shipping, delivery timelines, packaging, and our returns and refunds policy for handmade crafts from Multan.");
    }
  }, []);

  useEffect(() => {
    const sectionIds = sections.map(s => s.id);
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      }
    );

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });

    return () => obs.disconnect();
  }, []);

  const handleSectionClick = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    
    const element = document.getElementById(sectionId);
    if (!element) {
      console.warn(`Section not found: ${sectionId}`);
      return;
    }

    const navbarHeight = 80;
    const elementTop = element.getBoundingClientRect().top + window.scrollY;
    const scrollTo = elementTop - navbarHeight - 16;

    window.scrollTo({
      top: scrollTo,
      behavior: "smooth"
    });
    setTocOpen(false);
  };

  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* Hero Section */}
      <section className="bg-navy py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] mix-blend-overlay pointer-events-none"></div>
        <BackButton className="absolute top-24 left-8 text-white/70 hover:text-white" />
        <span className="text-gold uppercase tracking-[0.2em] text-xs font-bold block mb-4 mt-8">
          Delivery & Returns
        </span>
        <h1 className="font-serif text-5xl text-white mt-4">
          Shipping & Returns
        </h1>
        <p className="text-white/50 mt-6 text-sm max-w-xl mx-auto leading-relaxed">
          Handmade with care in Multan — delivered carefully to your door. 
          Here is everything you need to know.
        </p>
      </section>

      <div className="container mx-auto px-4 mt-12 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Mobile Table of Contents */}
          <div className="lg:hidden w-full mb-8 shrink-0">
            <button
              onClick={() => setTocOpen(!tocOpen)}
              className="w-full flex items-center justify-between bg-white border border-border/50 rounded-xl px-4 py-4 shadow-sm"
            >
              <span className="text-sm font-bold text-navy uppercase tracking-wider">Table of Contents</span>
              <ChevronDown size={20} className={`text-gold transition-transform duration-300 ${tocOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {tocOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden bg-white border border-t-0 border-border/50 rounded-b-xl px-4 shadow-sm relative -mt-2 z-10 pt-2"
                >
                  <div className="py-2">
                    {sections.map(section => (
                    <a key={section.id} href={`#${section.id}`}
                        onClick={(e) => handleSectionClick(e, section.id)}
                        className={`block py-3 text-sm border-b border-border/30 last:border-0 transition-colors ${activeSection === section.id ? "text-gold font-medium" : "text-muted-foreground hover:text-navy"}`}>
                        {section.label}
                    </a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Table of Contents */}
          <nav className="hidden lg:block w-72 flex-shrink-0 sticky top-24">
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-8 max-h-[80vh] overflow-y-auto">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold mb-6">
                Contents
              </p>
              <div className="flex flex-col gap-1">
                {sections.map(section => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={(e) => handleSectionClick(e, section.id)}
                    className={`block text-sm py-2 pl-4 border-l-2 transition-all duration-200 ${
                        activeSection === section.id
                        ? "border-gold text-gold font-bold"
                        : "border-transparent text-muted-foreground hover:text-navy hover:border-navy/30"
                    }`}
                  >
                    {section.label}
                  </a>
                ))}
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <div className="flex-1 max-w-3xl">
            {/* Quick Stats Cards */}
            <AnimatedSection>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {quickStats.map((stat, i) => (
                  <div key={i} className={`bg-white rounded-2xl p-5 border-t-4 border-t-${stat.color.split('-')[1]} shadow-sm text-center flex flex-col items-center justify-center min-h-[140px]`}>
                    <span className="text-3xl mb-1">{stat.icon}</span>
                    <p className="font-serif text-xl text-navy font-bold mt-2 leading-tight">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 leading-snug">{stat.label}</p>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            {/* Sections */}
            <div className="space-y-16 mt-6">
              
              <AnimatedSection id="overview" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">1. Overview</h2>
                <div className="space-y-4 text-ink/80 text-base leading-relaxed">
                  <p>Multan Connect is a marketplace connecting buyers across Pakistan with traditional artisans based in Multan. All products are handmade — Blue Pottery (Kashigari), Khussa footwear, embroidery, and gift sets — crafted in workshops across Hussain Agahi Bazaar, Ghanta Ghar, Mumtazabad, and Bahawalpur Road.</p>
                  <p>Because every item is made by hand, please allow artisans the time they need to prepare your order with care. You are not buying from a warehouse — you are buying from a person.</p>
                  <p>Shipping and returns on Multan Connect work as follows:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Sellers are responsible for shipping orders to buyers</li>
                    <li>Multan Connect facilitates the process and protects buyers through our Buyer Protection policy</li>
                    <li>All shipments are within Pakistan only</li>
                    <li>All prices and fees are in Pakistani Rupees (PKR)</li>
                  </ul>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="domestic-shipping" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">2. Domestic Shipping</h2>
                <div className="space-y-4 text-ink/80 text-base leading-relaxed">
                  <p>All orders on Multan Connect are shipped within Pakistan.</p>
                  
                  <div className="bg-gold/10 border border-gold/30 rounded-2xl p-5 md:p-6 my-6 flex items-center gap-5">
                    <span className="text-4xl">📦</span>
                    <div>
                      <p className="font-serif text-2xl text-navy font-bold">PKR 250</p>
                      <p className="text-sm text-ink/70 mt-1">
                        Flat delivery fee on all orders within Pakistan
                      </p>
                    </div>
                  </div>

                  <p><strong className="text-navy">Delivery Fee:</strong> A flat delivery fee of PKR 250 applies to all orders regardless of size, weight, or destination within Pakistan. This fee is shown clearly at checkout before you confirm your order.</p>
                  <p><strong className="text-navy">Free Shipping:</strong> Some sellers offer free shipping on orders above a certain value. This is set individually by each seller and will be displayed on their product listings and at checkout when applicable. Free shipping thresholds vary by seller.</p>
                  <p><strong className="text-navy">Shipping Carriers:</strong> Sellers use trusted Pakistani courier services including TCS, Leopards Courier, Call Courier, and M&P. The choice of carrier is at the seller's discretion based on their location and the buyer's delivery address.</p>
                  <p><strong className="text-navy">Remote Areas:</strong> Delivery to remote or less-accessible areas may incur an additional courier surcharge communicated by the seller after order placement. Buyers in such areas will be notified before the order is dispatched and may cancel if they disagree with the additional charge.</p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="delivery-timeline" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">3. Delivery Timeline</h2>
                
                <div className="relative my-8 py-2">
                  <div className="absolute left-6 md:left-[26px] top-6 bottom-6 w-0.5 bg-gold/30" />
                  
                  <div className="space-y-6">
                    {deliveryStages.map((stage, i) => (
                      <div key={i} className="flex gap-4 md:gap-6 relative">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-navy flex items-center justify-center flex-shrink-0 z-10 shadow-md border-4 border-cream text-xl">
                          <span className="text-lg md:text-xl">{stage.icon}</span>
                        </div>
                        <div className="flex-1 bg-white rounded-xl p-5 border border-border/50 shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <h4 className="font-bold text-navy text-sm uppercase tracking-wider">{stage.stage}</h4>
                            <span className="text-xs bg-gold/10 text-gold px-3 py-1 rounded-full font-bold uppercase tracking-wider self-start sm:self-auto">
                              {stage.timing}
                            </span>
                          </div>
                          <p className="text-sm text-ink/80 leading-relaxed">
                            {stage.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 text-ink/80 text-base leading-relaxed">
                  <p><strong className="text-navy">Business Days:</strong> Delivery timelines are in business days (Saturday through Thursday). Friday is a rest day for most couriers in Pakistan. Orders placed on Thursday may not be dispatched until Saturday.</p>
                  <p><strong className="text-navy">Peak Periods:</strong> During Eid, major holidays, or peak shopping seasons, delivery timelines may be extended by 2–3 additional business days. Sellers will communicate expected delays through the messaging feature.</p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="packaging" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">4. Packaging</h2>
                <div className="space-y-6 text-ink/80 text-base leading-relaxed">
                  <p>Because our artisans create fragile and precious handmade items, packaging is taken very seriously.</p>
                  
                  <div className="grid md:grid-cols-2 gap-6 my-8">
                    {/* Blue Pottery Packaging */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 border border-border/50 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-4xl">🏺</span>
                        <h4 className="font-serif text-2xl text-navy">Blue Pottery</h4>
                      </div>
                      <ul className="space-y-3">
                        {[
                          "Each piece individually wrapped in bubble wrap",
                          "Placed in a double-walled cardboard box",
                          "Empty space filled with packing peanuts or crumpled paper",
                          "Fragile sticker applied to all sides of the box",
                          "Sets of multiple pieces are individually wrapped before boxing",
                          "Larger pieces (vases, tile panels) use custom wooden crating when needed",
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-ink/80 leading-relaxed">
                            <span className="text-teal mt-0.5 flex-shrink-0 font-bold">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Khussa & Embroidery Packaging */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 border border-border/50 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-4xl">👟</span>
                        <h4 className="font-serif text-2xl text-navy">Khussa & Embroidery</h4>
                      </div>
                      <ul className="space-y-3">
                        {[
                          "Khussa pairs wrapped in tissue paper to protect embroidery",
                          "Placed in a branded shoe box or sturdy cardboard box",
                          "Embroidery items folded carefully to avoid crease damage",
                          "Delicate thread work covered with protective tissue layer",
                          "Bridal and ceremonial pieces wrapped in cloth before boxing",
                          "Gift sets include decorative packaging suitable for gifting",
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-ink/80 leading-relaxed">
                            <span className="text-teal mt-0.5 flex-shrink-0 font-bold">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <p><strong className="text-navy">Sustainable Packaging:</strong> We encourage all Multan Connect sellers to use recycled, biodegradable, or reused packaging materials. Sellers who commit to sustainable packaging receive a green packaging badge on their shop profile. We are working toward 100% plastic-free packaging across the platform.</p>
                </div>
              </AnimatedSection>
              
              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="order-tracking" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">5. Order Tracking</h2>
                <div className="space-y-6 text-ink/80 text-base leading-relaxed">
                  <p><strong className="text-navy">Tracking Your Order:</strong> You can check the status of your order at any time by visiting Orders in your account. Order statuses are:</p>
                  
                  <div className="space-y-3 my-6">
                    {orderStatuses.map((s, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-5 bg-white rounded-xl p-4 md:p-5 border border-border/50 shadow-sm">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider flex-shrink-0 w-max sm:w-28 text-center ${s.color}`}>
                          {s.status}
                        </span>
                        <p className="text-sm text-ink/80 leading-relaxed">{s.description}</p>
                      </div>
                    ))}
                  </div>

                  <p><strong className="text-navy">Courier Tracking Numbers:</strong> When a seller marks your order as Shipped, they may provide a courier tracking number through the Platform's messaging feature. You can use this number on the courier's website (TCS, Leopards, Call Courier, or M&P) to track your delivery directly.</p>
                  <p>If your seller has not provided a tracking number within 24 hours of your order being marked Shipped, you may message them directly through the chat feature to request one.</p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="failed-delivery" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">6. Failed Delivery</h2>
                <div className="space-y-4 text-ink/80 text-base leading-relaxed">
                  <p>A delivery may fail if:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>You were not available at the delivery address</li>
                    <li>The address provided was incomplete or incorrect</li>
                    <li>The courier could not access the delivery location</li>
                  </ul>
                  <p><strong className="text-navy">What Happens Next:</strong> The courier will typically attempt redelivery once or twice. If delivery fails after multiple attempts, the package is usually held at the courier's nearest facility for 3–5 days before being returned to the seller.</p>
                  <p><strong className="text-navy">Your Responsibility:</strong> Please ensure your shipping address is complete and accurate at checkout. Include your full street address, area, city, and a working phone number. If you are unavailable on the expected delivery date, contact the seller via the Platform's messaging feature to arrange an alternative.</p>
                  <p><strong className="text-navy">Returned Packages:</strong> If a package is returned to the seller due to a failed delivery caused by an incorrect address or unavailability on the buyer's part, the buyer is responsible for re-shipping costs. If the failed delivery was caused by a courier error, the seller will arrange reshipment at no additional cost to the buyer.</p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="returns-eligibility" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">7. Returns Eligibility</h2>
                <div className="space-y-6 text-ink/80 text-base leading-relaxed">
                  
                  <div className="grid md:grid-cols-2 gap-6 my-8">
                    {/* Eligible */}
                    <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-6 md:p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-[#059669] text-3xl font-bold flex-shrink-0">✓</span>
                        <h4 className="font-bold text-[#065F46] uppercase tracking-wider text-sm">Eligible for Return</h4>
                      </div>
                      <ul className="space-y-3">
                        {[
                          "Item is significantly different from the listing description",
                          "Item arrived damaged due to inadequate packaging",
                          "Wrong item was sent by the seller",
                          "Item is missing parts or accessories described in the listing",
                          "Item has a manufacturing defect not disclosed in the listing",
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-[#065F46] leading-relaxed">
                            <span className="flex-shrink-0 mt-0.5 font-bold">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Not Eligible */}
                    <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-6 md:p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-[#DC2626] text-3xl font-bold flex-shrink-0">✕</span>
                        <h4 className="font-bold text-[#991B1B] uppercase tracking-wider text-sm">Not Eligible for Return</h4>
                      </div>
                      <ul className="space-y-3">
                        {[
                          "Change of mind or buyer's remorse",
                          "Item does not fit (for Khussa — please check size guide before ordering)",
                          "Minor color variation due to screen display differences",
                          "Natural variation in handmade items (no two pieces are identical)",
                          "Damage caused by buyer after delivery",
                          "Return requested after the 7-day window has closed",
                          "Custom or personalized items made to buyer's specifications",
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-[#991B1B] leading-relaxed">
                            <span className="flex-shrink-0 mt-0.5 font-bold">✕</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <p><strong className="text-navy">Return Window:</strong> Return requests must be submitted within 7 days of the confirmed delivery date. After 7 days the order is considered accepted and no return or refund can be processed.</p>
                  <p><strong className="text-navy">Natural Variation Note:</strong> All products on Multan Connect are handmade. Small variations in color, pattern, glaze, or embroidery compared to the product photos are a natural characteristic of handcrafted items — not a defect. These variations make each piece unique and are not grounds for return. Significant differences (wrong color, missing elements, completely different design) are eligible for return.</p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="return-process" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">8. How to Return</h2>
                <div className="space-y-6 text-ink/80 text-base leading-relaxed">
                  
                  <div className="relative my-8 py-2">
                    <div className="absolute left-6 md:left-[26px] top-6 bottom-6 w-0.5 bg-gold/30" />
                    
                    <div className="space-y-6">
                      {returnSteps.map((stage, i) => (
                        <div key={i} className="flex gap-4 md:gap-6 relative">
                          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-navy flex items-center justify-center flex-shrink-0 z-10 shadow-md border-4 border-cream">
                            <span className="text-lg md:text-xl font-bold text-white font-serif">{stage.step}</span>
                          </div>
                          <div className="flex-1 bg-white rounded-xl p-5 border border-border/50 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <h4 className="font-bold text-navy text-sm uppercase tracking-wider">{stage.title}</h4>
                              <span className="text-xs bg-gold/10 text-gold px-3 py-1 rounded-full font-bold uppercase tracking-wider self-start sm:self-auto">
                                {stage.timing}
                              </span>
                            </div>
                            <p className="text-sm text-ink/80 leading-relaxed">
                              {stage.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p><strong className="text-navy">Return Shipping Costs:</strong></p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>If the return is due to a seller error (wrong item, damaged, significantly different): seller bears the return shipping cost</li>
                    <li>If the return is due to buyer preference: buyer bears the return shipping cost</li>
                    <li>Our support team will clarify who bears return shipping costs in the approval email</li>
                  </ul>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="refunds" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">9. Refunds</h2>
                <div className="space-y-6 text-ink/80 text-base leading-relaxed">
                  <p><strong className="text-navy">Refund Methods:</strong> Refunds are issued to the original payment method used for the purchase.</p>
                  
                  <div className="space-y-4 my-8">
                    {refundMethods.map((method, i) => (
                      <div key={i} className="bg-white rounded-xl p-6 border border-border/50 shadow-sm flex flex-col md:flex-row md:items-start gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-navy text-sm uppercase tracking-wider mb-2">{method.method}</h4>
                          <p className="text-sm text-ink/80 leading-relaxed">{method.process}</p>
                        </div>
                        <div className="flex-shrink-0 mt-1 md:mt-0">
                          <span className="text-xs bg-teal/10 text-teal px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
                            {method.timeline}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p><strong className="text-navy">Partial Refunds:</strong> In some cases where only part of an order is affected, a partial refund may be issued for the affected items only.</p>
                  <p><strong className="text-navy">Delivery Fee Refunds:</strong> The PKR 250 delivery fee is refunded only if the return is due to a seller error (wrong item, damaged, or significantly different from listing). It is not refunded for buyer preference returns.</p>
                  <p><strong className="text-navy">Refund Confirmation:</strong> You will receive an email confirmation when your refund has been processed. If you do not receive your refund within the stated timeline, contact support@multanconnect.com with your order number and we will investigate immediately.</p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="damaged-items" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">10. Damaged Items</h2>
                <div className="space-y-6 text-ink/80 text-base leading-relaxed">
                  
                  <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-6 md:p-8 mb-8 flex items-start gap-4">
                    <span className="text-[#D97706] text-3xl flex-shrink-0 leading-none mt-1">⚠️</span>
                    <div>
                      <p className="font-bold text-[#92400E] text-sm uppercase tracking-wider mb-2">
                        Received a damaged item?
                      </p>
                      <p className="text-[#B45309] text-sm leading-relaxed">
                        Do not discard the packaging. Photograph both the damaged item AND the packaging before contacting us. This helps our team resolve your case faster.
                      </p>
                    </div>
                  </div>

                  <p>If your item arrives damaged:</p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Photograph the item from multiple angles showing the damage clearly</li>
                    <li>Photograph the outer packaging showing any damage or mishandling</li>
                    <li>Photograph the inner packaging as it was when you opened it</li>
                    <li>Contact support@multanconnect.com within 48 hours of delivery with your order number and all photographs</li>
                    <li>Do not return the item until you have received instructions from our support team</li>
                  </ol>

                  <p><strong className="text-navy">Damaged in Transit:</strong> If damage occurred due to courier mishandling, Multan Connect will work with the seller to arrange either a full refund or a replacement item at no additional cost to you.</p>
                  <p><strong className="text-navy">Damaged Due to Inadequate Packaging:</strong> If damage occurred because the seller did not package the item appropriately, the seller is fully responsible for the refund or replacement.</p>
                  <p><strong className="text-navy">Damage Discovered After Opening:</strong> If you discover damage after initial inspection, contact us as soon as possible. We handle these cases on a case-by-case basis.</p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="non-returnable" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">11. Non-Returnable Items</h2>
                <div className="space-y-6 text-ink/80 text-base leading-relaxed">
                  <p>The following items cannot be returned or refunded except in cases of significant damage or seller error:</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {nonReturnableItems.map((item, i) => (
                      <div key={i} className="bg-white rounded-xl p-6 border border-border/50 shadow-sm">
                        <span className="text-3xl block mb-4">{item.icon}</span>
                        <h4 className="font-bold text-navy text-sm uppercase tracking-wider mb-2">{item.title}</h4>
                        <p className="text-sm text-ink/80 leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="seller-responsibilities" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">12. Seller Responsibilities</h2>
                <div className="space-y-4 text-ink/80 text-base leading-relaxed">
                  <p>Sellers on Multan Connect are responsible for:</p>
                  <p><strong className="text-navy">Accurate Listings:</strong> Product descriptions, photographs, dimensions, materials, and colors must accurately represent the actual item. Misleading listings are the most common cause of returns and will result in the seller bearing all return costs.</p>
                  <p><strong className="text-navy">Safe Packaging:</strong> Sellers must package all items — especially fragile Blue Pottery — with sufficient protective materials to survive courier handling. Items damaged due to inadequate packaging are the seller's full responsibility.</p>
                  <p><strong className="text-navy">Timely Dispatch:</strong> Sellers must dispatch orders within 2 business days of order confirmation. Sellers who consistently fail to dispatch on time risk account suspension.</p>
                  <p><strong className="text-navy">Order Communication:</strong> If there is any delay, stock issue, or problem with an order, sellers must communicate with the buyer through the Platform's messaging feature immediately.</p>
                  <p><strong className="text-navy">Return Acceptance:</strong> Sellers must accept approved returns and process replacements or refunds promptly. Sellers who refuse valid returns approved by Multan Connect support will have the refund deducted from their next payout.</p>
                  <p><strong className="text-navy">Impact on Seller Rating:</strong> Returns and disputes negatively affect a seller's rating on the Platform. Sellers with a high return rate may be reviewed and in severe cases have their shop suspended.</p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="contact" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">13. Contact & Support</h2>
                <p className="text-ink/80 text-base leading-relaxed mb-6">For all shipping and returns enquiries, contact our support team:</p>
                
                <div className="bg-navy/5 border border-navy/10 rounded-2xl p-6 md:p-8 space-y-6">
                  
                  {/* Support email */}
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <Mail size={20} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider font-bold text-navy/60 mb-1">Shipping & Returns Support</p>
                      <a href="mailto:support@multanconnect.com" className="text-base text-gold hover:underline font-medium">
                        support@multanconnect.com
                      </a>
                      <p className="text-xs text-ink/70 mt-1">
                        We respond within 24 hours, Sat–Thu
                      </p>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-[#D1FAE5] flex items-center justify-center flex-shrink-0">
                      <span className="text-[#059669] text-xl">💬</span>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider font-bold text-navy/60 mb-1">WhatsApp Support</p>
                      <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer" className="text-base text-[#059669] hover:underline font-medium">
                        +92 300 123 4567
                      </a>
                      <p className="text-xs text-ink/70 mt-1">
                        Usually replies within minutes
                      </p>
                    </div>
                  </div>

                  {/* Response time note */}
                  <div className="pt-4 mt-2 border-t border-navy/10">
                    <p className="text-sm text-ink/80 leading-relaxed">
                      When contacting us about a return, please include your 
                      <strong className="text-navy"> order number</strong> and 
                      <strong className="text-navy"> photographs</strong> of the 
                      item to speed up resolution. We resolve all disputes within 
                      <strong className="text-navy"> 48 hours</strong>.
                    </p>
                  </div>
                </div>

                <div className="mt-8 text-center sm:text-left pl-2">
                  <Link to="/contact" className="text-sm font-bold uppercase tracking-wider text-gold hover:text-navy transition-colors inline-flex items-center gap-2">
                    Visit our full Contact Us page →
                  </Link>
                </div>
              </AnimatedSection>

            </div>

             {/* Bottom Related Links Bar */}
             <AnimatedSection>
                <div className="bg-white rounded-2xl p-8 mt-20 border border-border/50 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-center text-center md:text-left">
                  <p className="text-base font-medium text-navy">
                    Also read our related policies:
                  </p>
                  <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
                    <Link to="/terms" className="text-sm font-medium text-muted-foreground hover:text-gold transition-colors">
                      Terms of Service →
                    </Link>
                    <Link to="/privacy" className="text-sm font-medium text-muted-foreground hover:text-gold transition-colors">
                      Privacy Policy →
                    </Link>
                    <Link to="/sustainability" className="text-sm font-medium text-muted-foreground hover:text-gold transition-colors">
                      Sustainability →
                    </Link>
                    <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-gold transition-colors">
                      Contact Us →
                    </Link>
                  </div>
                </div>
             </AnimatedSection>

          </div>
        </div>
      </div>
    </div>
  );
}
