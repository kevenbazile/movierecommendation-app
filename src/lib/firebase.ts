// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useRouter } from "next/navigation"; // ✅ Import useRouter

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Listen for authentication state changes
const listenForAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// ✅ Login function (Optimized)
const login = async (email: string, password: string) => {
  try {
    console.log("⏳ Attempting to log in...");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Logged in:", userCredential.user);
    return userCredential;
  } catch (error) {
    console.error("🚨 Login Failed:", error);
    throw error;
  }
};

// ✅ Register function (Optimized)
const register = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  // Create a user document in Firestore
  const user = userCredential.user;
  await createUserDocument(user.uid, {
    email: user.email,
    createdAt: serverTimestamp(),
    collections: {
      Favorites: [],
      "To Watch": [],
      Watched: [],
    },
  });

  return userCredential;
};

// ✅ Create a user document in Firestore
const createUserDocument = async (userId: string, data: any) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, data);
  }
};

// ✅ Logout function (Fixed)
const logout = async () => {
  try {
    console.warn("🚨 Logging out user...");
    await signOut(auth);
    sessionStorage.clear(); // ✅ Use sessionStorage for faster session clearing
    console.log("✅ User has been logged out.");
  } catch (error) {
    console.error("❌ Logout Error:", error);
  }
};

// ✅ Force Logout function (Fixed)
const forceLogout = async () => {
  try {
    const router = useRouter(); // ✅ Use router dynamically
    console.warn("🚨 Force logging out user...");
    await signOut(auth);
    sessionStorage.clear();
    router.push("/auth/login"); // ✅ Corrected navigation
  } catch (error) {
    console.error("❌ Force Logout Error:", error);
  }
};

// ✅ Export functions correctly
export { auth, db, listenForAuthChanges, login, register, logout, forceLogout, createUserDocument };
