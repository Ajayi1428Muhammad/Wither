const GEMINI_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY || "").trim();
const ASSISTANT_MODE = (import.meta.env.VITE_ASSISTANT_MODE || "local")
  .trim()
  .toLowerCase();
const GEMINI_MODEL = (
  import.meta.env.VITE_GEMINI_MODEL || "gemini-2.0-flash"
).trim();

export const assistantModeLabel =
  ASSISTANT_MODE === "gemini" ? "Gemini Live" : "Demo Mode (Local Advisor)";

const GEMINI_MODEL_CANDIDATES = [
  GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
].filter((value, index, self) => value && self.indexOf(value) === index);

const buildWeatherSnapshot = (weatherData) => {
  if (!weatherData?.current) {
    return {
      location: "your location",
      temp: null,
      humidity: null,
      windKmh: null,
      rainNow: 0,
      rainChance: null,
      condition: null,
    };
  }

  const current = weatherData.current;
  const nextRainChance = weatherData.forecast?.[0]?.pop;

  return {
    location: weatherData.precise_name || current.name || "your location",
    temp: Math.round(current.main?.temp ?? 0),
    humidity: current.main?.humidity ?? null,
    windKmh: Math.round((current.wind?.speed ?? 0) * 3.6),
    rainNow: current.rain?.["1h"] || current.rain?.["3h"] || 0,
    rainChance:
      nextRainChance == null ? null : Math.round(nextRainChance * 100),
    condition: current.weather?.[0]?.description || null,
  };
};

const localAdvice = (question, weatherData) => {
  const q = question.toLowerCase();
  const weather = buildWeatherSnapshot(weatherData);
  const rainRisk = Math.max(
    weather.rainNow > 0 ? 70 : 0,
    weather.rainChance ?? 0,
  );
  const highHumidity = (weather.humidity ?? 0) >= 82;
  const veryHot = (weather.temp ?? 0) >= 33;
  const windy = (weather.windKmh ?? 0) > 18;

  if (!weatherData?.current) {
    return "I do not have live weather data yet. Search for a city or enable GPS, then ask again for field advice.";
  }

  if (q.includes("transplant") || q.includes("seedling")) {
    if (rainRisk >= 65) {
      return `Transplanting in ${weather.location} is risky now due to rain risk (${rainRisk}%). Wait for a drier 6-12 hour window so roots can settle.`;
    }
    if ((weather.windKmh ?? 0) >= 24) {
      return `Avoid transplanting right now in ${weather.location}. Wind is strong (${weather.windKmh} km/h) and can stress or bend young seedlings.`;
    }
    if (veryHot && (weather.humidity ?? 0) < 55) {
      return `Transplanting is possible but stressful in ${weather.location} due to heat and dry air. Do it near sunset, pre-wet the bed lightly, and mulch immediately.`;
    }
    if (
      (weather.temp ?? 0) >= 20 &&
      (weather.temp ?? 0) <= 31 &&
      rainRisk < 40 &&
      (weather.windKmh ?? 0) < 18
    ) {
      return `Good transplanting window in ${weather.location}. Conditions are fairly stable; transplant now and keep soil evenly moist for the next 24 hours.`;
    }
    return `Conditions are acceptable for transplanting in ${weather.location}, but use caution. Prioritize evening transplanting and add mulch to reduce moisture loss.`;
  }

  if (q.includes("tomato") || q.includes("leaf")) {
    if (highHumidity) {
      return `Humidity is high in ${weather.location} (${weather.humidity}%), so tomato leaf disease risk is elevated. Increase spacing/airflow and avoid overhead watering.`;
    }
    return `Humidity is not critically high for tomato leaves in ${weather.location}. Keep morning checks for spots and water at root level.`;
  }

  if (q.includes("fungal") || q.includes("fungus") || q.includes("mildew")) {
    if (highHumidity || rainRisk >= 60) {
      return `Fungal pressure is moderate to high in ${weather.location} today. Prioritize airflow, remove wet lower leaves, and avoid late-evening irrigation.`;
    }
    return `Fungal risk is relatively low in ${weather.location} right now. Continue preventive scouting, especially after sunset.`;
  }

  if (q.includes("shade") || q.includes("shade net")) {
    if (veryHot) {
      return `Yes, shade nets are useful this afternoon in ${weather.location}. Heat is high, so protect tender crops from stress and sunscald.`;
    }
    return `Shade nets are optional today in ${weather.location}. Keep them ready if temperatures rise in the afternoon.`;
  }

  if (q.includes("dry") || q.includes("maize") || q.includes("harvest")) {
    if (rainRisk >= 45 || highHumidity) {
      return `Not ideal for open-air drying in ${weather.location}. Use covered drying or postpone to prevent re-wetting and mold risk.`;
    }
    return `Drying harvested maize outside should be fine in ${weather.location}. Spread thinly and cover quickly if clouds build.`;
  }

  if (
    q.includes("once or twice") ||
    q.includes("twice") ||
    q.includes("how many times")
  ) {
    if (rainRisk >= 50) {
      return `For ${weather.location}, skip extra irrigation today due to rain risk. One light check is enough unless soil is clearly dry.`;
    }
    if (veryHot && (weather.humidity ?? 0) < 60) {
      return `In ${weather.location}, split into two light irrigations (morning and late afternoon) to reduce evaporation loss.`;
    }
    return `One well-timed irrigation should be enough in ${weather.location} today, preferably early morning.`;
  }

  if (
    q.includes("safest") ||
    q.includes("task right now") ||
    q.includes("farm task")
  ) {
    if (rainRisk >= 60) {
      return `Safest task now in ${weather.location}: indoor/covered work like sorting seeds, tool maintenance, or storage checks. Avoid spraying and drying outdoors.`;
    }
    if (windy) {
      return `Safest task now in ${weather.location}: weeding, pruning, or irrigation checks. Avoid spraying while wind is around ${weather.windKmh} km/h.`;
    }
    return `A safe productive task now in ${weather.location} is transplant prep, weeding, or measured irrigation before late-day heat.`;
  }

  if (q.includes("umbrella") || q.includes("rain") || q.includes("go out")) {
    if (weather.rainNow > 0 || (weather.rainChance ?? 0) >= 60) {
      return `Yes, carry an umbrella in ${weather.location}. Rain is likely today (${weather.rainChance ?? "unknown"}% chance).`;
    }
    return `You can likely skip the umbrella in ${weather.location}. Current rain risk is low (${weather.rainChance ?? "unknown"}% chance).`;
  }

  if (
    q.includes("water") ||
    q.includes("wet") ||
    q.includes("plants") ||
    q.includes("irrigation")
  ) {
    if (weather.rainNow > 0 || (weather.rainChance ?? 0) >= 55) {
      return `Hold irrigation for now in ${weather.location}. Rainfall is present or likely, so overwatering risk is high.`;
    }
    if ((weather.humidity ?? 0) > 80) {
      return `Use light watering only in ${weather.location}. Humidity is already high (${weather.humidity}%), so reduce moisture stress risks.`;
    }
    return `Watering is reasonable today in ${weather.location}. Prefer early morning or late afternoon to reduce evaporation.`;
  }

  if (
    q.includes("spray") ||
    q.includes("fertilizer") ||
    q.includes("pesticide")
  ) {
    if ((weather.windKmh ?? 0) > 18) {
      return `Avoid spraying now in ${weather.location}. Wind speed is around ${weather.windKmh} km/h, which increases drift.`;
    }
    return `Spraying conditions are acceptable in ${weather.location}. Keep nozzles low and avoid peak sun hours.`;
  }

  return `For ${weather.location}: around ${weather.temp} C, humidity ${weather.humidity}%, wind ${weather.windKmh} km/h, and ${weather.condition}. Ask about irrigation, spraying, umbrella, or best farm work time for a specific recommendation.`;
};

