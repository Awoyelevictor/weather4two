'use server';
/**
 * @fileOverview A weather-generating AI agent.
 *
 * - getWeather - A function that handles the weather data generation process.
 * - WeatherInput - The input type for the getWeather function.
 * - WeatherData - The return type for the getWeather function, which is the same as the application's WeatherData type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type {WeatherData} from '@/lib/types';
import {
  CurrentWeatherSchema,
  DetailedStatsSchema,
  ForecastDaySchema,
  WeatherDataSchema,
} from '@/lib/types';

export type WeatherInput = z.infer<typeof z.string>;
export type {WeatherData};

export async function getWeather(location: WeatherInput): Promise<WeatherData> {
  return weatherFlow(location);
}

const prompt = ai.definePrompt({
  name: 'weatherPrompt',
  input: {schema: z.string()},
  output: {schema: WeatherDataSchema},
  prompt: `You are a weather API. Your purpose is to return weather data in JSON format based on a given location.

Generate a realistic current weather conditions and a 7-day forecast for the following location: {{{input}}}

Today is {{moment.day}}. The days of the week are Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday.
The forecast should start from tomorrow. For the "day" field in the forecast, use the 3-letter abbreviation for the day of the week (e.g., Mon, Tue, Wed). The first entry in the forecast array should be for 'Tomorrow'.
`,
});

const weatherFlow = ai.defineFlow(
  {
    name: 'weatherFlow',
    inputSchema: z.string(),
    outputSchema: WeatherDataSchema,
  },
  async (location) => {
    const {output} = await prompt(location, {
      moment: {
        day: new Date().toLocaleString('en-US', {weekday: 'long'}),
      },
    });
    return output!;
  }
);
