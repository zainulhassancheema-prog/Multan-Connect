import AnimatedSection from '@/components/shared/AnimatedSection';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function OrdersList() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] bg-sand flex flex-col items-center justify-center pt-24 pb-12">
      <AnimatedSection className="text-center px-4">
        <h1 className="text-3xl md:text-4xl font-heading text-primary mb-4">My Orders</h1>
        <p className="text-muted-foreground font-serif italic max-w-md mx-auto mb-8">
          You haven't placed any orders yet. Discover timeless pieces from our artisans.
        </p>
        <Button onClick={() => navigate('/explore')} className="bg-gold hover:bg-gold-light text-white rounded-full px-8">
          Explore Products
        </Button>
      </AnimatedSection>
    </div>
  );
}
