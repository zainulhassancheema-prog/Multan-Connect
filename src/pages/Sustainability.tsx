import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { Plus, Minus } from 'lucide-react';

const pillars = [
  {
    icon: "🏺",
    title: "Preserving Living Heritage",
    color: "border-gold",
    content: `Blue Pottery (Kashigari) and Khussa-making are not museum artifacts — 
    they are living, breathing traditions practiced by master artisans in Multan today. 
    Multan Connect exists to ensure these crafts survive not as nostalgia, but as 
    viable livelihoods for the next generation. Every product sold funds a craftsman's 
    decision to teach their child the trade.`
  },
  {
    icon: "⚖️",
    title: "Fair & Transparent Trade",
    color: "border-teal",
    content: `We charge only a 15% platform fee — far below global marketplace norms — 
    so artisans keep 85% of every sale. Prices are set by the artisans themselves. 
    We never negotiate their craft down. We never allow bulk discount pressure. 
    Every price tag reflects the true value of human skill and time.`
  },
  {
    icon: "🌿",
    title: "Natural & Low-Impact Materials",
    color: "border-navy",
    content: `Multan's traditional crafts are inherently sustainable. Blue Pottery uses 
    natural quartz, glass, and earth-based mineral pigments — no synthetic dyes, 
    no plastics, no industrial chemicals. Khussa leather is sourced locally. 
    Thread and embroidery materials are natural fiber. We encourage and verify 
    artisans' use of traditional material sourcing.`
  },
  {
    icon: "👐",
    title: "Community Empowerment",
    content: `We actively partner with the Institute of Blue Pottery Development (IBPD) 
    in Mumtazabad and the Ustad Alam Institute on Bahawalpur Road to onboard new 
    artisans, offer digital literacy support, and help craftsmen photograph and 
    list their work. We prioritize onboarding women artisans from Multan's 
    embroidery community who have historically lacked market access.`,
    color: "border-gold"
  }
];

const policies = [
  {
    icon: "🚫",
    title: "No Factory-Made Products",
    body: "Every product listed on Multan Connect must be handmade by the seller themselves or their workshop team. We reserve the right to remove any listing suspected of being factory-produced. Buyers can report suspicious listings."
  },
  {
    icon: "✅",
    title: "Verified Artisan Program",
    body: "Sellers who complete our verification process receive a Verified Artisan badge. Verification includes a video call with our team, workshop location confirmation, and a sample product review. Verified artisans get priority placement in search results."
  },
  {
    icon: "🔄",
    title: "Buyer Protection Policy",
    body: "If a product arrives significantly different from its listing, we offer a full refund within 7 days of delivery. Disputes are resolved by our team within 48 hours. Artisan reputation scores are impacted by disputes to maintain quality."
  },
  {
    icon: "📦",
    title: "Sustainable Packaging Encouraged",
    body: "We encourage all sellers to use recycled, biodegradable, or reused packaging materials. Sellers who commit to sustainable packaging receive a green packaging badge on their shop profile."
  },
  {
    icon: "👩",
    title: "Women Artisan Initiative",
    body: "We actively recruit and support women artisans from Multan's embroidery community. Women-owned shops receive zero platform fees for their first 6 months and priority onboarding support from our team."
  },
  {
    icon: "📚",
    title: "Digital Literacy Support",
    body: "We partner with local institutes to offer free workshops helping artisans photograph products, write descriptions, and manage their online shop. Because great craft deserves great presentation."
  }
];

const partners = [
  {
    name: "Institute of Blue Pottery Development",
    location: "Mumtazabad, Multan",
    description: "Government-backed institute training the next generation of Kashigari artisans"
  },
  {
    name: "Ustad Alam Institute of Blue Pottery",
    location: "Bahawalpur Road, Multan",
    description: "Home of master artisan Ustad Muhammad Alam, renowned for traditional Kashigari"
  },
  {
    name: "Hussain Agahi Bazaar Association",
    location: "Old City, Multan",
    description: "One of Multan's oldest markets, representing generations of Khussa craftsmen"
  },
  {
    name: "Ghanta Ghar Market Guild",
    location: "Clock Tower, Multan",
    description: "Hub of established Khussa outlets and traditional footwear workshops"
  }
];

