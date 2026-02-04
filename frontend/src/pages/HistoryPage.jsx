import React, { useState, useEffect, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { getPlots, deletePlot } from '../services/api'

// ==========================================
// ICONS
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

const HistoryIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
)

const TrashIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
)

const EditIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
)

const SearchIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
)

// ==========================================
// CHART COMPONENTS (Responsive & Dynamic)
// ==========================================

// --- Trend Chart (Line) ---
const TrendChart = ({ data }) => {
    if (!data || data.length === 0) return <div className="h-48 flex items-center justify-center text-slate-300">ไม่มีข้อมูล</div>

    const padding = 10
    const height = 100
    const width = 300
    const maxY = Math.max(...data.map(d => d.value), 100) * 1.2

    // Calculate points
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1 || 1)) * (width - 2 * padding) + padding
        const y = height - (d.value / maxY) * (height - 2 * padding) - padding
        return { x, y, value: d.value, label: d.label }
    })

    // Smooth Curve Generator
    const createPath = (pts) => {
        if (pts.length === 0) return ""
        if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y} h 1`

        let path = `M ${pts[0].x} ${pts[0].y}`
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i]
            const p1 = pts[i + 1]
            path += ` C ${p0.x + (p1.x - p0.x) * 0.5} ${p0.y}, ${p0.x + (p1.x - p0.x) * 0.5} ${p1.y}, ${p1.x} ${p1.y}`
        }
        return path
    }

    const linePath = createPath(points)
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`

    return (
        <div className="w-full h-full relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
                    <line
                        key={ratio}
                        x1="0" y1={height - (ratio * (height - 2 * padding)) - padding}
                        x2={width} y2={height - (ratio * (height - 2 * padding)) - padding}
                        stroke="#f1f5f9"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                    />
                ))}

                {/* Area & Line */}
                <path d={areaPath} fill="url(#trendGradient)" />
                <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

                {/* Interactive Points */}
                {points.map((p, i) => (
                    <g key={i} className="group">
                        <circle cx={p.x} cy={p.y} r="3" fill="#ffffff" stroke="#10b981" strokeWidth="2" className="transition-all duration-300 group-hover:r-5 cursor-pointer" vectorEffect="non-scaling-stroke" />
                        <foreignObject x={p.x - 30} y={p.y - 40} width="60" height="30" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="flex items-center justify-center">
                                <span className="bg-slate-800 text-white text-[9px] py-1 px-2 rounded-lg shadow-lg whitespace-nowrap">
                                    {p.value.toLocaleString()} t
                                </span>
                            </div>
                        </foreignObject>
                    </g>
                ))}
            </svg>

            {/* Axis Labels */}
            <div className="flex justify-between mt-2 px-2 text-[10px] text-slate-400 font-medium">
                {points.map((p, i) => (
                    <span key={i} style={{ left: `${(p.x / width) * 100}%` }} className="text-center transform -translate-x-1/2 w-8">
                        {p.label}
                    </span>
                ))}
            </div>
        </div>
    )
}

