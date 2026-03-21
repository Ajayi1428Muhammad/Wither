import {
  BarChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { useMemo } from "react";

const FarmerAnalytics = ({ data, isLoading, error }) => {
  // 1. DATA TRANSFORMATION LOGIC
  const analyticsData = useMemo(() => {
    if (!data?.forecast) return [];

    const dayMap = {};

    data.forecast.forEach((item) => {
      // Create a key based on the date
      const dateKey = item.dt_txt.split(" ")[0];
      const dayName = new Date(item.dt * 1000).toLocaleDateString("en-US", {
        weekday: "short",
      });

      if (!dayMap[dateKey]) {
        dayMap[dateKey] = {
          name: dayName,
          tempMax: item.main.temp,
          humidity: item.main.humidity,
          rainProb: item.pop, // Probability of precipitation (0 to 1)
          count: 1,
        };
      } else {
        dayMap[dateKey].tempMax = Math.max(
          dayMap[dateKey].tempMax,
          item.main.temp,
        );
        dayMap[dateKey].humidity += item.main.humidity;
        dayMap[dateKey].rainProb = Math.max(dayMap[dateKey].rainProb, item.pop); // Peak rain chance
        dayMap[dateKey].count++;
      }
    });

    // Convert object to array for Recharts and format values
    return Object.values(dayMap).map((d) => ({
      name: d.name,
      temp: Math.round(d.tempMax),
      humidity: Math.round(d.humidity / d.count),
      rain: Math.round(d.rainProb * 100), // Convert 0.85 to 85%
    }));
  }, [data]);

  if (isLoading)
    return <div className="p-4 text-cyan-400">Loading Fields...</div>;
  if (error) return <div className="p-4 text-red-400">Error loading data</div>;
  const locationLabel = data?.precise_name || "your area";

  return (
    <div className="flex flex-col gap-6 p-4 weather-card-container">
      {/* CHART 1: RAINFALL PERCENTAGE (BAR) */}
      <div className="weather-container backdrop-blur-2xl bg-white/10 p-5 rounded-3xl border border-white/10 ">
        <h3 className="text-white text-sm font-semibold mb-6 flex items-center gap-2">
          Rainfall Probability (%)
        </h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={analyticsData}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#ffffff10"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#ffffff", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#ffffff", fontSize: 10 }}
              />
              <Tooltip
                cursor={{ fill: "#ffffff05" }}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                }}
              />
              <Bar
                dataKey="rain"
                fill="blue"
                radius={[6, 6, 0, 0]}
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 2: THE "CROP STRESS" CHART (COMPOSED) */}
      <div className=" p-5 rounded-3xl border border-white/5 weather-container backdrop-blur-2xl bg-white/10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white text-sm font-semibold">
            Temperature(°C) vs Humidity(%)
          </h3>
          <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">
            Field Insights
          </span>
        </div>
        <div className=" w-full">
          <ResponsiveContainer width="100%" aspect={2}>
            <ComposedChart
              data={analyticsData}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#ffffff10"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                padding={{ left: 20, right: 20 }}
                tick={{ fill: "#ffffff", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#ffffff", fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                }}
              />

              {/* Humidity as a soft area */}
              <Area
                type="monotone"
                dataKey="humidity"
                fill="url(#areaGradient)"
                stroke="none"
              />

              {/* Temperature as a sharp glowing line */}
              <Line
                type="monotone"
                dataKey="temp"
                stroke="Blue"
                strokeWidth={3}
                dot={{ r: 4, fill: "#c084fc" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[12px] text-slate-700 mt-4 text-center italic">
          {`High temp + Low humidity = Increase irrigation for ${locationLabel} crops`}
        </p>
      </div>
    </div>
  );
};

export default FarmerAnalytics;
