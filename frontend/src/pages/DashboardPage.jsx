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
        <div className="space-y-8 pb-10">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className={`w-14 h-14 ${stat.iconBg === 'bg-[#065f46]/10' ? 'bg-[#eef2e6] text-[#4c7c44]' : stat.iconBg} rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-white`}>
                                {stat.icon}
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.period}</span>
                        </div>
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.title}</div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-[#2d4a27] tracking-tighter">{stat.value}</span>
                            {stat.unit && <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">{stat.unit}</span>}
                        </div>
                        {stat.changeType !== 'neutral' && (
                            <div className={`flex items-center gap-1 mt-4 text-[10px] font-black uppercase tracking-wider ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-500'}`}>
                                {stat.changeType === 'positive' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                                <span>เพิ่มขึ้น {stat.change}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Carbon by Age Chart */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-[#2d4a27] tracking-tight">คาร์บอนตามอายุต้นยาง</h2>
                            <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-widest">การกระจายตัวของคาร์บอน (จำลองข้อมูล)</p>
                        </div>
                        <select className="px-5 py-2.5 border border-gray-100 rounded-2xl text-xs font-bold text-gray-600 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#4c7c44]/10 transition-all outline-none">
                            <option>รายงานปี 2024</option>
                            <option>รายงานปี 2023</option>
                        </select>
                    </div>

                    <div className="space-y-6">
                        {carbonByAge.map((item, index) => (
                            <div key={index} className="flex items-center gap-6">
                                <div className="w-20 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.age}</div>
                                <div className="flex-1 h-3.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                    <div
                                        className="h-full bg-[#4c7c44] rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${item.percentage}%` }}
                                    ></div>
                                </div>
                                <div className="w-24 text-right">
                                    <span className="font-bold text-[#2d4a27] text-sm tracking-tight">{item.carbon}</span>
                                    <span className="text-gray-400 text-[10px] ml-1.5 font-bold uppercase tracking-wider">ตัน</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 pt-10 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="text-center sm:text-left">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px]">คาร์บอนรวมสะสม</span>
                            <div className="text-3xl font-bold text-[#2d4a27] tracking-tighter mt-1">{stats[2].value} <span className="text-lg font-bold text-gray-300 ml-1 tracking-tight">ตัน CO₂</span></div>
                        </div>
                        <Link
                            to="/dashboard/history"
                            className="flex items-center gap-3 px-6 py-3 bg-[#eef2e6] text-[#4c7c44] rounded-2xl font-bold text-xs hover:bg-[#4c7c44] hover:text-white transition-all group shadow-sm"
                        >
                            ดูรายละเอียดทั้งหมด
                            <div className="transition-transform group-hover:translate-x-1">
                                <ArrowRightIcon />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Map Preview */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-[#2d4a27] tracking-tight">จัดการพื้นที่</h2>
                        <Link
                            to="/map"
                            className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[#4c7c44] hover:bg-[#eef2e6] transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                        </Link>
                    </div>

                    <div className="flex-1 min-h-[220px] bg-[#fbfbfb] rounded-3xl relative overflow-hidden mb-6 border border-gray-100 group cursor-pointer" onClick={() => window.location.href = '/map'}>
                        <div className="absolute inset-0 bg-[url('https://mt1.google.com/vt/lyrs=s&x=203&y=118&z=8')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-[#4c7c44]/10"></div>
                        <div className="absolute top-5 right-5 bg-white shadow-xl px-4 py-2 rounded-2xl text-[10px] font-bold text-[#4c7c44] uppercase tracking-widest border border-gray-50">
                            {stats[0].value} แปลงสวนยาง
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center flex-col gap-2 p-10">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#4c7c44] shadow-premium mb-2 group-hover:scale-110 transition-transform duration-500">
                                <MapPinIcon />
                            </div>
                            <span className="text-xs font-bold text-[#2d4a27] tracking-tight text-center">คลิกเพื่อเปิดแผนที่<br />สำรวจข้อมูลเกษตรกร</span>
                        </div>
                    </div>

                    <Link
                        to="/map"
                        className="w-full py-4 bg-[#4c7c44] text-white rounded-2xl text-center font-bold text-sm shadow-lg shadow-[#4c7c44]/20 hover:bg-[#3d6336] transition-all active:scale-95"
                    >
                        เริ่มคำนวณแปลงยางใหม่
                    </Link>
                </div>
            </div>

            {/* Recent Plots Table */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-[#2d4a27] tracking-tight">แปลงล่าสุด</h2>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest leading-relaxed">รายการแปลงยางพาราที่เพิ่มเข้าสู่ระบบล่าสุด</p>
                    </div>
                    <Link to="/dashboard/history" className="text-xs font-bold text-[#4c7c44] hover:underline underline-offset-4 tracking-tight">ดูทั้งหมด →</Link>
                </div>

                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-50">
                                <th className="text-left py-5 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">ข้อมูลชื่อเรียกแปลง</th>
                                <th className="text-left py-5 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">พื้นที่จริง</th>
                                <th className="text-left py-5 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap text-center">อายุต้นยาง</th>
                                <th className="text-left py-5 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">กักเก็บคาร์บอน</th>
                                <th className="text-left py-5 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap text-right">สถานะระบบ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {recentPlots.length > 0 ? (
                                recentPlots.map((plot) => (
                                    <tr key={plot.id} className="group hover:bg-[#fbfbfb] transition-all cursor-pointer">
                                        <td className="py-5 px-6 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#eef2e6] rounded-2xl flex items-center justify-center text-[#4c7c44] group-hover:scale-110 transition-transform border border-white shadow-sm">
                                                    <LeafIcon />
                                                </div>
                                                <span className="font-bold text-sm text-[#2d4a27] tracking-tight group-hover:text-[#4c7c44] transition-colors">{plot.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6 whitespace-nowrap">
                                            <span className="text-sm font-bold text-gray-600 tracking-tight">{plot.area}</span>
                                        </td>
                                        <td className="py-5 px-6 whitespace-nowrap text-center">
                                            <span className="text-sm font-bold text-gray-600 tracking-tight">{plot.age} ปี</span>
                                        </td>
                                        <td className="py-5 px-6 whitespace-nowrap">
                                            <div className="flex items-baseline gap-1.5 font-bold tracking-tight">
                                                <span className="text-[#2d4a27] text-base">{plot.carbon}</span>
                                                <span className="text-xs text-gray-300 uppercase tracking-tighter">ตัน C</span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6 whitespace-nowrap text-right">
                                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${plot.status === 'completed' || plot.status === 'complete'
                                                    ? 'bg-[#eef2e6] text-[#4c7c44] border-[#e0e7d5]'
                                                    : 'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}>
                                                {plot.status === 'completed' || plot.status === 'complete' ? 'สมบูรณ์' : 'รอดำเนินการ'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center">
                                                <MapPinIcon />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">ยังไม่มีข้อมูลเเปลงยางพาราในระบบ</span>
                                        </div>
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
