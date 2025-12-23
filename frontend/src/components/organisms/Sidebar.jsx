import React from 'react'
import { NavLink } from 'react-router-dom'
import { Button } from '../atoms'
import {
    LeafIcon,
    DashboardIcon,
    MapIcon,
    HistoryIcon,
    SettingsIcon
} from '../atoms/Icons'

const Sidebar = ({ isOpen = true, onClose }) => {
    const navigation = [
        { name: 'แดชบอร์ด', path: '/dashboard', icon: DashboardIcon },
        { name: 'แผนที่แปลง', path: '/dashboard/map', icon: MapIcon },
        { name: 'ประวัติ', path: '/dashboard/history', icon: HistoryIcon },
    ]

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 w-[280px] h-screen 
          bg-gradient-to-b from-gray-800 to-gray-900 
          text-gray-300 p-6 z-50 overflow-y-auto 
          transition-transform duration-300 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0
        `}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 pb-6 mb-6 border-b border-white/10">
                    <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white">
                        <LeafIcon size={24} />
                    </div>
                    <span className="text-xl font-bold text-white">KeptCarbon</span>
                </div>

                {/* Main Navigation */}
                <div className="mb-6">
                    <div className="text-xs uppercase tracking-wider text-gray-500 mb-3 px-2">
                        เมนูหลัก
                    </div>
                    <nav className="space-y-1">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                exact={item.path === '/dashboard'}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                                activeClassName="bg-[#3cc2cf] !text-white shadow-lg shadow-[#3cc2cf]/40"
                            >
                                <item.icon size={20} />
                                <span>{item.name}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Settings */}
                <div className="mb-6">
                    <div className="text-xs uppercase tracking-wider text-gray-500 mb-3 px-2">
                        การตั้งค่า
                    </div>
                    <nav className="space-y-1">
                        <a
                            href="#"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                        >
                            <SettingsIcon size={20} />
                            <span>ตั้งค่า</span>
                        </a>
                    </nav>
                </div>

                {/* Promo Card */}
                <div className="mt-auto bg-gradient-to-br from-[#3cc2cf]/20 to-[#7c5cfc]/20 rounded-2xl p-5 text-center">
                    <div className="text-3xl mb-3">🌱</div>
                    <div className="font-semibold text-white text-sm mb-2">เริ่มประเมินคาร์บอน</div>
                    <div className="text-xs text-gray-400 mb-4 leading-relaxed">
                        วาดแปลงยางพาราของคุณเพื่อคำนวณคาร์บอน
                    </div>
                    <NavLink to="/dashboard/map">
                        <Button variant="primary" size="sm" fullWidth>
                            เริ่มต้นใช้งาน
                        </Button>
                    </NavLink>
                </div>
            </aside>
        </>
    )
}

export default Sidebar
