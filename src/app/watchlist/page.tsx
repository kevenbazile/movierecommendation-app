"use client";
import React, { useEffect, useState, useRef } from "react";

// Define the movie type
type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  trailer_url: string | null;
};

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const YOUTUBE_EMBED_URL = "https://www.youtube.com/embed/";

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const videoRefs = useRef<(HTMLIFrameElement | null)[]>([]);

  // ✅ Load watchlist from localStorage on mount
  useEffect(() => {
    const savedWatchlist = localStorage.getItem("watchlist");
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, []);

  // ✅ Auto-play & pause YouTube videos when in view
  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      const video = entry.target as HTMLIFrameElement;
      if (video.contentWindow) {
        video.contentWindow.postMessage(
          `{"event":"command","func":"${entry.isIntersecting ? "playVideo" : "pauseVideo"}","args":""}`,
          "*"
        );
      }
    });
  };

  // ✅ Use Intersection Observer for TikTok-style auto-play
  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.8, // Play when 80% visible
    });

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [watchlist]);

  // ✅ Prevent scroll blocking
  useEffect(() => {
    document.addEventListener("touchstart", () => {}, { passive: true });
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100vh",
        overflowY: "scroll",
        scrollSnapType: "y mandatory",
        backgroundColor: "#000",
      }}
    >
      {watchlist.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888", marginTop: "50px" }}>
          Your watchlist is empty.
        </p>
      ) : (
        watchlist.map((movie, index) => (
          <div
            key={movie.id}
            style={{
              position: "relative",
              width: "100vw",
              height: "100vh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#000",
              color: "#fff",
              overflow: "hidden",
              borderBottom: "10px solid #222",
              scrollSnapAlign: "start",
            }}
          >
            {/* YouTube Embedded Trailer */}
            <iframe
              ref={(el) => {
                if (el) videoRefs.current[index] = el;
              }}
              width="100%"
              height="100%"
              src={`${YOUTUBE_EMBED_URL}${movie.trailer_url}?autoplay=0&mute=1&controls=0&modestbranding=1&enablejsapi=1`}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={movie.title}
              style={{ objectFit: "cover" }}
            ></iframe>

            {/* Movie Details Overlay */}
            <div
              style={{
                position: "absolute",
                bottom: "15%",
                left: "5%",
                background: "rgba(0,0,0,0.7)",
                padding: "10px",
                borderRadius: "10px",
                fontSize: "18px",
              }}
            >
              <h3>{movie.title}</h3>
              <p>⭐ {movie.vote_average} | 📅 {movie.release_date}</p>
            </div>

            {/* Watch Full Trailer Button */}
            <div style={{ position: "absolute", bottom: "5%", left: "50%", transform: "translateX(-50%)" }}>
              <a
                href={`https://www.youtube.com/watch?v=${movie.trailer_url}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "#FF0000",
                  color: "#fff",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                🎬 Watch Full Trailer
              </a>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
