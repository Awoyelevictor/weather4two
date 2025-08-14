export interface CurrentWeather {
  temperature: number;
  description: string;
  high: number;
  low: number;
}

export interface DetailedStats {
  humidity: number;
  windSpeed: number;
  chanceOfRain: number;
}

export interface ForecastDay {
  day: string;
  description: string;
  high: number;
  low: number;
}

export interface WeatherData {
  current: CurrentWeather;
  details: DetailedStats;
  forecast: ForecastDay[];
}

export interface Location {
  id: string;
  name: string;
  isCurrent?: boolean;
}
