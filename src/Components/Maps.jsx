import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- FIX FOR LEAFLET ICONS IN VITE/REACT ---
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper to move the map when coordinates update
function RecenterMap({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], 13);
  }, [lat, lon, map]);
  return null;
}

const Map = ({ data: weather, isLoading }) => {
  // Guard: Show a skeleton/loader if location isn't ready
  if (isLoading || !weather) {
    return (
      <div className="mx-auto px-4 mb-10">
        <div className="w-full bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 shadow-xl overflow-hidden relative">
          <div className="text-cyan-800 text-xs font-bold uppercase tracking-widest animate-pulse">
            Establishing Satellite Link...
          </div>
        </div>
      </div>
    );
  }

  const { lat, lon } = weather.current.coord;

  return (
    <div className="mx-auto px-4 mb-10">
      <div className="w-full bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl overflow-hidden relative">
        {/* GLASSY HEADER */}

        <div className="flex p-4 justify-between items-start mb-2">
          <div>
            <h3 className="text-white text-sm font-semibold tracking-tight">
              Field Map
            </h3>
            <p className="text-[10px] text-cyan-800 font-bold uppercase tracking-widest">
              {weather.precise_name || "Current Location"}
            </p>
          </div>
          <div>
            <span className="text-[9px] text-slate-800 font-mono block">
              LAT: {lat.toFixed(4)}
            </span>
            <span className="text-[9px] text-slate-800 font-mono block">
              LON: {lon.toFixed(4)}
            </span>
          </div>
        </div>

        {/* MAP AREA */}
        <div className="h-62.5  relative z-0">
          <MapContainer
            center={[lat, lon]}
            zoom={13}
            scrollWheelZoom={false}
            zoomControl={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lon]} />
            <RecenterMap lat={lat} lon={lon} />
          </MapContainer>
        </div>

        {/* FOOTER ACTION */}
        <div className="p-4 flex justify-center items-center">
          <a
            href={`https://www.google.com/maps?q=${lat},${lon}`}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] text-white hover:text-cyan-800 hover:animate-pulse font-bold uppercase tracking-[0.2em] transition-all"
          >
            Open External satellite
          </a>
        </div>
      </div>
    </div>
  );
};

export default Map;
