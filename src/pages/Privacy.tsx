import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Shield, Mail, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedSection from '@/components/shared/AnimatedSection';
import { BackButton } from '@/components/shared/BackButton';

const sections = [
  { id: "introduction", label: "1. Introduction" },
  { id: "information-we-collect", label: "2. Information We Collect" },
  { id: "how-we-collect", label: "3. How We Collect Information" },
  { id: "how-we-use", label: "4. How We Use Your Information" },
  { id: "sharing", label: "5. Sharing Your Information" },
  { id: "data-storage", label: "6. Data Storage & Security" },
  { id: "cookies", label: "7. Cookies & Tracking" },
  { id: "your-rights", label: "8. Your Rights & Choices" },
  { id: "children", label: "9. Children's Privacy" },
  { id: "third-party", label: "10. Third-Party Services" },
  { id: "firebase", label: "11. Firebase & Google Services" },
  { id: "retention", label: "12. Data Retention" },
  { id: "changes", label: "13. Changes to This Policy" },
  { id: "contact", label: "14. Contact Us" },
];

const dataCategories = [
  {
    category: "Account Information",
    icon: "👤",
    items: [
      "Full name or display name",
      "Email address",
      "Profile photo (if uploaded or via Google Sign-In)",
      "Phone number (optional, provided during profile setup)",
      "Password (stored as a secure hash — we never store plaintext passwords)",
    ]
  },
  {
    category: "Shop Information (Sellers Only)",
    icon: "🏪",
    items: [
      "Shop name and shop handle (public URL slug)",
      "Shop description and tagline",
      "Craft type and workshop location in Multan",
      "Shop logo and banner photos",
      "Bank account or mobile payment details (for payouts)",
      "Product listings: titles, descriptions, prices, photographs",
    ]
  },
  {
    category: "Transaction Information",
    icon: "🛒",
    items: [
      "Orders placed: products, quantities, prices",
      "Shipping address: name, street, city, province, postal code",
      "Payment method selected (COD or card)",
      "Order status history",
    ]
  },
  {
    category: "Communication Information",
    icon: "💬",
    items: [
      "Messages sent through the Platform's buyer-seller chat system",
      "Contact form submissions",
      "Review and rating content",
      "Replies to reviews",
    ]
  },
];

const uses = [
  {
    icon: "⚙️",
    title: "Operating the Platform",
    body: "Creating and managing your account, processing orders, facilitating payments, enabling buyer-seller communication, and displaying your shop and product listings to other users."
  },
  {
    icon: "🔒",
    title: "Security & Fraud Prevention",
    body: "Detecting and preventing fraudulent transactions, unauthorized account access, fake reviews, and prohibited listings. Verifying seller identity for the Verified Artisan program."
  },
  {
    icon: "📦",
    title: "Order Fulfillment",
    body: "Sharing your shipping address with the seller to fulfill your order. Sending you order confirmation, status updates, and delivery notifications."
  },
  {
    icon: "🛠️",
    title: "Platform Improvement",
    body: "Analyzing usage patterns to improve features, fix bugs, optimize performance, and develop new services that better serve our artisan and buyer communities."
  },
  {
    icon: "📧",
    title: "Communications",
    body: "Sending transactional emails (order confirmations, receipts, password resets). Sending service announcements. Sending optional marketing emails only if you have opted in."
  },
  {
    icon: "⚖️",
    title: "Legal Compliance",
    body: "Complying with applicable Pakistani laws and regulations. Responding to lawful requests from government authorities. Enforcing our Terms of Service and resolving disputes."
  },
  {
    icon: "⭐",
    title: "Reviews & Trust",
    body: "Publishing your reviews and ratings on product pages and artisan profiles to help the community make informed purchasing decisions."
  },
  {
    icon: "📊",
    title: "Seller Analytics",
    body: "Providing sellers with aggregated analytics about their shop performance, product views, order volume, and revenue — using only their own shop data."
  },
];

