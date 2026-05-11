import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

const googleProvider = new GoogleAuthProvider();

// Add these scopes for better user info
googleProvider.addScope("email");
googleProvider.addScope("profile");

// Force account picker every time (good UX)
googleProvider.setCustomParameters({
  prompt: "select_account",
});

const isMobile = () => {
    if (typeof window === "undefined") return false;
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

export async function signInWithGoogle(role: "buyer" | "seller" | "both") {
  try {
    let userCredential;

    // Use popup on desktop, redirect on mobile
    // (popups are blocked on some mobile browsers)
    if (!isMobile()) {
      userCredential = await signInWithPopup(auth, googleProvider);
    } else {
      // Store role in sessionStorage before redirect
      // (sessionStorage survives the redirect)
      sessionStorage.setItem("pendingRole", role);
      await signInWithRedirect(auth, googleProvider);
      return; // page will redirect — code below won't run
    }

    const firebaseUser = userCredential.user;

    // Check if user profile already exists in Firestore
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // New user — create their Firestore profile
      const userData: any = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName ?? "",
        email: firebaseUser.email ?? "",
        photoURL: firebaseUser.photoURL ?? "",
        role: role,
        shopName: "",
        shopHandle: "",
        shopBio: "",
        shopLogoUrl: "",
        shopBannerUrl: "",
        shopLocation: "",
        craftType: null,
        isVerifiedArtisan: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      if (role === 'seller' || role === 'both') {
          userData.craftType = 'New Artisan';
          userData.workshopLocation = 'Update in settings';
          userData.isVerifiedArtisan = false;
      }

      await setDoc(userDocRef, userData);
    } else {
      // Existing user — update last login timestamp only
      // Do NOT overwrite their role or shop details
      await setDoc(
        userDocRef,
        { updatedAt: serverTimestamp() },
        { merge: true }
      );
    }

    return firebaseUser;
  } catch (error: any) {
    // Handle specific Firebase Auth errors with user-friendly messages
    console.error("Google Sign-In error:", error.code, error.message);

    switch (error.code) {
      case "auth/popup-closed-by-user":
        throw new Error("Sign-in cancelled. Please try again.");

      case "auth/popup-blocked":
        // Popup was blocked by browser — fall back to redirect
        sessionStorage.setItem("pendingRole", role);
        await signInWithRedirect(auth, googleProvider);
        return;

      case "auth/unauthorized-domain":
        throw new Error(
          "This domain is not authorized for Google Sign-In. " +
          "Please add it in Firebase Console → Authentication → Authorized Domains."
        );

      case "auth/cancelled-popup-request":
        throw new Error("Multiple sign-in popups opened. Please close others and try again.");

      case "auth/network-request-failed":
        throw new Error("Network error. Please check your internet connection and try again.");

      case "auth/too-many-requests":
        throw new Error("Too many attempts. Please wait a moment and try again.");

      case "auth/user-disabled":
        throw new Error("This account has been disabled. Contact support@multanconnect.com.");

      default:
        throw new Error(`Google Sign-In failed: ${error.message}`);
    }
  }
}

// Handle redirect result — call this in your auth layout or root page
export async function handleGoogleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (!result) return null;

    const firebaseUser = result.user;
    const role = (sessionStorage.getItem("pendingRole") as "buyer" | "seller" | "both") ?? "buyer";
    sessionStorage.removeItem("pendingRole");

    // Same Firestore logic as popup flow
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const userData: any = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName ?? "",
        email: firebaseUser.email ?? "",
        photoURL: firebaseUser.photoURL ?? "",
        role: role,
        shopName: "",
        shopHandle: "",
        shopBio: "",
        shopLogoUrl: "",
        shopBannerUrl: "",
        shopLocation: "",
        craftType: null,
        isVerifiedArtisan: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (role === 'seller' || role === 'both') {
          userData.craftType = 'New Artisan';
          userData.workshopLocation = 'Update in settings';
          userData.isVerifiedArtisan = false;
      }
      await setDoc(userDocRef, userData);
    }

    return firebaseUser;
  } catch (error: any) {
    console.error("Redirect result error:", error);
    return null;
  }
}
