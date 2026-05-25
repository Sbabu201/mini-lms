/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Teal-Emerald primary — trustworthy, academic, fresh
        primary: {
          50: '#EDFCF5',
          100: '#D3F8E6',
          200: '#AAF0D2',
          300: '#73E2B8',
          400: '#3BCD9A',
          500: '#17B07E',
          600: '#0B9066',
          700: '#097354',
          800: '#0B5B44',
          900: '#0A4B39',
        },
        // Warm amber accent — inviting, energetic, educational
        accent: {
          50: '#FFF8EB',
          100: '#FFECC6',
          200: '#FFD688',
          300: '#FFBC4B',
          400: '#FFA520',
          500: '#F98307',
          600: '#DD5F02',
          700: '#B74006',
          800: '#94310C',
          900: '#7A290D',
        },
        // Deep slate-navy for backgrounds — calm, modern, readable
        dark: {
          50: '#E6E9EF',
          100: '#C5CEDA',
          200: '#95A3B8',
          300: '#6B7D96',
          400: '#4B5E78',
          500: '#354663',
          600: '#2C3A54',
          700: '#232E44',
          800: '#1B2436',
          900: '#141C2B',
          950: '#0D1321',
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        'inter-regular': ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold': ['Inter_700Bold'],
      },
    },
  },
  plugins: [],
};
