"use client";
import React, { useEffect, useState, useRef } from "react";

type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  trailer_url: string | null;
};

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const YOUTUBE_EMBED_URL = "https://www.youtube.com/embed/";

export default function TikTokStyleMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const videoRefs = useRef<(HTMLIFrameElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchPopularMovies();
  }, []);

  // ✅ Fetch movies
  const fetchPopularMovies = async () => {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    );
    const data = await response.json();
    setMovies(data.results);
  };

  // ✅ Auto-play trailers when in view
  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      const video = entry.target as HTMLIFrameElement;
      if (entry.isIntersecting) {
        video.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      } else {
        video.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      }
    });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, { threshold: 0.8 });
    videoRefs.current.forEach((video) => video && observer.observe(video));
    return () => observer.disconnect();
  }, [movies]);

  return (
    <div ref={containerRef} style={styles.container}>
      {movies.length === 0 ? (
        <p style={styles.emptyMessage}>Loading movies...</p>
      ) : (
        movies.map((movie, index) => (
          <div key={movie.id} style={styles.movieContainer}>
            {/* 🎬 YouTube Embedded Trailer */}
            <iframe
              ref={(el) => {
                if (el) videoRefs.current[index] = el;
              }}
              src={`${YOUTUBE_EMBED_URL}${movie.trailer_url}?autoplay=0&mute=1&controls=0&modestbranding=1&enablejsapi=1`}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={movie.title}
              style={styles.video}
            ></iframe>

            {/* 🎭 Movie Details Overlay */}
            <div style={styles.overlay}>
              <h2 style={styles.title}>{movie.title}</h2>
              <p style={styles.details}>⭐ {movie.vote_average} | 📅 {movie.release_date}</p>
              <a href={`https://www.themoviedb.org/movie/${movie.id}`} target="_blank" rel="noopener noreferrer" style={styles.watchButton}>
                🎬 Watch on TMDB
              </a>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ✅ Styles for the TikTok-like UI
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100vh",
    overflowY: "scroll",
    scrollSnapType: "y mandatory",
    backgroundColor: "#000",
  },
  movieContainer: {
    position: "relative",
    width: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    scrollSnapAlign: "start",
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  overlay: {
    position: "absolute",
    bottom: "15%",
    left: "5%",
    background: "rgba(0,0,0,0.7)",
    padding: "10px",
    borderRadius: "10px",
    fontSize: "18px",
    color: "white",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  details: {
    fontSize: "1rem",
    marginTop: "5px",
  },
  watchButton: {
    marginTop: "10px",
    display: "inline-block",
    background: "#FF4500",
    color: "#fff",
    padding: "8px 15px",
    borderRadius: "5px",
    textDecoration: "none",
    fontWeight: "bold",
  },
  emptyMessage: {
    color: "#888",
    marginTop: "50px",
    fontSize: "1.5rem",
  },
};

