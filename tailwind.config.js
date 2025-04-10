/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Set Inter as the default sans font
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        // Keep the inter class for explicit usage if needed
        inter: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        brand: {
          // Primary Colors
          primary: '#000000', // Black - Main brand color
          secondary: '#37543c', // Forest Green - Secondary brand color
          
          // Supporting Colors
          accent: '#3F3931', // Deep taupe - For highlights and CTAs
          success: '#A28D4B', // Warm gold - Success states
          error: '#6B5F4D', // Muted brown - Error states
          warning: '#8E7A36', // Golden brown - Warning states
          
          // Neutral Colors
          dark: '#1F2937', // Cool gray - Text and dark backgrounds
          light: '#F3F4F6', // Light gray - Light backgrounds
          muted: '#6B7280', // Medium gray - Muted text
          
          // Gradient Colors
          'gradient-start': '#000000', // Black
          'gradient-end': '#37543c', // Forest Green
        },
        // Custom header colors
        appheader: '#e0e0d7',
        headerborder: '#cacaba'
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(to right, var(--tw-gradient-stops))',
        'brand-gradient-vertical': 'linear-gradient(to bottom, var(--tw-gradient-stops))',
      },
      gradientColorStops: theme => ({
        'gradient-start': theme('colors.brand.gradient-start'),
        'gradient-end': theme('colors.brand.gradient-end'),
      }),
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.brand.dark'),
            maxWidth: 'none',
            h1: {
              color: theme('colors.brand.dark'),
            },
            h2: {
              color: theme('colors.brand.dark'),
            },
            h3: {
              color: theme('colors.brand.dark'),
            },
            h4: {
              color: theme('colors.brand.dark'),
            },
            p: {
              color: theme('colors.brand.dark'),
            },
            a: {
              color: theme('colors.brand.accent'),
              '&:hover': {
                color: theme('colors.brand.secondary'),
              },
            },
            strong: {
              color: theme('colors.brand.dark'),
            },
            ul: {
              li: {
                '&::marker': {
                  color: theme('colors.brand.accent'),
                },
              },
            },
            ol: {
              li: {
                '&::marker': {
                  color: theme('colors.brand.accent'),
                },
              },
            },
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.300'),
            h1: { color: theme('colors.gray.100') },
            h2: { color: theme('colors.gray.100') },
            h3: { color: theme('colors.gray.100') },
            h4: { color: theme('colors.gray.100') },
            p: { color: theme('colors.gray.300') },
            strong: { color: theme('colors.gray.100') },
            a: { color: theme('colors.brand.accent') },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};