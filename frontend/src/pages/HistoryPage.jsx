import React, { useState, useEffect } from 'react'
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

function HistoryPage() {
    const history = useHistory()
    const [plots, setPlots] = useState([])
    const [stats, setStats] = useState({ plots: 0, area: 0, carbon: 0 })
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchPlots()
    }, [])

    const fetchPlots = async () => {
        try {
            const data = await getPlots()
            // Transform data to fit table requirements
            const processed = data.map((p, index) => {
                let geometry = p.geometry;
                if (typeof geometry === 'string') {
                    try { geometry = JSON.parse(geometry); } catch (e) { }
                }

                // Mock random coordinates for display if missing
                const lat = geometry?.type === 'Point' ? geometry.coordinates[1] : (geometry?.coordinates?.[0]?.[0]?.[1] || 18.80)
                const lng = geometry?.type === 'Point' ? geometry.coordinates[0] : (geometry?.coordinates?.[0]?.[0]?.[0] || 98.95)

                return {
                    id: p.id || index + 1,
                    date: p.created_at ? new Date(p.created_at).toLocaleDateString('th-TH') : '5 ม.ค. 2557', // Mock if missing
                    name: p.name || `แปลงที่ ${index + 1}`,
                    tambon: 'สุเทพ', // Mock
                    amphoe: 'เมือง', // Mock
                    province: 'เชียงใหม่', // Mock
                    coordinates: `${lat.toFixed(2)}, ${lng.toFixed(2)}`,
                    area: parseFloat(p.area_rai) || 0,
                    method: p.method || `วิธีที่ ${Math.floor(Math.random() * 3) + 1}`,
                    age: parseInt(p.tree_age) || 0,
                    carbon: parseFloat(p.carbon_tons) || 0,
                    fullData: p
                }
            })
            setPlots(processed)

            // Calculate stats
            const totalArea = processed.reduce((sum, p) => sum + p.area, 0)
            const totalCarbon = processed.reduce((sum, p) => sum + p.carbon, 0)
            setStats({
                plots: processed.length,
                area: totalArea,
                carbon: totalCarbon
            })

        } catch (error) {
            console.error("Failed to fetch plots", error)
        }
    }

    const handleNavClick = (path) => {
        history.push(path)
    }

    const handleDelete = async (id) => {
        if (window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
            try {
                await deletePlot(id)
                fetchPlots() // Refresh
            } catch (err) {
                alert('ลบไม่สำเร็จ')
            }
        }
    }

    // Filter plots
    const filteredPlots = plots.filter(p =>
        p.name.includes(searchTerm) ||
        p.id.toString().includes(searchTerm)
    )

    return (
        <div className="relative w-full min-h-screen bg-[#f7f5f2] flex flex-col font-sans">

            {/* MAIN CONTENT */}
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-8 pt-32 pb-12 flex flex-col gap-6">

                {/* TOP PROFILE & STATS ROW */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User Profile Card */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 p-[2px]">
                                <div className="w-full h-full rounded-full bg-white p-1">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kanyapat" alt="Profile" className="w-full h-full rounded-full bg-slate-50" />
                                </div>
                            </div>
                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl font-bold text-slate-800">Kanyapat Daungjai</h2>
                            <p className="text-slate-400 font-medium mb-6">daungjai.16002@gmail.com</p>

                            <div className="flex justify-center md:justify-start gap-8">
                                <div className="text-center">
                                    <p className="text-3xl font-black text-slate-800">{stats.plots}</p>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">แปลงทั้งหมด</p>
                                </div>
                                <div className="w-px h-12 bg-slate-100"></div>
                                <div className="text-center">
                                    <p className="text-3xl font-black text-blue-600">{stats.area.toLocaleString()}</p>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">ไร่รวม</p>
                                </div>
                                <div className="w-px h-12 bg-slate-100"></div>
                                <div className="text-center">
                                    <p className="text-3xl font-black text-emerald-600">{stats.carbon.toFixed(0)}</p>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">tCO₂e</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
                            <p className="text-slate-500 text-xs font-medium mb-2">คาร์บอนรวมปีนี้</p>
                            <h3 className="text-3xl font-bold text-slate-800">2,580 <span className="text-xs text-slate-400 font-normal">tCO₂e</span></h3>
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full mt-2">Currently</span>
                        </div>
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
                            <p className="text-slate-500 text-xs font-medium mb-2">คาร์บอนรวมปีก่อน</p>
                            <h3 className="text-3xl font-bold text-slate-800">2,240 <span className="text-xs text-slate-400 font-normal">tCO₂e</span></h3>
                        </div>
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
                            <p className="text-slate-500 text-xs font-medium mb-2">การเปลี่ยนแปลง</p>
                            <h3 className="text-3xl font-bold text-slate-800">+340 <span className="text-xs text-slate-400 font-normal">tCO₂e</span></h3>
                            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 mt-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                +15.2% เพิ่มขึ้น
                            </span>
                        </div>
                    </div>
                </div>

                {/* CHARTS ROW */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Line Chart */}
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">แนวโน้มคาร์บอนเครดิตรายปี <span className="text-xs font-normal text-slate-400 ml-2">carbon credit trend</span></h3>
                        <div className="relative h-64 w-full flex items-end justify-between px-4 pb-6 mt-8">
                            {/* Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                {[2000, 1600, 1200, 800, 400, 0].map(val => (
                                    <div key={val} className="w-full border-b border-slate-50 h-0 relative">
                                        <span className="absolute -left-8 -top-2 text-[10px] text-slate-300">{val}</span>
                                    </div>
                                ))}
                            </div>

                            {/* SVG Chart */}
                            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                                <path d="M0,80 Q100,120 200,80 T400,60 T600,100" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" className="drop-shadow-lg" vectorEffect="non-scaling-stroke" />
                                <path d="M0,80 Q100,120 200,80 T400,60 T600,100 V300 H0 Z" fill="url(#gradient)" opacity="0.1" vectorEffect="non-scaling-stroke" />
                                <defs>
                                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" />
                                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                {/* Points */}
                                <circle cx="0%" cy="27%" r="4" fill="white" stroke="#10b981" strokeWidth="2" />
                                <circle cx="25%" cy="38%" r="4" fill="white" stroke="#10b981" strokeWidth="2" />
                                <circle cx="50%" cy="20%" r="4" fill="white" stroke="#10b981" strokeWidth="2" />
                                <circle cx="75%" cy="28%" r="4" fill="white" stroke="#10b981" strokeWidth="2" />
                                <circle cx="100%" cy="33%" r="4" fill="white" stroke="#10b981" strokeWidth="2" />
                            </svg>

                            {/* X Labels */}
                            <div className="absolute -bottom-6 left-0 w-full flex justify-between text-[10px] text-slate-400 font-medium">
                                <span>2021</span>
                                <span>2022</span>
                                <span>2023</span>
                                <span>2024</span>
                                <span>2025</span>
                            </div>
                        </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800">เปรียบเทียบคาร์บอนรายแปลง <span className="text-xs font-normal text-slate-400 ml-2">carbon comparison</span></h3>
                            <button className="text-xs bg-slate-50 px-3 py-1 rounded-lg text-slate-500 border border-slate-100">แสดงแปลง: 1-5</button>
                        </div>
                        <div className="relative h-64 w-full flex items-end justify-around px-2 pb-6 gap-4">
                            {/* Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                {[2000, 1600, 1200, 800, 400, 0].map(val => (
                                    <div key={val} className="w-full border-b border-slate-50 h-0 relative">
                                        <span className="absolute -left-8 -top-2 text-[10px] text-slate-300">{val}</span>
                                    </div>
                                ))}
                            </div>

                            {[1500, 1100, 1400, 1200, 1100].map((val, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 group w-full relative z-10 h-full justify-end">
                                    <div
                                        style={{ height: `${(val / 2000) * 100}%` }}
                                        className="w-full max-w-[60px] bg-gradient-to-t from-emerald-200 to-emerald-400 rounded-t-xl hover:from-emerald-400 hover:to-emerald-500 transition-all cursor-pointer relative group-hover:shadow-lg"
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            {val}
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">แปลงที่ {i + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* TABLE SECTION */}
                <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-sm border border-slate-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <h3 className="text-lg font-bold text-slate-800">ประวัติการประเมินรายแปลง</h3>
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 w-full md:w-auto">
                            <span className="text-sm text-slate-500 whitespace-nowrap">ค้นหา :</span>
                            <input
                                type="text"
                                placeholder="ชื่อแปลง, ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm w-full md:w-64 text-slate-700 placeholder-slate-400"
                            />
                            <SearchIcon className="w-4 h-4 text-slate-400" />
                        </div>
                    </div>

                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 pb-4">
                        <table className="w-full min-w-[1200px]">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="py-4 text-left font-bold text-slate-400 uppercase text-[10px] tracking-wider pl-4">Id</th>
                                    <th className="py-4 text-left font-bold text-slate-400 uppercase text-[10px] tracking-wider">วันที่ประเมิน</th>
                                    <th className="py-4 text-left font-bold text-slate-400 uppercase text-[10px] tracking-wider">ข้อมูลชื่อเรียกแปลง</th>
                                    <th className="py-4 text-left font-bold text-slate-400 uppercase text-[10px] tracking-wider">ตำบล</th>
                                    <th className="py-4 text-left font-bold text-slate-400 uppercase text-[10px] tracking-wider">อำเภอ</th>
                                    <th className="py-4 text-left font-bold text-slate-400 uppercase text-[10px] tracking-wider">จังหวัด</th>
                                    <th className="py-4 text-left font-bold text-slate-400 uppercase text-[10px] tracking-wider">ระบบพิกัด</th>
                                    <th className="py-4 text-left font-bold text-slate-400 uppercase text-[10px] tracking-wider">เนื้อที่แปลงนี้</th>
                                    <th className="py-4 text-left font-bold text-slate-400 uppercase text-[10px] tracking-wider">วิธีที่ใช้ในการคำนวณ</th>
                                    <th className="py-4 text-left font-bold text-slate-400 uppercase text-[10px] tracking-wider">อายุต้นยางพารา</th>
                                    <th className="py-4 text-left font-bold text-slate-400 uppercase text-[10px] tracking-wider">ปริมาณกักเก็บคาร์บอน</th>
                                    <th className="py-4 text-center font-bold text-slate-400 uppercase text-[10px] tracking-wider pr-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredPlots.map((p) => (
                                    <tr key={p.id} className="group hover:bg-slate-50 transition-colors">
                                        <td className="py-5 pl-4 text-sm font-medium text-slate-600">{p.id}</td>
                                        <td className="py-5 text-sm text-slate-600">{p.date}</td>
                                        <td className="py-5 text-sm font-bold text-slate-800">{p.name}</td>
                                        <td className="py-5 text-sm text-slate-600">{p.tambon}</td>
                                        <td className="py-5 text-sm text-slate-600">{p.amphoe}</td>
                                        <td className="py-5 text-sm text-slate-600">{p.province}</td>
                                        <td className="py-5 text-xs font-mono text-slate-500">{p.coordinates}</td>
                                        <td className="py-5 text-sm font-bold text-slate-700">{p.area.toFixed(2)} ไร่</td>
                                        <td className="py-5 text-sm text-slate-600">{p.method}</td>
                                        <td className="py-5 text-sm text-slate-600">{p.age} ปี</td>
                                        <td className="py-5 text-sm font-bold text-emerald-600">{p.carbon.toFixed(2)} tCO₂e</td>
                                        <td className="py-5 pr-4">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => history.push(`/map?editPlotId=${p.id}`)}
                                                    className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full transition-all shadow-sm shadow-emerald-200"
                                                >
                                                    <EditIcon className="w-3 h-3" />
                                                    คลิก
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p.id)}
                                                    className="text-slate-300 hover:text-red-500 transition-colors"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between mt-6 gap-4 text-slate-500 text-xs font-medium">
                        <div>Showing 1 to {filteredPlots.length} of {filteredPlots.length} entries</div>
                        <div className="flex items-center gap-1">
                            <button className="px-3 py-1 hover:bg-slate-100 rounded">Previous</button>
                            <button className="w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-lg font-bold">1</button>
                            <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg">2</button>
                            <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg">3</button>
                            <span>...</span>
                            <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg">5</button>
                            <button className="px-3 py-1 hover:bg-slate-100 rounded">Next</button>
                        </div>
                    </div>
                </div>

            </main>

            {/* ==========================================
                TOP NAVBAR - COPIED FROM PERSONAL DASHBOARD
            ========================================== */}
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-slide-down">
                <nav className="flex items-center p-2 bg-white/70 backdrop-blur-xl rounded-full border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 gap-2">

                    {/* Home */}
                    <button
                        onClick={() => handleNavClick('/')}
                        className="group relative w-12 h-12 rounded-full flex items-center justify-center transition-all bg-transparent hover:bg-white hover:scale-105"
                    >
                        <div className="text-slate-400 group-hover:text-amber-500 transition-colors duration-300">
                            <HomeIcon className="w-5 h-5" />
                        </div>
                        <span className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-all duration-300 text-[10px] font-bold text-slate-600 bg-white/90 px-2 py-1 rounded-lg shadow-xl translate-y-2 group-hover:translate-y-0 pointer-events-none">หน้าหลัก</span>
                    </button>

                    {/* Map */}
                    <button
                        onClick={() => handleNavClick('/map')}
                        className="group relative w-12 h-12 rounded-full flex items-center justify-center transition-all bg-transparent hover:bg-white hover:scale-105"
                    >
                        <div className="text-slate-400 group-hover:text-blue-500 transition-colors duration-300">
                            <MapIcon className="w-5 h-5" />
                        </div>
                        <span className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-all duration-300 text-[10px] font-bold text-slate-600 bg-white/90 px-2 py-1 rounded-lg shadow-xl translate-y-2 group-hover:translate-y-0 pointer-events-none">แผนที่</span>
                    </button>

                    {/* Dashboard */}
                    <button
                        onClick={() => handleNavClick('/dashboard')}
                        className="group relative w-12 h-12 rounded-full flex items-center justify-center transition-all bg-transparent hover:bg-white hover:scale-105"
                    >
                        <div className="text-slate-400 group-hover:text-purple-500 transition-colors duration-300">
                            <DashboardIcon className="w-5 h-5" />
                        </div>
                        <span className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-all duration-300 text-[10px] font-bold text-slate-600 bg-white/90 px-2 py-1 rounded-lg shadow-xl translate-y-2 group-hover:translate-y-0 pointer-events-none">แดชบอร์ด</span>
                    </button>

                    {/* Personal */}
                    <button
                        onClick={() => handleNavClick('/dashboard?view=personal')}
                        className="group relative w-12 h-12 rounded-full flex items-center justify-center transition-all bg-transparent hover:bg-white hover:scale-105"
                    >
                        <div className="text-slate-400 group-hover:text-emerald-500 transition-colors duration-300">
                            <UserIcon className="w-5 h-5" />
                        </div>
                        <span className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-all duration-300 text-[10px] font-bold text-slate-600 bg-white/90 px-2 py-1 rounded-lg shadow-xl translate-y-2 group-hover:translate-y-0 pointer-events-none">ส่วนตัว</span>
                    </button>

                    {/* History (Active) */}
                    <div className="relative w-14 h-14 bg-gradient-to-tr from-orange-400 to-amber-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-400/30 transform transition-transform animate-bounce-subtle">
                        <HistoryIcon className="w-6 h-6 z-10" />
                        {/* Glow layers */}
                        <div className="absolute inset-0 bg-orange-400 blur-md opacity-40 rounded-full animate-pulse"></div>
                    </div>

                </nav>
            </div>

        </div>
    )
}

export default HistoryPage
