import React, { useState } from 'react'
import { Input } from '../atoms'
import { EyeIcon, EyeOffIcon, LockIcon } from '../atoms/Icons'

const PasswordInput = ({
    label = 'รหัสผ่าน',
    placeholder = '••••••••',
    value,
    onChange,
    error,
    className = '',
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <div className={className}>
            {label && (
                <label className="block mb-2 font-medium text-gray-700 text-sm">
                    {label}
                </label>
            )}
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <LockIcon size={20} />
                </span>
                <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`
            w-full py-3.5 pl-12 pr-12 border border-gray-200 rounded-xl bg-white 
            focus:border-[#3cc2cf] focus:ring-4 focus:ring-[#3cc2cf]/15 outline-none transition-all
            ${error ? 'border-red-500' : ''}
          `}
                    {...props}
                />
                <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#3cc2cf] transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                </button>
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    )
}

export default PasswordInput
