'use client';

import { useState, useEffect, useCallback, useMemo, type FC } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { WeatherData, Location, ForecastDay } from '@/lib/types';
import { getWeatherData } from '@/lib/weather';
import { getWeatherIcon, Icons } from '@/components/icons';
import { MoreHorizontal, ChevronLeft, Calendar, Sun, Moon } from 'lucide-react';

// Custom hook for localStorage
const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};


const HourlyForecast = ({ forecast, selectedTime }: { forecast: { time: string, temp: number, description: string }[], selectedTime: string }) => (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Today</h3>
            <Button variant="ghost" size="sm">7 days <ChevronLeft className="h-4 w-4 rotate-180" /></Button>
        </div>
        <div className="flex justify-around">
            {forecast.map(({ time, temp, description }) => (
                <div key={time} className={`text-center p-2 rounded-full ${selectedTime === time ? 'bg-primary text-primary-foreground' : ''}`}>
                    <p className="text-lg font-medium">{temp}°</p>
                    <div className="w-8 h-8 mx-auto my-2">
                      {getWeatherIcon(description, { className: "w-8 h-8" })}
                    </div>
                    <p className="text-sm">{time}</p>
                </div>
            ))}
        </div>
    </div>
);


const DailyForecast = ({ forecast }: { forecast: ForecastDay[] }) => (
  <div className="space-y-2">
    {forecast.slice(1).map(day => (
      <div key={day.day} className="flex justify-between items-center">
        <span className="w-1/4">{day.day}</span>
        <div className="flex items-center gap-2">
          {getWeatherIcon(day.description, { className: "w-6 h-6" })}
          <span>{day.description}</span>
        </div>
        <span>+{day.high}° +{day.low}°</span>
      </div>
    ))}
  </div>
);

const WeatherDetails = ({ humidity, wind, rain }: { humidity: number, wind: number, rain: number }) => (
  <div className="flex justify-around text-center bg-card/50 backdrop-blur-sm p-4 rounded-2xl">
    <div>
      <Icons.Wind className="w-6 h-6 mx-auto mb-1" />
      <p className="font-bold">{wind} km/h</p>
      <p className="text-xs text-muted-foreground">Wind</p>
    </div>
    <div>
      <Icons.Droplets className="w-6 h-6 mx-auto mb-1" />
      <p className="font-bold">{humidity}%</p>
      <p className="text-xs text-muted-foreground">Humidity</p>
    </div>
    <div>
      <Icons.Waves className="w-6 h-6 mx-auto mb-1" />
      <p className="font-bold">{rain}%</p>
      <p className="text-xs text-muted-foreground">Chance of rain</p>
    </div>
  </div>
);

export const WeatherApp: FC = () => {
  const [locations, setLocations] = useLocalStorage<Location[]>('weather-locations', [{id: '1', name: 'Minsk'}]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'daily' | 'weekly'>('daily');
  const { toast } = useToast();
  const [time, setTime] = useState('11:00');

  const handleSelectLocation = useCallback(async (location: Location) => {
    setSelectedLocation(location);
    setIsLoading(true);
    setWeatherData(null);
    try {
      const data = await getWeatherData(location.name);
      setWeatherData(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch weather data.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    if (locations.length > 0 && !selectedLocation) {
      handleSelectLocation(locations[0]);
    }
  }, [locations, selectedLocation, handleSelectLocation]);


  const hourlyForecastData = [
      { time: '10:00', temp: 23, description: 'Partly Cloudy' },
      { time: '11:00', temp: 21, description: 'Thunderstorm' },
      { time: '12:00', temp: 22, description: 'Partly Cloudy' },
      { time: '01:00', temp: 19, description: 'Cloudy' }
  ];

  return (
    <div className="w-full max-w-sm mx-auto bg-background rounded-3xl shadow-2xl overflow-hidden font-body">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-4 h-[812px] flex flex-col justify-center">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </motion.div>
        ) : view === 'daily' && weatherData && selectedLocation ? (
          <motion.div key="daily" initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} className="p-6 bg-gradient-to-b from-blue-400 to-blue-600 text-white min-h-[812px] flex flex-col">
            <header className="flex justify-between items-center mb-4">
              <Button variant="ghost" size="icon"><MoreHorizontal className="rotate-90" /></Button>
              <div className="text-center">
                <h1 className="text-xl font-bold">{selectedLocation.name}</h1>
                <span className="text-xs bg-black/20 text-white/80 px-2 py-0.5 rounded-full">Updating</span>
              </div>
              <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
            </header>

            <main className="flex-grow flex flex-col justify-between text-center">
              <div className="flex-grow flex flex-col items-center justify-center -mt-8">
                {getWeatherIcon(weatherData.current.description, { className: "w-48 h-48 drop-shadow-2xl"})}
                <h2 className="text-8xl font-bold tracking-tighter -mt-8">{weatherData.current.temperature}°</h2>
                <p className="text-2xl font-medium">{weatherData.current.description}</p>
                <p className="text-sm text-white/80">Monday, 17 May</p>
              </div>

              <div className="space-y-6">
                <WeatherDetails humidity={weatherData.details.humidity} wind={weatherData.details.windSpeed} rain={weatherData.details.chanceOfRain} />
                <div className="bg-card text-card-foreground p-4 rounded-3xl">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg">Today</h3>
                      <Button variant="ghost" size="sm" onClick={() => setView('weekly')}>
                          7 days <ChevronLeft className="h-4 w-4 rotate-180" />
                      </Button>
                  </div>
                  <div className="flex justify-around">
                      {hourlyForecastData.map(({ time, temp, description }) => (
                          <button key={time} onClick={() => setTime(time)} className={`text-center p-3 rounded-full ${time === '11:00' ? 'bg-primary text-primary-foreground' : ''}`}>
                              <p className="text-lg font-medium">{temp}°</p>
                              <div className="w-8 h-8 mx-auto my-2">
                                {getWeatherIcon(description, { className: "w-8 h-8" })}
                              </div>
                              <p className="text-sm">{time}</p>
                          </button>
                      ))}
                  </div>
                </div>
              </div>
            </main>
          </motion.div>
        ) : view === 'weekly' && weatherData ? (
          <motion.div key="weekly" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="p-6 bg-card text-card-foreground min-h-[812px] flex flex-col">
            <header className="flex justify-between items-center mb-4">
              <Button variant="ghost" size="icon" onClick={() => setView('daily')}><ChevronLeft /></Button>
              <h1 className="text-xl font-bold flex items-center gap-2"><Calendar className="w-5 h-5"/> 7 days</h1>
              <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
            </header>
            <main className="flex-grow">
              <div className="bg-gradient-to-b from-blue-400 to-blue-600 text-white rounded-3xl p-6 mb-6 text-center">
                  <p className="font-semibold">Tomorrow</p>
                  <div className="flex items-center justify-center gap-4 my-2">
                      {getWeatherIcon(weatherData.forecast[1].description, { className: "w-20 h-20" })}
                      <p className="text-7xl font-bold">
                          {weatherData.forecast[1].high}°
                          <span className="text-5xl text-white/70">/{weatherData.forecast[1].low}°</span>
                      </p>
                  </div>
                  <p>{weatherData.forecast[1].description}</p>
                  <div className="mt-4">
                    <WeatherDetails humidity={weatherData.details.humidity} wind={weatherData.details.windSpeed} rain={weatherData.details.chanceOfRain} />
                  </div>
              </div>

              <DailyForecast forecast={weatherData.forecast} />
            </main>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
