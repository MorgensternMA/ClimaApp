import { Context } from "@oakserver/oak";
import prisma from "../services/prisma";
import { transformWeatherData } from "../services/weather";

export async function getWeather(ctx: Context) {

  if (!ctx.state.api_key_id) {
    ctx.response.status = 401;
    ctx.response.body = JSON.stringify({ error: "unauthorized." });
    return;
  }

  const lat = Number(ctx.request.url.searchParams.get("latitude")) ?? NaN;
  const lon = Number(ctx.request.url.searchParams.get("longitude")) ?? NaN;

  if (!isValidCoordinates(lat, lon)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Latitude and longitude must be valid numbers within the allowed range." };
    return;
  }

  try {
    const cacheKey = `lat:${lat},lon:${lon}`;
    let weatherData = await getCachedWeatherData(cacheKey);

    if (!weatherData) {
      weatherData = await getWeatherData(lat, lon);

      await prisma.weather_request.create({
        data: {
          location: cacheKey,
          response: weatherData as any,
          api_key_id: parseInt(ctx.state.api_key_id),
        },
      });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1);

      await prisma.cache.create({
        data: {
          location: cacheKey,
          response: weatherData as any,
          expires_at: expiresAt,
        },
      });
    }

    ctx.response.status = 200;
    ctx.response.body = JSON.stringify(transformWeatherData(weatherData as any), null, 2);
  } catch (error) {
    if (error instanceof Error) {
      ctx.response.status = 500;
      ctx.response.body = { error: error.message };
    } else {
      ctx.response.status = 500;
      ctx.response.body = {
        error: "Unknown error processing the request.",
      };
    }
  }
}

function isValidCoordinates(lat: number, lon: number): boolean {
  return !isNaN(lat) && !isNaN(lon) &&
    lat >= -90 && lat <= 90 &&
    lon >= -180 && lon <= 180;
}


// Función para obtener el clima
const getWeatherData = async (latitude: number, longitude: number) => {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation_probability,wind_speed_10m,soil_moisture_1_to_3cm&daily=temperature_2m_max,temperature_2m_min,daylight_duration`
  );
  if (!response.ok) {
    throw new Error("Error retrieving weather data.");
  }
  return response.json();
};

const getCachedWeatherData = async (location: string) => {
  const now = new Date();
  const cacheEntry = await prisma.cache.findFirst({
    where: {
      location: location,
      expires_at: {
        gte: now,
      },
    },
  });
  return cacheEntry?.response || null;
};

