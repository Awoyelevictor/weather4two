import {getWeather} from '@/ai/flows/weather-flow';
import type {WeatherData} from './types';

export const getWeatherData = async (
  locationName: string
): Promise<WeatherData> => {
  return await getWeather(locationName);
};
