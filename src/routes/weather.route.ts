import { Context } from "@oakserver/oak";
import prisma from "../services/prisma";
import { transformWeatherData } from "../services/weather";

export async function getWeather(ctx: Context) {

  const lat = Number(ctx.request.url.searchParams.get("latitude"));
  const lon = Number(ctx.request.url.searchParams.get("longitude"));

  if (!isValidCoordinates(lat, lon)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Latitud y longitud deben ser números válidos dentro del rango permitido." };
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
    // Manejo del error
    if (error instanceof Error) {
      ctx.response.status = 500;
      ctx.response.body = { error: error.message };
    } else {
      ctx.response.status = 500;
      ctx.response.body = {
        error: "Error desconocido al procesar la solicitud.",
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
    throw new Error("Error al obtener los datos meteorológicos");
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

