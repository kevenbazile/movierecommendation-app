"use client";
import { ReactNode, useState } from "react";
import { AuthProvider, useAuth } from "@/context/AuthProvider";
import Link from "next/link";

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

// ✅ Fix: Only show Watchlist tab when logged in
function NavBar() {
  const { user, logout } = useAuth();
  const [showWatchlist, setShowWatchlist] = useState(false);

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px",
        background: "#333",
        color: "#fff",
        alignItems: "center",
      }}
    >
      <h3>Movie Recommendation App</h3>

      {/* ✅ Only show Watchlist if user is logged in */}
      {user && (
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowWatchlist(!showWatchlist)}
            style={{
              background: "gray",
              padding: "8px 12px",
              color: "white",
              border: "none",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            🎥 Watchlist
          </button>
          {showWatchlist && (
            <div
              style={{
                position: "absolute",
                top: "40px",
                right: "0",
                background: "#222",
                padding: "10px",
                borderRadius: "5px",
                display: "flex",
                flexDirection: "column",
                zIndex: 100,
              }}
            >
              <Link href="/watchlist">
                <button
                  style={{
                    background: "none",
                    color: "white",
                    border: "none",
                    padding: "8px",
                    cursor: "pointer",
                  }}
                >
                  Go to Watchlist
                </button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ✅ Show Sign Out Button only when logged in */}
      {user && (
        <button
          onClick={async () => {
            await logout();
          }}
          style={{
            background: "red",
            padding: "8px 12px",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Sign Out
        </button>
      )}
    </nav>
  );
}
