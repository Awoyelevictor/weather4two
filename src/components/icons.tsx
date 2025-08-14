import type { FC } from 'react';
import { Sun, Cloud, CloudSun, CloudRain, CloudSnow, Wind, Droplets, Umbrella, CloudLightning, Thermometer, MapPin, Cloudy, Waves } from 'lucide-react';

type IconProps = { className?: string };

const iconMap: Record<string, FC<IconProps>> = {
  'sunny': Sun,
  'clear': Sun,
  'partly cloudy': CloudSun,
  'rainy - cloudy': CloudRain,
  'rainy': CloudRain,
  'cloudy': Cloud,
  'rain': CloudRain,
  'storm': CloudLightning,
  'thunder': CloudLightning,
  'slow': Cloud,
  'snow': CloudSnow,
  'thunderstorm': CloudLightning,
  'default': Cloud,
};

export const getWeatherIcon = (description: string, props?: IconProps): JSX.Element => {
  const key = description.toLowerCase();
  for (const iconKey in iconMap) {
    if (key.includes(iconKey)) {
      const IconComponent = iconMap[iconKey];
      return <IconComponent {...props} />;
    }
  }
  return <iconMap.default {...props} />;
};

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
