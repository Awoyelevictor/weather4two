
'use client';

import { useState, useEffect, useCallback, type FC } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { WeatherData, Location, ForecastDaySchema, HourSchema } from '@/lib/types';
import { getWeatherData } from '@/lib/weather';
import { Icons } from '@/components/icons';
import { MoreHorizontal, ChevronLeft, Calendar, Search, MapPin } from 'lucide-react';
import Image from 'next/image';
import { Input } from './ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      } else {
        setStoredValue(initialValue);
      }
    } catch (error) {
      console.error(error);
      setStoredValue(initialValue);
    }
  }, [key, initialValue]);

  const setValue = (value: T | ((val: T) => T)) => {
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

const DailyForecast = ({ forecast }: { forecast: (typeof ForecastDaySchema)[] }) => {
  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };
  return (
    <div className="space-y-2">
      {forecast.slice(1).map(day => (
        <div key={day.date_epoch} className="flex justify-between items-center">
          <span className="w-1/4">{getDayName(day.date)}</span>
          <div className="flex items-center gap-2">
            <Image src={`https:${day.day.condition.icon}`} alt={day.day.condition.text} width={24} height={24} />
            <span>{day.day.condition.text}</span>
          </div>
          <span>+{Math.round(day.day.maxtemp_c)}° +{Math.round(day.day.mintemp_c)}°</span>
        </div>
      ))}
    </div>
  );
};

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
  const [locations, setLocations] = useLocalStorage<Location[]>('weather-locations', []);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'daily' | 'weekly'>('daily');
  const { toast } = useToast();
  const [selectedHour, setSelectedHour] = useState<typeof HourSchema | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSelectLocation = useCallback(async (location: Location | null, forceRefresh = false) => {
    if (!location) return;
    
    setSelectedLocation(location);
    if (!weatherData || location.name !== weatherData.location.name || forceRefresh) {
      setIsLoading(true);
      setWeatherData(null);
      try {
        const data = await getWeatherData(location.name);
        setWeatherData(data);
        if (data.forecast.forecastday.length > 0 && data.forecast.forecastday[0].hour.length > 0) {
          const now = new Date();
          const currentHour = now.getHours();
          const closestHour = data.forecast.forecastday[0].hour.find(h => new Date(h.time).getHours() >= currentHour) || data.forecast.forecastday[0].hour[0];
          setSelectedHour(closestHour);
        }
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: (error as Error).message || 'Could not fetch weather data.',
        });
      } finally {
        setIsLoading(false);
      }
    }
  }, [toast, weatherData]);

  const fetchWeatherByCoords = useCallback(async (lat: number, lon: number) => {
    setIsLoading(true);
    setWeatherData(null);
    try {
      const data = await getWeatherData(`${lat},${lon}`);
      const newLocation: Location = {
        id: new Date().getTime().toString(),
        name: data.location.name,
        isCurrent: true,
      };
      
      setLocations(prevLocations => [newLocation, ...prevLocations.filter(l => !l.isCurrent)]);
      setSelectedLocation(newLocation);
      setWeatherData(data);

      if (data.forecast.forecastday.length > 0 && data.forecast.forecastday[0].hour.length > 0) {
        const now = new Date();
        const currentHour = now.getHours();
        const closestHour = data.forecast.forecastday[0].hour.find(h => new Date(h.time).getHours() >= currentHour) || data.forecast.forecastday[0].hour[0];
        setSelectedHour(closestHour);
      }
    } catch (error) {
      console.error('Failed to fetch weather by coordinates:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch weather for your location.',
      });
      // Fallback if location fetch fails
      if (locations.length > 0) {
        handleSelectLocation(locations[0]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [setLocations, toast, handleSelectLocation, locations]);


  useEffect(() => {
    if (!selectedLocation && locations !== null) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
          },
          (error) => {
            console.error('Geolocation error:', error);
            if (locations.length > 0) {
              handleSelectLocation(locations[0]);
            } else {
              setIsLoading(false);
            }
          }
        );
      } else {
          if (locations.length > 0) {
              handleSelectLocation(locations[0]);
          } else {
              setIsLoading(false);
          }
      }
    }
  }, [selectedLocation, locations, handleSelectLocation, fetchWeatherByCoords]);


  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedLocation) {
        handleSelectLocation(selectedLocation, true);
      }
    }, 10 * 60 * 1000); // Auto-update every 10 minutes

    return () => clearInterval(interval);
  }, [selectedLocation, handleSelectLocation]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const data = await getWeatherData(searchQuery.trim());
      const newLocation: Location = {
        id: new Date().getTime().toString(),
        name: data.location.name,
      };
      if (!locations.some(l => l.name.toLowerCase() === newLocation.name.toLowerCase())) {
        const newLocations = [...locations, newLocation];
        setLocations(newLocations);
        setSelectedLocation(newLocation);
        setWeatherData(data);
         if (data.forecast.forecastday.length > 0 && data.forecast.forecastday[0].hour.length > 0) {
          const now = new Date();
          const currentHour = now.getHours();
          const closestHour = data.forecast.forecastday[0].hour.find(h => new Date(h.time).getHours() >= currentHour) || data.forecast.forecastday[0].hour[0];
          setSelectedHour(closestHour);
        }
      } else {
        const existingLocation = locations.find(l => l.name.toLowerCase() === newLocation.name.toLowerCase())
        handleSelectLocation(existingLocation || null)
      }
      setSearchQuery('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'City not found',
        description: 'Please check the city name and try again.',
      });
    } finally {
      setIsSearching(false);
    }
  };


  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };
  
  return (
    <div className="w-full max-w-sm mx-auto bg-background rounded-3xl shadow-2xl overflow-hidden font-body">
      <AnimatePresence mode="wait">
        {isLoading && !weatherData ? (
          <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-4 h-[812px] flex flex-col justify-center">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </motion.div>
        ) : view === 'daily' && weatherData && selectedLocation && selectedHour ? (
          <motion.div key="daily" initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} className="p-6 bg-gradient-to-b from-blue-400 to-blue-600 text-white min-h-[812px] flex flex-col">
            <header className="flex justify-between items-center mb-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon"><MoreHorizontal className="rotate-90" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {locations.map(loc => (
                    <DropdownMenuItem key={loc.id} onClick={() => handleSelectLocation(loc)}>
                      <MapPin className="mr-2 h-4 w-4" />
                      <span>{loc.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="text-center">
                <h1 className="text-xl font-bold">{selectedLocation.name}</h1>
                <span className="text-xs bg-black/20 text-white/80 px-2 py-0.5 rounded-full">
                  {isLoading ? 'Updating...' : 'Updated'}
                </span>
              </div>
              <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
            </header>

            <form onSubmit={handleSearch} className="flex gap-2 my-2">
              <Input 
                type="text" 
                placeholder="Search for a city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/20 border-white/30 placeholder:text-white/70 text-white"
                disabled={isSearching}
              />
              <Button type="submit" variant="secondary" size="icon" disabled={isSearching}>
                <Search />
              </Button>
            </form>

            <main className="flex-grow flex flex-col justify-between text-center">
              <div className="flex-grow flex flex-col items-center justify-center -mt-8">
                <Image src={`https:${weatherData.current.condition.icon}`} alt={weatherData.current.condition.text} width={192} height={192} className="drop-shadow-2xl" />
                <h2 className="text-8xl font-bold tracking-tighter -mt-8">{Math.round(weatherData.current.temp_c)}°</h2>
                <p className="text-2xl font-medium">{weatherData.current.condition.text}</p>
                <p className="text-sm text-white/80">{getDayName(weatherData.location.localtime)}</p>
              </div>

              <div className="space-y-6">
                <WeatherDetails humidity={weatherData.current.humidity} wind={weatherData.current.wind_kph} rain={weatherData.forecast.forecastday[0].day.daily_chance_of_rain} />
                <Card className="bg-card text-card-foreground p-4 rounded-3xl">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg">Today</h3>
                      <Button variant="ghost" size="sm" onClick={() => setView('weekly')}>
                          7 days <ChevronLeft className="h-4 w-4 rotate-180" />
                      </Button>
                  </div>
                  <div className="flex justify-around">
                      {weatherData.forecast.forecastday[0].hour.filter((_,i) => i % 3 === 0).slice(0, 4).map((hour) => (
                          <button key={hour.time_epoch} onClick={() => setSelectedHour(hour)} className={`text-center p-3 rounded-full ${selectedHour?.time_epoch === hour.time_epoch ? 'bg-primary text-primary-foreground' : ''}`}>
                              <p className="text-lg font-medium">{Math.round(hour.temp_c)}°</p>
                              <div className="w-8 h-8 mx-auto my-2">
                                <Image src={`https:${hour.condition.icon}`} alt={hour.condition.text} width={32} height={32} />
                              </div>
                              <p className="text-sm">{new Date(hour.time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}</p>
                          </button>
                      ))}
                  </div>
                </Card>
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
                      <Image src={`https:${weatherData.forecast.forecastday[1].day.condition.icon}`} alt={weatherData.forecast.forecastday[1].day.condition.text} width={80} height={80} />
                      <p className="text-7xl font-bold">
                          {Math.round(weatherData.forecast.forecastday[1].day.maxtemp_c)}°
                          <span className="text-5xl text-white/70">/{Math.round(weatherData.forecast.forecastday[1].day.mintemp_c)}°</span>
                      </p>
                  </div>
                  <p>{weatherData.forecast.forecastday[1].day.condition.text}</p>
                  <div className="mt-4">
                    <WeatherDetails humidity={weatherData.forecast.forecastday[1].day.avghumidity} wind={weatherData.forecast.forecastday[1].day.maxwind_kph} rain={weatherData.forecast.forecastday[1].day.daily_chance_of_rain} />
                  </div>
              </div>

              <DailyForecast forecast={weatherData.forecast.forecastday} />
            </main>
          </motion.div>
        ) : (
          <motion.div key="search-prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 h-[812px] flex flex-col justify-center items-center text-center">
            <MapPin className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Welcome to Weather4two</h2>
            <p className="text-muted-foreground mb-6">Please allow location access or search for a city to get started.</p>
            <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-xs">
              <Input 
                type="text" 
                placeholder="Search for a city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/20 border-white/30 placeholder:text-muted-foreground"
                disabled={isSearching}
              />
              <Button type="submit" variant="secondary" size="icon" disabled={isSearching}>
                <Search />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