const askGemini = async (question, weatherData) => {
  const weather = buildWeatherSnapshot(weatherData);

  const prompt = [
    "You are an agriculture weather assistant for smallholder farmers.",
    "Give practical, concise advice in 2-4 short sentences.",
    "When relevant, include one actionable next step and one caution.",
    `Weather context: location=${weather.location}, temp=${weather.temp}C, humidity=${weather.humidity}%, wind=${weather.windKmh}km/h, rain_now=${weather.rainNow}mm, rain_chance=${weather.rainChance}%, condition=${weather.condition}.`,
    `User question: ${question}`,
  ].join("\n");

  let lastError = "Gemini request failed";
  for (const apiVersion of ["v1beta", "v1"]) {
    for (const model of GEMINI_MODEL_CANDIDATES) {
      const endpoint = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 260,
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const answer = json?.candidates?.[0]?.content?.parts
          ?.map((part) => part.text)
          .join("\n")
          .trim();

        if (answer) return answer;
        lastError = `Gemini returned empty response for ${model} (${apiVersion})`;
        continue;
      }

      let apiMessage = "unknown error";
      try {
        const body = await res.json();
        apiMessage = body?.error?.message || JSON.stringify(body);
      } catch {
        try {
          apiMessage = await res.text();
        } catch {
          apiMessage = "no response body";
        }
      }

      lastError = `${res.status} for ${model} (${apiVersion}): ${apiMessage}`;

      // On auth/quota errors, stop trying other models and bubble fast.
      if (res.status === 401 || res.status === 403 || res.status === 429) {
        throw new Error(lastError);
      }
    }
  }

  throw new Error(lastError);
};

export const getFarmAssistantReply = async ({ question, weatherData }) => {
  if (ASSISTANT_MODE !== "gemini") {
    return localAdvice(question, weatherData);
  }

  if (!GEMINI_API_KEY) {
    return localAdvice(question, weatherData);
  }

  try {
    return await askGemini(question, weatherData);
  } catch (error) {
    console.error("Gemini fallback:", error?.message || error);
    return localAdvice(question, weatherData);
  }
};
