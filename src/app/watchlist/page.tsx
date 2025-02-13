"use client";
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthProvider";
import Link from "next/link";

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

export default function WatchlistPage() {
  const { user } = useAuth() || { user: null };
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playingTrailer, setPlayingTrailer] = useState<boolean>(false);
  const [fetchedTrailers, setFetchedTrailers] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedWatchlist = localStorage.getItem("watchlist");
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, []);

  // Fetch trailers only ONCE when watchlist length changes
  useEffect(() => {
    async function fetchTrailers() {
      if (watchlist.length > 0 && !fetchedTrailers) {
        const moviesWithTrailers = await Promise.all(
          watchlist.map(async (movie) => {
            if (!movie.video_key) {
              const trailerRes = await fetch(
                `https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
              );
              const trailerData = await trailerRes.json();
              const trailer = trailerData.results.find((vid: any) => vid.type === "Trailer");
              return { ...movie, video_key: trailer?.key || null };
            }
            return movie;
          })
        );
        setWatchlist(moviesWithTrailers);
        setFetchedTrailers(true); // Mark trailers as fetched to prevent re-renders
      }
    }
    fetchTrailers();
  }, [watchlist.length]); // ✅ Only runs when watchlist length changes, preventing infinite loops

  const removeFromWatchlist = (movie: Movie) => {
    const updatedWatchlist = watchlist.filter((m) => m.id !== movie.id);
    setWatchlist(updatedWatchlist);
    localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
  };

  const selectMovie = (index: number) => {
    setCurrentIndex(index);
    setPlayingTrailer(false); // Reset trailer when switching movies
  };

  const scrollCarousel = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 120;
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
      {/* Go Back Button */}
      <nav style={{ position: "absolute", top: "20px", left: "20px", zIndex: 10 }}>
        <Link href="/">
          <button
            style={{
              padding: "10px",
              background: "gray",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            ⬅️ Go Back
          </button>
        </Link>
      </nav>

      {/* Watchlist Movie Display */}
      {watchlist.length > 0 ? (
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
                  watchlist[currentIndex].poster_path
                    ? `${IMAGE_BASE_URL}${watchlist[currentIndex].poster_path}`
                    : "https://via.placeholder.com/320x180"
                }
                alt={watchlist[currentIndex].title}
                style={{
                  width: "320px",
                  height: "180px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
              {watchlist[currentIndex].video_key && (
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
                src={`${YOUTUBE_EMBED_URL}${watchlist[currentIndex].video_key}?autoplay=1&enablejsapi=1`}
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
          <h2 style={{ color: "#fff", textAlign: "center", marginTop: "10px", fontSize: "18px" }}>
            {watchlist[currentIndex].title}
          </h2>
          <p style={{ color: "#bbb", textAlign: "center", fontSize: "14px" }}>
            ⭐ {watchlist[currentIndex].vote_average} | 📅{" "}
            {watchlist[currentIndex].release_date}
          </p>

          {/* Remove from Watchlist Button */}
          <button
            onClick={() => removeFromWatchlist(watchlist[currentIndex])}
            style={{
              padding: "10px",
              marginTop: "10px",
              background: "red",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              width: "90%",
              maxWidth: "250px",
              fontSize: "14px",
            }}
          >
            ❌ Remove from Watchlist
          </button>
        </div>
      ) : (
        <p style={{ color: "#888", fontSize: "20px" }}>Your watchlist is empty.</p>
      )}

      {/* Clickable Movie Carousel */}
      {watchlist.length > 0 && (
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
          <button onClick={() => scrollCarousel("left")} style={{ background: "#222", color: "#fff", padding: "8px", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px", marginRight: "10px" }}>◀️</button>

          <div ref={scrollRef} style={{ display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", gap: "10px", width: "80%", paddingBottom: "5px", scrollbarWidth: "none" }}>
            {watchlist.map((movie, index) => (
              <img key={movie.id} src={`${IMAGE_BASE_URL}${movie.poster_path}`} alt={movie.title} style={{ width: "70px", height: "105px", cursor: "pointer", borderRadius: "5px", scrollSnapAlign: "start", border: currentIndex === index ? "3px solid white" : "none" }} onClick={() => selectMovie(index)} />
            ))}
          </div>

          <button onClick={() => scrollCarousel("right")} style={{ background: "#222", color: "#fff", padding: "8px", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px", marginLeft: "10px" }}>▶️</button>
        </div>
      )}
    </div>
  );
}
