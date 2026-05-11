import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Mail, MapPin, Clock, ExternalLink } from 'lucide-react';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { BackButton } from '@/components/shared/BackButton';
import ContactForm from '@/components/contact/ContactForm';

const contactChannels = [
  {
    icon: "💬",
    title: "General Support",
    description: "Questions about orders, products, or your account",
    action: "support@multanconnect.com",
    actionLabel: "Email Support",
    responseTime: "We reply within 24 hours",
    href: "mailto:support@multanconnect.com",
    borderColor: "border-gold"
  },
  {
    icon: "🏪",
    title: "Seller & Artisan Help",
    description: "Help with your shop, listings, payouts, or verification",
    action: "sellers@multanconnect.com",
    actionLabel: "Email Seller Team",
    responseTime: "We reply within 12 hours",
    href: "mailto:sellers@multanconnect.com",
    borderColor: "border-teal-600"
  },
  {
    icon: "🤝",
    title: "Partnerships & Press",
    description: "Collaborations, media inquiries, institutional partnerships",
    action: "hello@multanconnect.com",
    actionLabel: "Email Partnerships",
    responseTime: "We reply within 48 hours",
    href: "mailto:hello@multanconnect.com",
    borderColor: "border-navy"
  }
];

const quickFaqs = [
  {
    q: "Where is my order?",
    a: "Log in and go to Orders to track your order status in real-time. If your order shows as Shipped, contact the seller directly via the messaging feature for a tracking number."
  },
  {
    q: "How do I become a verified artisan?",
    a: "After setting up your seller account and shop, email sellers@multanconnect.com with your craft details and workshop location. Our team will schedule a verification call within 3 business days."
  },
  {
    q: "Can I return or exchange a product?",
    a: "Yes. If a product arrives significantly different from its listing, contact support within 7 days of delivery. We resolve all disputes within 48 hours. Photos of the received item will be required."
  },
  {
    q: "How long does delivery take?",
    a: "Within Pakistan: 3–5 business days. International orders: 10–15 business days. Delivery times may vary during peak seasons. Sellers package fragile items like Blue Pottery with extra protective materials."
  }
];

