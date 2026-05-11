import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { BackButton } from '@/components/shared/BackButton';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  craftType: z.string().optional(),
  workshopLocation: z.string().optional(),
});

export default function Register() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<'buyer' | 'seller' | 'both' | null>(null);

  useEffect(() => {
    if (user) {
      if (user.role === 'seller' || user.role === 'both') {
        navigate('/seller', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, navigate]);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: any) => {
    if (!role) {
       toast.error("Please select an account type");
       return;
    }
    
    if ((role === 'seller' || role === 'both') && (!data.craftType || !data.workshopLocation)) {
        toast.error("Please fill in craft type and workshop location");
        return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      
      const userData: any = {
        uid: user.uid,
        email: user.email,
        displayName: data.name,
        role: role,
        createdAt: Date.now()
      };

      if (role === 'seller' || role === 'both') {
         userData.craftType = data.craftType;
         userData.workshopLocation = data.workshopLocation;
         userData.isVerifiedArtisan = false;
      }

      await setDoc(doc(db, 'users', user.uid), userData);

      try {
        await sendEmailVerification(user);
        toast.info('A verification email has been sent to your address.');
      } catch (err) {
        console.error('Failed to send verification email:', err);
      }

      useAuthStore.getState().setUser({ ...user, role, isVerifiedArtisan: userData.isVerifiedArtisan } as any);
      useAuthStore.getState().setMode(role === 'both' ? 'seller' : role);

      if (role === 'buyer') {
          navigate('/', { replace: true });
      } else {
          navigate('/seller', { replace: true });
      }
      
      toast.success('Account created successfully');
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
         toast.error('Email/Password Not Enabled', { description: 'Please enable Email/Password authentication in the Firebase Console.' });
      } else if (error.code === 'auth/email-already-in-use') {
        toast.error('Email Already Registered', { description: 'Please sign in instead, or use a different email address.' });
      } else {
        toast.error('Registration Failed', { description: error.message });
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
      if (!role) {
          toast.error("Please select a role to continue");
          return;
      }
      setStep(2);
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center items-center p-4 relative">
      <BackButton className="absolute top-6 left-6" />
      <div className="w-full max-w-xl bg-white rounded-3xl p-8 border border-border shadow-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-heading font-bold italic mx-auto mb-4">M</div>
          <h1 className="font-heading font-bold text-3xl text-ink">Join Multan Connect</h1>
          <p className="font-serif italic text-muted-foreground mt-2">Discover, buy, and sell authentic Multani crafts.</p>
        </div>

        {step === 1 && (
            <div className="space-y-6">
                <h2 className="text-lg font-bold text-center">What best describes you?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                       onClick={() => setRole('buyer')}
                       className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all ${role === 'buyer' ? 'border-[#1A237E] bg-[#1A237E]/5' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                        <span className="text-4xl mb-2">🛍️</span>
                        <span className="font-semibold text-gray-800 text-sm mt-2">I want to buy</span>
                    </button>
                    <button 
                       onClick={() => setRole('seller')}
                       className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all ${role === 'seller' ? 'border-[#FFC107] bg-[#FFC107]/10' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                        <span className="text-4xl mb-2">🏪</span>
                        <span className="font-semibold text-gray-800 text-sm mt-2">I want to sell</span>
                    </button>
                    <button 
                       onClick={() => setRole('both')}
                       className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all ${role === 'both' ? 'border-[#1A237E] bg-[#1A237E]/5' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                        <span className="text-4xl mb-2">🔄</span>
                        <span className="font-semibold text-gray-800 text-sm mt-2">Both</span>
                    </button>
                </div>
                <Button onClick={nextStep} className="w-full bg-navy hover:bg-navy-light text-white rounded-full py-6 font-bold tracking-wide mt-4">
                   Continue
                </Button>
                <p className="text-center mt-4 text-sm text-muted-foreground">
                  Already have an account? <Link to="/login" className="text-gold font-semibold hover:underline">Sign in</Link>
                </p>
            </div>
        )}

        {step === 2 && (
            <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-sans text-xs uppercase tracking-widest text-muted-foreground">Full Name</Label>
                <Input id="name" placeholder="Ali Raza" {...register('name')} className="bg-cream border-transparent focus-visible:ring-gold" />
                {errors.name && <p className="text-destructive text-xs">{errors.name.message as string}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-sans text-xs uppercase tracking-widest text-muted-foreground">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register('email')} className="bg-cream border-transparent focus-visible:ring-gold" />
                {errors.email && <p className="text-destructive text-xs">{errors.email.message as string}</p>}
              </div>

              {(role === 'seller' || role === 'both') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label htmlFor="craftType" className="font-sans text-xs uppercase tracking-widest text-muted-foreground text-red-500 font-bold">Craft Type *</Label>
                          <Input id="craftType" placeholder="e.g. Blue Pottery" {...register('craftType')} className="bg-cream border-transparent focus-visible:ring-gold" />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="workshopLocation" className="font-sans text-xs uppercase tracking-widest text-muted-foreground text-red-500 font-bold">Location *</Label>
                          <Input id="workshopLocation" placeholder="e.g. Hussain Agahi" {...register('workshopLocation')} className="bg-cream border-transparent focus-visible:ring-gold" />
                      </div>
                  </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="font-sans text-xs uppercase tracking-widest text-muted-foreground">Password</Label>
                <Input id="password" type="password" {...register('password')} className="bg-cream border-transparent focus-visible:ring-gold" />
                {errors.password && <p className="text-destructive text-xs">{errors.password.message as string}</p>}
              </div>
              
              <div className="flex gap-4 mt-6">
                  <Button type="button" onClick={() => setStep(1)} variant="outline" className="flex-1 rounded-full py-6 font-bold tracking-wide hover:bg-cream border-border text-ink">
                    Back
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-[2] bg-navy hover:bg-navy-light text-white rounded-full py-6 font-bold tracking-wide">
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
              </div>
            </form>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-muted-foreground uppercase tracking-widest">Or continue with</span>
              </div>
            </div>

            {role && (
                <GoogleSignInButton
                  role={role}
                  variant="outline"
                  label="Google"
                />
            )}
            </>
        )}

      </div>
    </div>
  );
}
