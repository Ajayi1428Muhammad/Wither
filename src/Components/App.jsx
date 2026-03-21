import { Suspense, lazy, useEffect, useState } from "react";
import Hero from "./Hero";
import HourlyUpdate from "./HourlyUpdate";
import Updates1 from "./Updates1";
import DailyUpdate from "./DailyUpdate";
import Navbar from "./Navbar";
import InfoCards from "./InfoCards";
import Moon from "./Moon";
import { useWeather } from "../Hooks/useWeather";

const FarmerAnalytics = lazy(() => import("./FarmerAnalytics"));
const Maps = lazy(() => import("./Maps"));

const App = () => {
  const [selectedCity, setSelectedCity] = useState("");
  const [recentCities, setRecentCities] = useState(() => {
    try {
      const stored = localStorage.getItem("wither-recent-cities");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [toastMessage, setToastMessage] = useState("");
  const { data, isLoading, isPending, error, isOnline } =
    useWeather(selectedCity);
  const isSearching = !!selectedCity && isOnline && (isLoading || isPending);

  const handleSearchCity = (city) => {
    const cleanCity = city.trim();
    if (!cleanCity) return;
    setSelectedCity(cleanCity);
  };

  const handleUseCurrentLocation = () => {
    setSelectedCity("");
  };

  const handleRemoveRecentCity = (cityToRemove) => {
    setRecentCities((prev) => {
      const next = prev.filter((city) => city !== cityToRemove);
      localStorage.setItem("wither-recent-cities", JSON.stringify(next));
      return next;
    });
  };

  const handleClearRecentCities = () => {
    setRecentCities([]);
    localStorage.setItem("wither-recent-cities", JSON.stringify([]));
  };

  useEffect(() => {
    if (!selectedCity || !data?.precise_name) return;

    setRecentCities((prev) => {
      const next = [
        data.precise_name,
        ...prev.filter((c) => c !== data.precise_name),
      ].slice(0, 6);
      localStorage.setItem("wither-recent-cities", JSON.stringify(next));
      return next;
    });
  }, [data?.precise_name, selectedCity]);

  useEffect(() => {
    if (!error) return;

    if (error?.message === "No internet connection") return;

    const message =
      error?.message === "City not found"
        ? `Could not find \"${selectedCity}\". Try a nearby major city.`
        : "Search failed. Please check your connection and try again.";

    setToastMessage(message);
    const timer = setTimeout(() => setToastMessage(""), 4000);
    return () => clearTimeout(timer);
  }, [error, selectedCity]);

  return (
    <div className="no-scrollbar overflow-x-auto w-full h-screen ">
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-120 px-4 pt-4">
          <div className="mx-auto max-w-172.5 rounded-xl border border-red-300/50 bg-red-500/90 text-white text-sm px-4 py-3 shadow-xl backdrop-blur-md text-center">
            No internet connection. Reconnect to search cities and refresh
            weather data.
          </div>
        </div>
      )}
      <div className="mb-30 max-w-172.5 mx-auto ">
        <Hero data={data} isPending={isPending} />
        <HourlyUpdate data={data} isPending={isPending} isLoading={isLoading} />
        <Updates1 data={data} />
        <DailyUpdate data={data} isLoading={isLoading} />
        <InfoCards data={data} />
        <Moon />
        <Suspense
          fallback={
            <div className="px-4 py-6 text-white/60">Loading analytics...</div>
          }
        >
          <FarmerAnalytics data={data} isLoading={isLoading} error={error} />
        </Suspense>
        <Suspense
          fallback={
            <div className="px-4 py-6 text-white/60">Loading map...</div>
          }
        >
          <Maps data={data} isLoading={isLoading} />
        </Suspense>
      </div>
      <Navbar
        onSearchCity={handleSearchCity}
        onUseCurrentLocation={handleUseCurrentLocation}
        onRemoveRecentCity={handleRemoveRecentCity}
        onClearRecentCities={handleClearRecentCities}
        selectedCity={selectedCity}
        recentCities={recentCities}
        isSearching={isSearching}
        weatherData={data}
      />
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-110 px-4 w-full max-w-120">
          <div className="bg-rose-500/90 border border-rose-300/50 text-white text-sm rounded-xl px-4 py-3 shadow-xl backdrop-blur-md text-center">
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
