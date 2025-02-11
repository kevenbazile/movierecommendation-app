// src/app/layout.tsx
"use client";
import { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthProvider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Movie Recommendation App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <AuthProvider>
          <NavBar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

// ✅ Move NavBar inside layout.tsx
import { useAuth } from "@/context/AuthProvider";

function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "#333", color: "#fff" }}>
      <h3>Movie Recommendation App</h3>
      {user && (
        <button
          onClick={async () => {
            await logout();
          }}
          style={{ background: "red", padding: "8px 12px", color: "white", border: "none", cursor: "pointer" }}
        >
          Sign Out
        </button>
      )}
    </nav>
  );
}
