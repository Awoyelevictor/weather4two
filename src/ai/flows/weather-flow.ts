'use server';
/**
 * @fileOverview A weather-generating AI agent that uses a tool to fetch weather data.
 *
 * - getWeather - A function that handles the weather data generation process.
 * - WeatherInput - The input type for the getWeather function.
 * - WeatherData - The return type for the getWeather function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type {WeatherData} from '@/lib/types';
import {WeatherDataSchema} from '@/lib/types';

export type WeatherInput = z.infer<typeof z.string>;
export type {WeatherData};

// This function will be called by the user's client code.
export async function getWeather(location: WeatherInput): Promise<WeatherData> {
  return weatherFlow(location);
}

const weatherFlow = ai.defineFlow(
  {
    name: 'weatherFlow',
    inputSchema: z.string(),
    outputSchema: WeatherDataSchema,
    config: {
        // Lower temperature to allow for more varied and creative responses
        temperature: 0.2,
    }
  },
  async (location) => {
    const weatherGenPrompt = ai.definePrompt({
      name: 'weatherGenPrompt',
      input: {schema: z.string()},
      output: {schema: WeatherDataSchema},
      prompt: `You are a weather API. Your purpose is to return weather data in JSON format based on a given location.

      Generate a realistic current weather conditions and a 7-day forecast for the following location: {{{input}}}

      Today is {{moment.day}}. The days of the week are Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday.
      The forecast should start from tomorrow. For the "day" field in the forecast, use the 3-letter abbreviation for the day of the week (e.g., Mon, Tue, Wed). The first entry in the forecast array should be for 'Tomorrow'.
      `,
    });

    const {output} = await weatherGenPrompt(location, {
        moment: {
            day: new Date().toLocaleString('en-US', {weekday: 'long'}),
        },
    });

    if (!output) {
        throw new Error('Could not generate weather data.');
    }
    
    return output;
  }
);
