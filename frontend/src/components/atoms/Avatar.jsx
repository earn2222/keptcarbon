import React from 'react'

const Avatar = ({
    src,
    alt,
    initials,
    size = 'md',
    className = ''
}) => {
    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-14 h-14 text-lg',
        xl: 'w-20 h-20 text-2xl',
    }

    if (src) {
        return (
            <img
                src={src}
                alt={alt}
                className={`
          ${sizes[size]}
          rounded-xl object-cover
          ${className}
        `}
            />
        )
    }

    return (
        <div
            className={`
        ${sizes[size]}
        gradient-primary rounded-xl flex items-center justify-center text-white font-semibold
        ${className}
      `}
        >
            {initials}
        </div>
    )
}

export default Avatar
