import React from 'react'
import { Avatar } from '../atoms'
import { SearchBar } from '../molecules'
import { MenuIcon, BellIcon, SettingsIcon } from '../atoms/Icons'

const Header = ({
    onMenuClick,
    user = { name: 'John Doe', role: 'ผู้ดูแลระบบ', initials: 'JD' }
}) => {
    return (
        <header className="fixed top-0 left-0 lg:left-[280px] right-0 h-[70px] bg-white/95 backdrop-blur-lg flex items-center justify-between px-6 z-30 shadow-sm">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#3cc2cf]/10 hover:text-[#3cc2cf] transition-all"
                    onClick={onMenuClick}
                >
                    <MenuIcon size={24} />
                </button>

                {/* Search Bar */}
                <div className="hidden md:block">
                    <SearchBar
                        placeholder="ค้นหา..."
                        className="w-[280px]"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Notifications */}
                <button className="relative w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#3cc2cf]/10 hover:text-[#3cc2cf] transition-all">
                    <BellIcon size={20} />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                        3
                    </span>
                </button>

                {/* Settings */}
                <button className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#3cc2cf]/10 hover:text-[#3cc2cf] transition-all">
                    <SettingsIcon size={20} />
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                    <Avatar initials={user.initials} size="md" />
                    <div className="hidden md:block">
                        <div className="font-semibold text-sm text-gray-800">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.role}</div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
