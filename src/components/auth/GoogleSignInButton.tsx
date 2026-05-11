import { useState } from "react";
import { signInWithGoogle } from "@/lib/firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface GoogleSignInButtonProps {
  role: "buyer" | "seller" | "both";
  label?: string;
  className?: string;
  variant?: "default" | "outline";
}

export function GoogleSignInButton({
  role,
  label = "Continue with Google",
  className = "",
  variant = "default",
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoogleSignIn = async () => {
    if (loading) return;
    try {
      setLoading(true);
      setError(null);

      const user = await signInWithGoogle(role);
      if (!user) return; // redirect flow — page will navigate automatically

      // Fetch latest role and state from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : null;

      if (userData) {
          useAuthStore.getState().setUser({ ...user, role: userData.role, isVerifiedArtisan: userData.isVerifiedArtisan } as any);
          useAuthStore.getState().setMode(userData.role === 'both' ? 'seller' : userData.role);
          
          // Determine where to go after sign in
          const searchParams = new URLSearchParams(location.search);
          const redirectTo = searchParams.get("redirect");

          if (redirectTo) {
              navigate(redirectTo, { replace: true });
          } else if (userData.role === "seller" || userData.role === "both") {
            navigate("/seller", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
      }

    } catch (err: any) {
      console.error("Sign-in button error:", err);
      setError(err.message ?? "Google Sign-In failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const baseStyles = "w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed";
  
  const styles = variant === "outline" 
    ? `${baseStyles} bg-white border border-gray-300 text-ink hover:bg-gray-50 hover:border-gray-400 ${className}`
    : `${baseStyles} bg-navy hover:bg-navy-light text-white border border-transparent ${className}`;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className={styles}
      >
        {loading ? (
          <Loader2 size={18} className={`animate-spin ${variant === 'outline' ? 'text-navy' : 'text-white'}`} />
        ) : (
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" className={variant === 'outline' ? '' : 'bg-white rounded-full p-0.5'}>
            <path fill={variant === 'outline' ? "#EA4335" : "#EA4335"} d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill={variant === 'outline' ? "#4285F4" : "#4285F4"} d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill={variant === 'outline' ? "#FBBC05" : "#FBBC05"} d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill={variant === 'outline' ? "#34A853" : "#34A853"} d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
        )}
        {loading ? "Signing in..." : label}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-red-700 text-xs leading-relaxed">{error}</p>
        </div>
      )}
    </div>
  );
}