const faqs = [
  {
    q: "How do you verify products are actually handmade?",
    a: "All sellers go through a registration process where they describe their craft and workshop. Verified Artisan sellers undergo a video call and sample review. Buyers can report listings that appear factory-made and our team investigates within 48 hours."
  },
  {
    q: "What percentage of my purchase goes to the artisan?",
    a: "85% of every sale goes directly to the artisan. Multan Connect retains a 15% platform fee which covers payment processing, platform maintenance, and seller support services."
  },
  {
    q: "Are the materials used in Blue Pottery safe and natural?",
    a: "Yes. Traditional Kashigari uses a unique body of powdered quartz, glass, Multani clay, and natural gum. Pigments are mineral-based — the iconic cobalt blue comes from natural lapis. No synthetic dyes or industrial chemicals are used in authentic pieces."
  },
  {
    q: "How long does it take to make a Khussa pair?",
    a: "A basic Khussa pair takes 4-6 hours to complete. Heavily embroidered bridal or ceremonial pairs with gold and silver thread work can take 10-15 hours or more. This handwork is reflected in the pricing."
  },
  {
    q: "Can I visit the artisans in Multan?",
    a: "Many of our artisans welcome visitors to their workshops. You can contact any verified artisan through the messaging feature to arrange a visit to Hussain Agahi Bazaar, Ghanta Ghar, Mumtazabad, or Bahawalpur Road."
  },
  {
    q: "Does Multan Connect ship internationally?",
    a: "Yes. All products can be shipped internationally. International delivery typically takes 10-15 business days and incurs a flat PKR 1,500 shipping fee. Artisans carefully package fragile items like Blue Pottery with protective materials."
  }
];

// Reusable Counter component using Framer motion
function AnimatedCounter({ value, label, delay = 0 }: { value: string, label: string, delay?: number }) {
  return (
    <AnimatedSection delay={delay} className="flex flex-col items-center">
      <span className="font-serif text-5xl md:text-6xl text-navy font-bold">{value}</span>
      <span className="text-muted-foreground text-sm mt-3 leading-snug max-w-[140px] uppercase tracking-widest">{label}</span>
    </AnimatedSection>
  );
}

