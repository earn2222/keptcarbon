import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

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

const LeafIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
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
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [mobileOpen, setMobileOpen] = useState(false)
    const location = useLocation()

    const navigation = [
        { name: 'แดชบอร์ด', path: '/dashboard', icon: DashboardIcon },
        { name: 'แผนที่แปลง', path: '/dashboard/map', icon: MapIcon },
        { name: 'ประวัติ', path: '/dashboard/history', icon: HistoryIcon },
    ]

    const getPageTitle = () => {
        switch (location.pathname) {
            case '/dashboard':
                return 'แดชบอร์ด'
            case '/dashboard/map':
                return 'จัดการแปลงยาง'
            case '/dashboard/history':
                return 'ประวัติและบันทึก'
            default:
                return 'แดชบอร์ด'
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 w-[280px] h-screen bg-gradient-to-b from-gray-800 to-gray-900 text-gray-300 p-6 z-50 overflow-y-auto transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                {/* Logo */}
                <div className="flex items-center gap-3 pb-6 mb-6 border-b border-white/10">
                    <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white">
                        <LeafIcon />
                    </div>
                    <span className="text-xl font-bold text-white">KeptCarbon</span>
                </div>

                {/* Navigation */}
                <div className="mb-6">
                    <div className="text-xs uppercase tracking-wider text-gray-500 mb-3 px-2">เมนูหลัก</div>
                    <nav className="space-y-1">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                exact={item.path === '/dashboard'}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${location.pathname === item.path
                                        ? 'bg-[#3cc2cf] text-white shadow-lg shadow-[#3cc2cf]/40'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`
                                }
                                activeClassName="bg-[#3cc2cf] text-white shadow-lg shadow-[#3cc2cf]/40"
                            >
                                <item.icon />
                                <span>{item.name}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Settings */}
                <div className="mb-6">
                    <div className="text-xs uppercase tracking-wider text-gray-500 mb-3 px-2">การตั้งค่า</div>
                    <nav className="space-y-1">
                        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-all">
                            <SettingsIcon />
                            <span>ตั้งค่า</span>
                        </a>
                    </nav>
                </div>

                {/* Promo Card */}
                <div className="mt-auto bg-gradient-to-br from-[#3cc2cf]/20 to-[#7c5cfc]/20 rounded-2xl p-5 text-center">
                    <div className="text-3xl mb-3">🌱</div>
                    <div className="font-semibold text-white text-sm mb-2">เริ่มประเมินคาร์บอน</div>
                    <div className="text-xs text-gray-400 mb-4 leading-relaxed">วาดแปลงยางพาราของคุณเพื่อคำนวณคาร์บอน</div>
                    <NavLink
                        to="/dashboard/map"
                        className="block w-full py-2.5 rounded-lg text-sm font-semibold gradient-primary text-white"
                    >
                        เริ่มต้นใช้งาน
                    </NavLink>
                </div>
            </aside>

            {/* Header */}
            <header className="fixed top-0 left-0 lg:left-[280px] right-0 h-[70px] bg-white/95 backdrop-blur-lg flex items-center justify-between px-6 z-30 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        className="lg:hidden w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#3cc2cf]/10 hover:text-[#3cc2cf] transition-all"
                        onClick={() => setMobileOpen(true)}
                    >
                        <MenuIcon />
                    </button>
                    <div className="hidden md:flex items-center bg-gray-100 rounded-xl px-4 py-2">
                        <SearchIcon className="text-gray-400" />
                        <input
                            type="text"
                            className="bg-transparent border-none outline-none ml-3 w-[250px] text-sm"
                            placeholder="ค้นหา..."
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="relative w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#3cc2cf]/10 hover:text-[#3cc2cf] transition-all">
                        <BellIcon />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">3</span>
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#3cc2cf]/10 hover:text-[#3cc2cf] transition-all">
                        <SettingsIcon />
                    </button>
                    <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-semibold">
                            JD
                        </div>
                        <div className="hidden md:block">
                            <div className="font-semibold text-sm text-gray-800">John Doe</div>
                            <div className="text-xs text-gray-500">ผู้ดูแลระบบ</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="lg:ml-[280px] pt-[70px] p-6 min-h-screen">
                <div className="mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <span>หน้าหลัก</span>
                        <span>/</span>
                        <span className="text-[#3cc2cf] font-medium">{getPageTitle()}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">{getPageTitle()}</h1>
                </div>
                {children}
            </main>
        </div>
    )
}

export default DashboardLayout
