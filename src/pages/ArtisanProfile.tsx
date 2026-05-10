import AnimatedSection from '@/components/shared/AnimatedSection';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ArtisanProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-sand pt-24 pb-12">
      <AnimatedSection className="container mx-auto px-4 max-w-4xl text-center">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8 hover:text-gold hover-underline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center mb-6 shadow-md border-4 border-white overflow-hidden">
             <img src="https://images.unsplash.com/photo-1533227268428-f9ed0900f953?auto=format&fit=crop&q=80" alt="Artisan" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-4xl font-heading text-primary mb-2">Artisan Profile {id}</h1>
        <p className="text-xl font-serif italic text-muted-foreground mb-8">Master Craftsman</p>
        <p className="max-w-2xl mx-auto text-ink/80 leading-relaxed">
          This artisan's detailed portfolio, beautiful story, and complete collection of works will be available here soon. Stay tuned.
        </p>
      </AnimatedSection>
    </div>
  );
}