function FaqItem({ faq }: { faq: typeof faqs[0] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none"
      >
        <span className="font-serif text-xl md:text-2xl text-navy">{faq.q}</span>
        <span className="text-gold ml-4 flex-shrink-0">
          {isOpen ? <Minus size={20} /> : <Plus size={20} />}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="text-ink/70 text-base leading-relaxed pb-8 pt-2">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Sustainability() {
  useEffect(() => {
    document.title = "Sustainability & Our Commitment | Multan Connect";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "How Multan Connect supports ethical trade, preserves 400-year-old craft traditions, empowers artisan communities, and champions sustainable handmade production.");
    }
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      {/* Section 1 — Hero */}
      <section className="bg-navy min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-32 relative overflow-hidden">
        {/* Arabesque SVG pattern background */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] mix-blend-overlay"></div>

        <AnimatedSection className="relative z-10 flex flex-col items-center max-w-4xl">
          {/* Gold label */}
          <span className="text-gold uppercase tracking-[0.2em] text-xs font-bold mb-6 block">
            Our Commitment
          </span>

          {/* Main heading */}
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-white max-w-4xl leading-[1.1]">
            Craft That Cares for
            <span className="text-gold italic"> People </span>
            and Planet
          </h1>

          {/* Subtext */}
          <p className="text-white/70 text-lg md:text-xl mt-8 max-w-2xl leading-relaxed font-light">
            Every purchase on Multan Connect is a vote for slow craft, fair wages, 
            and the survival of a 400-year-old living heritage.
          </p>

          {/* Gold divider */}
          <div className="w-20 h-[2px] bg-gold mt-12 shadow-[0_0_15px_rgba(201,151,58,0.3)]" />
        </AnimatedSection>
      </section>

      {/* Section 2 — Impact Numbers */}
      <section className="bg-cream py-24 px-4 border-b border-border/10">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          <AnimatedCounter delay={0} value="400+" label="Years of Craft Heritage Preserved" />
          <AnimatedCounter delay={0.1} value="100%" label="Handmade by Real Artisans" />
          <AnimatedCounter delay={0.2} value="0" label="Factory-Made Products on Platform" />
          <AnimatedCounter delay={0.3} value="85%" label="Of Every Sale Goes to the Artisan" />
        </div>
      </section>

      {/* Section 3 — Our Four Pillars */}
      <section className="bg-white py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <h2 className="font-serif text-4xl md:text-5xl text-navy">What We Stand For</h2>
            <p className="text-muted-foreground mt-4 text-lg">The foundation of our ethical marketplace.</p>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-2 gap-8">
            {pillars.map((pillar, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                {/* Fixed border color classes to fit our Tailwind setup where gold is standard string, replacing dynamic class rendering to ensure tailwind picks it up */}
                <div className="bg-cream/50 rounded-2xl p-10 border-t-4 border-gold shadow-sm hover:shadow-lg transition-all duration-300 h-full">
                  <span className="text-5xl block mb-6">{pillar.icon}</span>
                  <h3 className="font-serif text-3xl text-navy mb-4">{pillar.title}</h3>
                  <p className="text-ink/70 text-base leading-relaxed">{pillar.content}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 — The Craft Process */}
      <section className="bg-navy py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <AnimatedSection className="text-center mb-24">
            <h2 className="font-serif text-4xl md:text-5xl text-white">Slow Craft. Intentional Making.</h2>
            <div className="w-16 h-px bg-gold mx-auto mt-8 opacity-50" />
          </AnimatedSection>

          {/* Blue Pottery Section */}
          <AnimatedSection className="flex flex-col lg:flex-row items-center gap-16 mb-32" delay={0.2}>
            <div className="w-full lg:w-1/2 aspect-square lg:aspect-auto lg:h-[500px] rounded-2xl overflow-hidden bg-white/5 relative flex items-center justify-center">
              {/* Optional Placeholder / Real Image */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 to-teal-900/20 mix-blend-overlay"></div>
              <img src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1000&auto=format&fit=crop" alt="Artisan hand-painting intricate arabesque patterns onto Multani blue pottery" className="w-full h-full object-cover" />
            </div>
            <div className="w-full lg:w-1/2 text-white">
              <span className="text-gold uppercase tracking-[0.2em] text-xs font-bold mb-4 block">Blue Pottery · Kashigari</span>
              <h3 className="font-serif text-4xl mb-6">Made from Earth. Painted by Hand.</h3>
              <p className="text-white/70 text-lg leading-relaxed mb-10 font-light">
                Traditional Multani Blue Pottery begins with a unique body made from 
                powdered quartz stone, glass, Multani clay, and gum. Unlike conventional 
                pottery, it contains no clay from the earth — making it a rare art form 
                globally. Each piece is hand-thrown, sun-dried, hand-painted using natural 
                mineral pigments, then kiln-fired at precise temperatures. The cobalt blue 
                that defines Kashigari comes from natural lapis — a mineral used since 
                the Mughal era. No two pieces are identical. Each carries the fingerprint 
                of the artisan who made it.
              </p>
              
              {/* Process steps */}
              <div className="flex items-center gap-3 flex-wrap">
                {["Mix Quartz Body", "Hand Throw", "Sun Dry", "Paint by Hand", "Kiln Fire", "Quality Check"].map((step, i, arr) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs bg-gold/20 text-gold px-4 py-2 rounded-full font-medium tracking-wide">{step}</span>
                    {i < arr.length - 1 && <span className="text-gold/40">→</span>}
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Khussa Section */}
          <AnimatedSection className="flex flex-col-reverse lg:flex-row items-center gap-16" delay={0.2}>
            <div className="w-full lg:w-1/2 text-white">
              <span className="text-gold uppercase tracking-[0.2em] text-xs font-bold mb-4 block">Khussa · Traditional Footwear</span>
              <h3 className="font-serif text-4xl mb-6">Cut by Hand. Stitched with Patience.</h3>
              <p className="text-white/70 text-lg leading-relaxed mb-10 font-light">
                A single pair of Khussa can take anywhere from 4 to 12 hours to 
                complete depending on the embroidery complexity. Leather is sourced locally 
                from Multan's tanneries, cut by hand using traditional pattern templates 
                passed down through generations. The embroidery — using silk, gold, and 
                silver threads — is entirely handstitched, with no machine involvement. 
                Artisans in Hussain Agahi Bazaar and Ghanta Ghar market have been 
                perfecting this craft for over 300 years.
              </p>
              
              {/* Process steps */}
              <div className="flex items-center gap-3 flex-wrap">
                {["Source Leather", "Cut by Hand", "Shape Last", "Hand Embroider", "Stitch Sole", "Polish"].map((step, i, arr) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs bg-gold/20 text-gold px-4 py-2 rounded-full font-medium tracking-wide">{step}</span>
                    {i < arr.length - 1 && <span className="text-gold/40">→</span>}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full lg:w-1/2 aspect-square lg:aspect-auto lg:h-[500px] rounded-2xl overflow-hidden bg-white/5 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-900/40 to-red-900/20 mix-blend-overlay z-10"></div>
              <img src="https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=1000&auto=format&fit=crop" alt="Artisan hand-stitching and completing traditional leather Khussa shoes" className="w-full h-full object-cover" />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Section 5 — Our Policies */}
      <section className="bg-cream py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <h2 className="font-serif text-4xl md:text-5xl text-navy">Our Commitments to You</h2>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {policies.map((policy, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow h-full border border-border/50">
                  <span className="text-4xl block mb-4">{policy.icon}</span>
                  <h4 className="font-serif text-2xl text-navy mb-3">{policy.title}</h4>
                  <p className="text-ink/70 text-base leading-relaxed">{policy.body}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6 — Environmental Commitment */}
      <section className="bg-white py-32 px-4 shadow-sm relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <AnimatedSection>
            <h2 className="font-serif text-5xl text-navy mb-4">Our Footprint</h2>
            <p className="font-serif italic text-gold text-2xl mb-16">
              "Traditional craft is the original sustainable manufacturing."
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-12 text-left">
            <AnimatedSection delay={0.1}>
              <div className="text-4xl mb-6 text-center md:text-left">🌍</div>
              <h4 className="font-sans font-bold uppercase tracking-widest text-sm text-navy mb-4 text-center md:text-left">Carbon Footprint</h4>
              <p className="text-ink/70 leading-relaxed">
                Handmade production generates a fraction of the carbon footprint of factory manufacturing. We offset platform server emissions through certified programs.
              </p>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="text-4xl mb-6 text-center md:text-left">🌱</div>
              <h4 className="font-sans font-bold uppercase tracking-widest text-sm text-navy mb-4 text-center md:text-left">Materials</h4>
              <p className="text-ink/70 leading-relaxed">
                Natural earth pigments, local leather, silk, and cotton thread — no synthetic materials required for verified artisan status.
              </p>
            </AnimatedSection>
            <AnimatedSection delay={0.3}>
              <div className="text-4xl mb-6 text-center md:text-left">♻️</div>
              <h4 className="font-sans font-bold uppercase tracking-widest text-sm text-navy mb-4 text-center md:text-left">Packaging</h4>
              <p className="text-ink/70 leading-relaxed">
                We are building toward 100% plastic-free packaging across all sellers by 2026. Join our green packaging pledge.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Section 7 — Partnership Section */}
      <section className="bg-navy py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <AnimatedSection className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-white">Partners in Preservation</h2>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-2 gap-6">
            {partners.map((partner, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="border border-white/20 rounded-2xl p-8 hover:border-gold/50 transition-colors bg-white/5 backdrop-blur-sm h-full">
                  <p className="text-gold text-xs uppercase tracking-[0.2em] font-bold mb-2">{partner.location}</p>
                  <h4 className="font-serif text-white text-2xl mb-3">{partner.name}</h4>
                  <p className="text-white/60 text-base leading-relaxed">{partner.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Section 9 — FAQ Accordion */}
      <section className="bg-white py-32 px-4">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-navy">Frequently Asked Questions</h2>
          </AnimatedSection>

          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <FaqItem faq={faq} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8 — Call to Action */}
      <section className="bg-cream py-32 px-4 text-center border-t border-border/20">
        <AnimatedSection className="max-w-3xl mx-auto">
          <span className="text-gold uppercase tracking-[0.2em] text-xs font-bold block mb-6">
            Join the Movement
          </span>
          
          <h2 className="font-serif text-4xl md:text-5xl text-navy max-w-2xl mx-auto leading-tight mb-8">
            Every Purchase is an Act of Preservation
          </h2>
          
          <p className="text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed mb-12">
            When you buy from Multan Connect, you are not just buying a product. 
            You are paying a craftsman's rent, funding a child's education, 
            and keeping a 400-year-old tradition alive for another generation.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/explore"
                  className="bg-gold hover:bg-gold-light text-white px-10 py-4 
                            rounded-xl font-bold transition-all shadow-lg shadow-gold/20 hover:shadow-xl hover:-translate-y-1">
              Shop Handmade Crafts
            </Link>
            <Link to="/stories"
                  className="bg-white border-2 border-navy text-navy hover:bg-navy hover:text-white 
                            px-10 py-4 rounded-xl font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
              Read Artisan Stories
            </Link>
          </div>
        </AnimatedSection>
      </section>

    </div>
  );
}
