"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthProvider";

type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
};

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w200";

export default function HomePage() {
  const { user } = useAuth() || { user: null }; // ✅ Handle null auth state
  const [movies, setMovies] = useState<Movie[]>([]);
  const [collections, setCollections] = useState<Record<string, Movie[]>>({
    Favorites: [],
    "To Watch": [],
    Watched: [],
  });

  // ✅ Define movie-fetching function inside page.tsx (instead of importing from api.ts)
  async function fetchMovies() {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
      );
      const data = await response.json();
      setMovies(data.results || []);
    } catch (error) {
      console.error("Failed to fetch movies:", error);
    }
  }

  useEffect(() => {
    fetchMovies();

    // Load user collections
    if (user) {
      const storedCollections = JSON.parse(localStorage.getItem(`collections_${user.uid}`) || "{}");
      setCollections(storedCollections);
    }
  }, [user]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Welcome, {user?.email || "Guest"}!</h1>

      <h2>Your Collections</h2>
      <div>
        {Object.keys(collections).map((category) => (
          <div key={category}>
            <h3>{category}</h3>
            <ul>
              {collections[category]?.map((movie) => (
                <li key={movie.id}>{movie.title}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h2>Popular Movies</h2>
      <div className="movie-list">
        {movies.map((movie) => (
          <div key={movie.id} className="movie-item">
            <img
              src={movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : "https://via.placeholder.com/200x300?text=No+Image"}
              alt={movie.title}
            />
            <p>{movie.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
