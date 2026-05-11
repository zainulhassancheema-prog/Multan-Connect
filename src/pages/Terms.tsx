import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { BackButton } from '@/components/shared/BackButton';

const sections = [
  { id: "acceptance", label: "1. Acceptance of Terms" },
  { id: "platform", label: "2. About the Platform" },
  { id: "accounts", label: "3. User Accounts" },
  { id: "buyers", label: "4. Buyer Terms" },
  { id: "sellers", label: "5. Seller Terms" },
  { id: "products", label: "6. Product Listings" },
  { id: "payments", label: "7. Payments & Fees" },
  { id: "shipping", label: "8. Shipping & Delivery" },
  { id: "returns", label: "9. Returns & Refunds" },
  { id: "prohibited", label: "10. Prohibited Conduct" },
  { id: "ip", label: "11. Intellectual Property" },
  { id: "privacy", label: "12. Privacy" },
  { id: "disclaimers", label: "13. Disclaimers" },
  { id: "liability", label: "14. Limitation of Liability" },
  { id: "termination", label: "15. Termination" },
  { id: "governing", label: "16. Governing Law" },
  { id: "changes", label: "17. Changes to Terms" },
  { id: "contact", label: "18. Contact" },
];

export default function Terms() {
  const [activeSection, setActiveSection] = useState<string>("acceptance");
  const [tocOpen, setTocOpen] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    document.title = "Terms of Service | Multan Connect";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Read the Terms of Service for Multan Connect — the online marketplace connecting buyers across Pakistan with Multan's traditional artisans.");
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
      <section className="bg-navy py-20 px-4 text-center">
        <BackButton className="absolute top-24 left-8 text-white/70 hover:text-white" />
        <span className="text-gold uppercase tracking-[0.2em] text-xs font-bold block mb-4">
          Legal
        </span>
        <h1 className="font-serif text-5xl text-white mt-4">Terms of Service</h1>
        <p className="text-white/50 mt-6 text-sm">
          Last updated: May 10, 2026 · Effective: May 10, 2026
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
            {/* Intro Summary Box */}
            <AnimatedSection>
              <div className="bg-gold/5 border border-gold/30 rounded-2xl p-8 mb-12">
                <p className="text-xs uppercase tracking-[0.2em] text-gold font-bold mb-3">
                  Plain Language Summary
                </p>
                <p className="text-navy/80 text-base leading-relaxed">
                  These terms govern your use of Multan Connect — a marketplace connecting 
                  buyers across Pakistan with master artisans from Multan. Key points: 
                  sellers keep 85% of every sale, all products must be genuinely handmade 
                  in Multan, buyers are protected by our 7-day return policy, and all 
                  transactions are in PKR under Pakistani law.
                </p>
              </div>
            </AnimatedSection>

            {/* Sections */}
            <div className="space-y-16">
              
              <AnimatedSection id="acceptance" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">1. Acceptance of Terms</h2>
                <div className="space-y-4 text-ink/80 text-base leading-relaxed">
                  <p>By accessing or using Multan Connect ("the Platform", "we", "us", "our") at multanconnect.com or through our Android application, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Platform.</p>
                  <p>These Terms apply to all users of the Platform, including buyers, sellers (artisans), visitors, and any other persons who access the Platform.</p>
                  <p>You must be at least 18 years of age to create an account. By creating an account you represent that you are 18 or older and have the legal capacity to enter into a binding agreement.</p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="platform" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">2. About the Platform</h2>
                <div className="space-y-4 text-ink/80 text-base leading-relaxed">
                  <p>Multan Connect is an online marketplace that connects buyers across Pakistan with traditional artisans based in Multan — home to some of the world's finest Blue Pottery (Kashigari) and Khussa craftsmanship, practiced here for over 400 years. The Platform facilitates transactions between independent sellers and buyers. Multan Connect is not a party to transactions between buyers and sellers — we provide the technology and infrastructure that enables these transactions.</p>
                  <p>Multan Connect does not manufacture, own, or control any products listed on the Platform. We do not endorse any specific product, seller, or buyer unless explicitly stated through our Verified Artisan program.</p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="accounts" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">3. User Accounts</h2>
                <div className="space-y-4 text-ink/80 text-base leading-relaxed">
                  <p><strong className="text-navy">Account Registration:</strong> You must create an account to buy or sell on Multan Connect. You may register using Google Sign-In or an email address and password. You are responsible for maintaining the confidentiality of your account credentials.</p>
                  <p><strong className="text-navy">Account Accuracy:</strong> You agree to provide accurate, current, and complete information during registration and to update this information to keep it accurate. Providing false information is grounds for immediate account termination.</p>
                  <p><strong className="text-navy">Account Security:</strong> You are responsible for all activity that occurs under your account. Notify us immediately at support@multanconnect.com if you suspect unauthorized access to your account.</p>
                  <p><strong className="text-navy">One Account Per Person:</strong> Each individual or business entity may maintain only one active seller account. Creating multiple accounts to circumvent suspensions or bans is prohibited.</p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="buyers" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">4. Buyer Terms</h2>
                <div className="space-y-4 text-ink/80 text-base leading-relaxed">
                  <p><strong className="text-navy">Purchasing:</strong> By placing an order on Multan Connect, you are making an offer to purchase the listed product at the stated price. Orders are confirmed when the seller accepts them. Multan Connect does not guarantee acceptance of any order.</p>
                  <p><strong className="text-navy">Pricing:</strong> All prices are listed in Pakistani Rupees (PKR) unless otherwise stated. Prices do not include applicable taxes or shipping fees unless explicitly noted. Delivery fees are calculated and shown at checkout.</p>
                  <p><strong className="text-navy">Order Accuracy:</strong> You are responsible for reviewing your order details before confirming purchase. Errors in shipping address, product selection, or quantity must be reported to the seller within 2 hours of placing the order.</p>
                  <p><strong className="text-navy">Communication with Sellers:</strong> Buyers may communicate with sellers through the Platform's built-in messaging system. Communications must remain professional and respectful. Moving transactions off-platform to avoid fees is prohibited and may result in account suspension.</p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="sellers" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">5. Seller Terms</h2>
                <div className="space-y-4 text-ink/80 text-base leading-relaxed">
                  <p><strong className="text-navy">Eligibility:</strong> To sell on Multan Connect, you must be a genuine artisan or craft business creating handmade products. You must complete the shop setup process including providing your shop name, craft type, and workshop location.</p>
                  <p><strong className="text-navy">Seller Fees:</strong> Multan Connect charges a 15% commission on each completed sale. This fee is deducted from the sale amount before payout. There are no listing fees or monthly subscription charges. Women-owned shops receive zero platform fees for their first six months as part of our Women Artisan Initiative.</p>
                  <p><strong className="text-navy">Payouts:</strong> Seller payouts are processed within 3–5 business days of order delivery confirmation. Payouts are made via bank transfer, JazzCash, or EasyPaisa registered in your account settings.</p>
                  <p><strong className="text-navy">Seller Responsibilities:</strong> Sellers are solely responsible for the accuracy of their listings, fulfilling orders, communicating with buyers, packaging products safely, and complying with all applicable Pakistani laws regarding the sale of goods.</p>
                  <p><strong className="text-navy">Shop Vacation Mode:</strong> Sellers may activate Vacation Mode in settings to temporarily pause their shop. During Vacation Mode, your listings will be hidden from buyers and no new orders will be accepted.</p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="products" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">6. Product Listings</h2>
                <div className="space-y-4 text-ink/80 text-base leading-relaxed">
                  <p><strong className="text-navy">Handmade Requirement:</strong> All products listed on Multan Connect must be genuinely handmade by the seller or their workshop team. Factory-made, mass-produced, or drop-shipped products are strictly prohibited. Multan Connect reserves the right to remove any listing suspected of violating this policy without prior notice.</p>
                  <p><strong className="text-navy">Listing Accuracy:</strong> Sellers must provide accurate descriptions, dimensions, materials, and photographs for all listings. Photographs must show the actual product being sold. Stock photography or images of other sellers' products are prohibited.</p>
                  <p><strong className="text-navy">Prohibited Products:</strong> The following may not be listed on Multan Connect:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Products that are not handmade or traditionally crafted</li>
                    <li>Counterfeit or replica products</li>
                    <li>Products that infringe on third-party intellectual property</li>
                    <li>Illegal goods or products prohibited under Pakistani law</li>
                    <li>Products that misrepresent their origin, materials, or craftsmanship</li>
                  </ul>
                  <p><strong className="text-navy">Listing Removal:</strong> Multan Connect may remove listings that violate these Terms at any time. Sellers with repeated violations may have their accounts suspended or permanently terminated.</p>
                </div>
              </AnimatedSection>
              
              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="payments" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">7. Payments & Fees</h2>
                <div className="space-y-4 text-ink/80 text-base leading-relaxed">
                  <p><strong className="text-navy">Payment Methods:</strong> Multan Connect currently supports Cash on Delivery (COD) and card payments for orders within Pakistan. All transactions are processed in Pakistani Rupees (PKR).</p>
                  <p><strong className="text-navy">Platform Commission:</strong> A 15% commission is applied to the total sale amount (excluding delivery fees) on each completed transaction. This commission covers payment processing, platform maintenance, buyer protection, and seller support services.</p>
                  <p><strong className="text-navy">Taxes:</strong> Sellers are solely responsible for determining and paying any applicable taxes on their sales, including sales tax, income tax, or any other government-mandated charges. Multan Connect does not collect or remit taxes on behalf of sellers.</p>
                  <p><strong className="text-navy">Disputed Charges:</strong> If you believe a charge is incorrect, contact support@multanconnect.com within 14 days of the transaction date. We will investigate and respond within 5 business days.</p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="shipping" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">8. Shipping & Delivery</h2>
                <div className="space-y-4 text-ink/80 text-base leading-relaxed">
                  <p><strong className="text-navy">Seller Responsibility:</strong> Sellers are responsible for shipping products within the timeframe stated in their listings.</p>
                  <p><strong className="text-navy">Shipping Fees:</strong> A flat delivery fee of PKR 250 applies to all orders within Pakistan. Sellers who offer free shipping above a certain order value may configure this threshold in their shop settings.</p>
                  <p><strong className="text-navy">Delivery Timeline:</strong> Standard delivery within Pakistan takes 3–5 business days. Delivery to remote areas may take up to 7 business days.</p>
                  <p><strong className="text-navy">Packaging:</strong> Sellers are responsible for packaging products safely. Multan Connect strongly encourages the use of sustainable, biodegradable packaging materials. Fragile items such as Blue Pottery must be packaged with sufficient protective materials to prevent damage in transit.</p>
                  <p><strong className="text-navy">Lost or Damaged Shipments:</strong> If a product is lost or arrives damaged, the buyer must contact support@multanconnect.com within 48 hours of the expected delivery date with photographic evidence. Multan Connect will mediate between buyer and seller to reach a fair resolution.</p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="returns" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">9. Returns & Refunds</h2>
                <div className="space-y-4 text-ink/80 text-base leading-relaxed">
                  <p><strong className="text-navy">Buyer Protection:</strong> If a product arrives significantly different from its listing description or photographs, buyers are entitled to a full refund within 7 days of the confirmed delivery date.</p>
                  <p><strong className="text-navy">Return Process:</strong> To initiate a return, buyers must:</p>
                  <ol className="list-decimal pl-6 space-y-1">
                    <li>Contact support@multanconnect.com within 7 days of delivery</li>
                    <li>Provide order number, photographs of the received item, and a description of the discrepancy</li>
                    <li>Await confirmation from our team before returning the item</li>
                  </ol>
                  <p><strong className="text-navy">Return Shipping:</strong> Return shipping costs are borne by the seller if the return is due to a listing inaccuracy. If the buyer simply changed their mind, return shipping costs are borne by the buyer.</p>
                  <p><strong className="text-navy">Refund Timeline:</strong> Approved refunds are processed within 5–7 business days to the original payment method.</p>
                  <p><strong className="text-navy">Non-Returnable Items:</strong> Custom or personalized items made to buyer specifications are non-returnable unless they arrive damaged or significantly different from what was agreed.</p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="prohibited" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">10. Prohibited Conduct</h2>
                <ul className="space-y-4 mt-6">
                  {[
                    "Impersonating any person, entity, or Multan Connect itself",
                    "Using the Platform to conduct fraudulent transactions",
                    "Manipulating product reviews or ratings",
                    "Harassing, threatening, or abusing other users through any Platform feature",
                    "Attempting to circumvent Platform fees by conducting transactions outside Multan Connect",
                    "Uploading false, misleading, or defamatory content",
                    "Using automated tools, bots, or scrapers on the Platform without written consent",
                    "Attempting to gain unauthorized access to any part of the Platform or other users' accounts",
                    "Listing products that violate Pakistani law or these Terms",
                    "Creating multiple accounts to evade suspension or gain unfair advantages",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-base text-ink/80">
                      <span className="text-red-500 mt-0.5 flex-shrink-0 font-bold">✕</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="ip" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">11. Intellectual Property</h2>
                <div className="space-y-4 text-ink/80 text-base leading-relaxed">
                  <p><strong className="text-navy">Platform Ownership:</strong> All content on Multan Connect — including but not limited to the logo, design, interface, code, and written content — is owned by Multan Connect and protected under Pakistani intellectual property laws.</p>
                  <p><strong className="text-navy">Seller Content License:</strong> By listing a product on Multan Connect, sellers grant Multan Connect a non-exclusive, royalty-free, worldwide license to use, display, and reproduce their product images and descriptions for the purpose of operating and promoting the Platform, including on social media and marketing materials.</p>
                  <p><strong className="text-navy">Respect for Third-Party IP:</strong> Users must not upload content that infringes on the intellectual property rights of any third party. Infringing content will be removed and repeat infringers will have their accounts terminated.</p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="privacy" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">12. Privacy</h2>
                <div className="space-y-4 text-ink/80 text-base leading-relaxed">
                  <p>Your use of Multan Connect is also governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the Platform, you consent to the collection and use of your information as described in our Privacy Policy.</p>
                  <p>We do not sell your personal data to third parties. We use your information to operate the Platform, process transactions, communicate with you, and improve our services.</p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="disclaimers" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">13. Disclaimers</h2>
                <div className="space-y-4 text-ink/80 text-base leading-relaxed">
                  <p>The Platform is provided "as is" and "as available" without warranties of any kind, express or implied. Multan Connect does not warrant that:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>The Platform will be uninterrupted or error-free</li>
                    <li>Products listed will meet buyer expectations in all respects</li>
                    <li>Sellers will fulfill orders in a timely manner</li>
                    <li>The Platform will be free of viruses or harmful components</li>
                  </ul>
                  <p>Multan Connect acts as a marketplace facilitator and is not responsible for the quality, safety, legality, or authenticity of products listed by independent sellers beyond the protections explicitly stated in these Terms.</p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="liability" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">14. Limitation of Liability</h2>
                <div className="space-y-4 text-ink/80 text-base leading-relaxed">
                  <p>To the maximum extent permitted by applicable Pakistani law, Multan Connect shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform, including but not limited to loss of profits, data, or goodwill.</p>
                  <p>Multan Connect's total liability to you for any claim arising from your use of the Platform shall not exceed the total fees paid by you to Multan Connect in the three months preceding the claim.</p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />
              
              <AnimatedSection id="termination" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">15. Termination</h2>
                <div className="space-y-4 text-ink/80 text-base leading-relaxed">
                  <p><strong className="text-navy">By You:</strong> You may close your account at any time by contacting support@multanconnect.com or through the Account Settings page. Closing your account does not cancel pending orders, which must be fulfilled or cancelled before account closure.</p>
                  <p><strong className="text-navy">By Multan Connect:</strong> We reserve the right to suspend or permanently terminate any account that violates these Terms, engages in fraudulent activity, or poses a risk to other users or the Platform. Where possible, we will provide notice before termination. In cases of serious violations, immediate termination may occur without notice.</p>
                  <p><strong className="text-navy">Effect of Termination:</strong> Upon account termination, your right to use the Platform ceases immediately. Completed transactions, outstanding payouts, and pending disputes will be handled according to standard procedures.</p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="governing" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">16. Governing Law</h2>
                <div className="space-y-4 text-ink/80 text-base leading-relaxed">
                  <p>These Terms are governed by and construed in accordance with the laws of the Islamic Republic of Pakistan. Any disputes arising from these Terms or your use of the Platform shall be subject to the exclusive jurisdiction of the courts of Lahore, Punjab, Pakistan.</p>
                  <p>If any provision of these Terms is found to be unenforceable under applicable law, that provision will be modified to the minimum extent necessary to make it enforceable, and the remaining provisions will continue in full force and effect.</p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="changes" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">17. Changes to Terms</h2>
                <div className="space-y-4 text-ink/80 text-base leading-relaxed">
                  <p>Multan Connect reserves the right to modify these Terms at any time. When we make material changes, we will notify registered users via email and display a prominent notice on the Platform for at least 30 days before the changes take effect.</p>
                  <p>Your continued use of the Platform after the effective date of updated Terms constitutes your acceptance of the revised Terms. If you do not agree to the updated Terms, you must stop using the Platform and may close your account.</p>
                  <p>We maintain an archive of previous versions of these Terms. You may request a previous version by contacting support@multanconnect.com.</p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="contact" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">18. Contact</h2>
                <p className="text-ink/80 text-base leading-relaxed mb-6">For questions about these Terms of Service, contact us:</p>
                
                <div className="bg-navy/5 border border-navy/10 rounded-2xl p-8 space-y-4">
                  {[
                    { label: "Legal Inquiries", value: "legal@multanconnect.com", href: "mailto:legal@multanconnect.com" },
                    { label: "General Support", value: "support@multanconnect.com", href: "mailto:support@multanconnect.com" },
                    { label: "Address", value: "Multan Connect, Lahore, Punjab, Pakistan", href: null },
                  ].map(item => (
                    <div key={item.label} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                      <span className="text-sm tracking-wider uppercase font-bold text-navy/60 w-40 flex-shrink-0">{item.label}</span>
                      {item.href
                        ? <a href={item.href} className="text-base font-medium text-gold hover:underline">{item.value}</a>
                        : <span className="text-base text-navy font-medium">{item.value}</span>
                      }
                    </div>
                  ))}
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
                    <Link to="/privacy" className="text-sm font-medium text-muted-foreground hover:text-gold transition-colors">
                      Privacy Policy →
                    </Link>
                    <Link to="/sustainability" className="text-sm font-medium text-muted-foreground hover:text-gold transition-colors">
                      Sustainability Commitment →
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
