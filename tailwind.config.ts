import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'], theme: { extend: { colors: { ink: '#111827', brand: '#2563eb', cream: '#fff7ed' } } }, plugins: [] };
export default config;
