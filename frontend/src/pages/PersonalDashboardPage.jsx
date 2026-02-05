import React, { useState, useEffect, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import * as turf from '@turf/turf'
import { getPlots } from '../services/api'

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

const LeafIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646Z" />
    </svg>
)

const MapPinIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
)

const LogoutIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
)

// Helper for Area Formatting
const formatArea = (rai) => {
    if (!rai) return '0 ไร่ 0 งาน 0 ตร.ว.';

    // Ensure rai is valid number
    const rVal = parseFloat(rai);
    if (isNaN(rVal)) return '0 ไร่ 0 งาน 0 ตร.ว.';

    const r = Math.floor(rVal);
    const nganDouble = (rVal - r) * 4;
    const n = Math.floor(nganDouble);
    // 1 Ngan = 100 Sq.Wah. Residual of Ngan * 100 = Sq.Wah
    const wah = ((nganDouble - n) * 100);

    // Check if format needs rounding (e.g. 50.00 -> 50)
    return `${r} ไร่ ${n} งาน ${Math.round(wah)} ตร.ว.`;
}

// Get calculation method details
const getMethodDetails = (method) => {
    // Satellite methods
    if (method === 'ndvi' || method?.includes('NDVI')) {
        return {
            type: 'ดาวเทียม',
            name: 'ข้อมูลจากดาวเทียม (NDVI)',
            formula: 'AGB = 34.2 × NDVI + 5.8',
            description: 'ใช้ดัชนีพืชพรรณจากดาวเทียม'
        };
    }
    if (method === 'tcari' || method?.includes('TCARI')) {
        return {
            type: 'ดาวเทียม',
            name: 'ข้อมูลจากดาวเทียม (TCARI)',
            formula: 'AGB = 13.57 × TCARI + 7.45',
            description: 'ใช้ดัชนีคลอโรฟิลล์จากดาวเทียม'
        };
    }

    // Allometric / Equation 2
    if (method === 'allometric' || method === 'field2' || method?.includes('สมการที่ 2')) {
        return {
            type: 'ภาคสนาม',
            name: 'ข้อมูลภาคสนาม',
            formula: method === 'allometric' ? 'W = 0.0336 × (D²H)^0.931' : 'AGB = 0.062 × DBH^2.23',
            description: 'ใช้เส้นรอบวงลำต้น'
        };
    }

    // Default: Field Method
    return {
        type: 'ภาคสนาม',
        name: 'ข้อมูลภาคสนาม',
        formula: 'AGB = 0.118 × DBH^2.53',
        description: 'ใช้เส้นรอบวงลำต้น'
    };
}

