import {
  Cloud,
  CloudRain,
  Eye,
  Wind,
  Droplets,
  Gauge,
  Moon,
} from "lucide-react";
import Card from "./Card";

const InfoCards = ({ data }) => {
  if (!data) return null;

  const current = data.current;

  // 1. Precipitation Logic
  const rain = current.rain?.["1h"] || current.rain?.["3h"] || 0;

  // 2. Wind Logic
  const windSpeed = Math.round(current.wind.speed * 3.6); // m/s to km/h
  const getWindDir = (deg) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return directions[Math.round(deg / 45) % 8];
  };
  const windDir = getWindDir(current.wind.deg);
  const visibility = (current.visibility / 1000).toFixed(0);
  const calculateDewPoint = (temp, humidity) => {
    const a = 17.27;
    const b = 237.7;

    // Step 1: Calculate the Alpha constant
    const alpha = (a * temp) / (b + temp) + Math.log(humidity / 100.0);

    // Step 2: Calculate Dew Point
    const dp = (b * alpha) / (a - alpha);

    return Math.round(dp);
  };

  const dewPoint = calculateDewPoint(current.main.temp, current.main.humidity);

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 px-4 mb-20 ">
        {/* Precipitation */}
        <Card
          title="Precipitation"
          additionals={"for farmers"}
          icon={CloudRain}
          extra={
            rain > 0 ? `Rain in the last hour: ${rain}mm` : "No rain detected"
          }
        >
          <h2 className="text-3xl text-white font-semibold">
            {rain} <span className="text-lg text-white/70">mm</span>
          </h2>
        </Card>

        <Card title="Wind" icon={Wind} extra={`Direction: ${windDir}`}>
          <h2 className="text-3xl text-white font-semibold text-nowrap">
            {windSpeed} <span className="text-lg">km/h</span>
          </h2>
        </Card>
        {/* Dew Point */}
        <Card
          title={"Dew Point"}
          additionals={"For farmers"}
          icon={Droplets}
          extra={
            current.main.humidity < 50
              ? "Dry air conditions"
              : "Moisture level stable"
          }
        >
          <h2 className="text-3xl text-white font-semibold">{dewPoint}°</h2>
        </Card>

        {/* 2. Pressure */}
        <Card
          title="Pressure"
          icon={Gauge}
          extra={
            current.main.pressure > 1010 ? "Stable conditions" : "Low pressure"
          }
        >
          <h2 className="text-3xl text-white font-semibold text-nowrap">
            {current.main.pressure}{" "}
            <span className="text-lg text-white/70">hPa</span>
          </h2>
        </Card>

        <Card
          title="Visibility"
          icon={Eye}
          extra={visibility > 5 ? "Clear view" : "Hazy conditions"}
        >
          <h2 className="text-3xl text-white font-semibold">
            {visibility} <span className="text-lg">km</span>
          </h2>
        </Card>
        {/* Cloud Cover */}
        <Card
          title="Cloud Cover"
          additionals={"for farmers"}
          icon={Cloud}
          extra={
            current.clouds.all < 20
              ? "Ideal for crop drying"
              : current.clouds.all > 80
                ? "Reduced evaporation risk"
                : "Partial sun exposure"
          }
        >
          <h2 className="text-3xl text-white font-semibold">
            {current.clouds.all}%
          </h2>
        </Card>
      </div>
    </div>
  );
};

export default InfoCards;
