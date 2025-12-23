import React, { useState } from 'react'

// Icons
const FilterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
)

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
)

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
)

const TrendingUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
)

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
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
            biomass: 245.5,
            carbon: 258,
            changePercent: 8.5,
            status: 'completed',
            date: '2024-12-15'
        },
        {
            id: 2,
            year: 2024,
            plot: 'แปลงที่ 2 - ท่าศาลา',
            area: 35,
            age: 8,
            biomass: 118.2,
            carbon: 124,
            changePercent: 12.3,
            status: 'completed',
            date: '2024-12-14'
        },
        {
            id: 3,
            year: 2024,
            plot: 'แปลงที่ 3 - หัวไทร',
            area: 42,
            age: 12,
            biomass: 180.0,
            carbon: 189,
            changePercent: 6.8,
            status: 'pending',
            date: '2024-12-13'
        },
        {
            id: 4,
            year: 2023,
            plot: 'แปลงที่ 1 - บ้านนา',
            area: 50,
            age: 14,
            biomass: 226.2,
            carbon: 238,
            changePercent: 7.2,
            status: 'completed',
            date: '2023-12-20'
        },
        {
            id: 5,
            year: 2023,
            plot: 'แปลงที่ 2 - ท่าศาลา',
            area: 35,
            age: 7,
            biomass: 105.2,
            carbon: 110,
            changePercent: 15.1,
            status: 'completed',
            date: '2023-12-18'
        },
    ]

    const summaryStats = [
        {
            title: 'คาร์บอนรวมปีนี้',
            value: '2,580',
            unit: 'ตัน CO₂',
            change: '+15.2%',
            changeType: 'positive'
        },
        {
            title: 'คาร์บอนปีก่อน',
            value: '2,240',
            unit: 'ตัน CO₂',
            change: '',
            changeType: 'neutral'
        },
        {
            title: 'การเปลี่ยนแปลง',
            value: '+340',
            unit: 'ตัน CO₂',
            change: 'เพิ่มขึ้น',
            changeType: 'positive'
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
        <div className="space-y-6">
            {/* Owner Profile Card */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[#3cc2cf]/30">
                        JD
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-800 mb-1">John Doe</h2>
                        <p className="text-gray-500">จังหวัดนครศรีธรรมราช</p>
                    </div>
                    <div className="flex gap-8">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-800">25</div>
                            <div className="text-sm text-gray-500">แปลงทั้งหมด</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-[#3cc2cf]">1,250</div>
                            <div className="text-sm text-gray-500">ไร่รวม</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-500">2,580</div>
                            <div className="text-sm text-gray-500">ตันคาร์บอน</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                {summaryStats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-2xl p-6 shadow-card">
                        <div className="text-sm text-gray-500 mb-2">{stat.title}</div>
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-3xl font-bold text-gray-800">{stat.value}</span>
                            <span className="text-gray-500 text-sm">{stat.unit}</span>
                        </div>
                        {stat.change && (
                            <div className={`flex items-center gap-1 text-sm ${stat.changeType === 'positive' ? 'text-green-500' : 'text-gray-500'
                                }`}>
                                {stat.changeType === 'positive' && <TrendingUpIcon />}
                                <span>{stat.change}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Carbon Trend Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">แนวโน้มคาร์บอนรายปี</h2>
                        <p className="text-sm text-gray-500">การเปลี่ยนแปลงของคาร์บอนตลอดเวลา</p>
                    </div>
                </div>

                {/* Simple Bar Chart */}
                <div className="flex items-end justify-between gap-4 h-48 px-4">
                    {timelineData.map((item, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            <div className="text-sm font-semibold text-gray-700">{item.carbon}</div>
                            <div
                                className="w-full gradient-primary rounded-t-lg transition-all duration-500"
                                style={{ height: `${(item.carbon / maxCarbon) * 100}%` }}
                            ></div>
                            <div className="text-sm text-gray-500">{item.year}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters & Table */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">ประวัติการประเมิน</h2>
                        <p className="text-sm text-gray-500">รายการประเมินคาร์บอนทั้งหมด</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:border-[#3cc2cf] outline-none"
                        >
                            <option value="all">ทุกปี</option>
                            <option value="2024">ปี 2024</option>
                            <option value="2023">ปี 2023</option>
                            <option value="2022">ปี 2022</option>
                        </select>

                        <select
                            value={selectedPlot}
                            onChange={(e) => setSelectedPlot(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:border-[#3cc2cf] outline-none"
                        >
                            <option value="all">ทุกแปลง</option>
                            <option value="1">แปลงที่ 1</option>
                            <option value="2">แปลงที่ 2</option>
                            <option value="3">แปลงที่ 3</option>
                        </select>

                        <button className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-[#3cc2cf] hover:text-[#3cc2cf] transition-all flex items-center gap-2">
                            <DownloadIcon />
                            <span>ส่งออก</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-gray-100">
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500">ปี</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500">แปลง</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500">พื้นที่ (ไร่)</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500">อายุ (ปี)</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500">มวลชีวภาพ (ตัน)</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500">คาร์บอน (ตัน)</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500">สถานะ</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyData.map((row) => (
                                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="text-gray-400" />
                                            <span className="font-medium text-gray-800">{row.year}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-gray-700">{row.plot}</td>
                                    <td className="py-4 px-4 text-gray-600">{row.area}</td>
                                    <td className="py-4 px-4 text-gray-600">{row.age}</td>
                                    <td className="py-4 px-4 text-gray-600">{row.biomass}</td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-800">{row.carbon}</span>
                                            <span className="text-green-500 text-sm flex items-center gap-1">
                                                <TrendingUpIcon />
                                                {row.changePercent}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${row.status === 'completed'
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-amber-100 text-amber-600'
                                            }`}>
                                            {row.status === 'completed' ? 'เสร็จสิ้น' : 'รอดำเนินการ'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <button className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#3cc2cf] hover:text-white transition-all">
                                            <EyeIcon />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default HistoryPage
