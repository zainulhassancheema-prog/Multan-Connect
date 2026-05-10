import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { collection, query, where, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Star, MessageCircle, Reply, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Review {
  id: string;
  rating: number;
  text: string;
  reviewerName: string;
  reviewerImage?: string;
  productId: string;
  productName: string;
  productImage?: string;
  createdAt: any;
  reply?: {
    text: string;
    repliedAt: any;
  }
}

export default function SellerReviews() {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'reviews'),
          where('sellerId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setReviews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [user]);

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim() || !user) return;
    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        reply: {
          text: replyText.trim(),
          repliedAt: Date.now(),
          sellerId: user.uid
        }
      });
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reply: { text: replyText.trim(), repliedAt: Date.now() } } : r));
      setReplyingTo(null);
      setReplyText('');
      toast.success('Reply posted successfully');
    } catch (err) {
      toast.error('Failed to post reply');
      console.error(err);
    }
  };

  const avgRating = reviews.length ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;
  
  const ratingCounts = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: reviews.length ? (reviews.filter(r => r.rating === stars).length / reviews.length) * 100 : 0
  }));

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading reviews...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="font-heading font-bold text-3xl text-ink">Reviews</h1>
        <p className="font-serif italic text-muted-foreground">See what buyers are saying about your products.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-border shadow-sm flex flex-col md:flex-row gap-12 items-center md:items-start">
        <div className="text-center md:text-left">
           <p className="text-sm uppercase tracking-widest text-muted-foreground font-bold mb-2">Overall Rating</p>
           <div className="flex items-end gap-3 justify-center md:justify-start">
              <span className="text-6xl font-heading font-bold text-ink leading-none">{avgRating.toFixed(1)}</span>
              <div className="flex text-gold mb-2">
                 {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-5 h-5 ${i <= Math.round(avgRating) ? 'fill-current' : 'text-muted-foreground/30'}`} />
                 ))}
              </div>
           </div>
           <p className="text-sm mt-2 text-muted-foreground">{reviews.length} total reviews</p>
        </div>
        
        <div className="flex-1 w-full space-y-2">
           {ratingCounts.map(row => (
             <div key={row.stars} className="flex items-center gap-4 text-sm">
               <span className="font-mono w-4 font-bold">{row.stars}★</span>
               <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden flex items-center">
                 <div className="h-full bg-navy rounded-full transition-all duration-1000 ease-out" style={{ width: `${row.percentage}%` }} />
               </div>
               <span className="w-10 text-right font-mono text-muted-foreground">{Math.round(row.percentage)}%</span>
               <span className="w-8 text-right text-muted-foreground">({row.count})</span>
             </div>
           ))}
        </div>
      </div>

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-border text-center">
            <div className="w-20 h-20 bg-muted rounded-full mx-auto flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-heading font-bold text-xl mb-2">No reviews yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">Reviews will appear here once buyers rate your products after purchasing and receiving them.</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="bg-white rounded-2xl p-6 border border-border shadow-sm">
               <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-navy/10 overflow-hidden flex items-center justify-center shrink-0">
                           {review.reviewerImage ? <img src={review.reviewerImage} className="w-full h-full object-cover" /> : <span className="font-heading font-bold italic">{review.reviewerName[0]}</span>}
                        </div>
                        <div>
                           <p className="font-bold text-sm">{review.reviewerName}</p>
                           <p className="text-xs text-muted-foreground">{review.createdAt?.toMillis ? format(review.createdAt.toMillis(), 'MMM d, yyyy') : 'Recently'}</p>
                        </div>
                        <div className="ml-auto flex text-gold">
                          {[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= review.rating ? 'fill-current' : 'text-muted-foreground/20'}`} />)}
                        </div>
                     </div>
                     <p className="text-ink/80 leading-relaxed font-sans">{review.text}</p>
                     
                     {review.reply ? (
                       <div className="bg-sand/30 p-4 rounded-xl border border-border ml-4 mt-4 relative">
                         <div className="absolute -left-3 top-4 text-border rotate-180"><Reply className="w-5 h-5" /></div>
                         <div className="flex items-center gap-2 mb-2">
                           <CheckCircle2 className="w-4 h-4 text-gold" />
                           <p className="font-bold text-xs uppercase tracking-widest text-navy">Your Reply</p>
                         </div>
                         <p className="text-sm">{review.reply.text}</p>
                       </div>
                     ) : replyingTo === review.id ? (
                       <div className="mt-4 flex gap-2">
                         <Input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type your public reply..." className="flex-1" />
                         <Button onClick={() => handleReply(review.id)} className="bg-gold hover:bg-gold-light text-white">Post Reply</Button>
                         <Button variant="ghost" onClick={() => setReplyingTo(null)}>Cancel</Button>
                       </div>
                     ) : (
                       <Button variant="outline" size="sm" onClick={() => setReplyingTo(review.id)} className="mt-2 text-xs font-bold uppercase tracking-widest text-navy border-navy hover:bg-navy hover:text-white transition-colors">
                         Reply to Review
                       </Button>
                     )}
                  </div>
                  
                  <div className="w-full md:w-48 shrink-0 bg-muted/30 rounded-xl p-3 border border-border flex items-center gap-3">
                     <div className="w-12 h-12 bg-white rounded-md overflow-hidden shrink-0 border border-border flex items-center justify-center">
                        {review.productImage ? <img src={review.productImage} className="w-full h-full object-cover" /> : <span className="text-[10px] italic text-muted-foreground">No img</span>}
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Purchased</p>
                        <p className="text-sm font-bold truncate text-ink">{review.productName}</p>
                     </div>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
