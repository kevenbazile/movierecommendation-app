// src/lib/firebase.ts
import { initializeApp, FirebaseApp } from "firebase/app";
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

// ✅ Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ✅ Ensure Firebase is Initialized **Once**
let app: FirebaseApp;
try {
  app = initializeApp(firebaseConfig);
  console.log("✅ Firebase Initialized Successfully");
} catch (error) {
  console.error("🚨 Firebase Initialization Error:", error);
  throw new Error("🔥 Firebase failed to initialize"); // **Force a failure if init fails**
}

// ✅ Firebase Services (Guaranteed to be Defined)
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Listen for authentication state changes
const listenForAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// ✅ Login function
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

// ✅ Register function
const register = async (email: string, password: string) => {
  try {
    console.log("⏳ Registering new user...");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create a user document in Firestore
    await createUserDocument(user.uid, {
      email: user.email,
      createdAt: serverTimestamp(),
      collections: {
        Favorites: [],
        "To Watch": [],
        Watched: [],
      },
    });

    console.log("✅ User Registered Successfully:", user);
    return userCredential;
  } catch (error) {
    console.error("🚨 Registration Error:", error);
    throw error;
  }
};

// ✅ Create a user document in Firestore
const createUserDocument = async (userId: string, data: any) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, data);
      console.log(`✅ Firestore document created for User ID: ${userId}`);
    }
  } catch (error) {
    console.error("🚨 Firestore Document Creation Error:", error);
  }
};

// ✅ Logout function
const logout = async () => {
  try {
    console.warn("🚨 Logging out user...");
    await signOut(auth);
    sessionStorage.clear();
    console.log("✅ User has been logged out.");
  } catch (error) {
    console.error("❌ Logout Error:", error);
  }
};

// ✅ Force Logout function (Handled in component)
const forceLogout = async (redirectCallback: () => void) => {
  try {
    console.warn("🚨 Force logging out user...");
    await signOut(auth);
    sessionStorage.clear();
    console.log("✅ Forced Logout Successful.");

    // ✅ Redirect user (Passed from Component)
    redirectCallback();
  } catch (error) {
    console.error("❌ Force Logout Error:", error);
  }
};

// ✅ Export functions correctly
export { auth, db, listenForAuthChanges, login, register, logout, forceLogout, createUserDocument };
