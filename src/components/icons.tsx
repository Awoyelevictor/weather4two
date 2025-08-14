import type { FC } from 'react';
import { Sun, Cloud, CloudSun, CloudRain, CloudSnow, Wind, Droplets, Umbrella, CloudLightning, Thermometer, MapPin, Cloudy, Waves } from 'lucide-react';

type IconProps = { className?: string };

// This component is no longer used for weather icons as we are now fetching them from the API.
// It is kept for the other icons.
export const Icons = {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudSnow,
  Wind,
  Droplets,
  Umbrella,
  CloudLightning,
  Thermometer,
  MapPin,
  Cloudy,
  Waves,
};
