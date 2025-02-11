// src/app/watchlist/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // ✅ Import router for navigation

// Define the type for Movie
type Movie = {
  id: number;
  title: string;
  release_date: string;
  vote_average: number;
  poster_path: string | null;
};

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w200";

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const router = useRouter(); // ✅ Get router instance

  useEffect(() => {
    const savedWatchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
    setWatchlist(savedWatchlist);
  }, []);

  const removeFromWatchlist = (movieId: number) => {
    const updatedWatchlist = watchlist.filter((movie) => movie.id !== movieId);
    setWatchlist(updatedWatchlist);
    localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", color: "#333" }}>My Watchlist</h1>

      {/* ✅ Go Back Button */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button
          onClick={() => router.back()} // ✅ Go back to the previous page
          style={{ padding: "10px 20px", background: "#007BFF", color: "white", borderRadius: "5px", fontSize: "16px", cursor: "pointer" }}
        >
          ← Go Back
        </button>
      </div>

      {/* Back to Home Page */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <Link href="/">
          <button style={{ padding: "10px 20px", background: "#FFD700", borderRadius: "5px", fontSize: "16px" }}>
            Back to Home
          </button>
        </Link>
      </div>

      {/* Show Only Movies in the Watchlist */}
      {watchlist.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888" }}>Your watchlist is empty.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          {watchlist.map((movie) => (
            <li key={movie.id} style={{ textAlign: "center", background: "#f4f4f4", padding: "10px", borderRadius: "8px" }}>
              <a href={`https://www.themoviedb.org/movie/${movie.id}`} target="_blank">
                <img src={movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : "https://via.placeholder.com/200x300?text=No+Image"} alt={movie.title} style={{ width: "100%" }} />
                <h3>{movie.title}</h3>
              </a>
              <button
                onClick={() => removeFromWatchlist(movie.id)}
                style={{ marginTop: "10px", padding: "5px 10px", background: "#DC3545", color: "#fff", border: "none", borderRadius: "5px" }}
              >
                Remove from Watchlist
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
