"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Movie = {
  id: number;
  title: string;
  release_date: string;
  vote_average: number;
  poster_path: string | null;
  genre_ids: number[];
};

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w200";

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`)
      .then((res) => res.json())
      .then((data) => {
        if (data.results) {
          setMovies(data.results);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching movies:", error);
        setLoading(false);
      });

    const savedWatchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
    const savedUsername = localStorage.getItem("username") || "";

    setWatchlist(savedWatchlist);
    setUsername(savedUsername);
  }, []);

  const isInWatchlist = (movieId: number) => {
    return watchlist.some((movie) => movie.id === movieId);
  };

  const toggleWatchlist = (movie: Movie) => {
    const updatedWatchlist = isInWatchlist(movie.id)
      ? watchlist.filter((item) => item.id !== movie.id)
      : [...watchlist, movie];

    setWatchlist(updatedWatchlist);
    localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", color: "#333" }}>
        {username ? `${username}'s Movie Recommendations` : "Movie Recommendation App"}
      </h1>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <Link href="/watchlist">
          <button style={{ padding: "10px 20px", background: "#FFD700", borderRadius: "5px", fontSize: "16px" }}>
            Go to Watchlist
          </button>
        </Link>
      </div>

      <h2 style={{ textAlign: "center", color: "#444" }}>Movies for You</h2>
      {loading ? (
        <p style={{ textAlign: "center", color: "#888" }}>Loading...</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          {movies.map((movie) => (
            <li key={movie.id} style={{ textAlign: "center", background: "#f4f4f4", padding: "10px", borderRadius: "8px" }}>
              <Image
                src={movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : "https://via.placeholder.com/200x300?text=No+Image"}
                alt={movie.title}
                width={200}
                height={300}
              />
              <h3>{movie.title}</h3>
              <button onClick={() => toggleWatchlist(movie)} style={{ marginTop: "10px", padding: "5px 10px", background: isInWatchlist(movie.id) ? "#DC3545" : "#FFD700", color: "#fff", border: "none", borderRadius: "5px" }}>
                {isInWatchlist(movie.id) ? "Remove from Watchlist" : "Add to Watchlist"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
