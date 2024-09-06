export interface WeatherData {
    latitude: number;
    longitude: number;
    generationtime_ms: number;
    utc_offset_seconds: number;
    timezone: string;
    timezone_abbreviation: string;
    elevation: number;
    hourly_units: {
        time: string;
        temperature_2m: string;
        precipitation_probability: string;
        wind_speed_10m: string;
        soil_moisture_1_to_3cm: string;
    };
    hourly: {
        time: string[];
        temperature_2m: number[];
        precipitation_probability: number[];
        wind_speed_10m: number[];
        soil_moisture_1_to_3cm: number[];
    };
    daily_units: {
        time: string;
        temperature_2m_max: string;
        temperature_2m_min: string;
        daylight_duration: string;
    };
    daily: {
        time: string[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        daylight_duration: number[];
    };
}

export interface WeatherResult {
    [date: string]: {
        daily: {
            temperature_2m_max: number;
            temperature_2m_min: number;
            daylight_duration: number;
        };
        hourly: {
            [hour: string]: {
                temperature_2m: number;
                precipitation_probability: number;
                wind_speed_10m: number;
                soil_moisture_1_to_3cm: number;
            };
        };
    };
}

export function transformWeatherData(data: WeatherData): WeatherResult {
    const result: WeatherResult = {};

    data.daily.time.forEach((date, index) => {
        result[date] = {
            daily: {
                temperature_2m_max: data.daily.temperature_2m_max[index],
                temperature_2m_min: data.daily.temperature_2m_min[index],
                daylight_duration: data.daily.daylight_duration[index],
            },
            hourly: {},
        };
    });

    data.hourly.time.forEach((time, index) => {
        const date = time.split('T')[0];
        const hour = time.split('T')[1]?.split(':')[0] || '00';

        if (result[date]) {
            result[date].hourly[`${hour}:00`] = {
                temperature_2m: data.hourly.temperature_2m[index],
                precipitation_probability: data.hourly.precipitation_probability[index],
                wind_speed_10m: data.hourly.wind_speed_10m[index],
                soil_moisture_1_to_3cm: data.hourly.soil_moisture_1_to_3cm[index],
            };
        }
    });

    return result;
}
