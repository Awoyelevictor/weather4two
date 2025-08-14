import type { FC } from 'react';
import { Sun, Cloud, CloudSun, CloudRain, CloudSnow, Wind, Droplets, Umbrella, CloudLightning, Thermometer, MapPin } from 'lucide-react';

type IconProps = { className?: string };

const iconMap: Record<string, FC<IconProps>> = {
  'sunny': Sun,
  'clear': Sun,
  'partly cloudy': CloudSun,
  'cloudy': Cloud,
  'rain': CloudRain,
  'snow': CloudSnow,
  'thunderstorm': CloudLightning,
  'default': Cloud,
};

export const getWeatherIcon = (description: string, props?: IconProps): JSX.Element => {
  const key = description.toLowerCase();
  const IconComponent = iconMap[key] || iconMap['default'];
  return <IconComponent {...props} />;
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
};
