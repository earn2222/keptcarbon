import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'

// ==========================================
// NAV ICON COMPONENTS
// ==========================================
const HomeIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
)

const MapIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
    </svg>
)

const DashboardIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
)

const UserIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
)

// ==========================================
// ENHANCED ICONS FOR HISTORY PAGE
// ==========================================
const FilterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
)

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
)

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
)

const TrendingUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
)

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
)

const LeafIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646Z" />
    </svg>
)

const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>
)

function HistoryPage() {
    const history = useHistory()
    const [selectedYear, setSelectedYear] = useState('2024')
    const [selectedPlot, setSelectedPlot] = useState('all')

    const navItems = [
        { id: 'home', label: 'หน้าหลัก', icon: HomeIcon, path: '/' },
        { id: 'map', label: 'แผนที่', icon: MapIcon, path: '/map' },
        { id: 'dashboard', label: 'แดชบอร์ด', icon: DashboardIcon, path: '/dashboard' },
        { id: 'personal', label: 'ส่วนตัว', icon: UserIcon, path: '/dashboard?view=personal' },
        { id: 'history', label: 'ประวัติ', icon: HistoryIcon, path: '/dashboard/history', active: true },
    ]

    const historyData = [
        {
            id: 1,
            year: 2024,
            plot: 'แปลงที่ 1 - บ้านนา',
            area: 50,
            age: 15,
            carbon: 258,
            changePercent: 8.5,
            status: 'completed',
            date: '15 ธ.ค. 2024'
        },
        {
            id: 2,
            year: 2024,
            plot: 'แปลงที่ 2 - ท่าศาลา',
            area: 35,
            age: 8,
            carbon: 124,
            changePercent: 12.3,
            status: 'completed',
            date: '14 ธ.ค. 2024'
        },
        {
            id: 3,
            year: 2024,
            plot: 'แปลงที่ 3 - หัวไทร',
            area: 42,
            age: 12,
            carbon: 189,
            changePercent: 6.8,
            status: 'pending',
            date: '13 ธ.ค. 2024'
        },
        {
            id: 4,
            year: 2023,
            plot: 'แปลงที่ 1 - บ้านนา',
            area: 50,
            age: 14,
            carbon: 238,
            changePercent: 7.2,
            status: 'completed',
            date: '20 ธ.ค. 2023'
        },
        {
            id: 5,
            year: 2023,
            plot: 'แปลงที่ 2 - ท่าศาลา',
            area: 35,
            age: 7,
            carbon: 110,
            changePercent: 15.1,
            status: 'completed',
            date: '18 ธ.ค. 2023'
        },
    ]

    const summaryStats = [
        {
            title: 'คาร์บอนรวมปีนี้',
            value: '2,580',
            unit: 'ตัน CO₂',
            change: '+15.2%',
            changeType: 'positive',
            icon: <TrendingUpIcon />,
            color: 'text-green-600',
            bgColor: 'bg-[#eef2e6]'
        },
        {
            title: 'พื้นที่สะสมทั้งหมด',
            value: '1,250',
            unit: 'ไร่',
            change: '25 แปลง',
            changeType: 'neutral',
            icon: <LeafIcon />,
            color: 'text-[#4c7c44]',
            bgColor: 'bg-[#4c7c44]/5'
        },
        {
            title: 'การประเมินสำเร็จ',
            value: '98',
            unit: '%',
            change: 'เรียบร้อย',
            changeType: 'positive',
            icon: <CheckCircleIcon />,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
    ]

    const timelineData = [
        { year: 2020, carbon: 1850 },
        { year: 2021, carbon: 1980 },
        { year: 2022, carbon: 2120 },
        { year: 2023, carbon: 2240 },
        { year: 2024, carbon: 2580 },
    ]

    const maxCarbon = Math.max(...timelineData.map(d => d.carbon))

    return (
        <div className="relative w-full min-h-screen overflow-hidden bg-[#f7f5f2]">
            {/* SIDE NAVIGATION (DESKTOP) */}
            <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 z-40 flex-col w-20 bg-gradient-to-b from-emerald-700 to-emerald-900 shadow-2xl">
                <div className="flex-1 flex flex-col items-center py-8 gap-4">
                    {/* Logo */}
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-xl hover:scale-110 transition-transform duration-300">
                        <LeafIcon className="w-8 h-8 text-emerald-600" />
                    </div>

                    {/* Nav Items */}
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => history.push(item.path)}
                            className={`group relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${item.active
                                ? 'bg-white text-emerald-600 shadow-2xl scale-110'
                                : 'text-white/70 hover:bg-white/10 hover:text-white hover:scale-105'
                                }`}
                        >
                            <item.icon className="w-6 h-6" />

                            {/* Active Indicator */}
                            {item.active && (
                                <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-full"></div>
                            )}

                            {/* Tooltip */}
                            <div className="absolute left-full ml-4 px-3 py-2 bg-emerald-800 text-white text-sm font-semibold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                                {item.label}
                            </div>
                        </button>
                    ))}
                </div>
            </nav>

            {/* MAIN CONTENT AREA */}
            <div className="lg:ml-20 min-h-screen p-4 lg:p-8 pb-24 lg:pb-8">
                <div className="space-y-8 lg:space-y-10 animate-fadeIn">

                    {/* Owner Profile Card - Premium Refinement */}
                    <div className="bg-white rounded-[2.5rem] lg:rounded-[3.5rem] p-8 lg:p-12 border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#4c7c44]/5 rounded-full blur-3xl group-hover:bg-[#4c7c44]/10 transition-all duration-1000"></div>

                        <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12 relative z-10">
                            <div className="relative">
                                <div className="w-24 h-24 lg:w-32 lg:h-32 bg-[#4c7c44] rounded-[2rem] lg:rounded-[2.5rem] flex items-center justify-center text-white text-3xl lg:text-4xl font-bold shadow-2xl shadow-[#4c7c44]/30 border-4 border-white transform lg:rotate-3 transition-transform group-hover:rotate-0 duration-500">
                                    JD
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-lg flex items-center justify-center text-[#4c7c44] border-2 border-[#eef2e6]">
                                    <CheckCircleIcon />
                                </div>
                            </div>

                            <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                                    <h2 className="text-3xl lg:text-4xl font-bold text-[#2d4a27] tracking-tight">John Doe</h2>
                                    <span className="inline-flex items-center px-3 py-1 bg-[#eef2e6] text-[#4c7c44] text-[10px] font-bold uppercase tracking-widest rounded-full border border-[#4c7c44]/10">
                                        เกษตรกรรุ่นใหม่
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    <div className="flex items-center gap-1">
                                        <MapPinIcon />
                                        นครศรีธรรมราช, ประเทศไทย
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 border-t lg:border-t-0 lg:border-l border-gray-50 pt-8 lg:pt-0 lg:pl-12">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 opacity-60">แปลงสะสม</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl lg:text-4xl font-bold text-[#2d4a27] tracking-tighter">25</span>
                                        <span className="text-[10px] font-bold text-gray-300 uppercase">แปลง</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 opacity-60">พื้นที่รวม</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl lg:text-4xl font-bold text-[#4c7c44] tracking-tighter">1,250</span>
                                        <span className="text-[10px] font-bold text-gray-300 uppercase">ไร่</span>
                                    </div>
                                </div>
                                <div className="col-span-2 lg:col-span-1 border-t lg:border-t-0 border-gray-50 pt-6 lg:pt-0">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 opacity-60">คาร์บอนรวม</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl lg:text-4xl font-bold text-green-600 tracking-tighter">2.5k</span>
                                        <span className="text-[10px] font-bold text-gray-300 uppercase">ตัน CO₂</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Stats & Chart Column */}
                        <div className="lg:col-span-2 space-y-8 lg:space-y-10">
                            {/* Summary Cards */}
                            <div className="grid sm:grid-cols-3 gap-6">
                                {summaryStats.map((stat, index) => (
                                    <div key={index} className="bg-white rounded-3xl p-6 lg:p-8 border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:shadow-[#4c7c44]/5 group">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`w-12 h-12 rounded-2xl ${stat.bgColor} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
                                                {stat.icon}
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest pt-2">Live</span>
                                        </div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[2px] mb-2 leading-none opacity-80">{stat.title}</p>
                                        <div className="flex items-baseline gap-2 mb-4">
                                            <span className={`text-4xl font-bold text-[#2d4a27] tracking-tighter`}>{stat.value}</span>
                                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{stat.unit}</span>
                                        </div>
                                        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${stat.changeType === 'positive' ? 'bg-[#eef2e6] text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                                            {stat.changeType === 'positive' && <TrendingUpIcon />}
                                            {stat.change}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Chart Card */}
                            <div className="bg-white rounded-[2.5rem] lg:rounded-[3rem] p-8 lg:p-10 border border-gray-100 shadow-sm relative overflow-hidden">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-6 relative z-10">
                                    <div>
                                        <h2 className="text-2xl font-bold text-[#2d4a27] tracking-tight">แนวโน้มคาร์บอนรายปี</h2>
                                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[2px]">ประวัติการกักเก็บคาร์บอนย้อนหลัง 5 ปี</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#4c7c44]"></div>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">ปริมาณ CO₂</span>
                                        </div>
                                        <select className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl outline-none border-none">
                                            <option>5 ปีล่าสุด</option>
                                            <option>10 ปีล่าสุด</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-end justify-between gap-4 lg:gap-8 h-64 px-4 pt-4 relative z-10">
                                    {timelineData.map((item, index) => (
                                        <div key={index} className="flex-1 flex flex-col items-center gap-5 group">
                                            <div className="text-[10px] font-bold text-[#4c7c44] bg-[#eef2e6] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
                                                {item.carbon.toLocaleString()}
                                            </div>
                                            <div
                                                className="w-full max-w-[40px] bg-[#f7f9f2] hover:bg-[#4c7c44] rounded-t-2xl transition-all duration-700 ease-out shadow-[inset_0_-4px_10px_rgba(0,0,0,0.02)] group-hover:shadow-[0_10px_25px_rgba(76,124,68,0.2)] relative"
                                                style={{ height: `${(item.carbon / maxCarbon) * 100}%` }}
                                            >
                                                <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 rounded-t-2xl"></div>
                                            </div>
                                            <div className="text-[11px] font-bold text-gray-300 group-hover:text-[#2d4a27] transition-colors uppercase tracking-[2px]">{item.year}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Background subtle lines */}
                                <div className="absolute inset-x-8 bottom-28 h-[1px] bg-gray-50"></div>
                                <div className="absolute inset-x-8 bottom-44 h-[1px] bg-gray-50"></div>
                                <div className="absolute inset-x-8 bottom-60 h-[1px] bg-gray-50"></div>
                            </div>
                        </div>

                        {/* Info Column */}
                        <div className="space-y-8">
                            <div className="bg-[#4c7c44] rounded-[2.5rem] p-8 lg:p-10 text-white shadow-xl shadow-[#4c7c44]/20 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none transform -rotate-12 translate-x-12 translate-y-12">
                                    <LeafIcon className="w-64 h-64" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 relative z-10">เป้าหมายปี 2025</h3>
                                <p className="text-sm text-white/80 mb-8 relative z-10 font-medium leading-relaxed">
                                    ตั้งเป้ากักเก็บคาร์บอนเพิ่มอีก 500 ตัน CO₂ ผ่านการขยายพื้นที่ปลูกยางพาราและบริหารจัดการสวนอย่างยั่งยืน
                                </p>
                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                                        <span>ความคืบหน้า</span>
                                        <span>65%</span>
                                    </div>
                                    <div className="h-3 w-full bg-black/10 rounded-full overflow-hidden p-1 shadow-inner">
                                        <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: '65%' }}></div>
                                    </div>
                                </div>
                                <button className="w-full mt-10 py-4 bg-white text-[#4c7c44] rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#eef2e6] transition-all relative z-10 active:scale-95 shadow-lg">
                                    ดูรายละเอียด
                                </button>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">ดาวน์โหลดรายงาน</h4>
                                <div className="space-y-4">
                                    {[2024, 2023, 2022].map(year => (
                                        <div key={year} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all group cursor-pointer border border-transparent hover:border-gray-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-[#eef2e6] text-[#4c7c44] flex items-center justify-center shrink-0">
                                                    <CalendarIcon />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-[#2d4a27]">รายงานประจำปี {year}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">PDF • 2.4 MB</p>
                                                </div>
                                            </div>
                                            <div className="text-gray-300 group-hover:text-[#4c7c44] transition-colors">
                                                <DownloadIcon />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Assessment History Table */}
                    <div className="bg-white rounded-[2.5rem] lg:rounded-[3.5rem] p-8 lg:p-12 border border-gray-100 shadow-sm relative">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
                            <div>
                                <h2 className="text-2xl font-bold text-[#2d4a27] tracking-tight">ประวัติการประเมินรายแปลง</h2>
                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[2px]">ข้อมูลเชิงลึกจากการประเมินในแต่ละรอบ</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <select className="px-5 py-3 bg-gray-50 border border-gray-50 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-[#2d4a27] focus:bg-white focus:border-[#4c7c44]/20 transition-all outline-none">
                                    <option>พ.ศ. 2567</option>
                                    <option>พ.ศ. 2566</option>
                                </select>
                                <button className="flex items-center gap-3 px-6 py-3 bg-gray-50 text-[#2d4a27] rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#4c7c44] hover:text-white transition-all transform hover:-translate-y-1">
                                    <FilterIcon />
                                    ตัวกรองขั้นสูง
                                </button>
                                <button className="flex items-center gap-3 px-6 py-3 bg-[#2d4a27] text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#4c7c44] transition-all shadow-lg shadow-[#2d4a27]/20 transform hover:-translate-y-1">
                                    <DownloadIcon />
                                    Export Data
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto -mx-8 lg:mx-0">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-50">
                                        <th className="text-left py-6 px-6 text-[9px] font-black text-gray-300 uppercase tracking-[2px]">วันที่ประเมิน</th>
                                        <th className="text-left py-6 px-6 text-[9px] font-black text-gray-300 uppercase tracking-[2px]">แปลงยางพารา</th>
                                        <th className="text-left py-6 px-6 text-[9px] font-black text-gray-300 uppercase tracking-[2px]">พื้นที่และอายุ</th>
                                        <th className="text-left py-6 px-6 text-[9px] font-black text-gray-300 uppercase tracking-[2px]">ปริมาณคาร์บอน</th>
                                        <th className="text-left py-6 px-6 text-[9px] font-black text-gray-300 uppercase tracking-[2px]">สถานะ</th>
                                        <th className="text-right py-6 px-6 text-[9px] font-black text-gray-300 uppercase tracking-[2px]">เครื่องมือ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {historyData.map((row) => (
                                        <tr key={row.id} className="group hover:bg-gray-50/50 transition-all cursor-pointer">
                                            <td className="py-8 px-6 whitespace-nowrap">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-[#eef2e6] group-hover:text-[#4c7c44] flex items-center justify-center transition-all">
                                                        <CalendarIcon />
                                                    </div>
                                                    <span className="font-bold text-xs text-[#2d4a27] uppercase tracking-wider">{row.date}</span>
                                                </div>
                                            </td>
                                            <td className="py-8 px-6 whitespace-nowrap">
                                                <p className="font-bold text-sm text-[#2d4a27] tracking-tight">{row.plot}</p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">CODE: KCB-{(row.id + 100).toString()}</p>
                                            </td>
                                            <td className="py-8 px-6 whitespace-nowrap">
                                                <p className="font-bold text-sm text-gray-600 tracking-tight">{row.area} ไร่</p>
                                                <p className="text-[9px] font-bold text-[#4c7c44] uppercase tracking-widest mt-1">อายุยาง {row.age} ปี</p>
                                            </td>
                                            <td className="py-8 px-6 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg font-bold text-[#2d4a27] tracking-tighter">{row.carbon}</span>
                                                        <span className="text-[10px] font-bold text-gray-300 uppercase">ตัน CO₂</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[9px] font-black text-green-600 uppercase tracking-widest mt-0.5">
                                                        <TrendingUpIcon />
                                                        +{row.changePercent}%
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-8 px-6 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${row.status === 'completed'
                                                    ? 'bg-green-50 text-green-600 border-green-100'
                                                    : 'bg-orange-50 text-orange-600 border-orange-100'
                                                    }`}>
                                                    {row.status === 'completed' ? 'ยืนยันแล้ว' : 'รอดำเนินการ'}
                                                </span>
                                            </td>
                                            <td className="py-8 px-6 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
                                                    <button className="w-10 h-10 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-[#4c7c44] hover:shadow-md transition-all flex items-center justify-center">
                                                        <DownloadIcon />
                                                    </button>
                                                    <button className="w-10 h-10 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:shadow-md transition-all flex items-center justify-center">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer Watermark */}
                    <div className="text-center opacity-10 py-10">
                        <p className="text-[10px] font-black text-[#2d4a27] uppercase tracking-[15px]">KeptCarbon History Portal</p>
                    </div>
                </div>
            </div>

            {/* BOTTOM NAVIGATION (MOBILE) */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl shadow-2xl border-t border-emerald-100">
                <div className="flex items-center justify-around px-2 py-3">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => history.push(item.path)}
                            className={`group relative flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300 ${item.active
                                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-500/30 scale-110'
                                : 'text-slate-600'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 transition-transform ${item.active ? '' : 'group-hover:scale-110'}`} />
                            <span className="text-xs font-bold">{item.label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    )
}

export default HistoryPage