// --- Bar Chart (Comparison) ---
const BarChart = ({ data }) => {
    if (!data || data.length === 0) return <div className="h-48 flex items-center justify-center text-slate-300">ไม่มีข้อมูล</div>

    const maxVal = Math.max(...data.map(d => d.value), 1)

    return (
        <div className="h-full w-full flex items-end justify-between gap-2 md:gap-4 pb-6">
            {data.map((d, i) => {
                const heightPercent = (d.value / maxVal) * 100
                return (
                    <div key={i} className="group relative flex flex-col items-center justify-end h-full flex-1 w-full">
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                            <div className="bg-slate-800 text-white text-[10px] py-1 px-2 rounded-lg shadow-lg whitespace-nowrap">
                                {d.value.toLocaleString()} tCO₂e
                            </div>
                        </div>

                        <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full max-w-[40px] md:max-w-[50px] rounded-t-lg transition-all duration-500 ease-out 
                                ${i === 0 ? 'bg-gradient-to-t from-emerald-500 to-emerald-300 shadow-lg shadow-emerald-200' : 'bg-gradient-to-t from-emerald-100 to-emerald-200 hover:from-emerald-300 hover:to-emerald-400'}
                            `}
                        ></div>

                        <span className="mt-2 text-[10px] text-slate-400 font-medium truncate w-full text-center block px-1">
                            {d.label}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================

function HistoryPage() {
    const history = useHistory()
    const [plots, setPlots] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [userStats, setUserStats] = useState({
        totalPlots: 0,
        totalArea: 0,
        totalCarbon: 0,
        thisYearCarbon: 0,
        lastYearCarbon: 0
    })

    useEffect(() => {
        fetchPlots()
    }, [])

    const fetchPlots = async () => {
        try {
            const data = await getPlots()

            // Transform data
            const processed = data.map((p, index) => {
                let geometry = p.geometry;
                if (typeof geometry === 'string') try { geometry = JSON.parse(geometry); } catch (e) { }

                const lat = geometry?.type === 'Point' ? geometry.coordinates[1] : (geometry?.coordinates?.[0]?.[0]?.[1] || 18.80)
                const lng = geometry?.type === 'Point' ? geometry.coordinates[0] : (geometry?.coordinates?.[0]?.[0]?.[0] || 98.95)

                const carbonVal = parseFloat(p.carbon_tons) || 0
                const dateObj = p.created_at ? new Date(p.created_at) : new Date(2024, index % 12, 1)

                return {
                    id: p.id || index + 1,
                    dateObj: dateObj,
                    date: dateObj.toLocaleDateString('th-TH'),
                    year: dateObj.getFullYear(),
                    name: p.name || `แปลงที่ ${index + 1}`,
                    tambon: 'สุเทพ',
                    amphoe: 'เมือง',
                    province: 'เชียงใหม่',
                    coordinates: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                    area: parseFloat(p.area_rai) || 0,
                    method: p.method || `การคำนวณมาตรฐาน`,
                    age: parseInt(p.tree_age) || 0,
                    carbon: carbonVal,
                    fullData: p
                }
            })
            setPlots(processed)

            // Calculate Stats
            const currentYear = new Date().getFullYear()
            const totalArea = processed.reduce((sum, p) => sum + p.area, 0)
            const totalCarbon = processed.reduce((sum, p) => sum + p.carbon, 0)
            const thisYearCarbon = processed.filter(p => p.year === currentYear).reduce((sum, p) => sum + p.carbon, 0)
            const lastYearCarbon = processed.filter(p => p.year === currentYear - 1).reduce((sum, p) => sum + p.carbon, 0)

            setUserStats({
                totalPlots: processed.length,
                totalArea,
                totalCarbon,
                thisYearCarbon,
                lastYearCarbon
            })

        } catch (error) {
            console.error("Failed to fetch plots", error)
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
            try {
                await deletePlot(id)
                fetchPlots()
            } catch (err) {
                alert('ลบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
            }
        }
    }

    const handleNavClick = (path) => history.push(path)

    const filteredPlots = plots.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toString().includes(searchTerm)
    )

    // Chart Data Preparation
    const trendData = useMemo(() => {
        if (plots.length === 0) return []
        const grouped = {}
        const currentYear = new Date().getFullYear()
        for (let y = currentYear - 4; y <= currentYear; y++) grouped[y] = 0
        plots.forEach(p => { if (grouped[p.year] !== undefined) grouped[p.year] += p.carbon })
        return Object.keys(grouped).map(year => ({ label: year, value: grouped[year] }))
    }, [plots])

    const topPlotsData = useMemo(() => {
        if (plots.length === 0) return []
        return [...plots].sort((a, b) => b.carbon - a.carbon).slice(0, 5).map(p => ({
            label: p.name, value: p.carbon, id: p.id
        }))
    }, [plots])

    const carbonDiff = userStats.thisYearCarbon - userStats.lastYearCarbon
    const carbonPercent = userStats.lastYearCarbon > 0
        ? ((carbonDiff / userStats.lastYearCarbon) * 100).toFixed(1)
        : (userStats.thisYearCarbon > 0 ? '100' : '0')
    const isPositive = carbonDiff >= 0

    return (
        <div className="relative w-full min-h-screen bg-[#f8fafc] flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-700">

            <main className="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-8 pt-32 pb-24 flex flex-col gap-8">

                {/* HEADER SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Profile Card */}
                    <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-6 lg:gap-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                        <div className="relative shrink-0">
                            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 p-[2px] shadow-lg shadow-emerald-200">
                                <div className="w-full h-full rounded-full bg-white p-1">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Profile" className="w-full h-full rounded-full bg-slate-50" />
                                </div>
                            </div>
                            <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full"></div>
                        </div>

                        <div className="flex-1 text-center sm:text-left z-10 w-full">
                            <h2 className="text-xl lg:text-2xl font-bold text-slate-800">ผู้ดูแลระบบ</h2>
                            <p className="text-slate-400 text-sm font-medium mb-6">admin@keptcarbon.com</p>

                            <div className="grid grid-cols-3 gap-2 sm:gap-6 divide-x divide-slate-100">
                                <div className="text-center px-2">
                                    <p className="text-2xl lg:text-3xl font-black text-slate-800">{userStats.totalPlots}</p>
                                    <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wide mt-1">แปลงทั้งหมด</p>
                                </div>
                                <div className="text-center px-2">
                                    <p className="text-2xl lg:text-3xl font-black text-blue-500">{userStats.totalArea.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                    <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wide mt-1">ไร่รวม</p>
                                </div>
                                <div className="text-center px-2">
                                    <p className="text-2xl lg:text-3xl font-black text-emerald-500">{userStats.totalCarbon.toFixed(0)}</p>
                                    <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wide mt-1">tCO₂e</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
                            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">ปี {new Date().getFullYear()}</p>
                            <h3 className="text-2xl lg:text-3xl font-bold text-slate-800">{userStats.thisYearCarbon.toFixed(0)} <span className="text-xs text-slate-400 font-normal">t</span></h3>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-2 border border-emerald-100">คาร์บอนล่าสุด</span>
                        </div>
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
                            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">ปี {new Date().getFullYear() - 1}</p>
                            <h3 className="text-2xl lg:text-3xl font-bold text-slate-800">{userStats.lastYearCarbon.toFixed(0)} <span className="text-xs text-slate-400 font-normal">t</span></h3>
                        </div>
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
                            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">การเปลี่ยนแปลง</p>
                            <h3 className={`text-2xl lg:text-3xl font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {isPositive ? '+' : ''}{carbonDiff.toFixed(0)}
                            </h3>
                            <span className={`text-[10px] font-bold flex items-center gap-1 mt-2 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {isPositive ? '▲' : '▼'} {carbonPercent}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* CHARTS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 lg:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                                แนวโน้มคาร์บอนรายปี
                            </h3>
                            <p className="text-xs text-slate-400 pl-4 mt-1">Carbon Credit Trend</p>
                        </div>
                        <div className="flex-1 min-h-[250px] w-full mt-4">
                            <TrendChart data={trendData} />
                        </div>
                    </div>

                    <div className="bg-white p-6 lg:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                                    5 อันดับแปลงคาร์บอนสูงสุด
                                </h3>
                                <p className="text-xs text-slate-400 pl-4 mt-1">Top 5 Plots</p>
                            </div>
                        </div>
                        <div className="flex-1 min-h-[250px] w-full mt-4 px-2">
                            <BarChart data={topPlotsData} />
                        </div>
                    </div>
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-slate-100 mt-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                <HistoryIcon className="w-5 h-5" />
                            </div>
                            ประวัติการประเมิน
                        </h3>
                        <div className="relative group w-full md:w-auto">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="ค้นหาชื่อแปลง, ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full md:w-72 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px] text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    {['ID', 'วันที่', 'ชื่อแปลง', 'ที่ตั้ง', 'ขนาด (ไร่)', 'วิธีคำนวณ', 'คาร์บอน (tCO₂e)', 'จัดการ'].map((h, i) => (
                                        <th key={i} className={`py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider ${i === 7 ? 'text-center' : ''}`}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredPlots.length > 0 ? (
                                    filteredPlots.map((p) => (
                                        <tr key={p.id} className="group hover:bg-emerald-50/30 transition-colors duration-200">
                                            <td className="py-4 px-4 text-sm font-semibold text-slate-500">#{p.id}</td>
                                            <td className="py-4 px-4 text-sm text-slate-600">{p.date}</td>
                                            <td className="py-4 px-4 text-sm font-bold text-slate-800">{p.name}</td>
                                            <td className="py-4 px-4 text-sm text-slate-500">
                                                {p.tambon}, {p.province}
                                                <div className="text-[10px] font-mono text-slate-300 mt-0.5">{p.coordinates}</div>
                                            </td>
                                            <td className="py-4 px-4 text-sm font-medium text-slate-700">{p.area.toFixed(2)}</td>
                                            <td className="py-4 px-4 text-xs">
                                                <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-md border border-slate-200">
                                                    {p.method}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-emerald-600 tabular-nums">{p.carbon.toFixed(2)}</span>
                                                    {p.carbon > 50 && <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded font-bold">High</span>}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => history.push(`/map?editPlotId=${p.id}`)}
                                                        className="p-2 text-emerald-500 hover:text-white hover:bg-emerald-500 rounded-lg transition-all"
                                                        title="ดูบนแผนที่"
                                                    >
                                                        <EditIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(p.id)}
                                                        className="p-2 text-slate-300 hover:text-white hover:bg-rose-500 rounded-lg transition-all"
                                                        title="ลบข้อมูล"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="py-12 text-center text-slate-400 text-sm">
                                            ไม่พบข้อมูลแปลงที่ค้นหา
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>

            {/* NAVIGATION BAR */}
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-slide-down">
                <nav className="flex items-center p-2 bg-white/80 backdrop-blur-md rounded-full border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 gap-1 md:gap-2">

                    <button
                        onClick={() => handleNavClick('/')}
                        className="group w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all bg-transparent hover:bg-white"
                        title="หน้าหลัก"
                    >
                        <HomeIcon className="w-5 h-5 text-slate-400 group-hover:text-slate-800 transition-colors" />
                    </button>

                    <button
                        onClick={() => handleNavClick('/map')}
                        className="group w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all bg-transparent hover:bg-white"
                        title="แผนที่"
                    >
                        <MapIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </button>

                    <button
                        onClick={() => handleNavClick('/dashboard')}
                        className="group w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all bg-transparent hover:bg-white"
                        title="แดชบอร์ด"
                    >
                        <DashboardIcon className="w-5 h-5 text-slate-400 group-hover:text-purple-500 transition-colors" />
                    </button>

                    <button
                        onClick={() => handleNavClick('/dashboard/personal')}
                        className="group w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all bg-transparent hover:bg-white"
                        title="ส่วนตัว"
                    >
                        <UserIcon className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                    </button>

                    {/* Active Indicator */}
                    <div className="relative w-12 h-12 md:w-14 md:h-14 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 transform transition-transform">
                        <HistoryIcon className="w-6 h-6 z-10" />
                        <div className="absolute inset-0 bg-emerald-400 blur-md opacity-40 rounded-full animate-pulse"></div>
                    </div>

                </nav>
            </div>

        </div>
    )
}

export default HistoryPage
