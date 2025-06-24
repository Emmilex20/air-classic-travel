// frontend/src/components/Spinner.jsx
import React from 'react';

function Spinner({ size = 'md', color = 'indigo' }) {
    // Define base sizes for outer container and inner orb/glows
    const baseSizes = {
        sm: { container: 'w-12 h-12', orb: 'w-4 h-4' },
        md: { container: 'w-20 h-20', orb: 'w-6 h-6' },
        lg: { container: 'w-32 h-32', orb: 'w-10 h-10' },
        xl: { container: 'w-48 h-48', orb: 'w-16 h-16' },
    };

    const { container, orb } = baseSizes[size] || baseSizes.md;

    // Define color schemes for the orb and its glow
    const colorSchemes = {
        indigo: { main: 'indigo-500', shadow: 'indigo-500/80' },
        purple: { main: 'purple-500', shadow: 'purple-500/80' },
        blue: { main: 'blue-500', shadow: 'blue-500/80' },
        white: { main: 'white', shadow: 'white/80' },
        gray: { main: 'gray-500', shadow: 'gray-500/80' },
        green: { main: 'green-500', shadow: 'green-500/80' },
        red: { main: 'red-500', shadow: 'red-500/80' },
        // Add more color schemes as needed
    };

    const { main, shadow } = colorSchemes[color] || colorSchemes.indigo;

    return (
        <div
            className={`
                relative flex items-center justify-center rounded-full
                ${container}
            `}
            role="status"
            aria-label="Loading..."
        >
            {/* Outer Expanding/Fading Glow Ring 1 */}
            <div
                className={`
                    absolute inset-0 rounded-full
                    bg-${main} opacity-70 filter blur-sm
                    animate-expand-fade-1
                `}
            ></div>

            {/* Outer Expanding/Fading Glow Ring 2 (staggered for ripple effect) */}
            <div
                className={`
                    absolute inset-0 rounded-full
                    bg-${main} opacity-70 filter blur-sm
                    animate-expand-fade-2
                `}
            ></div>

            {/* Central Pulsating Orb */}
            <div
                className={`
                    absolute rounded-full
                    ${orb}
                    bg-${main}
                    shadow-xl shadow-${shadow}
                    animate-pulse-orb
                `}
            ></div>

            <span className="sr-only">Loading...</span>
        </div>
    );
}

export default Spinner;