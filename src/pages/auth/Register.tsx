import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['buyer', 'seller'])
});

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'buyer' }
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      
      const userData: any = {
        uid: user.uid,
        email: user.email,
        displayName: data.name,
        role: data.role,
        createdAt: Date.now()
      };

      if (data.role === 'seller') {
        userData.isVerifiedArtisan = false; // Requires manual verification
      }

      await setDoc(doc(db, 'users', user.uid), userData);
      navigate(data.role === 'seller' ? '/dashboard' : '/');
      toast.success('Account created successfully');
    } catch (error: any) {
      toast.error('Registration Failed', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-border shadow-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-heading font-bold italic mx-auto mb-4">M</div>
          <h1 className="font-heading font-bold text-3xl text-ink">Join Us</h1>
          <p className="font-serif italic text-muted-foreground mt-2">Discover or share the crafts of Multan.</p>
        </div>

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
          <div className="space-y-2">
            <Label htmlFor="password" className="font-sans text-xs uppercase tracking-widest text-muted-foreground">Password</Label>
            <Input id="password" type="password" {...register('password')} className="bg-cream border-transparent focus-visible:ring-gold" />
            {errors.password && <p className="text-destructive text-xs">{errors.password.message as string}</p>}
          </div>
          <div className="space-y-2 pt-2">
            <Label className="font-sans text-xs uppercase tracking-widest text-muted-foreground block mb-2">I want to...</Label>
            <div className="flex gap-4">
               <label className="flex-1 flex items-center gap-2 p-3 border border-border rounded-xl cursor-pointer hover:border-gold">
                  <input type="radio" value="buyer" {...register('role')} className="accent-gold text-gold" />
                  <span className="text-sm font-medium">Buy Crafts</span>
               </label>
               <label className="flex-1 flex items-center gap-2 p-3 border border-border rounded-xl cursor-pointer hover:border-gold">
                  <input type="radio" value="seller" {...register('role')} className="accent-gold text-gold" />
                  <span className="text-sm font-medium">Sell My Craft</span>
               </label>
            </div>
            {errors.role && <p className="text-destructive text-xs">{errors.role.message as string}</p>}
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-navy hover:bg-navy-light text-white rounded-full py-6 font-bold tracking-wide mt-4">
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center mt-8 text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-gold font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
