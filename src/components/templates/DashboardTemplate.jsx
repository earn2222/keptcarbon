import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar, Header } from '../organisms'

const DashboardTemplate = ({ children }) => {
    const [mobileOpen, setMobileOpen] = useState(false)
    const location = useLocation()

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
            <Sidebar
                isOpen={mobileOpen}
                onClose={() => setMobileOpen(false)}
            />

            <Header onMenuClick={() => setMobileOpen(true)} />

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

export default DashboardTemplate
