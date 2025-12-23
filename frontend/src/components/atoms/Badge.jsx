import React from 'react'

const Badge = ({
    children,
    variant = 'primary',
    size = 'md',
    className = ''
}) => {
    const variants = {
        primary: 'bg-[#3cc2cf]/15 text-[#3cc2cf]',
        success: 'bg-green-100 text-green-600',
        warning: 'bg-amber-100 text-amber-600',
        error: 'bg-red-100 text-red-600',
        info: 'bg-blue-100 text-blue-600',
        neutral: 'bg-gray-100 text-gray-600',
    }

    const sizes = {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-3 py-1 text-xs',
        lg: 'px-4 py-1.5 text-sm',
    }

    return (
        <span
            className={`
        inline-flex items-center rounded-full font-semibold
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
        >
            {children}
        </span>
    )
}

export default Badge
