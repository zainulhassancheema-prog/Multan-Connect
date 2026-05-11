import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuthStore } from '@/lib/store/authStore';
import { CheckCircle, Send, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  category: z.enum(["buyer_support", "seller_support", "partnership", "press", "other"], {
    message: "Please select a category"
  }),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters").max(2000, "Message cannot exceed 2000 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const { user } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
       name: user?.displayName || '',
       email: user?.email || '',
    }
  });

  const watchMessage = watch("message", "");

  const onSubmit = async (data: ContactFormData) => {
    try {
      await addDoc(collection(db, "contactMessages"), {
        ...data,
        status: "unread",
        userId: user?.uid ?? null,
        createdAt: serverTimestamp()
      });

      setSubmittedEmail(data.email);
      setSubmitted(true);
      reset();
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message. Please try again or email us directly.");
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center"
        >
          <CheckCircle size={32} className="text-gold" />
        </motion.div>
        
        <h3 className="font-serif text-2xl text-navy mt-6">Message Sent!</h3>
        <p className="text-muted-foreground mt-2 max-w-sm leading-relaxed">
          Thank you for reaching out. We've received your message and 
          will get back to you at <strong className="text-navy">{submittedEmail}</strong> shortly.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-6 text-gold text-sm hover:underline font-medium"
        >
          Send another message
        </button>
      </div>
    );
  }

  const inputClass = "w-full border border-border rounded-xl px-4 py-3 text-sm text-ink placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200 bg-white";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <input 
          {...register("name")} 
          placeholder="Your full name *" 
          className={inputClass}
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <AlertCircle size={12} /> {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <input 
          type="email" 
          {...register("email")} 
          placeholder="your@email.com *" 
          className={inputClass}
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <AlertCircle size={12} /> {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <input 
          type="tel" 
          {...register("phone")} 
          placeholder="Phone (+92 300 0000000)" 
          className={inputClass}
        />
        {errors.phone && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <AlertCircle size={12} /> {errors.phone.message}
          </p>
        )}
      </div>

      <div>
        <select 
          {...register("category")} 
          className={inputClass}
        >
          <option value="">I am a... *</option>
          <option value="buyer">Buyer / Customer</option>
          <option value="seller">Artisan / Seller</option>
          <option value="partner">Partner / Institution</option>
          <option value="press">Press / Media</option>
          <option value="other">Other</option>
        </select>
        {errors.category && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <AlertCircle size={12} /> {errors.category.message}
          </p>
        )}
      </div>

      <div>
        <input 
          {...register("subject")} 
          placeholder="Brief subject of your message *" 
          className={inputClass}
        />
        {errors.subject && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <AlertCircle size={12} /> {errors.subject.message}
          </p>
        )}
      </div>

      <div>
        <textarea 
          {...register("message")}
          rows={6} 
          placeholder="Tell us how we can help you... *" 
          className={`${inputClass} resize-none`}
        />
        <div className="flex justify-between mt-1">
          {errors.message ? (
            <p className="text-red-500 text-xs flex items-center gap-1">
              <AlertCircle size={12} /> {errors.message.message}
            </p>
          ) : (
            <span />
          )}
          <span className="text-muted-foreground text-xs">{watchMessage?.length ?? 0}/2000</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gold hover:bg-[#b8860b] disabled:opacity-60 text-white font-medium py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send size={16} />
            Send Message
          </>
        )}
      </button>
    </form>
  );
}
