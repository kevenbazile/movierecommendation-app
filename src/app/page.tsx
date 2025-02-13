"use client";
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthProvider";

// Define movie type
type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  video_key?: string;
};

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const YOUTUBE_EMBED_URL = "https://www.youtube.com/embed/";

export default function HomePage() {
  const { user } = useAuth() || { user: null };
  const [movies, setMovies] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playingTrailer, setPlayingTrailer] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedWatchlist = localStorage.getItem("watchlist");
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, []);

  // Fetch movies and trailers
  useEffect(() => {
    async function fetchMovies() {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
      );
      const data = await res.json();

      // Fetch trailers for each movie
      const moviesWithTrailers = await Promise.all(
        data.results.map(async (movie: Movie) => {
          const trailerRes = await fetch(
            `https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
          );
          const trailerData = await trailerRes.json();
          const trailer = trailerData.results.find((vid: any) => vid.type === "Trailer");
          return { ...movie, video_key: trailer?.key || null };
        })
      );

      setMovies(moviesWithTrailers);
    }
    fetchMovies();
  }, []);

  const selectMovie = (index: number) => {
    setCurrentIndex(index);
    setPlayingTrailer(false); // Reset trailer when switching movies
  };

  const toggleWatchlist = (movie: Movie) => {
    const isInWatchlist = watchlist.some((m) => m.id === movie.id);
    const updatedWatchlist = isInWatchlist
      ? watchlist.filter((m) => m.id !== movie.id)
      : [...watchlist, movie];

    setWatchlist(updatedWatchlist);
    localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
  };

  const scrollCarousel = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 120; // Adjust for smooth feel
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        backgroundColor: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Movie Display */}
      {movies.length > 0 && (
        <div
          style={{
            width: "90vw",
            height: "75vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            position: "relative",
          }}
        >
          {/* Thumbnail or Trailer */}
          {!playingTrailer ? (
            <div style={{ position: "relative", cursor: "pointer" }}>
              <img
                src={
                  movies[currentIndex].poster_path
                    ? `${IMAGE_BASE_URL}${movies[currentIndex].poster_path}`
                    : "https://via.placeholder.com/320x180"
                }
                alt={movies[currentIndex].title}
                style={{
                  width: "320px",
                  height: "180px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
              {movies[currentIndex].video_key && (
                <button
                  onClick={() => setPlayingTrailer(true)}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: "rgba(0, 0, 0, 0.7)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    padding: "15px",
                    fontSize: "18px",
                    cursor: "pointer",
                  }}
                >
                  ▶️
                </button>
              )}
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              <iframe
                width="320"
                height="180"
                src={`${YOUTUBE_EMBED_URL}${movies[currentIndex].video_key}?autoplay=1`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                style={{ borderRadius: "8px" }}
              ></iframe>

              {/* Close Button */}
              <button
                onClick={() => setPlayingTrailer(false)}
                style={{
                  position: "absolute",
                  top: "5px",
                  right: "5px",
                  background: "rgba(255, 0, 0, 0.8)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  padding: "8px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                ❌
              </button>
            </div>
          )}

          {/* Movie Title & Info */}
          <h2
            style={{
              color: "#fff",
              textAlign: "center",
              marginTop: "10px",
              fontSize: "18px",
            }}
          >
            {movies[currentIndex].title}
          </h2>
          <p style={{ color: "#bbb", textAlign: "center", fontSize: "14px" }}>
            ⭐ {movies[currentIndex].vote_average} | 📅{" "}
            {movies[currentIndex].release_date}
          </p>

          {/* Add to Watchlist Button */}
          <button
            onClick={() => toggleWatchlist(movies[currentIndex])}
            style={{
              padding: "10px",
              marginTop: "10px",
              background: watchlist.some((m) => m.id === movies[currentIndex].id)
                ? "red"
                : "green",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              width: "90%",
              maxWidth: "250px",
              fontSize: "14px",
            }}
          >
            {watchlist.some((m) => m.id === movies[currentIndex].id)
              ? "❌ Remove from Watchlist"
              : "➕ Add to Watchlist"}
          </button>
        </div>
      )}

      {/* Clickable Movie Carousel */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.8)",
          padding: "10px",
        }}
      >
        {/* Left Scroll Button */}
        <button
          onClick={() => scrollCarousel("left")}
          style={{
            background: "#222",
            color: "#fff",
            padding: "8px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
            marginRight: "10px",
          }}
        >
          ◀️
        </button>

        {/* Carousel Container */}
        <div
          ref={scrollRef}
          style={{
            display: "flex",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            gap: "10px",
            width: "80%",
            paddingBottom: "5px",
            scrollbarWidth: "none",
          }}
        >
          {movies.map((movie, index) => (
            <img
              key={movie.id}
              src={`${IMAGE_BASE_URL}${movie.poster_path}`}
              alt={movie.title}
              style={{
                width: "70px",
                height: "105px",
                cursor: "pointer",
                borderRadius: "5px",
                scrollSnapAlign: "start",
                border: currentIndex === index ? "3px solid white" : "none",
              }}
              onClick={() => selectMovie(index)}
            />
          ))}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={() => scrollCarousel("right")}
          style={{
            background: "#222",
            color: "#fff",
            padding: "8px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
            marginLeft: "10px",
          }}
        >
          ▶️
        </button>
      </div>
    </div>
  );
}