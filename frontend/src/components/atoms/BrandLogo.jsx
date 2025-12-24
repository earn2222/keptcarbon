import React from 'react'
import { LeafIcon } from './Icons'

/**
 * BrandLogo - Unified brand identity component
 * @param {string} mode - 'light', 'dark', or 'white'
 * @param {number} size - Icon size
 * @param {boolean} showText - Whether to show text
 * @param {string} className - Optional container class
 */
const BrandLogo = ({ mode = 'dark', size = 32, showText = true, className = '' }) => {
    const isDark = mode === 'dark';
    const isWhite = mode === 'white';

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className={`
                flex items-center justify-center rounded-xl transition-all duration-500 hover:rotate-[15deg]
                ${isWhite ? 'bg-white text-[#10b981]' : 'gradient-primary text-white shadow-lg'}
                ${size > 40 ? 'w-16 h-16 p-3' : 'w-10 h-10 p-2'}
            `}>
                <LeafIcon size={size} />
            </div>

            {showText && (
                <div className="flex flex-col leading-none">
                    <span className={`
                        text-xl font-bold tracking-tighter
                        ${isWhite ? 'text-white' : isDark ? 'text-slate-800' : 'text-white'}
                    `}>
                        KEPTCARBON
                    </span>
                    <span className={`
                        text-[0.6rem] font-bold tracking-[3px] uppercase
                        ${isWhite ? 'text-white/60' : 'text-[#10b981]'}
                    `}>
                        GIS PORTAL
                    </span>
                </div>
            )}
        </div>
    )
}

export default BrandLogo
