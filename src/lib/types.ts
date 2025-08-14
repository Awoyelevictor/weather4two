import {z} from 'zod';

export const CurrentWeatherSchema = z.object({
  temperature: z.number().describe('The current temperature in Celsius.'),
  description: z.string().describe('A short description of the weather (e.g., "Partly Cloudy").'),
  high: z.number().describe('The high temperature for the day in Celsius.'),
  low: z.number().describe('The low temperature for the day in Celsius.'),
});
export type CurrentWeather = z.infer<typeof CurrentWeatherSchema>;


export const DetailedStatsSchema = z.object({
  humidity: z.number().describe('The current humidity percentage.'),
  windSpeed: z.number().describe('The current wind speed in km/h.'),
  chanceOfRain: z.number().describe('The chance of rain as a percentage.'),
});
export type DetailedStats = z.infer<typeof DetailedStatsSchema>;


export const ForecastDaySchema = z.object({
  day: z.string().describe("The day of the week (e.g., 'Mon', 'Tomorrow')."),
  description: z.string().describe('A short description of the weather.'),
  high: z.number().describe('The high temperature for the day in Celsius.'),
  low: z.number().describe('The low temperature for the day in Celsius.'),
});
export type ForecastDay = z.infer<typeof ForecastDaySchema>;

export const WeatherDataSchema = z.object({
  current: CurrentWeatherSchema,
  details: DetailedStatsSchema,
  forecast: z.array(ForecastDaySchema).length(8),
});
export type WeatherData = z.infer<typeof WeatherDataSchema>;

export interface Location {
  id: string;
  name: string;
  isCurrent?: boolean;
}
