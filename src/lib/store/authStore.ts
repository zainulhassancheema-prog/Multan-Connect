import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { User, Role } from '../types';

interface AuthState {
  user: (FirebaseUser & { role?: Role; isVerifiedArtisan?: boolean }) | null;
  loading: boolean;
  setUser: (user: FirebaseUser | null) => void;
  fetchAndSetUserData: (uid: string) => Promise<void>;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  fetchAndSetUserData: async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as User;
        set((state) => ({
          user: state.user ? { ...state.user, role: data.role, isVerifiedArtisan: data.isVerifiedArtisan } : null,
          loading: false
        }));
      }
    } catch (err) {
      console.error('Error fetching user data', err);
      set({ loading: false });
    }
  },
  clearUser: () => set({ user: null, loading: false }),
}));

// Setup listener
auth.onAuthStateChanged(async (user) => {
  if (user) {
    useAuthStore.getState().setUser(user);
    await useAuthStore.getState().fetchAndSetUserData(user.uid);
  } else {
    useAuthStore.getState().clearUser();
  }
});
