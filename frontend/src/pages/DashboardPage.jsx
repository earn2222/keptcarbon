import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPlots } from '../services/api'

// Icons
const TrendingUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
)

const TrendingDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
        <polyline points="17 18 23 18 23 12"></polyline>
    </svg>
)

const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>
)

const AreaIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    </svg>
)

const LeafIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
    </svg>
)

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
)

function DashboardPage() {
    const [recentPlots, setRecentPlots] = useState([]);
    const [stats, setStats] = useState([
        {
            title: 'จำนวนแปลง',
            value: '0',
            change: '+0',
            changeType: 'neutral',
            icon: '🗺️',
            iconBg: 'bg-[#16a34a]/10',
            period: 'ทั้งหมด'
        },
        {
            title: 'พื้นที่รวม',
            value: '0',
            unit: 'ไร่',
            change: '+0',
            changeType: 'neutral',
            icon: '📐',
            iconBg: 'bg-[#059669]/10',
            period: 'ทั้งหมด'
        },
        {
            title: 'คาร์บอนรวม',
            value: '0',
            unit: 'ตัน',
            change: '-',
            changeType: 'neutral',
            icon: '🌱',
            iconBg: 'bg-green-100',
            period: 'ประมาณการ'
        },
        {
            title: 'อายุเฉลี่ย',
            value: '0',
            unit: 'ปี',
            change: '-',
            changeType: 'neutral',
            icon: '🌳',
            iconBg: 'bg-amber-100',
            period: 'ต้นยาง'
        }
    ]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const plots = await getPlots();

                // Debug logs
                console.log("Plots data received:", plots);

                // Process Data for Stats
                const totalPlots = plots.length;
                const totalArea = plots.reduce((sum, p) => sum + (parseFloat(p.area_rai) || 0), 0);
                const avgAge = plots.length > 0 ? (plots.reduce((sum, p) => sum + (parseFloat(p.tree_age) || 0), 0) / plots.length).toFixed(1) : 0;

                // Use carbon_tons from backend API with safer parsing
                const totalCarbon = plots.reduce((sum, p) => {
                    const carbon = parseFloat(p.carbon_tons);
                    // console.log(`Plot ${p.id} carbon:`, carbon); 
                    return sum + (isNaN(carbon) ? 0 : carbon);
                }, 0);

                setStats([
                    {
                        title: 'จำนวนแปลง',
                        value: totalPlots.toString(),
                        change: `+${totalPlots}`,
                        changeType: 'positive',
                        icon: '🗺️',
                        iconBg: 'bg-[#065f46]/10',
                        period: 'ทั้งหมด'
                    },
                    {
                        title: 'พื้นที่รวม',
                        value: totalArea.toFixed(2),
                        unit: 'ไร่',
                        change: `+${totalArea.toFixed(2)}`,
                        changeType: 'positive',
                        icon: '📐',
                        iconBg: 'bg-[#059669]/10',
                        period: 'ทั้งหมด'
                    },
                    {
                        title: 'คาร์บอนรวม',
                        value: totalCarbon.toFixed(2),
                        unit: 'ตัน',
                        change: '-',
                        changeType: 'neutral',
                        icon: '🌱',
                        iconBg: 'bg-green-100',
                        period: 'ข้อมูลล่าสุด'
                    },
                    {
                        title: 'อายุเฉลี่ย',
                        value: avgAge.toString(),
                        unit: 'ปี',
                        change: '-',
                        changeType: 'neutral',
                        icon: '🌳',
                        iconBg: 'bg-amber-100',
                        period: 'ต้นยาง'
                    }
                ]);

                // Set Recent Plots (Top 5)
                const mappedPlots = plots.slice(0, 5).map(p => ({
                    id: p.id,
                    name: p.name,
                    area: `${(p.area_rai || 0).toFixed(2)} ไร่`,
                    age: p.tree_age || 0,
                    carbon: (p.carbon_tons || 0).toFixed(2),
                    status: p.status || 'completed'
                }));
                setRecentPlots(mappedPlots);

            } catch (error) {
                console.error("Failed to load dashboard data", error);
            }
        };

        loadData();
    }, []);

    const carbonByAge = [
        { age: '1-5 ปี', carbon: 320, percentage: 12 },
        { age: '6-10 ปี', carbon: 580, percentage: 22 },
        { age: '11-15 ปี', carbon: 890, percentage: 34 },
        { age: '16-20 ปี', carbon: 540, percentage: 21 },
        { age: '20+ ปี', carbon: 250, percentage: 10 },
    ]

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-2xl p-6 shadow-card hover:shadow-hover hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center text-2xl`}>
                                {stat.icon}
                            </div>
                            <span className="text-xs text-gray-400">{stat.period}</span>
                        </div>
                        <div className="text-sm text-gray-500 mb-1">{stat.title}</div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-gray-800">{stat.value}</span>
                            {stat.unit && <span className="text-gray-500 text-sm">{stat.unit}</span>}
                        </div>
                        {stat.changeType !== 'neutral' && (
                            <div className={`flex items-center gap-1 mt-2 text-sm ${stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                                {stat.changeType === 'positive' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                                <span>{stat.change}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Carbon by Age Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-card">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">คาร์บอนตามอายุต้นยาง</h2>
                            <p className="text-sm text-gray-500">การกระจายตัวของคาร์บอนตามช่วงอายุ (จำลองข้อมูล)</p>
                        </div>
                        <select className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 bg-white">
                            <option>ปี 2024</option>
                        </select>
                    </div>

                    <div className="space-y-4">
                        {carbonByAge.map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className="w-20 text-sm text-gray-600 font-medium">{item.age}</div>
                                <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full gradient-primary rounded-full transition-all duration-500"
                                        style={{ width: `${item.percentage}%` }}
                                    ></div>
                                </div>
                                <div className="w-24 text-right">
                                    <span className="font-semibold text-gray-800">{item.carbon}</span>
                                    <span className="text-gray-400 text-sm ml-1">ตัน</span>
                                </div>
                                <div className="w-12 text-right text-sm text-gray-500">{item.percentage}%</div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                        <div>
                            <span className="text-gray-500 text-sm">คาร์บอนรวมทั้งหมด</span>
                            <div className="text-2xl font-bold text-gray-800">{stats[2].value} <span className="text-sm font-normal text-gray-500">ตัน CO₂</span></div>
                        </div>
                        <Link
                            to="/dashboard/history"
                            className="flex items-center gap-2 text-[#059669] font-medium text-sm hover:gap-3 transition-all"
                        >
                            ดูรายละเอียด
                            <ArrowRightIcon />
                        </Link>
                    </div>
                </div>

                {/* Map Preview */}
                <div className="bg-white rounded-2xl p-6 shadow-card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">แผนที่แปลง</h2>
                        <Link
                            to="/dashboard/map"
                            className="text-[#16a34a] text-sm font-medium hover:underline"
                        >
                            ดูเต็ม
                        </Link>
                    </div>

                    <div className="h-[200px] bg-gradient-to-br from-green-100 via-green-200 to-green-300 rounded-xl relative overflow-hidden mb-4">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(60,194,207,0.3)_0%,transparent_50%)]"></div>
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700">
                            {stats[0].value} แปลง
                        </div>
                        <div className="flex items-center justify-center h-full text-green-800/50 font-semibold text-lg">
                            KeptCarbon Map
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-3 h-3 rounded bg-green-300"></div>
                            <span className="text-gray-600">แสดงข้อมูลพื้นที่จริง</span>
                        </div>
                    </div>

                    <Link
                        to="/dashboard/map"
                        className="mt-4 w-full py-3 rounded-xl text-center font-semibold text-white gradient-primary block shadow-lg shadow-[#065f46]/20"
                    >
                        จัดการแปลง
                    </Link>
                </div>
            </div>

            {/* Recent Plots Table */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">แปลงล่าสุด</h2>
                        <p className="text-sm text-gray-500">รายการแปลงยางที่เพิ่มล่าสุด</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500">ชื่อแปลง</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500">พื้นที่</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500">อายุ (ปี)</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500">คาร์บอน (ตัน)</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500">สถานะ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentPlots.length > 0 ? (
                                recentPlots.map((plot) => (
                                    <tr key={plot.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#059669]/10 rounded-xl flex items-center justify-center text-[#059669]">
                                                    <MapPinIcon />
                                                </div>
                                                <span className="font-medium text-gray-800">{plot.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-gray-600">{plot.area}</td>
                                        <td className="py-4 px-4 text-gray-600">{plot.age}</td>
                                        {/* Show Carbon */}
                                        <td className="py-4 px-4">
                                            <span className="font-semibold text-gray-800">{plot.carbon}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${plot.status === 'completed' || plot.status === 'complete'
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-amber-100 text-amber-600'
                                                }`}>
                                                {plot.status === 'completed' || plot.status === 'complete' ? 'เสร็จสิ้น' : 'รอดำเนินการ'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-gray-400">
                                        ยังไม่มีข้อมูลแปลง
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage
