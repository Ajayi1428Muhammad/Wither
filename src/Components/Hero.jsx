import { FaMapMarkerAlt } from "react-icons/fa"; // Using Alt for a cleaner look

const Hero = ({ data, isPending }) => {
  // 1. Data Mapping
  const displayTemp = data ? Math.round(data.current.main.temp) : "--";
  const displayLocation = data ? data.precise_name : "Locating...";
  const displayHigh = data ? Math.round(data.current.main.temp_max) : "--";
  const displayLow = data ? Math.round(data.current.main.temp_min) : "--";
  const displayDesc = data
    ? data.current.weather[0].description
    : "Syncing with satellites...";

  return (
    <div className="text-white mx-auto h-auto p-10 flex flex-col items-center justify-center gap-2">
      {/* Location Section */}
      <span className="flex justify-center items-center mb-1 text-center">
        <FaMapMarkerAlt
          className={`text-xl inline mr-3 transition-all duration-500 ${
            isPending
              ? "animate-pulse text-gray-500 text-xl"
              : "text-blue-700 text-xl drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]"
          }`}
        />
        <h1 className="inline text-4xl font-bold tracking-tight">
          {displayLocation}
        </h1>
      </span>

      {/* Main Stats */}
      <div className="flex flex-col items-center">
        {/* Temperature */}
        <div className="relative">
          <h1 className="text-[120px] font-light leading-none tracking-tighter">
            {displayTemp}
            <span className="text-4xl absolute top-6 -right-8 opacity-50">
              &deg;
            </span>
          </h1>
        </div>

        {/* Condition Description */}
        <h2 className="text-xl capitalize text-white/60 font-medium tracking-wide">
          {displayDesc}
        </h2>

        {/* High/Low Range */}
        <div className="flex items-center gap-6 mt-4 px-6 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm ">
          <span className="flex items-center gap-2">
            <span className="text-orange-400 font-bold text-xs uppercase opacity-70">
              High
            </span>
            <span className="text-lg font-mono">{displayHigh}&deg;</span>
          </span>
          <div className="w-px h-4 bg-white/10" /> {/* Vertical Divider */}
          <span className="flex items-center gap-2">
            <span className="text-blue-400 font-bold text-xs uppercase opacity-70">
              Low
            </span>
            <span className="text-lg font-mono">{displayLow}&deg;</span>
          </span>
        </div>
      </div>

      {/* Background Syncing Label */}
      {isPending && data && (
        <div className="flex items-center gap-2 mt-6">
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
          <p className="text-[10px] text-white/30 uppercase tracking-[0.3em]">
            Refreshing Data
          </p>
        </div>
      )}
    </div>
  );
};

export default Hero;
