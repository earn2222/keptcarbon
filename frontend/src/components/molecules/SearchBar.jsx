import React from 'react'
import { SearchIcon } from '../atoms/Icons'

const SearchBar = ({
    placeholder = 'ค้นหา...',
    value,
    onChange,
    onSubmit,
    showButton = false,
    buttonText = 'ค้นหา',
    className = ''
}) => {
    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit && onSubmit(value)
    }

    return (
        <form onSubmit={handleSubmit} className={`flex items-center bg-gray-100 rounded-xl ${className}`}>
            <div className="pl-4 text-gray-400">
                <SearchIcon size={18} />
            </div>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange && onChange(e.target.value)}
                className="flex-1 py-2.5 px-3 bg-transparent border-none outline-none text-sm"
            />
            {showButton && (
                <button
                    type="submit"
                    className="px-4 py-2 mr-1 gradient-primary text-white rounded-lg text-sm font-medium"
                >
                    {buttonText}
                </button>
            )}
        </form>
    )
}

export default SearchBar
