import React from 'react'

// Button variants: primary, secondary, outline, success
const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    isLoading = false,
    disabled = false,
    fullWidth = false,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
        primary: 'gradient-primary text-white shadow-lg shadow-[#3cc2cf]/30 hover:opacity-90',
        secondary: 'bg-white text-gray-700 border border-gray-200 hover:border-[#3cc2cf] hover:text-[#3cc2cf]',
        outline: 'bg-transparent text-[#3cc2cf] border-2 border-[#3cc2cf] hover:bg-[#3cc2cf] hover:text-white',
        success: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 hover:opacity-90',
        ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
    }

    const sizes = {
        sm: 'px-4 py-2 text-xs',
        md: 'px-6 py-3 text-sm',
        lg: 'px-8 py-4 text-base',
        icon: 'w-10 h-10 p-0',
    }

    return (
        <button
            className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
                children
            )}
        </button>
    )
}

export default Button
