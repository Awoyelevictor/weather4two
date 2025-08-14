import { WeatherApp } from '@/components/weather-app';

export default function Home() {
  return (
    <main className="flex justify-center items-center min-h-screen p-0 sm:p-4">
      <WeatherApp />
    </main>
  );
}
