import React from 'react'

const Input = ({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    icon: Icon,
    iconPosition = 'left',
    error,
    className = '',
    ...props
}) => {
    const hasLeftIcon = Icon && iconPosition === 'left'
    const hasRightIcon = Icon && iconPosition === 'right'

    return (
        <div className={`${className}`}>
            {label && (
                <label className="block mb-2 font-medium text-gray-700 text-sm">
                    {label}
                </label>
            )}
            <div className="relative">
                {hasLeftIcon && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Icon size={20} />
                    </span>
                )}
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`
            w-full py-3.5 border border-gray-200 rounded-xl bg-white 
            focus:border-[#3cc2cf] focus:ring-4 focus:ring-[#3cc2cf]/15 outline-none transition-all
            ${hasLeftIcon ? 'pl-12' : 'pl-4'}
            ${hasRightIcon ? 'pr-12' : 'pr-4'}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15' : ''}
          `}
                    {...props}
                />
                {hasRightIcon && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Icon size={20} />
                    </span>
                )}
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    )
}

export default Input
