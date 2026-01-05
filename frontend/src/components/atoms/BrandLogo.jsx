import React from 'react'
import { Link } from 'react-router-dom'
import { LeafIcon } from './Icons'

/**
 * BrandLogo - Unified premium brand identity component
 * @param {string} mode - 'light', 'dark', or 'white'
 * @param {number} size - Icon size
 * @param {boolean} showText - Whether to show text
 * @param {string} className - Optional container class
 */
const BrandLogo = ({ mode = 'dark', size = 32, showText = true, className = '' }) => {
    const isDark = mode === 'dark';
    const isWhite = mode === 'white';

    return (
        <Link
            to="/"
            className={`flex items-center gap-4 group transition-all duration-300 active:scale-95 no-underline ${className}`}
        >
            <div className={`
                relative flex items-center justify-center rounded-[1rem] transition-all duration-500 overflow-hidden
                group-hover:shadow-[0_8px_20px_rgba(76,124,68,0.2)] group-hover:rotate-[-4deg]
                ${isWhite ? 'bg-white text-[#4c7c44]' : 'bg-[#4c7c44] text-white shadow-lg shadow-[#4c7c44]/10'}
                ${size > 40 ? 'w-16 h-16 p-3.5' : 'w-11 h-11 p-2.5'}
            `}>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <LeafIcon size={size} />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white/20 rounded-full blur-sm group-hover:scale-150 transition-transform"></div>
            </div>

            {showText && (
                <div className="flex flex-col leading-none font-sans">
                    <span className={`
                        text-xl font-black tracking-[-1px] mb-0.5 transition-colors duration-300
                        ${isWhite ? 'text-white' : isDark ? 'text-[#2d4a27]' : 'text-white'}
                        group-hover:text-[#4c7c44]
                    `}>
                        KEPT CARBON
                    </span>
                    <span className={`
                        text-[0.6rem] font-bold tracking-[1px] opacity-60
                        ${isWhite ? 'text-white/70' : 'text-[#4c7c44]'}
                    `}>
                        ระบบประเมินการกักเก็บคาร์บอน
                    </span>
                </div>
            )}
        </Link>
    )
}

export default BrandLogo

