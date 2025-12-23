import React from 'react'

const ProgressBar = ({
    value = 0,
    max = 100,
    label,
    showValue = true,
    variant = 'primary', // primary, success, warning
    size = 'md',
    className = ''
}) => {
    const percentage = Math.min((value / max) * 100, 100)

    const variants = {
        primary: 'gradient-primary',
        success: 'bg-gradient-to-r from-green-500 to-green-400',
        warning: 'bg-gradient-to-r from-amber-500 to-amber-400',
    }

    const sizes = {
        sm: 'h-1.5',
        md: 'h-2',
        lg: 'h-3',
    }

    return (
        <div className={className}>
            {(label || showValue) && (
                <div className="flex justify-between items-center mb-2">
                    {label && <span className="text-sm text-gray-600">{label}</span>}
                    {showValue && <span className="text-sm font-medium text-gray-800">{value}</span>}
                </div>
            )}
            <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${sizes[size]}`}>
                <div
                    className={`${sizes[size]} ${variants[variant]} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    )
}

export default ProgressBar
