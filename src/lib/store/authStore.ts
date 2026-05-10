import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { User, Role } from '../types';

interface AuthState {
  user: (FirebaseUser & Partial<User>) | null;
  loading: boolean;
  mode: 'buyer' | 'seller';
  setUser: (user: Partial<FirebaseUser & Partial<User>> | null) => void;
  fetchAndSetUserData: (uid: string) => Promise<void>;
  clearUser: () => void;
  setMode: (mode: 'buyer' | 'seller') => void;
}

const getInitialMode = (): 'buyer' | 'seller' => {
  const saved = localStorage.getItem('multan_connect_mode');
  return saved === 'seller' ? 'seller' : 'buyer';
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  mode: getInitialMode(),
  setMode: (mode) => {
    localStorage.setItem('multan_connect_mode', mode);
    set({ mode });
  },
  setUser: (user) => set((state) => ({ user: user ? { ...state.user, ...user } as any : null })),
  fetchAndSetUserData: async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as User;
        
        let targetMode = getInitialMode();
        if (data.role === 'seller' && targetMode !== 'seller') targetMode = 'seller';
        if (data.role === 'buyer' && targetMode !== 'buyer') targetMode = 'buyer';

        set((state) => {
          const userObj = state.user ? { ...state.user, ...data } : null;
          return {
            user: userObj,
            mode: data.role === 'both' ? getInitialMode() : targetMode,
            loading: false
          };
        });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      console.error('Error fetching user data', err);
      set({ loading: false });
    }
  },
  clearUser: () => set({ user: null, loading: false }),
}));

// Setup listener
if (auth?.onAuthStateChanged) {
  try {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        useAuthStore.getState().setUser(user);
        if (db) {
           await useAuthStore.getState().fetchAndSetUserData(user.uid);
        } else {
           useAuthStore.setState({ loading: false });
        }
      } else {
        useAuthStore.getState().clearUser();
      }
    });
  } catch (error) {
    console.warn('Firebase auth listener failed to initialize', error);
    useAuthStore.getState().clearUser();
  }
} else {
  useAuthStore.getState().clearUser();
}
