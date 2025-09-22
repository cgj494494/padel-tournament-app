/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      // Custom extensions for better mobile experience
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
  // CRITICAL: This safelist ensures all dynamic classes are included
  safelist: [
    // Large font sizes used in Championship component
    'text-5xl',
    'text-6xl', 
    'text-3xl',
    'text-4xl',
    'text-xl',
    'text-2xl',
    'text-lg',
    'text-base',
    'text-sm',
    // Responsive variants
    'md:text-6xl',
    'md:text-4xl',
    'md:text-2xl',
    'md:text-xl',
    // Padding classes for large buttons
    'px-8',
    'py-6',
    'px-6', 
    'py-5',
    'px-4',
    'py-3',
    // Background opacity (glassmorphism effects)
    'bg-white/95',
    'bg-white/90',
    'bg-white/80',
    'bg-white/60',
    'bg-white/50',
    'bg-blue-50/50',
    'bg-gray-50/50',
    'bg-yellow-50/80',
    // Border sizes
    'border-2',
    'border-3',
    'border-t-2',
    'border-t-3',
    'border-b-2',
    'border-b-3',
    'border-b-4',
    // Backdrop blur effects
    'backdrop-blur',
    // Transform classes
    'translate-x-7',
    'translate-x-1',
    'scale-105',
    'scale-[1.02]',
    'hover:scale-105',
    'hover:scale-[1.02]',
    'transform',
    'transition-transform',
    'transition-all',
    // Gradient directions and colors
    'bg-gradient-to-r',
    'bg-gradient-to-br',
    'from-blue-50',
    'via-indigo-50', 
    'to-purple-100',
    'from-blue-500',
    'to-purple-600',
    'from-green-500',
    'to-emerald-600',
    'hover:from-green-600',
    'hover:to-emerald-700',
    'hover:from-blue-600',
    'hover:to-purple-700',
    'disabled:from-gray-400',
    'disabled:to-gray-500',
    // Shadow classes
    'shadow-2xl',
    'shadow-3xl',
    'hover:shadow-3xl',
    'shadow-xl',
    'shadow-lg',
    // Rounded corners
    'rounded-2xl',
    'rounded-3xl',
    'rounded-xl',
    'rounded-lg',
    'rounded-full',
    // Text effects
    'bg-clip-text',
    'text-transparent',
    // Grid and flex
    'space-x-3',
    'space-x-4',
    'space-x-6',
    'space-y-2',
    'space-y-3',
    'space-y-4',
    'space-y-6',
    'space-y-8',
    'space-y-10',
    'gap-4',
    'gap-6',
    'gap-8',
    // Positioning
    'fixed',
    'top-6',
    'right-6',
    'bottom-0',
    'left-0',
    'z-50',
    // Heights and widths
    'h-8',
    'w-8',
    'h-10',
    'w-10',
    'w-16',
    'h-6',
    'w-6',
    'min-h-screen',
    'max-h-80',
    'max-h-96',
    'max-w-4xl',
    'max-w-5xl',
    'max-w-6xl',
    // Overflow
    'overflow-y-auto',
    'overflow-x-auto',
    'overflow-hidden',
    // Display
    'inline-flex',
    'inline-block',
    // Focus states
    'focus:border-blue-500',
    'focus:border-green-500',
    'focus:ring-4',
    'focus:ring-blue-200',
    'focus:ring-green-200'
  ]
}