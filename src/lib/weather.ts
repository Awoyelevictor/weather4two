import type { WeatherData, ForecastDay } from './types';

const generateForecast = (tempRange: [number, number]): ForecastDay[] => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date().getDay();
  const descriptions = ['Sunny', 'Partly Cloudy', 'Rain', 'Cloudy', 'Thunderstorm', 'Snow'];
  
  return Array.from({ length: 7 }, (_, i) => {
    const dayIndex = (today + i) % 7;
    const dayName = i === 0 ? 'Today' : days[dayIndex];
    const high = Math.floor(Math.random() * (tempRange[1] - tempRange[0] + 5)) + tempRange[0];
    return {
      day: dayName,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      high: high,
      low: high - Math.floor(Math.random() * 5 + 5),
    };
  });
};

const mockWeatherData: Record<string, WeatherData> = {
  "new york": {
    current: { temperature: 72, description: 'Partly Cloudy', high: 75, low: 65 },
    details: { humidity: 60, windSpeed: 10, chanceOfRain: 20 },
    forecast: generateForecast([65, 75]),
  },
  "london": {
    current: { temperature: 60, description: 'Rain', high: 62, low: 55 },
    details: { humidity: 85, windSpeed: 15, chanceOfRain: 80 },
    forecast: generateForecast([55, 62]),
  },
  "tokyo": {
    current: { temperature: 80, description: 'Sunny', high: 85, low: 75 },
    details: { humidity: 70, windSpeed: 5, chanceOfRain: 10 },
    forecast: generateForecast([75, 85]),
  },
  "sydney": {
    current: { temperature: 68, description: 'Clear', high: 70, low: 60 },
    details: { humidity: 50, windSpeed: 12, chanceOfRain: 5 },
    forecast: generateForecast([60, 70]),
  },
  "current location": {
    current: { temperature: 78, description: 'Sunny', high: 82, low: 68 },
    details: { humidity: 55, windSpeed: 8, chanceOfRain: 15 },
    forecast: generateForecast([68, 82]),
  },
};

const defaultWeather: WeatherData = {
  current: { temperature: 65, description: 'Cloudy', high: 68, low: 58 },
  details: { humidity: 75, windSpeed: 7, chanceOfRain: 40 },
  forecast: generateForecast([58, 68]),
};


export const getWeatherData = (locationName: string): Promise<WeatherData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = mockWeatherData[locationName.toLowerCase()] || defaultWeather;
      // create a new copy to avoid mutation issues with forecast
      const freshData = JSON.parse(JSON.stringify(data));
      freshData.forecast = generateForecast([freshData.current.low, freshData.current.high]);
      if (locationName.toLowerCase() === 'current location') {
        freshData.forecast[0].description = 'Sunny';
        freshData.current.description = 'Sunny';
      }
      resolve(freshData);
    }, 500); // Simulate network delay
  });
};
