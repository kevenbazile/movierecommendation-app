// src/app/auth/signup/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/firebase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Add loading state
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Signing up with:", email, password); // ✅ Debugging log
      await register(email, password);
      console.log("Sign up successful, redirecting...");
      router.push("/"); // ✅ Redirect after success
    } catch (err) {
      console.error("Signup error:", err); // ✅ Show exact error
      setError("Failed to create account. " + (err as any)?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Sign Up</h1>
      <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "10px", marginBottom: "10px" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "10px", marginBottom: "10px" }}
        />
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: "10px", background: "#007BFF", color: "white", cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: "10px" }}>
        Already have an account? <a href="/auth/login">Login</a>
      </p>
    </div>
  );
}
