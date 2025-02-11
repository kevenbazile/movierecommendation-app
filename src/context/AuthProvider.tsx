// src/context/AuthProvider.tsx
"use client";
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { auth, logout, forceLogout } from "@/lib/firebase"; 
import { useRouter } from "next/navigation";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setLoading(true); // ✅ Show "Checking authentication..." message
      if (authUser) {
        console.log("✅ User is authenticated:", authUser);
        setUser(authUser);
      } else {
        console.warn("🚨 User not authenticated. Redirecting...");
        setUser(null);
        setTimeout(() => {
          router.push("/auth/login"); // ✅ Small delay prevents unnecessary flickers
        }, 300);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, logout, forceLogout }}>
      {loading ? (
        <p style={{ textAlign: "center" }}>Checking authentication...</p>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

// ✅ Custom Hook to use Auth
export function useAuth() {
  return useContext(AuthContext);
}
