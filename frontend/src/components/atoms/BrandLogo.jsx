import React from 'react'
import { Link } from 'react-router-dom'

/**
 * BrandLogo - Professional layout with Image + Styled Text identity
 */
const BrandLogo = ({ mode = 'dark', size = 32, showText = true, className = '' }) => {
    const logoSrc = "/logo.jpg";
    const isWhite = mode === 'white';

    // Brand Colors from the logo
    const blueColor = "#2D4A27";
    const greenColor = "#2D4A27";

    return (
        <Link
            to="/"
            className={`flex items-center gap-3 group transition-all duration-300 active:scale-95 no-underline ${className}`}
        >
            {/* Logo Image Container */}
            <div className={`relative flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-105 ${size > 40 ? 'h-16' : 'h-11'}`}>
                <img
                    src={logoSrc}
                    alt="Kept Carbon"
                    className="h-full w-auto object-contain"
                />
            </div>

            {/* Brand Text Identity */}
            {showText && (
                <div className="flex flex-col leading-none">
                    <div className="flex items-baseline gap-[1px]">
                        <span className="text-xl font-black tracking-tight" style={{ color: blueColor }}>KEPT</span>
                        <span className="text-xl font-black tracking-tight ml-1" style={{ color: greenColor }}>CARBON</span>
                    </div>
                    <span
                        className={`text-[0.65rem] font-bold tracking-[0.5px] mt-0.5 opacity-80 ${isWhite ? 'text-white' : 'text-gray-500'}`}
                    >
                        ระบบประเมินการกักเก็บคาร์บอน
                    </span>
                </div>
            )}
        </Link>
    )
}

export default BrandLogo

