import type { WeatherData, ForecastDay } from './types';

const generateForecast = (tempRange: [number, number]): ForecastDay[] => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDay();
  const descriptions = ['Sunny', 'Partly Cloudy', 'Rainy', 'Cloudy', 'Storm', 'Slow', 'Thunder'];
  
  return Array.from({ length: 7 }, (_, i) => {
    const dayIndex = (today + i + 1) % 7;
    const dayName = days[dayIndex];
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
  "minsk": {
    current: { temperature: 21, description: 'Thunderstorm', high: 23, low: 18 },
    details: { humidity: 24, windSpeed: 13, chanceOfRain: 87 },
    forecast: [
      { day: 'Today', description: 'Thunderstorm', high: 21, low: 17 },
      { day: 'Tommorow', description: 'Rainy - Cloudy', high: 20, low: 17 },
      { day: 'Mon', description: 'Rainy', high: 20, low: 14 },
      { day: 'Tue', description: 'Rainy', high: 22, low: 16 },
      { day: 'Wed', description: 'Storm', high: 19, low: 13 },
      { day: 'Thu', description: 'Slow', high: 18, low: 12 },
      { day: 'Fri', description: 'Thunder', high: 23, low: 19 },
      { day: 'Sat', description: 'Rainy', high: 25, low: 17 },
      { day: 'Sun', description: 'Storm', high: 21, low: 18 },
    ]
  },
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
  current: { temperature: 21, description: 'Thunderstorm', high: 23, low: 18 },
  details: { humidity: 24, windSpeed: 13, chanceOfRain: 87 },
  forecast: [
      { day: 'Today', description: 'Thunderstorm', high: 21, low: 17 },
      { day: 'Tommorow', description: 'Rainy - Cloudy', high: 20, low: 17 },
      { day: 'Mon', description: 'Rainy', high: 20, low: 14 },
      { day: 'Tue', description: 'Rainy', high: 22, low: 16 },
      { day: 'Wed', description: 'Storm', high: 19, low: 13 },
      { day: 'Thu', description: 'Slow', high: 18, low: 12 },
      { day: 'Fri', description: 'Thunder', high: 23, low: 19 },
      { day: 'Sat', description: 'Rainy', high: 25, low: 17 },
      { day: 'Sun', description: 'Storm', high: 21, low: 18 },
    ]
};


export const getWeatherData = (locationName: string): Promise<WeatherData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = mockWeatherData[locationName.toLowerCase()] || defaultWeather;
      const freshData = JSON.parse(JSON.stringify(data));
      
      const forecastData = [
        { day: 'Tommorow', description: 'Rainy - Cloudy', high: 20, low: 17 },
        { day: 'Mon', description: 'Rainy', high: 20, low: 14 },
        { day: 'Tue', description: 'Rainy', high: 22, low: 16 },
        { day: 'Wed', description: 'Storm', high: 19, low: 13 },
        { day: 'Thu', description: 'Slow', high: 18, low: 12 },
        { day: 'Fri', description: 'Thunder', high: 23, low: 19 },
        { day: 'Sat', description: 'Rainy', high: 25, low: 17 },
        { day: 'Sun', description: 'Storm', high: 21, low: 18 },
      ];

      freshData.forecast = [freshData.forecast[0], ...forecastData];
      
      resolve(freshData);
    }, 500); // Simulate network delay
  });
};
