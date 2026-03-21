import  { useState, useEffect } from "react";

const Moon = () => {
  const [lunarData, setLunarData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHijri = async () => {
      try {
        const today = new Date();
        const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
        // AlAdhan API gives us the Arabic month name and year automatically
        const res = await fetch(
          `https://api.aladhan.com/v1/gToH?date=${dateStr}`,
        );
        const json = await res.json();
        setLunarData(json.data.hijri);
        setLoading(false);
      } catch (err) {
        console.error("Lunar Fetch Error", err);
      }
    };
    fetchHijri();
  }, []);

  if (loading)
    return (
      <div className="p-10 text-white/20 animate-pulse">Scanning Sky...</div>
    );

  const day = parseInt(lunarData.day);
  const monthAr = lunarData.month.en; // رَمَضان
  const yearAr = lunarData.year; // ١٤٤٧
  const getPhaseName = (day) => {
    if (day === 1) return "New Moon";
    if (day > 1 && day < 7) return "Waxing Crescent";
    if (day >= 7 && day < 14) return "Waxing Gibbous";
    if (day >= 14 && day <= 16) return "Full Moon";
    if (day > 16 && day < 23) return "Waning Gibbous";
    if (day >= 23 && day < 29) return "Waning Crescent";
    return "New Moon";
  };

  // 1. Position Logic: 0% to 100% across the line
  const position = (day / 30) * 100;
  
  // 2. Gradient Logic: The moon should be brightest at day 14/15 (Full Moon)
  // We calculate "how much white" vs "how much shadow"
  return (
    <div>
      <div className=" mx-auto px-4 mb-10 ">
        <div className="w-full bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 shadow-xl overflow-hidden relative">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-white font-bold text-lg">Lunar Tracker</h3>
              <p className="text-white/60 text-xs">
                {monthAr} {day}, {yearAr} AH
              </p>
            </div>
            <div
              className={`bg-white/10 px-3 py-1 rounded-full border border-white/10 relative ${
                day >= 14 && day <= 16
                  ? "border-amber-400/60 shadow-[0_0_15px_rgba(251,191,36,0.4)] bg-amber-400/40"
                  : "border-cyan-400/60 shadow-[0_0_15px_rgba(34,211,238,0.4)] bg-cyan-400/40"
              }`}
            >
              <span className="font-black text-white text-[10px]  uppercase tracking-widest">
                {getPhaseName(day)}
              </span>
            </div>
          </div>

          <div className="absolute inset-0 rounded-lg bg-linear-to-tr from-white/50 to-transparent pointer-events-none" />
          {/* The Visual Moon Section */}
          <div className="flex flex-col items-center justify-center py-4 mx-auto">
            <div className="relative w-full h-1 bg-white/10 rounded-full mt-8 mb-4">
              {/* The Moon "Node" - positioned along the line based on the day of the month */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-2000 ease-in-out"
                style={{
                  left: `${position - 2}%`,
                }}
              >
                <div className="w-12 h-12 transition-all duration-700 rounded-full bg-linear-to-br from-white to-gray-400 shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
                <p className="text-white text-[10px] mt-2 text-center font-semibold">
                  Day {day}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Logic */}
          <div className="mt-4 flex justify-between text-[11px] text-blue-800">
            <span>New Moon</span>
            <span>Full Moon (14th)</span>
            <span>Next Month</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Moon;
