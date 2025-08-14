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

const getWeatherTool = ai.defineTool(
  {
    name: 'getWeatherTool',
    description: 'Returns weather data for a given location.',
    inputSchema: z.string().describe('The location to get weather for.'),
    outputSchema: WeatherDataSchema,
  },
  async (location) => {
    // In a real application, this is where you would call a third-party weather API.
    // For this example, we'll use another AI prompt to generate the data.
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
    return output!;
  }
);


const weatherFlow = ai.defineFlow(
  {
    name: 'weatherFlow',
    inputSchema: z.string(),
    outputSchema: WeatherDataSchema,
    config: {
        // Lower temperature to allow for more varied and creative responses
        temperature: 0.8
    }
  },
  async (location) => {
    const llmResponse = await ai.generate({
        prompt: `What is the weather in ${location}?`,
        // Make the tool available to the model
        tools: [getWeatherTool],
    });

    // The model will automatically call the tool and return the output.
    const toolOutput = llmResponse.toolRequest?.tool.output;

    if (!toolOutput) {
        throw new Error('The model did not return weather data.');
    }
    
    // We need to parse the tool output as it's returned as a string.
    return WeatherDataSchema.parse(toolOutput);
  }
);
