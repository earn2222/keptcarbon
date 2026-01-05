import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { BrandLogo } from '../components/atoms'

// Icons
const DashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
)

const MapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
        <line x1="8" y1="2" x2="8" y2="18"></line>
        <line x1="16" y1="6" x2="16" y2="22"></line>
    </svg>
)

const HistoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
)

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
)

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
)

const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
)

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
)


const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
)


function DashboardLayout({ children }) {
    const [mobileOpen, setMobileOpen] = useState(false)
    const location = useLocation()

    const navigation = [
        { name: 'แดชบอร์ด', path: '/dashboard', icon: DashboardIcon },
        { name: 'แผนที่แปลง', path: '/map', icon: MapIcon },
        { name: 'ประวัติ', path: '/dashboard/history', icon: HistoryIcon },
    ]

    const getPageTitle = () => {
        switch (location.pathname) {
            case '/dashboard':
                return 'แดชบอร์ด'
            case '/map':
            case '/dashboard/map':
                return 'จัดการแปลงยาง'
            case '/dashboard/history':
                return 'ประวัติและบันทึก'
            default:
                return 'แดชบอร์ด'
        }
    }

    return (
        <div className="min-h-screen bg-[#f7f5f2] font-sans">
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-all duration-500"
                    onClick={() => setMobileOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 w-[280px] h-screen 
                bg-white border-r border-gray-100
                p-6 z-50 overflow-y-auto 
                transition-all duration-300 ease-in-out
                ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo */}
                <div className="flex items-center justify-between pb-8 mb-8 border-b border-gray-50">
                    <BrandLogo mode="dark" size={32} />
                    <button onClick={() => setMobileOpen(false)} className="lg:hidden p-2 text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <div className="mb-10">
                    <div className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 mb-6 px-2">เมนูหลัก</div>
                    <nav className="space-y-4">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                exact={item.path === '/dashboard'}
                                className={({ isActive }) =>
                                    `flex items-center gap-4 px-5 py-4 rounded-2xl font-medium text-sm transition-all duration-300 group ${location.pathname === item.path
                                        ? 'bg-[#4c7c44] text-white shadow-lg shadow-[#4c7c44]/20'
                                        : 'text-gray-500 hover:bg-[#4c7c44]/5 hover:text-[#4c7c44]'
                                    }`
                                }
                                onClick={() => setMobileOpen(false)}
                            >
                                <div className={`transition-transform duration-300 group-hover:scale-110`}>
                                    <item.icon />
                                </div>
                                <span className="tracking-tight">{item.name}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Settings Section */}
                <div className="mb-10">
                    <div className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 mb-6 px-2">การตั้งค่า</div>
                    <nav className="space-y-4">
                        <a href="#" className="flex items-center gap-4 px-5 py-4 rounded-2xl font-medium text-sm text-gray-500 hover:bg-gray-100 transition-all">
                            <SettingsIcon />
                            <span>ตั้งค่าบัญชี</span>
                        </a>
                        <button className="flex items-center gap-4 px-5 py-4 rounded-2xl font-medium text-sm text-red-500 hover:bg-red-50 transition-all w-full text-left mt-2">
                            <LogoutIcon />
                            <span>ออกจากระบบ</span>
                        </button>
                    </nav>
                </div>

                {/* Farmer Support Card */}
                <div className="mt-10 bg-[#eef2e6] rounded-3xl p-6 border border-[#e0e7d5] relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-2xl mb-3">🌱</div>
                        <div className="font-bold text-[#2d4a27] text-sm mb-1 uppercase tracking-tight">ต้องการความช่วยเหลือ?</div>
                        <div className="text-[11px] text-[#4c7c44] mb-4 font-medium opacity-80 leading-relaxed">
                            โทรหาเจ้าหน้าที่เพื่อช่วยเหลือในการวาดแปลงของท่าน
                        </div>
                        <button className="w-full py-3 bg-white text-[#4c7c44] rounded-xl text-xs font-bold shadow-sm border border-[#e0e7d5] hover:bg-green-50 transition-all">
                            ติดต่อเรา
                        </button>
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-[#4c7c44]/5 rounded-full blur-xl"></div>
                </div>
            </aside>

            {/* Header */}
            <header className="fixed top-0 left-0 lg:left-[280px] right-0 h-[70px] lg:h-[80px] bg-white lg:bg-white/80 lg:backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 z-30 border-b border-gray-100/50 font-sans">
                <div className="flex items-center gap-4">
                    <button
                        className="lg:hidden w-10 h-10 rounded-full bg-[#f0f4ef] flex items-center justify-center text-[#2d4a27] hover:bg-[#4c7c44] hover:text-white transition-all shadow-sm active:scale-95"
                        onClick={() => setMobileOpen(true)}
                    >
                        <MenuIcon size={20} />
                    </button>
                    {/* Desktop Search */}
                    <div className="hidden md:flex items-center bg-gray-50 border border-gray-100 rounded-2xl px-5 py-2.5 transition-all focus-within:bg-white focus-within:border-[#4c7c44]/20 focus-within:shadow-sm">
                        <SearchIcon className="text-gray-400" />
                        <input
                            type="text"
                            className="bg-transparent border-none outline-none ml-4 w-[280px] text-sm font-medium text-gray-700 placeholder:text-gray-400"
                            placeholder="ค้นหาชื่อแปลง..."
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* ID Indicator for Mobile Design */}
                    <div className="flex items-center gap-1 pl-1 pr-1.5 py-1 bg-white border border-gray-100 rounded-full shadow-sm">
                        <button className="relative w-9 h-9 lg:w-10 lg:h-10 rounded-full text-gray-400 hover:text-[#4c7c44] hover:bg-gray-50 transition-all flex items-center justify-center">
                            <BellIcon size={18} />
                            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 border border-white rounded-full"></span>
                        </button>
                        <div className="w-[1px] h-5 bg-gray-200 mx-0.5"></div>
                        <div className="flex items-center gap-3 pr-1 cursor-pointer group">
                            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-[#4c7c44] flex items-center justify-center text-white text-[10px] lg:text-xs font-bold shadow-md ring-2 ring-white transition-all group-hover:scale-105">
                                JD
                            </div>
                            {/* Desktop Name */}
                            <div className="hidden sm:block pr-2">
                                <div className="font-bold text-xs text-[#2d4a27] tracking-tight">John Doe</div>
                                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Farmer Agent</div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className={`
                lg:ml-[280px] pt-[70px] lg:pt-[80px] p-0 lg:p-8 min-h-screen
                transition-all duration-300 relative
            `}>
                <div className="px-5 pt-6 pb-2 lg:px-0 lg:pt-0 lg:pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 sticky top-[70px] lg:static z-20 bg-[#f7f5f2] lg:bg-transparent">
                    <div>
                        <div className="hidden lg:flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-widest">
                            <span className="hover:text-gray-600 transition-colors cursor-pointer">หน้าหลัก</span>
                            <span className="opacity-30">/</span>
                            <span className="text-[#4c7c44]">{getPageTitle()}</span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-black text-[#1b301a] tracking-tight">{getPageTitle()}</h1>
                    </div>
                </div>
                <div className="animate-fadeIn">
                    {children}
                </div>
            </main>
        </div>
    )
}

export default DashboardLayout
