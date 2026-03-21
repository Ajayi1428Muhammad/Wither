import { useState, useRef } from "react";

const Updates1 = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null); // Make sure this is defined at the top

  const locationLabel = data?.precise_name || "your area";

  // --- 🧠 UPDATED DYNAMIC ADVICE ---

  const getDrivingAdvice = () => {
    if (!data) return "Analysing road conditions...";
    const visibility = data.current.visibility / 1000;
    const isRaining = data.current.weather[0].main === "Rain";

    // Dynamically injecting the location name here
    if (isRaining)
      return `Caution: Wet roads in ${locationLabel}. Keep a safe distance.`;
    if (visibility < 5)
      return `Low visibility detected in ${locationLabel}. Drive carefully.`;
    return `Clear skies and good visibility for your commute around ${locationLabel}.`;
  };

  const getClothingAdvice = () => {
    if (!data) return "Checking the feel...";
    const feelsLike = data.current.main.feels_like;
    const isRaining = data.current.weather[0].main === "Rain";

    if (isRaining) return "Rain expected. Waterproof layers are a must today.";
    if (feelsLike > 32)
      return "It's scorching! Light linens and hydration recommended.";
    return "Warm weather. Breathable cotton fabrics are best.";
  };

  const getFarmerAdvice = () => {
    if (!data) return "Checking farm readiness...";
    const windSpeed = data.current.wind.speed * 3.6;
    const humidity = data.current.main.humidity;

    if (windSpeed > 20)
      return `High winds in ${locationLabel}! Avoid spraying fertilizers.`;
    if (humidity > 80)
      return "High humidity. Watch for fungal growth on crops.";
    return `Perfect conditions for farm maintenance in ${locationLabel}.`;
  };

  const scrollToIndex = (i) => {
    if (scrollRef.current) {
      const width = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({
        left: i * width,
        behavior: "smooth",
      });
    }
  };
  const handleScroll = (e) => {
    const scroll = e.target.scrollLeft;
    const width = e.target.offsetWidth;
    const index = Math.round(scroll / width);
    setActiveIndex(index);
  };

  const adviceCards = [
    { title: "Farm Outlook", text: getFarmerAdvice() },
    { title: "Driving Difficulty", text: getDrivingAdvice() },
    { title: "Clothing Tip", text: getClothingAdvice() },
  ];

  return (
    <div className=" relative rounded-3xl weather-container overflow-hidden mt-6">
      <div
        onScroll={handleScroll}
        ref={scrollRef}
        className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory"
      >
        {adviceCards.map((card, i) => (
          <div
            key={i}
            className="min-w-full snap-center p-10 flex flex-col items-center justify-center text-center"
          >
            <h4 className="text-[10px] font-bold opacity-50 uppercase tracking-[0.3em] text-white">
              {card.title}
            </h4>
            <p className="text-sm mt-3 text-white/90 leading-relaxed max-w-70">
              {card.text}
            </p>
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 ">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            className={`transition-all duration-300 rounded-full h-1.5 z-20 ${
              activeIndex === i ? "bg-white w-4" : "bg-white/30 w-1.5"
            }`}
            aria-label={`Go to page ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Updates1;
