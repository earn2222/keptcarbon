import React from 'react'

const Card = ({
    children,
    className = '',
    hover = true,
    padding = 'md',
    ...props
}) => {
    const paddings = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        none: 'p-0',
    }

    return (
        <div
            className={`
        bg-white rounded-2xl shadow-card
        ${hover ? 'hover:shadow-hover hover:-translate-y-1 transition-all duration-300' : ''}
        ${paddings[padding]}
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    )
}

export default Card
