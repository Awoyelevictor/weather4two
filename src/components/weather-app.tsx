'use client';

import { useState, useEffect, useCallback, useMemo, type FC } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { WeatherData, Location } from '@/lib/types';
import { getWeatherData } from '@/lib/weather';
import { getWeatherIcon, Icons } from '@/components/icons';
import { Plus, Trash2, LocateFixed, ArrowRight } from 'lucide-react';

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


export const WeatherApp: FC = () => {
  const [locations, setLocations] = useLocalStorage<Location[]>('weather-locations', []);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  const { toast } = useToast();

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


  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLocation && !locations.find(loc => loc.name.toLowerCase() === newLocation.toLowerCase())) {
      const newLoc: Location = { id: Date.now().toString(), name: newLocation };
      const newLocations = [...locations, newLoc];
      setLocations(newLocations);
      handleSelectLocation(newLoc);
      setNewLocation('');
    }
  };

  const handleRemoveLocation = (id: string) => {
    const newLocations = locations.filter(loc => loc.id !== id);
    setLocations(newLocations);
    if (selectedLocation?.id === id) {
      setSelectedLocation(null);
      setWeatherData(null);
      if (newLocations.length > 0) {
        handleSelectLocation(newLocations[0]);
      }
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      toast({ title: "Fetching your location..." });
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation: Location = { id: 'current', name: 'Current Location', isCurrent: true };
          if (!locations.find(l => l.id === 'current')) {
            setLocations([currentLocation, ...locations.filter(l => l.id !== 'current')])
          }
          handleSelectLocation(currentLocation);
          toast({ title: "Location found!", description: "Displaying weather for your current location." });
        },
        () => {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Unable to retrieve your location. Please enable location services.',
          });
        }
      );
    } else {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Geolocation is not supported by your browser.',
      });
    }
  };


  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 p-4 font-body">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full h-full">
        <Card className="col-span-1 flex flex-col h-full shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Icons.MapPin className="text-primary"/> Locations</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-grow gap-4">
            <Button onClick={handleGetCurrentLocation} variant="outline" className="w-full">
              <LocateFixed className="mr-2 h-4 w-4" /> Use Current Location
            </Button>
            <form onSubmit={handleAddLocation} className="flex gap-2">
              <Input
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Add a city"
              />
              <Button type="submit" size="icon" aria-label="Add location">
                <Plus className="h-4 w-4" />
              </Button>
            </form>
            <div className="flex-grow overflow-y-auto pr-2">
                {locations.map(loc => (
                  <div key={loc.id} className="mt-2">
                    <Button
                      variant={selectedLocation?.id === loc.id ? 'default' : 'ghost'}
                      className="w-full justify-between"
                      onClick={() => handleSelectLocation(loc)}
                    >
                      <span className="truncate">{loc.name}</span>
                      {!loc.isCurrent && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={(e) => { e.stopPropagation(); handleRemoveLocation(loc.id); }}
                          aria-label={`Remove ${loc.name}`}
                        >
                          <Trash2 className="h-4 w-4"/>
                        </Button>
                      )}
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
        
        <main className="col-span-1 md:col-span-2 lg:col-span-3 h-full overflow-y-auto pr-2">
            <AnimatePresence mode="wait">
            {isLoading && (
                <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <Skeleton className="h-56 w-full" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {Array.from({length: 7}).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
                    </div>
                </motion.div>
            )}

            {!isLoading && weatherData && selectedLocation && (
              <motion.div key={selectedLocation.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="space-y-4">
                  {/* Current Weather */}
                  <Card className="shadow-lg">
                    <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        {getWeatherIcon(weatherData.current.description, { className: "w-24 h-24 text-primary"})}
                        <div>
                          <p className="text-muted-foreground">{selectedLocation.name}</p>
                          <h2 className="text-5xl md:text-7xl font-bold font-headline">{weatherData.current.temperature}°</h2>
                          <p className="font-semibold text-lg">{weatherData.current.description}</p>
                        </div>
                      </div>
                      <div className="text-center md:text-right">
                        <p className="text-lg">High: {weatherData.current.high}°</p>
                        <p className="text-lg">Low: {weatherData.current.low}°</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card><CardContent className="p-4 flex items-center gap-4"><Icons.Droplets className="w-8 h-8 text-accent"/><div><p className="text-muted-foreground">Humidity</p><p className="text-2xl font-bold">{weatherData.details.humidity}%</p></div></CardContent></Card>
                    <Card><CardContent className="p-4 flex items-center gap-4"><Icons.Wind className="w-8 h-8 text-accent"/><div><p className="text-muted-foreground">Wind</p><p className="text-2xl font-bold">{weatherData.details.windSpeed} mph</p></div></CardContent></Card>
                    <Card><CardContent className="p-4 flex items-center gap-4"><Icons.Umbrella className="w-8 h-8 text-accent"/><div><p className="text-muted-foreground">Rain</p><p className="text-2xl font-bold">{weatherData.details.chanceOfRain}%</p></div></CardContent></Card>
                  </div>
                  
                  {/* Forecast */}
                  <div>
                    <h3 className="text-xl font-bold font-headline mb-2">7-Day Forecast</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                        {weatherData.forecast.map(day => (
                            <Card key={day.day} className="flex flex-col items-center p-3 text-center">
                                <p className="font-bold">{day.day}</p>
                                {getWeatherIcon(day.description, { className: "w-10 h-10 my-2 text-primary"})}
                                <p className="text-sm">{day.high}° / {day.low}°</p>
                            </Card>
                        ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {!isLoading && !selectedLocation && (
                 <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center">
                    <div className="text-primary">{getWeatherIcon('default', { className: "w-24 h-24"})}</div>
                    <h2 className="mt-6 text-2xl font-semibold font-headline">Welcome to Weather4Two</h2>
                    <p className="mt-2 text-muted-foreground">Select a location, or add a new one to get started.</p>
                    <Button onClick={handleGetCurrentLocation} className="mt-4">
                        <LocateFixed className="mr-2 h-4 w-4" /> Get My Location
                        <ArrowRight className="ml-2 h-4 w-4"/>
                    </Button>
                </motion.div>
            )}
            </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
