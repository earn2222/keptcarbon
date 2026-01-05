import React, { useState } from 'react'

// Enhanced Icons for Premium Look
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

const LeafIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2z"></path>
        <path d="M11 20v-5.5"></path>
        <path d="M7 15l1.5-1.5"></path>
        <path d="M15 15l-1.5-1.5"></path>
    </svg>
)

const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>
)

function HistoryPage() {
    const [selectedYear, setSelectedYear] = useState('2024')
    const [selectedPlot, setSelectedPlot] = useState('all')

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
        <div className="space-y-8 lg:space-y-10 pb-20 animate-fadeIn">

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
                                        <div className="absolute top-0 left-0 right-0 h-1bg-white/20 rounded-t-2xl"></div>
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

                {/* Info Column - Optional refinement for sidebar empty space if grid allows */}
                <div className="space-y-8">
                    <div className="bg-[#4c7c44] rounded-[2.5rem] p-8 lg:p-10 text-white shadow-xl shadow-[#4c7c44]/20 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none transform -rotate-12 translate-x-12 translate-y-12">
                            <LeafIcon size={250} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 relative z-10">เป้าหมายปี 2025</h3>
                        <p className="text-sm text-white/80 mb-8 relative z-10 font-medium leading-relaxed">
                            ตั้งเป้ากักเก็บคาร์บอนเพิ่มอีก 500 ตัน CO₂ ผ่านการขยายพื้นที่ปลูกยางพาราเเละบริหารจัดการสวนอย่างยั่งยืน
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
                        <h2 className="text-2xl font-bold text-[#2d4a27] tracking-tight">ประวัติการประเมินรายเเปลง</h2>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[2px]">ข้อมูลเชิงลึกจากการประเมินในเเตละรอบ</p>
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
                                <th className="text-left py-6 px-6 text-[9px] font-black text-gray-300 uppercase tracking-[2px]">เเปลงยางพารา</th>
                                <th className="text-left py-6 px-6 text-[9px] font-black text-gray-300 uppercase tracking-[2px]">พื้นที่เเละอายุ</th>
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
                                            {row.status === 'completed' ? 'ยืนยันเเล้ว' : 'รอดำเนินการ'}
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
    )
}

export default HistoryPage

