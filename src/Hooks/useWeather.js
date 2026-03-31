import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

const API_KEY = (import.meta.env.VITE_WEATHER_API_KEY || "").trim();

const normalizeCoords = (lat, lon) => ({
  // 3 decimals keeps location accurate enough for weather while reducing GPS jitter refetches.
  lat: Number(lat.toFixed(3)),
  lon: Number(lon.toFixed(3)),
});

// 1. Helper to turn City Name -> Lat/Lon
const fetchCoords = async (city) => {
  const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;
  const res = await fetch(geoUrl);
  if (!res.ok) throw new Error("Failed to resolve city coordinates");
  const data = await res.json();
  if (data && data.length > 0) {
    return { lat: data[0].lat, lon: data[0].lon, name: data[0].name };
  }
  throw new Error("City not found");
};

// 2. Helper to get Weather by Lat/Lon
const fetchWeather = async (lat, lon, cityName) => {
  if (lat == null || lon == null) return null;

  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

  const [currentRes, forecastRes] = await Promise.all([
    fetch(currentUrl),
    fetch(forecastUrl),
  ]);

  if (!currentRes.ok || !forecastRes.ok) {
    throw new Error("Failed to fetch weather data");
  }

  const currentData = await currentRes.json();
  const forecastData = await forecastRes.json();

  return {
    current: currentData,
    forecast: forecastData.list,
    precise_name: cityName || currentData.name,
  };
};

export const useWeather = (searchQuery = "") => {
  const [coords, setCoords] = useState(null);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const normalizedQuery = searchQuery.trim();

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // Handle GPS watchPosition (only runs if no search query exists)
  useEffect(() => {
    if (normalizedQuery) return; // Skip GPS if user is searching

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    };

    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        const next = normalizeCoords(
          position.coords.latitude,
          position.coords.longitude,
        );

        setCoords((prev) => {
          if (prev?.lat === next.lat && prev?.lon === next.lon) {
            return prev;
          }
          return next;
        });
      },
      (error) => console.error("Location error:", error),
      geoOptions,
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, [normalizedQuery]);

  const query = useQuery({
    // Adding searchQuery to the key ensures the cache resets on new searches
    queryKey: ["weather", normalizedQuery, coords?.lat, coords?.lon, isOnline],
    queryFn: async () => {
     // if (!isOnline) {
     //   throw new Error("No internet connection");
    //  }

      let lat = coords?.lat;
      let lon = coords?.lon;
      let name = "";

      // Logic: If search exists, get those coords. Otherwise use GPS.
      if (normalizedQuery) {
        const geo = await fetchCoords(normalizedQuery);
        lat = geo.lat;
        lon = geo.lon;
        name = geo.name;
      }

      return fetchWeather(lat, lon, name);
    },
    // Enable if we have either a search term OR GPS coords
    enabled:
      isOnline &&
      (!!normalizedQuery || (coords?.lat != null && coords?.lon != null)),
    retry: isOnline,
    keepPreviousData: true,
    refetchOnConnect: true, 
    staleTime: Infinity,
  });

  return { ...query, isOnline };
};
