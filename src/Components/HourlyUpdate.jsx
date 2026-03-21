import {
  Cloud,
  CloudSun,
  Sun,
  CloudRain,
  CloudLightning,
  Loader2,
} from "lucide-react";

const HourlyUpdate = ({ data, isPending, isLoading }) => {
  // --- NEW LOGIC: PREPARE DATA TO AVOID SKIPPING ---
  const prepareHourlyData = () => {
    if (!data || !data.forecast) return [];

    // 1. Create the "Now" entry from current weather
    const nowEntry = {
      dt: Math.floor(Date.now() / 1000),
      main: data.current.main,
      weather: data.current.weather,
      wind: data.current.wind,
      isNow: true,
    };

    // 2. Filter forecast to only show things in the future
    const currentTime = Math.floor(Date.now() / 1000);
    const futureForecast = data.forecast.filter(
      (block) => block.dt > currentTime,
    );

    // Combine them (Now + next 7 future blocks)
    return [nowEntry, ...futureForecast.slice(0, 7)];
  };

  const hourlyList = prepareHourlyData();

  // Helper to format time
  const formatTime = (dt, isNow) => {
    if (isNow) return "Now";
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: true,
    }).format(new Date(dt * 1000));
  };

  const getIcon = (main) => {
    switch (main) {
      case "Clear":
        return <Sun size={32} className="text-yellow-400" />;
      case "Rain":
        return <CloudRain size={32} className="text-blue-400" />;
      case "Thunderstorm":
        return <CloudLightning size={32} className="text-purple-400" />;
      case "Clouds":
        return <Cloud size={32} className="text-gray-300" />;
      default:
        return <CloudSun size={32} />;
    }
  };

  // 3. Summary Logic: Look at the first FUTURE block (index 1) for the banner
  // This ensures the banner tells you about the 1PM rain even while you're in the "Now" slot
  const nextChange = hourlyList[1] || hourlyList[0];
  const summaryCondition = nextChange?.weather[0].description || " ";
  const summaryTime = nextChange
    ? formatTime(nextChange.dt, nextChange.isNow)
    : "...";
  const summaryWind = nextChange
    ? Math.round(nextChange.wind.speed * 3.6)
    : "0";

  return (
    <div className="weather-card-container">
      <div className="weather-container backdrop-blur-2xl bg-white/10 rounded-3xl border border-white/10 overflow-hidden">
        {/* Top Summary Banner */}
        <div className="p-4 text-sm text-white/90 flex items-center gap-2">
          <span className="capitalize">
            {isLoading
              ? "_ _"
              : `${summaryCondition} expected around ${summaryTime}. Wind gusts are up to ${summaryWind} km/h.`}
          </span>
        </div>

        <hr className="border-white/10 mx-2" />

        {/* Scrollable Timeline */}
        <div className="flex gap-8 mt-4 justify-start p-5 overflow-x-auto no-scrollbar scroll-smooth">
          {(isPending || hourlyList.length === 0
            ? [...Array(8)]
            : hourlyList
          ).map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-4 min-w-16.25 text-white/90"
            >
              {/* Time Label */}
              <span className="text-xs font-bold uppercase opacity-60">
                {!item ? "__" : formatTime(item.dt, item.isNow)}
              </span>

              {/* Weather Icon */}
              <span className="text-white drop-shadow-lg">
                {!item ? (
                  <Loader2 className="animate-spin opacity-20" size={24} />
                ) : (
                  getIcon(item.weather[0].main)
                )}
              </span>

              {/* Temperature */}
              <span className="font-bold text-xl">
                {!item ? "__" : Math.round(item.main.temp)}&deg;
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HourlyUpdate;