// ==========================================
// PERSONAL DASHBOARD PAGE
// ==========================================
function PersonalDashboardPage() {
    const history = useHistory()
    const mapContainer = useRef(null)
    const map = useRef(null)
    const [mapLoaded, setMapLoaded] = useState(false)
    const [plots, setPlots] = useState([])
    const [stats, setStats] = useState({
        plots: 0,
        area: 0,
        carbon: 0
    })

    const [userProfile, setUserProfile] = useState(null)
    const [isNavExpanded, setIsNavExpanded] = useState(false)
    const [isStatsExpanded, setIsStatsExpanded] = useState(false)

    useEffect(() => {
        const profile = localStorage.getItem('userProfile')
        if (profile) {
            try {
                setUserProfile(JSON.parse(profile))
            } catch (e) {
                console.error('Failed to parse user profile', e)
            }
        }
    }, [])

    const handleNavClick = (path) => {
        history.push(path)
    }

    const handleLogout = () => {
        if (window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
            localStorage.removeItem('userProfile')
            // localStorage.removeItem('token') // หากมีการใช้ token
            history.push('/login')
        }
    }

    // Fetch and process user plots
    useEffect(() => {
        const fetchPersonalData = async () => {
            try {
                const allPlots = await getPlots()
                const myPlots = allPlots.map(p => {
                    let geometry = p.geometry;
                    if (typeof geometry === 'string') {
                        try { geometry = JSON.parse(geometry); } catch (e) { console.warn('GeoJSON Parse Error', e) }
                    }
                    return {
                        ...p,
                        geometry,
                        farmerName: p.name || p.farmer_name || 'ไม่ระบุชื่อ',
                        area: parseFloat(p.area_rai) || 0,
                        carbon: parseFloat(p.carbon_tons) || 0,
                        age: parseInt(p.tree_age) || 0,
                        plantingYearBE: p.planting_year ? parseInt(p.planting_year) + 543 : '-',
                        variety: p.notes?.includes('พันธุ์:') ? p.notes.split('พันธุ์:')[1]?.trim() : (p.variety || 'RRIM 600'),
                        methodTitle: getMethodDetails(p.method).name,
                        methodFormula: getMethodDetails(p.method).formula,
                        date: p.created_at
                    }
                }).filter(p => p.geometry)

                setPlots(myPlots)

                const totalPlots = myPlots.length
                const totalArea = myPlots.reduce((sum, p) => sum + p.area, 0)
                const totalCarbon = myPlots.reduce((sum, p) => sum + p.carbon, 0)

                setStats({
                    plots: totalPlots,
                    area: totalArea,
                    carbon: totalCarbon
                })

            } catch (err) {
                console.error("Failed to fetch personal plots", err)
            }
        }
        fetchPersonalData()
    }, [])

    // Initialize Map
    useEffect(() => {
        if (map.current) return

        if (!mapContainer.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                sources: {
                    'satellite': {
                        type: 'raster',
                        tiles: [
                            'https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
                            'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
                        ],
                        tileSize: 256,
                        attribution: '© Google'
                    }
                },
                layers: [
                    {
                        id: 'satellite-layer',
                        type: 'raster',
                        source: 'satellite',
                        minzoom: 0,
                        maxzoom: 22
                    }
                ]
            },
            center: [100.5018, 13.7563],
            zoom: 5,
            attributionControl: false
        })

        map.current.on('load', () => setMapLoaded(true))
    }, [])

    // Add Plots to Map
    useEffect(() => {
        if (!map.current || !mapLoaded || plots.length === 0) return;

        const sourceId = 'personal-plots';
        const geojson = {
            type: 'FeatureCollection',
            features: plots.map(p => ({
                type: 'Feature',
                geometry: p.geometry,
                properties: {
                    id: p.id,
                    carbon: p.carbon,
                    area: p.area,
                    farmerName: p.farmerName,
                    formattedArea: formatArea(p.area),
                    age: p.age
                }
            }))
        }

        if (map.current.getSource(sourceId)) {
            map.current.getSource(sourceId).setData(geojson)
        } else {
            map.current.addSource(sourceId, { type: 'geojson', data: geojson })
            map.current.addLayer({
                id: 'plot-fill',
                type: 'fill',
                source: sourceId,
                paint: {
                    'fill-color': '#10b981',
                    'fill-opacity': 0.5
                }
            })
            map.current.addLayer({
                id: 'plot-line',
                type: 'line',
                source: sourceId,
                paint: {
                    'line-color': '#ffffff',
                    'line-width': 2
                }
            })

            // Interaction: Click to show popup
            map.current.on('click', 'plot-fill', (e) => {
                const feature = e.features[0];
                const props = feature.properties;
                const coordinates = e.lngLat;

                // Create HTML Content for Popup
                const htmlContent = `
                    <div style="font-family: 'Inter', sans-serif; min-width: 220px; padding: 4px;">
                        <h4 style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 2px;">${props.farmerName}</h4>
                        <p style="font-size: 11px; color: #64748b; margin-bottom: 8px;">แปลง ID: ${props.id}</p>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; background: #f8fafc; padding: 8px; border-radius: 8px;">
                            <div>
                                <span style="display: block; font-size: 10px; color: #94a3b8;">พื้นที่</span>
                                <span style="display: block; font-size: 12px; font-weight: 600; color: #475569;">${props.formattedArea}</span>
                            </div>
                            <div>
                                <span style="display: block; font-size: 10px; color: #94a3b8;">อายุยาง</span>
                                <span style="display: block; font-size: 12px; font-weight: 600; color: #f97316;">${props.age} ปี</span>
                            </div>
                        </div>

                        <button 
                            onclick="window.location.href='/map?editPlotId=${props.id}'"
                            style="width: 100%; background: #10b981; color: white; border: none; padding: 8px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);"
                        >
                            <span>✏️</span> แก้ไขข้อมูลแปลง
                        </button>
                    </div>
                `;

                new maplibregl.Popup({ closeButton: false, maxWidth: '300px', className: 'custom-popup' })
                    .setLngLat(coordinates)
                    .setHTML(htmlContent)
                    .addTo(map.current);
            });

            // Interaction: Cursor pointer
            map.current.on('mouseenter', 'plot-fill', () => {
                map.current.getCanvas().style.cursor = 'pointer';
            });
            map.current.on('mouseleave', 'plot-fill', () => {
                map.current.getCanvas().style.cursor = '';
            });

            const bounds = new maplibregl.LngLatBounds()
            plots.forEach(p => {
                if (p.geometry.type === 'Polygon') {
                    p.geometry.coordinates[0].forEach(coord => bounds.extend(coord))
                } else if (p.geometry.type === 'Point') {
                    bounds.extend(p.geometry.coordinates)
                }
            })
            if (!bounds.isEmpty()) map.current.fitBounds(bounds, { padding: 50 })
        }
    }, [mapLoaded, plots])

    const zoomToPlot = (plot) => {
        if (!map.current) return
        if (plot.geometry.type === 'Point') {
            map.current.flyTo({ center: plot.geometry.coordinates, zoom: 16 })
        } else {
            const bbox = turf.bbox(plot.geometry);
            map.current.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], { padding: 50 });
        }
    }

    // ==========================================
    // RENDER
    // ==========================================
    return (
        <div className="relative w-full min-h-screen bg-[#f8f9fa] flex flex-col font-sans overflow-x-hidden">

            <style>{`
        @keyframes nav-item-pop-vertical {
            0% { transform: scale(0) translateX(-20px); opacity: 0; }
            70% { transform: scale(1.1) translateX(2px); opacity: 1; }
            100% { transform: scale(1) translateX(0); opacity: 1; }
        }
        .nav-pop-v-1 { animation: nav-item-pop-vertical 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s forwards; opacity: 0; }
        .nav-pop-v-2 { animation: nav-item-pop-vertical 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.10s forwards; opacity: 0; }
        .nav-pop-v-3 { animation: nav-item-pop-vertical 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s forwards; opacity: 0; }
        .nav-pop-v-4 { animation: nav-item-pop-vertical 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.20s forwards; opacity: 0; }
        .nav-pop-v-5 { animation: nav-item-pop-vertical 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.25s forwards; opacity: 0; }
        
        /* Airy Mobile Dock Animations */
        @keyframes active-spring {
            0% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
            100% { transform: translateY(0); }
        }
        .active-tab-spring {
            animation: active-spring 3s ease-in-out infinite;
        }

        @keyframes dot-pop {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.5); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }
        .indicator-dot {
            animation: dot-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        .minimalist-glass {
            background: rgba(255, 255, 255, 0.6);
            backdrop-filter: blur(15px) saturate(180%);
            -webkit-backdrop-filter: blur(15px) saturate(180%);
            border: 0.5px solid rgba(255, 255, 255, 0.5);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
        }
    `}</style>

            {/* MAIN CONTENT */}
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-8 pt-12 pb-32 flex flex-col gap-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="pl-20 md:pl-0">
                        <h1 className="text-3xl font-bold text-slate-800">แดชบอร์ดส่วนตัว</h1>
                        <p className="text-sm text-slate-500 font-medium mt-1">จัดการแปลงและดูสถิติข้อมูลคาร์บอนเครดิตของคุณ</p>
                    </div>
                </div>

                {/* DESKTOP STATS SECTION (Hidden on Mobile) */}
                <div className="hidden md:grid grid-cols-3 gap-4 relative z-[100]">
                    {/* Plots */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform duration-500 group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-3 shadow-sm group-hover:rotate-12 transition-transform duration-300">
                                <MapIcon className="w-5 h-5" />
                            </div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">จำนวนแปลง</p>
                            <h3 className="text-3xl font-black text-slate-800 mt-1">{stats.plots} <span className="text-xs font-bold text-slate-400">แปลง</span></h3>
                        </div>
                    </div>

                    {/* Area */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform duration-500 group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-3 shadow-sm group-hover:-rotate-12 transition-transform duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">พื้นที่รวม</p>
                            <h3 className="text-3xl font-black text-slate-800 mt-1">{stats.area.toLocaleString()} <span className="text-xs font-bold text-slate-400">ไร่</span></h3>
                        </div>
                    </div>

                    {/* Carbon */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform duration-500 group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-3 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <LeafIcon className="w-5 h-5" />
                            </div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">คาร์บอนรวม</p>
                            <h3 className="text-3xl font-black text-slate-800 mt-1">{stats.carbon.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xs font-bold text-slate-400">ตัน</span></h3>
                        </div>
                    </div>
                </div>

                {/* MAP & LIST SECTION */}
                <div className="grid lg:grid-cols-3 gap-6 h-[500px] lg:h-[600px] relative z-20">
                    <div className="lg:col-span-3 bg-white rounded-[2.5rem] shadow-lg border border-slate-100 overflow-hidden relative group h-full">
                        <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

                        {/* Status Label (Desktop Only) */}
                        <div className="hidden md:block absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-xs font-bold text-slate-700 shadow-sm border border-white/50 z-10">
                            แผนที่สังเขปแปลง
                        </div>

                        {/* MOBILE FLOATING STATS DOCK */}
                        <div className="md:hidden absolute top-4 left-1/2 -translate-x-1/2 w-[90%] z-[50]">
                            <div className={`
                                minimalist-glass rounded-[1.5rem] p-3 transition-all duration-500 ease-out overflow-hidden
                                ${isStatsExpanded ? 'h-auto scale-100' : 'h-[56px] scale-95 opacity-90'}
                            `}>
                                {/* Summary Bar */}
                                <div
                                    className="flex items-center justify-between cursor-pointer h-[32px]"
                                    onClick={() => setIsStatsExpanded(!isStatsExpanded)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1">
                                            <LeafIcon className="w-3 h-3 text-emerald-600" />
                                            <span className="text-xs font-black text-slate-700">{stats.carbon.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                        </div>
                                        <div className="w-[1px] h-3 bg-slate-300/50"></div>
                                        <div className="flex items-center gap-1">
                                            <MapIcon className="w-3 h-3 text-blue-600" />
                                            <span className="text-xs font-black text-slate-700">{stats.area.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="bg-white/50 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 transition-transform duration-300" style={{ transform: isStatsExpanded ? 'rotate(180deg)' : 'none' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isStatsExpanded && (
                                    <div className="mt-3 pt-3 border-t border-slate-200/50 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">จำนวนแปลง</span>
                                            <span className="text-xs font-black text-slate-700">{stats.plots} แปลง</span>
                                        </div>
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">พื้นที่รวม</span>
                                            <span className="text-xs font-black text-slate-700">{stats.area.toLocaleString()} ไร่</span>
                                        </div>
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">คาร์บอนรวม</span>
                                            <span className="text-xs font-black text-emerald-600">{stats.carbon.toLocaleString(undefined, { maximumFractionDigits: 1 })} tCO₂e</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* DETAILED DATA TABLE SECTION */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 lg:p-8 shadow-xl border border-white/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                                <LeafIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg lg:text-xl font-bold text-slate-800">ข้อมูลรายละเอียดรายแปลง</h3>
                                <p className="text-[10px] lg:text-xs text-slate-500 font-medium tracking-tight">5 รายการล่าสุดจากหน้าแผนที่</p>
                            </div>
                        </div>
                        <button
                            onClick={() => history.push('/dashboard/history')}
                            className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 group whitespace-nowrap"
                        >
                            <span className="hidden sm:inline">ดูทั้งหมด</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </button>
                    </div>

                    {/* Desktop Table View (Hidden on Mobile) */}
                    <div className="hidden md:block overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
                        <table className="w-full min-w-[1000px]">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="py-4 text-left font-bold text-slate-400 uppercase text-[10px] tracking-wider pl-4">Zoom</th>
                                    <th className="py-4 text-left font-bold text-slate-400 uppercase text-[10px] tracking-wider">ชื่อเกษตรกร</th>
                                    <th className="py-4 text-left font-bold text-slate-400 uppercase text-[10px] tracking-wider">เนื้อที่ (ไร่-งาน-ตร.ว.)</th>
                                    <th className="py-4 text-left font-bold text-slate-400 uppercase text-[10px] tracking-wider">อายุ / ปีที่ปลูก</th>
                                    <th className="py-4 text-left font-bold text-slate-400 uppercase text-[10px] tracking-wider">สายพันธุ์ยาง</th>
                                    <th className="py-4 text-left font-bold text-slate-400 uppercase text-[10px] tracking-wider">วิธีการคำนวณ</th>
                                    <th className="py-4 text-right font-bold text-slate-400 uppercase text-[10px] tracking-wider pr-4">ปริมาณคาร์บอน</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {plots.slice(0, 5).map((p) => (
                                    <tr key={p.id} className="group hover:bg-emerald-50/50 transition-all duration-300">
                                        <td className="py-6 pl-4 w-20 align-top">
                                            <button
                                                onClick={() => zoomToPlot(p)}
                                                className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-500 hover:text-white transition-all shadow-sm group-hover:scale-110"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                            </button>
                                        </td>
                                        <td className="py-6 align-top">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-bold text-slate-800 text-sm whitespace-nowrap">{p.farmerName}</span>
                                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md w-fit">ID: {p.id}</span>
                                            </div>
                                        </td>
                                        {/* Area Column (Restored) */}
                                        <td className="py-6 font-bold text-slate-700 text-sm align-top whitespace-nowrap">
                                            {formatArea(p.area)}
                                        </td>
                                        {/* Age / Year Column */}
                                        <td className="py-6 align-top">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-bold text-slate-600 text-sm">
                                                    {p.age} ปี
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    พ.ศ. {p.plantingYearBE}
                                                </span>
                                            </div>
                                        </td>
                                        {/* Variety Column */}
                                        <td className="py-6 align-top">
                                            <span className="text-sm font-bold text-slate-700">{p.variety}</span>
                                        </td>
                                        {/* Method Column */}
                                        <td className="py-6 align-top">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-[11px] font-bold text-blue-600 border border-blue-100 w-fit">
                                                    {p.methodTitle}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-100 w-fit">
                                                    {p.methodFormula}
                                                </span>
                                            </div>
                                        </td>
                                        {/* Carbon Column */}
                                        <td className="py-6 pr-4 text-right align-top">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="font-black text-emerald-600 text-lg leading-none">{p.carbon.toFixed(2)}</span>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">tCO₂e</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card Layout (Visible on Mobile Only) */}
                    <div className="md:hidden flex flex-col gap-4">
                        {plots.length > 0 ? (
                            plots.slice(0, 5).map((p) => (
                                <div key={p.id} className="bg-slate-50/50 rounded-3xl p-5 border border-slate-100/50 flex flex-col gap-4 group active:scale-[0.98] transition-all duration-200">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => zoomToPlot(p)}
                                                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100 active:bg-emerald-500 active:text-white transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                            </button>
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-sm leading-tight">{p.farmerName}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-wider">Plot ID: {p.id}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-black text-emerald-600 block leading-none">{p.carbon.toFixed(2)}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">tCO₂e</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/80 rounded-2xl p-3 border border-white">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">พื้นที่</p>
                                            <p className="text-[11px] font-bold text-slate-700 leading-tight">{formatArea(p.area)}</p>
                                        </div>
                                        <div className="bg-white/80 rounded-2xl p-3 border border-white">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">อายุยาง / ปีที่ปลูก</p>
                                            <p className="text-[11px] font-bold text-slate-700 leading-tight">{p.age} ปี (พ.ศ. {p.plantingYearBE})</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100/50">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">วิธีการ</span>
                                            <span className="text-[10px] font-bold text-blue-500">{p.methodTitle}</span>
                                        </div>
                                        <div className="flex flex-col items-end gap-0.5">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">สายพันธุ์</span>
                                            <span className="text-[10px] font-bold text-slate-700">{p.variety}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-slate-300 gap-3 opacity-50">
                                <LeafIcon className="w-10 h-10" />
                                <span className="text-sm font-medium">ไม่พบข้อมูลแปลง</span>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* ==========================================
                MAGIC MENU - TOP LEFT
            ========================================== */}
            <div
                className="fixed top-8 left-8 z-[2000] flex items-start"
                onMouseEnter={() => setIsNavExpanded(true)}
                onMouseLeave={() => setIsNavExpanded(false)}
            >
                <div className={`
                    glass-pill-v transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                    flex flex-col items-center overflow-hidden
                    ${isNavExpanded ? 'p-2 gap-2 rounded-[2rem]' : 'p-1 rounded-full'}
                `}>

                    {/* Collapsed Active Icon / Menu Trigger */}
                    {/* Collapsed Active Icon / Menu Trigger */}
                    {!isNavExpanded && (
                        <div className="w-12 h-12 relative flex items-center justify-center cursor-pointer group">
                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-md group-hover:blur-lg transition-all duration-500 animate-pulse"></div>

                            {/* Profile Image/Icon */}
                            <div className="relative w-11 h-11 bg-white p-[2px] rounded-full shadow-lg border border-emerald-100 group-hover:scale-105 transition-transform duration-300">
                                {userProfile?.picture ? (
                                    <img src={userProfile.picture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <UserIcon className="w-6 h-6" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Expanded Items */}
                    {isNavExpanded && (
                        <>
                            {/* Home */}
                            <button
                                onClick={() => handleNavClick('/')}
                                className="nav-pop-v-1 group relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"
                            >
                                <HomeIcon className="w-5 h-5" />
                                <div className="absolute left-16 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap pointer-events-none shadow-xl border border-white/10 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                    หน้าหลัก
                                </div>
                            </button>

                            {/* Map */}
                            <button
                                onClick={() => handleNavClick('/map')}
                                className="nav-pop-v-2 group relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:bg-emerald-50 text-slate-400 hover:text-blue-500"
                            >
                                <MapIcon className="w-5 h-5" />
                                <div className="absolute left-16 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap pointer-events-none shadow-xl border border-white/10 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                    แผนที่สังเขป
                                </div>
                            </button>

                            {/* Dashboard */}
                            <button
                                onClick={() => handleNavClick('/dashboard')}
                                className="nav-pop-v-3 group relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:bg-emerald-50 text-slate-400 hover:text-purple-500"
                            >
                                <DashboardIcon className="w-5 h-5" />
                                <div className="absolute left-16 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap pointer-events-none shadow-xl border border-white/10 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                                    แดชบอร์ดรวม
                                </div>
                            </button>

                            {/* Personal (Active Highlight) */}
                            <div className="nav-pop-v-4 group relative w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 overflow-hidden">
                                {userProfile?.picture ? (
                                    <img src={userProfile.picture} alt="Profile" className="w-10 h-10 rounded-md object-cover" />
                                ) : (
                                    <UserIcon className="w-8 h-8" />
                                )}
                                <div className="absolute left-16 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap pointer-events-none shadow-xl border border-white/10 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                                    ส่วนตัว (กำลังดู)
                                </div>
                            </div>

                            {/* History */}
                            <button
                                onClick={() => handleNavClick('/dashboard/history')}
                                className="nav-pop-v-5 group relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:bg-emerald-50 text-slate-400 hover:text-orange-500"
                            >
                                <HistoryIcon className="w-5 h-5" />
                                <div className="absolute left-16 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap pointer-events-none shadow-xl border border-white/10 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                                    ประวัติประเมิน
                                </div>
                            </button>

                            {/* Divider */}
                            <div className="w-8 h-[1px] bg-slate-100 my-1"></div>

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className="nav-pop-v-5 group relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:bg-rose-50 text-slate-400 hover:text-rose-500"
                            >
                                <LogoutIcon className="w-5 h-5" />
                                <div className="absolute left-16 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap pointer-events-none shadow-xl border border-white/10 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                                    ออกจากระบบ
                                </div>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* ==========================================
                MOBILE BOTTOM NAVIGATION (Airy Minimalist Dock)
            ========================================== */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2000] md:hidden w-[85%] max-w-[360px]">
                <nav className="minimalist-glass flex items-center justify-between px-6 py-4 rounded-[2rem] relative">

                    {/* Home */}
                    <button
                        onClick={() => handleNavClick('/')}
                        className="relative flex flex-col items-center justify-center text-slate-400 active:scale-90 transition-all duration-300"
                    >
                        <HomeIcon className="w-5 h-5" />
                    </button>

                    {/* Map */}
                    <button
                        onClick={() => handleNavClick('/map')}
                        className="relative flex flex-col items-center justify-center text-slate-400 active:scale-90 transition-all duration-300"
                    >
                        <MapIcon className="w-5 h-5" />
                    </button>

                    {/* Personal (Active) */}
                    <div className="relative flex flex-col items-center justify-center">
                        <button
                            className="relative text-emerald-600 active-tab-spring transition-all duration-500"
                        >
                            <UserIcon className="w-6 h-6" />
                        </button>
                        {/* Minimalist Dot Indicator */}
                        <div className="absolute -bottom-3 w-1.5 h-1.5 bg-emerald-500 rounded-full indicator-dot"></div>
                    </div>

                    {/* Dashboard */}
                    <button
                        onClick={() => handleNavClick('/dashboard')}
                        className="relative flex flex-col items-center justify-center text-slate-400 active:scale-90 transition-all duration-300"
                    >
                        <DashboardIcon className="w-5 h-5" />
                    </button>

                    {/* History */}
                    <button
                        onClick={() => handleNavClick('/dashboard/history')}
                        className="relative flex flex-col items-center justify-center text-slate-400 active:scale-90 transition-all duration-300"
                    >
                        <HistoryIcon className="w-5 h-5" />
                    </button>

                </nav>
            </div>
        </div>
    )
}


export default PersonalDashboardPage