const sharingParties = [
  {
    party: "Other Users (Buyers & Sellers)",
    what: "When you place an order, your shipping name, address, and phone number are shared with the seller to fulfill your order. Your public profile information (display name, profile photo) is visible to other users. Your shop name, listings, and reviews are publicly visible if you are a seller.",
    why: "Essential for marketplace operations"
  },
  {
    party: "Firebase / Google",
    what: "All Platform data is stored on Firebase, a Google Cloud product. Google processes this data as our data processor under their terms. Firebase stores user authentication data, Firestore database content, and Storage files.",
    why: "Infrastructure provider"
  },
  {
    party: "Payment Processors",
    what: "For card payments, payment data is processed by our payment provider. We do not store your full card number on our servers. For Cash on Delivery orders, no payment data is transmitted electronically.",
    why: "Payment processing"
  },
  {
    party: "Law Enforcement / Legal Authorities",
    what: "We may disclose your information if required by Pakistani law, court order, or lawful government request, or if we believe disclosure is necessary to protect the rights, safety, or property of Multan Connect, our users, or the public.",
    why: "Legal compliance"
  },
  {
    party: "Business Transfers",
    what: "If Multan Connect undergoes a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you via email before your data is transferred and becomes subject to a different privacy policy.",
    why: "Business continuity"
  },
];

const cookieTypes = [
  {
    name: "Authentication Cookie",
    provider: "Firebase Auth",
    purpose: "Keeps you logged in across browser sessions. Without this cookie you would need to log in every time you visit.",
    duration: "Until you sign out or 30 days",
    canDisable: false,
    required: true
  },
  {
    name: "Guest Cart",
    provider: "Browser localStorage",
    purpose: "Stores items you add to your cart before logging in, so your cart is preserved.",
    duration: "Until you clear browser data",
    canDisable: false,
    required: true
  },
  {
    name: "Preferences",
    provider: "Browser localStorage",
    purpose: "Remembers your preferences such as dark mode setting.",
    duration: "Until you clear browser data",
    canDisable: true,
    required: false
  },
  {
    name: "Analytics",
    provider: "Firebase Analytics",
    purpose: "Collects anonymized usage data to help us understand how users interact with the Platform and improve our features.",
    duration: "Session + 2 years",
    canDisable: true,
    required: false
  },
];

const rights = [
  {
    icon: "👁️",
    right: "Right to Access",
    description: "You can view all personal information associated with your account by visiting your Profile page. You may also request a full export of your data by emailing privacy@multanconnect.com."
  },
  {
    icon: "✏️",
    right: "Right to Correct",
    description: "You can update your name, email, phone number, profile photo, and shop details at any time through your Profile and Shop Settings pages."
  },
  {
    icon: "🗑️",
    right: "Right to Delete",
    description: "You can request deletion of your account and all associated personal data by going to Settings → Account → Delete Account, or by emailing privacy@multanconnect.com. Note: completed order records may be retained for legal and financial compliance purposes for up to 5 years."
  },
  {
    icon: "📤",
    right: "Right to Data Portability",
    description: "You may request an export of your personal data in a machine-readable format (JSON) by emailing privacy@multanconnect.com. We will fulfill your request within 14 business days."
  },
  {
    icon: "🚫",
    right: "Right to Opt Out of Marketing",
    description: "You can unsubscribe from marketing emails at any time by clicking the unsubscribe link in any email we send, or by updating your notification preferences in Settings. Transactional emails (order confirmations, password resets) cannot be disabled."
  },
  {
    icon: "⏸️",
    right: "Right to Restrict Processing",
    description: "If you believe we are processing your data incorrectly, you may contact us at privacy@multanconnect.com to request that we restrict processing while we investigate your concern."
  },
];

const thirdParties = [
  {
    name: "Google Firebase",
    purpose: "Authentication, database (Firestore), file storage (Storage), and analytics",
    policy: "https://firebase.google.com/support/privacy",
    policyLabel: "Firebase Privacy"
  },
  {
    name: "Google Sign-In",
    purpose: "Optional login method using your existing Google account",
    policy: "https://policies.google.com/privacy",
    policyLabel: "Google Privacy Policy"
  },
  {
    name: "Google Maps",
    purpose: "Embedded map on the Contact Us page showing Multan location",
    policy: "https://policies.google.com/privacy",
    policyLabel: "Google Privacy Policy"
  },
  {
    name: "Vercel",
    purpose: "Web hosting and content delivery for the Multan Connect website",
    policy: "https://vercel.com/legal/privacy-policy",
    policyLabel: "Vercel Privacy Policy"
  },
];

