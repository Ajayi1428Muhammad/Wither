import { Suspense, lazy, useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import Hero from "./Hero";
import HourlyUpdate from "./HourlyUpdate";
import Updates1 from "./Updates1";
import DailyUpdate from "./DailyUpdate";
import Navbar from "./Navbar";
import InfoCards from "./InfoCards";
import Moon from "./Moon";
// import BrandLogo from "./BrandLogo";
import WelcomeLoader from "./WelcomeLoader";
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
  const [hasBootstrapped, setHasBootstrapped] = useState(false);
  const { data, isLoading, isPending, error, isOnline } =
    useWeather(selectedCity);
  const isSearching = !!selectedCity && isOnline && (isLoading || isPending);
  const isFetchingWeather = isLoading || isPending;

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

  useEffect(() => {
    if (hasBootstrapped) return;

    if (data || error) {
      setHasBootstrapped(true);
      return;
    }

    // Prevents indefinite splash when geolocation is blocked and query never starts.
    const fallbackTimer = setTimeout(() => {
      if (!isFetchingWeather) {
        setHasBootstrapped(true);
      }
    }, 3200);

    return () => clearTimeout(fallbackTimer);
  }, [data, error, hasBootstrapped, isFetchingWeather]);

  const showWelcomeLoader = !hasBootstrapped && (isFetchingWeather || !data);

  return (
    <div className="no-scrollbar overflow-x-auto w-full h-screen ">
      <WelcomeLoader show={showWelcomeLoader} />
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-120 px-4 pt-4">
          <div className="mx-auto max-w-172.5 rounded-xl border border-red-300/50 bg-red-500/90 text-white text-sm px-4 py-3 shadow-xl backdrop-blur-md text-center">
            No internet connection. Reconnect to search cities and refresh
            weather data.
          </div>
        </div>
      )}
      {/* <div
        className={`fixed left-1/2 -translate-x-1/2 z-50 px-4 transition-all duration-300 ${
          !isOnline ? "top-20" : "top-4"
        }`}
      >
        <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2 shadow-lg backdrop-blur-md">
          <BrandLogo size={34} loading={isFetchingWeather} withText />
        </div>
      </div> */}
      <div className="mb-30 max-w-172.5 mx-auto pt-5">
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
        <section className="px-4 pt-4 pb-6">
          <div className="rounded-2xl border border-white/20 bg-slate-950/30 p-4 sm:p-5 backdrop-blur-xl shadow-xl">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.22em] text-cyan-100/70">
              Community Feedback
            </p>
            <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm sm:text-base text-white/90 leading-relaxed max-w-120">
                Help improve Wither before we roll out full CMS support. Share
                bugs, feature requests, or UI suggestions in a quick form.
              </p>
              <a
                href="https://forms.gle/f8YQ5dFKohHnK6gRA"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-cyan-300/40 bg-cyan-400/20 px-4 py-2.5 text-sm font-semibold text-cyan-50 hover:bg-cyan-400/35 transition-colors"
              >
                Send Feedback
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>
        </section>
      </div>
      <Navbar
        onSearchCity={handleSearchCity}
        onUseCurrentLocation={handleUseCurrentLocation}
        onRemoveRecentCity={handleRemoveRecentCity}
        onClearRecentCities={handleClearRecentCities}
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
      <Analytics />
    </div>
  );
};

export default App;
