"use client";
import { useEffect, useState } from "react";
import { animate } from "motion/react";

const CACHE_KEY = "runeicons-github-stars";
const CACHE_TTL_MS = 60 * 60 * 1000;

interface CachedStars {
  count: number;
  fetchedAt: number;
}

function readCache(): CachedStars | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedStars;
    if (
      typeof parsed?.count !== "number" ||
      typeof parsed?.fetchedAt !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function useGitHubStars() {
  const [displayCount, setDisplayCount] = useState<string>("0");
  useEffect(() => {
    let controls: any;
    let cancelled = false;

    const show = (value: number) => {
      setDisplayCount(
        value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toString(),
      );
    };

    const cached = readCache();
    if (cached) {
      show(cached.count);
      if (Date.now() - cached.fetchedAt < CACHE_TTL_MS) return;
    }

    const fetchStars = async () => {
      try {
        const response = await fetch("https://api.github.com/repos/Nexvyn/runeicons");
        if (!response.ok) return;
        const data = await response.json();
        const stars = data.stargazers_count;
        if (typeof stars !== "number" || cancelled) return;
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ count: stars, fetchedAt: Date.now() } satisfies CachedStars),
          );
        } catch {
          // Storage may be unavailable; the count still renders.
        }
        if (cached) {
          if (cached.count !== stars) show(stars);
          return;
        }
        controls = animate(0, stars, {
          duration: 2,
          ease: "easeOut",
          onUpdate(value) {
            show(Math.floor(value));
          },
        });
      } catch (error) {
        console.error("Error fetching stars:", error);
      }
    };
    fetchStars();
    return () => {
      cancelled = true;
      if (controls) {
        controls.stop();
      }
    };
  }, []);
  return displayCount;
}
