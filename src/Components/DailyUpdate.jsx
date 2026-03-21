import {
  Cloud,
  CloudSun,
  Sun,
  CloudRain,
  CloudLightning,
  Loader2,
} from "lucide-react";

const DailyUpdate = ({ data, isLoading }) => {
  // PRODUCTION LOGIC: Group 40 blocks by date to find real Highs and Lows
  const processData = () => {
    if (!data?.forecast || !data?.current) return [];

    // 1. Group forecast by date (YYYY-MM-DD)
    const groups = data.forecast.reduce((acc, block) => {
      const date = block.dt_txt.split(" ")[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(block);
      return acc;
    }, {});

    // 2. Calculate daily stats
    const dailyStats = Object.keys(groups).map((date) => {
      const dayBlocks = groups[date];
      return {
        dt:
          dayBlocks.find((b) => b.dt_txt.includes("12:00:00"))?.dt ||
          dayBlocks[0].dt,
        // The real PRODUCTION math: find absolute max/min of the day
        temp_max: Math.max(...dayBlocks.map((b) => b.main.temp_max)),
        temp_min: Math.min(...dayBlocks.map((b) => b.main.temp_min)),
        condition:
          dayBlocks.find((b) => b.dt_txt.includes("12:00:00"))?.weather[0]
            .main || dayBlocks[0].weather[0].main,
        dateString: date,
      };
    });

    // 3. Prepare Display List: Start with Today (using live current data)
    const todayStr = new Date().toISOString().split("T")[0];

    const today = {
      isToday: true,
      dt: data.current.dt,
      main: data.current.main, // Current temp range
      weather: data.current.weather,
    };

    // Filter out today from the forecast so we don't repeat it
    const future = dailyStats.filter((day) => day.dateString !== todayStr);

    return [today, ...future].slice(0, 6); // Returns 6 days total
  };

  const displayList = processData();

  const getDayName = (dayObj) => {
    if (dayObj.isToday) return "Today";
    const date = new Date(dayObj.dt * 1000);
    return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
  };

  const getWeatherIcon = (main) => {
    switch (main) {
      case "Clear":
        return <Sun size={30} className="text-yellow-400" />;
      case "Rain":
        return <CloudRain size={30} className="text-blue-400" />;
      case "Thunderstorm":
        return <CloudLightning size={30} className="text-purple-400" />;
      case "Clouds":
        return <Cloud size={30} className="text-gray-300" />;
      default:
        return <CloudSun size={30} className="text-orange-200" />;
    }
  };

  return (
    <div className="weather-card-container">
      <div className="relative weather-container backdrop-blur-2xl bg-white/10 rounded-3xl border border-white/10 overflow-hidden mt-6">
        <div className="p-8 flex flex-col gap-6">
          <h3 className="text-white/50 text-xs font-bold uppercase tracking-widest">
            6-Day Forecast
          </h3>

          {(isLoading || displayList.length === 0
            ? [...Array(6)]
            : displayList
          ).map((day, i) => (
            <div
              key={i}
              className="flex py-2 justify-between items-center text-white border-b border-white/5 last:border-0"
            >
              {/* Day Name */}
              <div className="flex text-left font-medium w-16">
                {!day || isLoading ? "___" : getDayName(day)}
              </div>

              {/* Middle: Icon */}
              <div className="flex font-bold items-center gap-4 flex-1 justify-center">
                {!day || isLoading ? (
                  <Loader2 className="animate-spin opacity-20" size={24} />
                ) : (
                  getWeatherIcon(
                    day.isToday ? day.weather[0].main : day.condition,
                  )
                )}
              </div>

              {/* Right Side: High/Low */}
              <div className="flex text-right gap-4 text-xl font-mono">
                <div className="font-bold">
                  {!day || isLoading
                    ? "__"
                    : Math.round(
                        day.isToday ? day.main.temp_max : day.temp_max,
                      )}
                  &deg;
                </div>
                <div className="opacity-40">
                  {!day || isLoading
                    ? "__"
                    : Math.round(
                        day.isToday ? day.main.temp_min : day.temp_min,
                      )}
                  &deg;
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyUpdate;