const retentionPeriods = [
  { dataType: "Account Information", retention: "Until account deletion", notes: "Deleted within 30 days of account deletion request" },
  { dataType: "Order Records", retention: "5 years", notes: "Retained for financial and legal compliance" },
  { dataType: "Chat Messages", retention: "2 years", notes: "Or until account deletion, whichever comes first" },
  { dataType: "Product Listings", retention: "Until deleted by seller", notes: "Deleted listings are removed within 30 days" },
  { dataType: "Contact Form Submissions", retention: "2 years", notes: "Retained for support reference" },
  { dataType: "Reviews", retention: "Until account deletion", notes: "Reviews may be anonymized rather than deleted" },
  { dataType: "Analytics Data", retention: "26 months", notes: "Firebase Analytics default retention" },
  { dataType: "Crash Reports", retention: "90 days", notes: "Firebase Crashlytics default" },
];

export default function Privacy() {
  const [activeSection, setActiveSection] = useState<string>("introduction");
  const [tocOpen, setTocOpen] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    document.title = "Privacy Policy | Multan Connect";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Learn how Multan Connect collects, uses, and protects your personal information. Your privacy matters to us.");
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
          Your Privacy Matters
        </span>
        <h1 className="font-serif text-5xl text-white mt-4">Privacy Policy</h1>
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
                  We collect your name, email, and usage data to operate the Multan Connect 
                  marketplace. We use Firebase (by Google) to store your data securely. 
                  We never sell your personal information to third parties. You can request 
                  deletion of your data at any time by contacting us. This policy applies 
                  to all users of the Multan Connect website and Android app.
                </p>
              </div>
            </AnimatedSection>

            {/* Sections */}
            <div className="space-y-16">
              
              <AnimatedSection id="introduction" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">1. Introduction</h2>
                <div className="space-y-4 text-ink/80 text-base leading-relaxed">
                  <p>Multan Connect ("we", "us", "our") operates the Multan Connect website at multanconnect.com and the Multan Connect Android application (collectively, the "Platform"). This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our Platform.</p>
                  <p>By creating an account or using the Platform, you agree to the collection and use of your information as described in this Privacy Policy. If you do not agree, please do not use the Platform.</p>
                  <p>This Privacy Policy applies to:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>All registered users (buyers and sellers)</li>
                    <li>Visitors who browse the Platform without an account</li>
                    <li>Artisans who create seller accounts and shop profiles</li>
                    <li>Any person who contacts us through our contact form or email</li>
                  </ul>
                  <p>This policy should be read alongside our Terms of Service, which governs your use of the Platform.</p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="information-we-collect" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">2. Information We Collect</h2>
                <div className="space-y-6">
                  <h3 className="font-serif text-xl text-navy mb-4">2.1 — Information You Provide Directly</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {dataCategories.map((cat, i) => (
                      <div key={i} className="bg-white rounded-xl p-6 border border-border/50 shadow-sm h-full">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-2xl">{cat.icon}</span>
                          <h4 className="font-bold text-navy text-sm uppercase tracking-wider">{cat.category}</h4>
                        </div>
                        <ul className="space-y-2">
                          {cat.items.map((item, j) => (
                            <li key={j} className="flex items-start gap-3 text-sm text-ink/80 leading-relaxed">
                              <span className="text-gold mt-1 flex-shrink-0 font-bold">·</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <h3 className="font-serif text-xl text-navy mt-10 mb-4">2.2 — Information Collected Automatically</h3>
                  <div className="space-y-4 text-ink/80 text-base leading-relaxed">
                    <p>When you use the Platform, we automatically collect certain technical information:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Device information: device type, operating system, browser type and version</li>
                      <li>IP address and approximate location (city/region level only)</li>
                      <li>Pages visited, features used, and time spent on the Platform</li>
                      <li>Product listings viewed and searches performed</li>
                      <li>Referring website or app that brought you to Multan Connect</li>
                      <li>Crash reports and error logs (for app stability)</li>
                    </ul>
                    <p>This information is collected to improve the Platform's performance, fix bugs, and understand how users interact with our features.</p>
                  </div>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="how-we-collect" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">3. How We Collect Information</h2>
                <div className="space-y-4 text-ink/80 text-base leading-relaxed">
                  <p>We collect information through the following methods:</p>
                  <p><strong className="text-navy">Direct Input:</strong> Information you provide when registering an account, setting up your seller shop, placing an order, writing a review, sending a message, or contacting our support team.</p>
                  <p><strong className="text-navy">Google Sign-In:</strong> When you choose to sign in with Google, we receive your name, email address, and profile photo from your Google account. We do not receive your Google password or any other Google account data.</p>
                  <p><strong className="text-navy">Firebase Services:</strong> Our Platform uses Firebase (a Google product) for authentication, database storage, and file storage. Firebase automatically collects certain usage and performance data. See Section 11 for details.</p>
                  <p><strong className="text-navy">Cookies and Local Storage:</strong> We use cookies and browser local storage to maintain your login session, remember your cart contents as a guest, and store your preferences such as dark mode settings. See Section 7 for full details.</p>
                  <p><strong className="text-navy">Contact Forms:</strong> When you submit our Contact Us form, we collect your name, email, and message content and store it in our Firestore database.</p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="how-we-use" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">4. How We Use Your Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {uses.map((use, i) => (
                    <div key={i} className="bg-white rounded-xl p-6 border border-border/50 shadow-sm h-full">
                      <span className="text-3xl block mb-3">{use.icon}</span>
                      <h4 className="font-bold text-navy text-sm uppercase tracking-wider mb-2">{use.title}</h4>
                      <p className="text-sm text-ink/80 leading-relaxed">{use.body}</p>
                    </div>
                  ))}
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="sharing" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">5. Sharing Your Information</h2>
                
                <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-6 mb-8 flex items-start gap-4">
                  <span className="text-[#059669] text-2xl flex-shrink-0 font-bold">✓</span>
                  <div>
                    <p className="font-bold text-[#065F46] text-base mb-1 uppercase tracking-wider">
                      We do not sell your personal data
                    </p>
                    <p className="text-[#059669] text-sm leading-relaxed">
                      Multan Connect does not sell, rent, or trade your personal 
                      information to any third party for their marketing purposes. Ever.
                    </p>
                  </div>
                </div>

                <div className="space-y-0">
                  {sharingParties.map((item, i) => (
                    <div key={i} className="border-b border-border/50 last:border-0 py-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-navy text-sm uppercase tracking-wider mb-2">{item.party}</h4>
                          <p className="text-sm text-ink/80 leading-relaxed">{item.what}</p>
                        </div>
                        <span className="text-xs font-bold bg-navy/5 text-navy px-3 py-1.5 rounded-full flex-shrink-0 whitespace-nowrap self-start">
                          {item.why}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="data-storage" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">6. Data Storage & Security</h2>
                <div className="space-y-4 text-ink/80 text-base leading-relaxed">
                  <p><strong className="text-navy">Where Data is Stored:</strong> All data is stored on Google Firebase servers. Firebase data centers are located in the United States and Belgium (Google Cloud regions). By using the Platform, you consent to your data being stored and processed in these locations.</p>
                  <p><strong className="text-navy">Security Measures:</strong> We implement the following security measures to protect your data:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Firebase Authentication handles all password hashing and session management using industry-standard security protocols</li>
                    <li>Firestore Security Rules restrict data access so users can only read and write their own data unless explicitly permitted</li>
                    <li>Firebase Storage Rules restrict file access to authorized users</li>
                    <li>All data is transmitted over HTTPS/TLS encryption</li>
                    <li>Seller financial information (bank details) is stored in Firestore with restricted read access — only the seller and admin accounts can access this data</li>
                    <li>We conduct periodic security reviews of our Firestore rules and Storage rules</li>
                  </ul>
                  <p>No system is 100% secure. While we implement strong protections, we cannot guarantee absolute security of your data. In the event of a data breach that affects your personal information, we will notify affected users via email within 72 hours of becoming aware of the breach.</p>
                </div>
              </AnimatedSection>
              
              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="cookies" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">7. Cookies & Tracking</h2>
                <div className="space-y-6 text-ink/80 text-base leading-relaxed">
                  <p><strong className="text-navy">What Are Cookies:</strong> Cookies are small text files stored on your device by your browser. We use cookies and similar technologies (browser localStorage) to operate the Platform.</p>
                  <p><strong className="text-navy">Cookies We Use:</strong></p>
                  
                  <div className="overflow-x-auto rounded-xl border border-border/50 shadow-sm bg-white">
                    <table className="w-full text-sm">
                      <thead className="bg-navy text-white">
                        <tr>
                          <th className="text-left p-4 font-bold tracking-wider uppercase text-xs">Cookie</th>
                          <th className="text-left p-4 font-bold tracking-wider uppercase text-xs">Provider</th>
                          <th className="text-left p-4 font-bold tracking-wider uppercase text-xs">Purpose</th>
                          <th className="text-left p-4 font-bold tracking-wider uppercase text-xs">Duration</th>
                          <th className="text-left p-4 font-bold tracking-wider uppercase text-xs">Required</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cookieTypes.map((cookie, i) => (
                          <tr key={i} className={`border-b border-border/20 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-cream/30"}`}>
                            <td className="p-4 font-medium text-navy">{cookie.name}</td>
                            <td className="p-4 text-muted-foreground text-xs">{cookie.provider}</td>
                            <td className="p-4 text-ink/80 text-xs leading-relaxed">{cookie.purpose}</td>
                            <td className="p-4 text-muted-foreground text-xs whitespace-nowrap">{cookie.duration}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                ${cookie.required 
                                  ? "bg-navy/10 text-navy" 
                                  : "bg-gray-100 text-muted-foreground"}`}>
                                {cookie.required ? "Required" : "Optional"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p><strong className="text-navy">Managing Cookies:</strong> You can control cookies through your browser settings. Disabling required cookies will prevent you from logging in and using core Platform features. Disabling optional cookies will not affect your ability to buy or sell on Multan Connect.</p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="your-rights" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">8. Your Rights & Choices</h2>
                <div className="space-y-6">
                  <p className="text-ink/80 text-base leading-relaxed">As a user of Multan Connect, you have the following rights regarding your personal data:</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {rights.map((rightItem, i) => (
                      <div key={i} className="bg-white rounded-xl p-6 border border-border/50 shadow-sm h-full">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">{rightItem.icon}</span>
                          <h4 className="font-bold text-navy text-sm uppercase tracking-wider">{rightItem.right}</h4>
                        </div>
                        <p className="text-sm text-ink/80 leading-relaxed">{rightItem.description}</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-ink/80 text-base leading-relaxed mt-4">
                    To exercise any of these rights, contact us at privacy@multanconnect.com. 
                    We will respond within 14 business days. We may ask you to verify your 
                    identity before fulfilling certain requests.
                  </p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="children" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">9. Children's Privacy</h2>
                <div className="space-y-4 text-ink/80 text-base leading-relaxed">
                  <p>Multan Connect is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children under 18.</p>
                  <p>If you are a parent or guardian and believe your child has provided personal information to Multan Connect, please contact us immediately at privacy@multanconnect.com. We will promptly delete any such information upon verification.</p>
                  <p>If we discover that we have inadvertently collected information from a user under 18, we will delete that account and all associated data without notice.</p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="third-party" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">10. Third-Party Services</h2>
                <div className="space-y-6 text-ink/80 text-base leading-relaxed">
                  <p>The Platform integrates with the following third-party services. Each has its own privacy policy governing how they handle data:</p>
                  
                  <div className="space-y-4">
                    {thirdParties.map((tp, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-white rounded-xl p-6 border border-border/50 shadow-sm">
                        <div className="flex-1">
                          <h4 className="font-bold text-navy text-sm uppercase tracking-wider mb-2">{tp.name}</h4>
                          <p className="text-sm text-ink/80 leading-relaxed">{tp.purpose}</p>
                        </div>
                        <a href={tp.policy} target="_blank" rel="noopener noreferrer"
                           className="text-xs font-bold uppercase tracking-wider text-gold hover:text-navy transition-colors flex-shrink-0 flex items-center gap-1 mt-1 sm:mt-0">
                          {tp.policyLabel}
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    ))}
                  </div>

                  <p>Links to third-party websites or services from our Platform are provided for convenience only. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any personal information.</p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="firebase" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">11. Firebase & Google Services</h2>
                <div className="space-y-4 text-ink/80 text-base leading-relaxed">
                  <p>Because Multan Connect is built on Firebase, it is important that you understand what data Firebase collects:</p>
                  <p><strong className="text-navy">Firebase Authentication:</strong> Stores your email address, hashed password (if using email login), and authentication tokens. If you use Google Sign-In, Firebase receives your Google account ID, name, email, and profile photo URL.</p>
                  <p><strong className="text-navy">Firestore Database:</strong> All your account data, product listings, orders, cart items, messages, and reviews are stored in Firestore. This data is stored in Google Cloud data centers.</p>
                  <p><strong className="text-navy">Firebase Storage:</strong> Product images you upload as a seller, and your profile photo, are stored in Firebase Storage (Google Cloud Storage).</p>
                  <p><strong className="text-navy">Firebase Analytics:</strong> We use Firebase Analytics to collect anonymized usage data including screen views, feature usage, and session duration. This data is aggregated and cannot be used to identify individual users.</p>
                  <p><strong className="text-navy">Firebase Crash Reporting:</strong> If the Android app crashes, anonymized crash reports are sent to Firebase Crashlytics to help us identify and fix bugs. These reports do not contain personal information.</p>
                  <p>You can opt out of Firebase Analytics data collection by adjusting your device's advertising ID settings. On Android: Settings → Google → Ads → Delete advertising ID.</p>
                  <p>For full details on how Google/Firebase handles data, visit: <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">firebase.google.com/support/privacy</a></p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="retention" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">12. Data Retention</h2>
                <div className="overflow-x-auto rounded-xl border border-border/50 shadow-sm bg-white">
                  <table className="w-full text-sm">
                    <thead className="bg-navy text-white">
                      <tr>
                        <th className="text-left p-4 font-bold tracking-wider uppercase text-xs whitespace-nowrap">Data Type</th>
                        <th className="text-left p-4 font-bold tracking-wider uppercase text-xs whitespace-nowrap">Retention Period</th>
                        <th className="text-left p-4 font-bold tracking-wider uppercase text-xs">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {retentionPeriods.map((row, i) => (
                        <tr key={i} className={`border-b border-border/20 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-cream/30"}`}>
                          <td className="p-4 font-medium text-navy whitespace-nowrap">{row.dataType}</td>
                          <td className="p-4 text-ink/80 text-xs whitespace-nowrap">{row.retention}</td>
                          <td className="p-4 text-muted-foreground text-xs leading-relaxed">{row.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="changes" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">13. Changes to This Policy</h2>
                <div className="space-y-4 text-ink/80 text-base leading-relaxed">
                  <p>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or for other operational reasons.</p>
                  <p>When we make material changes to this policy, we will:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Update the "Last updated" date at the top of this page</li>
                    <li>Send a notification email to all registered users at least 14 days before the changes take effect</li>
                    <li>Display a prominent banner on the Platform announcing the update</li>
                  </ul>
                  <p>Your continued use of the Platform after the effective date of the updated Privacy Policy constitutes your acceptance of the changes. If you do not agree to the updated policy, please stop using the Platform and request account deletion.</p>
                  <p>Previous versions of this Privacy Policy are available upon request by emailing privacy@multanconnect.com.</p>
                </div>
              </AnimatedSection>

              <div className="w-16 h-[2px] bg-gold/50 my-10" />

              <AnimatedSection id="contact" className="scroll-mt-32">
                <h2 className="font-serif text-3xl text-navy mb-6">14. Contact Us</h2>
                <p className="text-ink/80 text-base leading-relaxed mb-6">For any privacy-related questions, requests, or concerns, contact our Privacy team:</p>
                
                <div className="bg-navy/5 border border-navy/10 rounded-2xl p-6 md:p-8 space-y-6">
                  
                  {/* Privacy contact */}
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <Shield size={20} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider font-bold text-navy/60 mb-1">Privacy Requests</p>
                      <a href="mailto:privacy@multanconnect.com" className="text-base text-gold hover:underline font-medium">
                        privacy@multanconnect.com
                      </a>
                    </div>
                  </div>

                  {/* General support */}
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <Mail size={20} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider font-bold text-navy/60 mb-1">General Support</p>
                      <a href="mailto:support@multanconnect.com" className="text-base text-gold hover:underline font-medium">
                        support@multanconnect.com
                      </a>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <MapPin size={20} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider font-bold text-navy/60 mb-1">Address</p>
                      <p className="text-base text-navy font-medium">
                        Multan Connect, Lahore, Punjab, Pakistan
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t border-navy/10">
                    <p className="text-sm text-ink/80">
                      We aim to respond to all privacy requests within <strong className="text-navy">14 business days</strong>.
                    </p>
                  </div>

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
