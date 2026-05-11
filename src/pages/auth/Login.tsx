import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { BackButton } from '@/components/shared/BackButton';
import { useAuthStore } from '@/lib/store/authStore';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (user) {
      if (user.role === 'seller' || user.role === 'both') {
        navigate('/seller', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, navigate]);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const redirectUser = (role: string) => {
    // Priority: use search param if present (e.g. from a protected route)
    const searchParams = new URLSearchParams(location.search);
    const redirectParam = searchParams.get('redirect');
    if (redirectParam) {
       navigate(redirectParam, { replace: true });
       return;
    }

    if (role === 'seller' || role === 'both') {
      navigate('/seller', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, data.email, data.password);
      const userRef = doc(db, 'users', cred.user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
         redirectUser(snap.data().role || 'buyer');
      } else {
         redirectUser('buyer');
      }
    } catch (error: any) {
      toast.error('Login Failed', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const email = getValues('email');
    if (!email) return toast.error('Please enter your email address first.');
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent.');
    } catch (error: any) {
      toast.error('Error', { description: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center items-center p-4 relative">
      <BackButton className="absolute top-6 left-6" />
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-border shadow-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-heading font-bold italic mx-auto mb-4">M</div>
          <h1 className="font-heading font-bold text-3xl text-ink">Welcome Back</h1>
          <p className="font-serif italic text-muted-foreground mt-2">Sign in to continue to your artisan marketplace.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-sans text-xs uppercase tracking-widest text-muted-foreground">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register('email')} className="bg-cream border-transparent focus-visible:ring-gold" />
            {errors.email && <p className="text-destructive text-xs">{errors.email.message as string}</p>}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="font-sans text-xs uppercase tracking-widest text-muted-foreground">Password</Label>
              <button type="button" onClick={handleResetPassword} className="text-xs text-gold hover:underline">Forgot?</button>
            </div>
            <Input id="password" type="password" {...register('password')} className="bg-cream border-transparent focus-visible:ring-gold" />
            {errors.password && <p className="text-destructive text-xs">{errors.password.message as string}</p>}
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-navy hover:bg-navy-light text-white rounded-full py-6 font-bold tracking-wide">
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-muted-foreground uppercase tracking-widest">Or continue with</span>
          </div>
        </div>

        <GoogleSignInButton
          role="buyer"
          variant="outline"
          label="Google"
        />

        <p className="text-center mt-8 text-sm text-muted-foreground">
          Don't have an account? <Link to="/register" className="text-gold font-semibold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