export default function Contact() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Contact Us | Multan Connect";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Get in touch with the Multan Connect team. We're here to help buyers, sellers, and artisans with any questions, support, or partnership inquiries.");
    }
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      {/* Section 1 — Hero */}
      <section className="bg-navy py-24 px-4 text-center relative overflow-hidden">
        {/* Arabesque pattern background */}
        <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] mix-blend-overlay"></div>

        <AnimatedSection className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          <BackButton className="mb-8" />
          
          <span className="text-gold uppercase tracking-[0.2em] text-xs font-bold block mb-4">
            We're Here to Help
          </span>

          <h1 className="font-serif text-5xl md:text-6xl text-white leading-tight">
            Contact Us
          </h1>

          <p className="text-white/70 text-lg md:text-xl mt-6 max-w-xl mx-auto leading-relaxed font-light">
            Whether you're a buyer, an artisan, or a partner — 
            our team is ready to help you.
          </p>
        </AnimatedSection>
      </section>

      {/* Section 2 — Contact Cards Row */}
      <section className="bg-cream py-24 px-4 -mt-10 relative z-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {contactChannels.map((channel, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <div className={`bg-white rounded-2xl p-8 border-t-4 ${channel.borderColor} shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full`}>
                <span className="text-4xl block mb-4">{channel.icon}</span>
                <h3 className="font-serif text-2xl text-navy mb-3">{channel.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                  {channel.description}
                </p>
                <div className="mt-8 pt-6 border-t border-border/50">
                  <a href={channel.href} className="text-gold font-bold text-sm hover:underline flex items-center gap-1 group">
                    {channel.actionLabel}
                    <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                  </a>
                  <p className="text-muted-foreground text-xs mt-2">{channel.responseTime}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Section 3 — Main Contact Form + Info Side by Side */}
      <section className="bg-white py-24 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.5fr_1fr] gap-16 lg:gap-24">
          
          {/* Left — Contact Form */}
          <AnimatedSection delay={0.2}>
            <div className="mb-8">
              <h2 className="font-serif text-3xl text-navy">Send a Message</h2>
              <p className="text-muted-foreground mt-2">Fill out the form below and we'll get back to you.</p>
            </div>
            <ContactForm />
          </AnimatedSection>

          {/* Right — Contact Information Panel */}
          <AnimatedSection delay={0.4}>
            <div className="space-y-10">
              {/* Heading */}
              <div>
                <h2 className="font-serif text-3xl text-navy">Get in Touch</h2>
                <p className="text-muted-foreground mt-3 leading-relaxed text-sm">
                  Our team is based in Lahore and Multan, Pakistan. 
                  We're available Saturday through Thursday, 9am–6pm PKT.
                </p>
              </div>

              {/* Contact details list */}
              <div className="space-y-6">
                
                {/* WhatsApp — primary CTA */}
                <a href="https://wa.me/923001234567"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="flex items-center gap-4 p-5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl hover:bg-[#D1FAE5] transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-[#10B981] flex items-center justify-center flex-shrink-0 shadow-sm shadow-[#10B981]/20">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.859L.054 23.486a.75.75 0 00.921.921l5.628-1.478A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.522-5.204-1.43l-.374-.22-3.882 1.018 1.018-3.882-.22-.374A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[#065F46] text-sm mb-1 uppercase tracking-wider">WhatsApp Support</p>
                    <p className="text-[#059669] text-sm">+92 300 123 4567 <br/><span className="text-xs opacity-80">Usually replies in minutes</span></p>
                  </div>
                  <ExternalLink size={18} className="text-[#34D399] ml-auto group-hover:text-[#059669] transition-colors" />
                </a>

                {/* Email */}
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Mail size={20} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-navy uppercase tracking-wider mb-1">Email</p>
                    <a href="mailto:support@multanconnect.com" 
                       className="text-muted-foreground text-sm hover:text-gold transition-colors">
                      support@multanconnect.com
                    </a>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-navy uppercase tracking-wider mb-1">Based In</p>
                    <p className="text-muted-foreground text-sm">Multan & Lahore, Punjab, Pakistan</p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Clock size={20} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-navy uppercase tracking-wider mb-1">Support Hours</p>
                    <p className="text-muted-foreground text-sm">Sat – Thu · 9:00 AM – 6:00 PM PKT</p>
                    <p className="text-muted-foreground text-xs opacity-80 mt-1">Friday: Closed</p>
                  </div>
                </div>

              </div>

              {/* Divider */}
              <div className="w-full h-px bg-border max-w-sm" />

              {/* Social links */}
              <div>
                <p className="text-sm font-bold text-navy mb-4 uppercase tracking-wider">Follow Us</p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: "Instagram", href: "https://instagram.com/multanconnect", icon: "📷" },
                    { label: "Facebook", href: "https://facebook.com/multanconnect", icon: "📘" },
                    { label: "LinkedIn", href: "https://linkedin.com/company/multanconnect", icon: "💼" },
                  ].map(social => (
                    <a key={social.label}
                       href={social.href}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-center gap-2 text-sm text-muted-foreground border border-border/50 bg-cream/50 rounded-lg px-4 py-2 hover:border-gold hover:text-gold transition-colors duration-200">
                      <span>{social.icon}</span>
                      {social.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Embedded Google Maps iframe */}
              <div className="rounded-xl overflow-hidden border border-border/50 h-[240px] shadow-sm">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d109602.6896298744!2d71.41719!3d30.19679!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x393b5c1f3cb43077%3A0x4cfa5d86d20f1f7d!2sMultan%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Multan, Pakistan map"
                />
              </div>

            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Section 4 — FAQ Strip */}
      <section className="bg-cream py-32 px-4 border-t border-border/20">
        <AnimatedSection className="max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-navy text-center mb-12">
            Quick Answers
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-4 md:p-8">
            {quickFaqs.map((faq, i) => (
              <div key={i} className="border-b border-border/50 last:border-0">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-6 text-left group"
                >
                  <span className="font-medium text-navy text-base md:text-lg group-hover:text-gold transition-colors">{faq.q}</span>
                  <ChevronDown 
                    size={20} 
                    className={`text-gold flex-shrink-0 transition-transform duration-300 ml-4 
                                ${openFaq === i ? "rotate-180" : ""}`} 
                  />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="text-muted-foreground text-sm md:text-base leading-relaxed pb-6 pt-2">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* Section 5 — Bottom CTA */}
      <section className="bg-navy py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] mix-blend-overlay"></div>
        <AnimatedSection className="relative z-10 w-full">
          <h2 className="font-serif text-3xl md:text-4xl text-white">
            Still have questions?
          </h2>
          <p className="text-white/70 mt-6 max-w-md mx-auto text-base leading-relaxed font-light">
            Our support team is available 6 days a week. 
            We're real people who genuinely care about your experience.
          </p>
          <a href="https://wa.me/923001234567"
             target="_blank"
             rel="noopener noreferrer"
             className="inline-flex items-center gap-3 mt-10 bg-[#10B981] hover:bg-[#059669] text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-[#10B981]/20 hover:-translate-y-1">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.859L.054 23.486a.75.75 0 00.921.921l5.628-1.478A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.522-5.204-1.43l-.374-.22-3.882 1.018 1.018-3.882-.22-.374A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            Chat on WhatsApp
          </a>
        </AnimatedSection>
      </section>
    </div>
  );
}
