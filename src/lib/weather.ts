import type {WeatherData} from './types';

export const getWeatherData = async (
  locationName: string
): Promise<WeatherData> => {
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) {
    throw new Error('Missing WEATHER_API_KEY environment variable.');
  }
  const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${locationName}&days=7&aqi=no&alerts=no`);
  if (!response.ok) {
    throw new Error('Failed to fetch weather data.');
  }
  return await response.json();
};
