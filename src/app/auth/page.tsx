// src/app/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

type Movie = {
  id: string;
  title: string;
  poster: string;
};

export default function HomePage() {
  const { user } = useAuth() || { user: null };
  const [movies, setMovies] = useState<Movie[]>([]);
  const [collections, setCollections] = useState<Record<string, Movie[]>>({
    Favorites: [],
    "To Watch": [],
    Watched: [],
  });

  useEffect(() => {
    async function fetchMovies() {
      try {
        const moviesCollection = collection(db, "movies");
        const snapshot = await getDocs(moviesCollection);

        const fetchedMovies = snapshot.docs.map((doc) => {
          const movieData = doc.data() as Movie;
          return { id: doc.id, title: movieData.title, poster: movieData.poster }; // ✅ Ensuring no duplicate `id`
        });

        setMovies(fetchedMovies);
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    }
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
              {collections[category].map((movie) => (
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
              src={movie.poster || "/placeholder.jpg"} // ✅ Prevent broken images
              alt={movie.title}
              onError={(e) => (e.currentTarget.src = "/placeholder.jpg")} // ✅ Set a fallback image if broken
            />
            <p>{movie.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
