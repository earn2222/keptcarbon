import React, { useState, useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import * as turf from '@turf/turf'
import { useHistory } from 'react-router-dom'
import { getPlots } from '../services/api'

// ==========================================
// ICON COMPONENTS
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

// ==========================================
// MINI LINE CHART COMPONENT
// ==========================================
const MiniLineChart = ({ data, color, height = 40, width = 120 }) => {
    if (!data || data.length === 0) return null

    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - ((val - min) / range) * height
        return `${x},${y}`
    }).join(' ')

    return (
        <svg width={width} height={height} className="overflow-visible">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                points={points}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <area
                x={0}
                y={0}
                width={width}
                height={height}
                fill={`url(#gradient-${color})`}
            />
        </svg>
    )
}

// ==========================================
// CIRCULAR PROGRESS CHART COMPONENT
// ==========================================
const CircularProgress = ({ percentage, size = 140, strokeWidth = 12, color = "#10b981", label, value, unit }) => {
    const [animatedPercentage, setAnimatedPercentage] = useState(0)

    useEffect(() => {
        const timeout = setTimeout(() => {
            setAnimatedPercentage(percentage)
        }, 100)
        return () => clearTimeout(timeout)
    }, [percentage])

    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (animatedPercentage / 100) * circumference

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(16, 185, 129, 0.15)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress circle with glow */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{
                        transition: 'stroke-dashoffset 1.5s ease-in-out',
                        filter: `drop-shadow(0 0 6px ${color})`,
                    }}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-slate-800">{value}</span>
                {unit && <span className="text-xs font-bold text-emerald-600 mt-1 uppercase tracking-wider">{unit}</span>}
            </div>
        </div>
    )
}

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================
function DashboardPage() {
    const history = useHistory()
    const mapContainer = useRef(null)
    const map = useRef(null)

    const [mapLoaded, setMapLoaded] = useState(false)
    const [accumulatedPlots, setAccumulatedPlots] = useState([])
    const [stats, setStats] = useState({
        totalPlots: 0,
        totalArea: 0,
        totalCarbon: 0
    })

    // Mock trend data
    const generateTrendData = (base, count) => {
        return Array.from({ length: count }, (_, i) => base + Math.sin(i) * (base * 0.2) + (i * base * 0.05))
    }

    const carbonTrendData = generateTrendData(stats.totalCarbon / 12 || 100, 12)
    const areaTrendData = generateTrendData(stats.totalArea / 12 || 50, 12)
    const plotsTrendData = generateTrendData(stats.totalPlots / 12 || 10, 12)

    // Function to zoom to a specific plot
    const zoomToPlot = (plot) => {
        if (!map.current || !plot.geometry) return;

        try {
            let coordinates;
            if (plot.geometry.type === 'Point') {
                coordinates = plot.geometry.coordinates;
            } else if (plot.geometry.type === 'Polygon') {
                const bbox = turf.bbox(plot.geometry);
                map.current.fitBounds(
                    [[bbox[0], bbox[1]], [bbox[2], bbox[3]]],
                    { padding: 100, duration: 1000 }
                );
                return;
            } else if (plot.geometry.type === 'MultiPolygon') {
                const bbox = turf.bbox(plot.geometry);
                map.current.fitBounds(
                    [[bbox[0], bbox[1]], [bbox[2], bbox[3]]],
                    { padding: 100, duration: 1000 }
                );
                return;
            }

            if (coordinates) {
                map.current.flyTo({
                    center: coordinates,
                    zoom: 16,
                    duration: 1000
                });
            }
        } catch (error) {
            console.error('Error zooming to plot:', error);
        }
    };

    // ==========================================
    // INITIALIZE MAP & FETCH DATA
    // ==========================================
    useEffect(() => {
        const loadPlots = async () => {
            try {
                const plots = await getPlots()
                console.log("Fetched plots:", plots)

                if (plots && Array.isArray(plots)) {
                    // Process plots to ensure geometry is valid
                    const processed = plots.map(p => {
                        let geometry = p.geometry;
                        if (typeof geometry === 'string') {
                            try { geometry = JSON.parse(geometry); } catch (e) {
                                console.warn('Dashboard: Failed to parse geometry for plot:', p.id);
                            }
                        }

                        // Fallback for missing geometry if lat/lng exists
                        if (!geometry && (p.lng || p.lat)) {
                            geometry = {
                                type: 'Point',
                                coordinates: [parseFloat(p.lng || 0), parseFloat(p.lat || 0)]
                            };
                        }

                        return {
                            ...p,
                            id: p.id,
                            carbon: parseFloat(p.carbon_tons) || 0,
                            areaRai: parseFloat(p.area_rai) || 0,
                            geometry: geometry,
                            date: p.created_at || new Date().toISOString()
                        };
                    });

                    const validPlots = processed.filter(p => p.geometry);
                    setAccumulatedPlots(validPlots)

                    // Calculate totals
                    const totalPlots = plots.length
                    const totalArea = plots.reduce((sum, p) => sum + (parseFloat(p.area_rai) || 0), 0)
                    const totalCarbon = plots.reduce((sum, p) => sum + (parseFloat(p.carbon_tons) || 0), 0)

                    setStats({
                        totalPlots,
                        totalArea,
                        totalCarbon
                    })
                }
            } catch (err) {
                console.error('Failed to load plots for dashboard:', err)
            }
        }

        loadPlots()

        if (map.current) return // initialize map only once

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
                ],
                glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'
            },
            center: [100.5018, 13.7563],
            zoom: 6,
            pitch: 0,
            bearing: 0,
            antialias: true
        })

        map.current.on('load', () => {
            setMapLoaded(true)
        })

        return () => {
            if (map.current) {
                map.current.remove()
                map.current = null
            }
        }
    }, [])

    // ==========================================
    // ADD PLOTS TO MAP
    // ==========================================
    useEffect(() => {
        if (!map.current || !mapLoaded || accumulatedPlots.length === 0) return;

        const sourceId = 'dashboard-source';
        const fillId = 'dashboard-fill';
        const lineId = 'dashboard-line';
        const glowId = 'dashboard-glow';

        const geojson = {
            type: 'FeatureCollection',
            features: accumulatedPlots
                .filter(p => p.geometry)
                .map(p => ({
                    type: 'Feature',
                    geometry: p.geometry,
                    properties: { id: p.id, carbon: p.carbon, area: p.areaRai }
                }))
        };

        if (map.current.getSource(sourceId)) {
            map.current.getSource(sourceId).setData(geojson);
        } else {
            map.current.addSource(sourceId, { type: 'geojson', data: geojson });

            // 1. Glow effect (underneath)
            map.current.addLayer({
                id: glowId,
                type: 'line',
                source: sourceId,
                paint: {
                    'line-color': '#10b981', // Emerald 500
                    'line-width': 10,
                    'line-blur': 8,
                    'line-opacity': 0.5
                }
            });

            // 2. Fill
            map.current.addLayer({
                id: fillId,
                type: 'fill',
                source: sourceId,
                paint: {
                    'fill-color': '#10b981',
                    'fill-opacity': 0.4
                }
            });

            // 3. Stroke
            map.current.addLayer({
                id: lineId,
                type: 'line',
                source: sourceId,
                paint: {
                    'line-color': '#10b981',
                    'line-width': 2
                }
            });
        }
    }, [accumulatedPlots, mapLoaded]);

    const navItems = [
        { id: 'home', label: 'หน้าหลัก', icon: HomeIcon, path: '/' },
        { id: 'map', label: 'แผนที่', icon: MapIcon, path: '/map' },
        { id: 'dashboard', label: 'แดชบอร์ด', icon: DashboardIcon, path: '/dashboard', active: true },
        { id: 'personal', label: 'ส่วนตัว', icon: UserIcon, path: '/dashboard?view=personal' },
        { id: 'history', label: 'ประวัติ', icon: HistoryIcon, path: '/dashboard/history' },
    ]

    // Sort plots by date descending
    const recentPlots = [...accumulatedPlots]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3)

    return (
        <div className="relative w-full h-screen overflow-hidden bg-slate-900">
            {/* FULLSCREEN MAP - Fully visible */}
            <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

            {/* TOP HEADER BAR - Minimal White */}
            <div className="absolute top-0 left-0 right-0 z-40 px-4 pt-4 lg:px-8 lg:pt-6">
                <div className="flex items-center justify-between">
                    {/* Logo & Title */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <LeafIcon className="w-7 h-7 text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-black text-slate-800 drop-shadow-md bg-white/50 px-2 rounded-lg backdrop-blur-sm">แดชบอร์ด</h1>
                            <p className="text-xs text-emerald-400 font-semibold drop-shadow-sm bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm inline-block mt-0.5">ผลกระทบต่อชุมชน</p>
                        </div>
                    </div>

                    {/* Desktop Navigation Pills */}
                    <nav className="hidden lg:flex items-center gap-2 bg-white/90 backdrop-blur-xl rounded-full p-2 border border-emerald-100 shadow-lg shadow-emerald-500/10">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => history.push(item.path)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${item.active
                                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/30'
                                    : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="text-sm font-bold">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* MAIN STATS SECTION - TOP */}
            <div className="absolute top-20 lg:top-24 left-0 right-0 z-30 px-4 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto">
                    {/* CARBON CARD */}
                    <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-emerald-100 shadow-xl shadow-emerald-500/5 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:scale-[1.02] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10">
                            <div className="text-sm text-emerald-700 font-bold mb-4 uppercase tracking-wider">คาร์บอนที่กักเก็บได้ทั้งหมด</div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-5xl font-black text-slate-800 mb-2">
                                        {stats.totalCarbon.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                                    </div>
                                    <div className="text-emerald-600 font-bold text-lg">ตัน</div>

                                    {/* Mini trend chart */}
                                    <div className="mt-4">
                                        <MiniLineChart data={carbonTrendData} color="#10b981" />
                                    </div>
                                </div>

                                <div className="hidden md:block">
                                    <CircularProgress
                                        percentage={Math.min((stats.totalCarbon / 500000) * 100, 100)}
                                        size={120}
                                        strokeWidth={10}
                                        color="#10b981"
                                        value={`${Math.min((stats.totalCarbon / 500000) * 100, 100).toFixed(0)}%`}
                                        unit="เป้าหมาย"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full blur-2xl" />
                    </div>

                    {/* AREA CARD */}
                    <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-emerald-100 shadow-xl shadow-emerald-500/5 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:scale-[1.02] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10">
                            <div className="text-sm text-emerald-700 font-bold mb-4 uppercase tracking-wider">พื้นที่ที่ได้รับการคุ้มครองทั้งหมด</div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-5xl font-black text-slate-800 mb-2">
                                        {stats.totalArea.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                                    </div>
                                    <div className="text-emerald-600 font-bold text-lg">ไร่</div>

                                    <div className="mt-4">
                                        <MiniLineChart data={areaTrendData} color="#34d399" />
                                    </div>
                                </div>

                                <div className="hidden md:block">
                                    <CircularProgress
                                        percentage={Math.min((stats.totalArea / 15000) * 100, 100)}
                                        size={120}
                                        strokeWidth={10}
                                        color="#34d399"
                                        value={`${Math.min((stats.totalArea / 15000) * 100, 100).toFixed(0)}%`}
                                        unit="เป้าหมาย"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/5 rounded-bl-full blur-2xl" />
                    </div>

                    {/* PARTICIPANTS CARD */}
                    <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-emerald-100 shadow-xl shadow-emerald-500/5 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:scale-[1.02] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10">
                            <div className="text-sm text-emerald-700 font-bold mb-4 uppercase tracking-wider">ผู้เข้าร่วมโครงการทั้งหมด</div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-5xl font-black text-slate-800 mb-2">
                                        {stats.totalPlots.toLocaleString('th-TH')}
                                    </div>
                                    <div className="text-emerald-600 font-bold text-lg">ราย</div>

                                    <div className="mt-4">
                                        <MiniLineChart data={plotsTrendData} color="#6ee7b7" />
                                    </div>
                                </div>

                                <div className="hidden md:block">
                                    <CircularProgress
                                        percentage={Math.min((stats.totalPlots / 10000) * 100, 100)}
                                        size={120}
                                        strokeWidth={10}
                                        color="#6ee7b7"
                                        value={`${Math.min((stats.totalPlots / 10000) * 100, 100).toFixed(0)}%`}
                                        unit="เป้าหมาย"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-300/5 rounded-bl-full blur-2xl" />
                    </div>
                </div>
            </div>

            {/* RECENT REGISTRATIONS - BOTTOM RIGHT (DESKTOP) */}
            <div className="hidden md:block absolute bottom-20 lg:bottom-6 right-4 lg:right-8 z-30 w-96">
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-500/5 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-50 to-white px-6 py-4 border-b border-emerald-100">
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-wide">การลงทะเบียนล่าสุด</h3>
                        <p className="text-xs text-emerald-600 mt-1 font-semibold">แปลงที่เข้าร่วมล่าสุด</p>
                    </div>

                    {/* List */}
                    <div className="p-4">
                        {recentPlots.length === 0 ? (
                            <p className="text-center text-slate-400 py-8">ยังไม่มีข้อมูล</p>
                        ) : (
                            <div className="space-y-3">
                                {recentPlots.map((plot, idx) => (
                                    <div
                                        key={plot.id}
                                        onClick={() => zoomToPlot(plot)}
                                        className="group relative bg-gradient-to-r from-emerald-50 to-white p-4 rounded-2xl hover:from-emerald-100 hover:to-emerald-50 transition-all duration-300 border border-emerald-100 hover:border-emerald-200 hover:shadow-md cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md shadow-emerald-500/30">
                                                    #{idx + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800">แปลง #{plot.id.toString().padStart(4, '0')}</p>
                                                    <p className="text-xs text-emerald-600 font-semibold">
                                                        {new Date(plot.date).toLocaleDateString('th-TH', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black text-emerald-600">{plot.areaRai.toFixed(1)}</p>
                                                <p className="text-xs text-slate-500 font-bold">ไร่</p>
                                            </div>
                                        </div>

                                        {/* Hover glow effect */}
                                        <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* BOTTOM NAVIGATION (MOBILE) */}
            <nav className="lg:hidden absolute bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-emerald-100 shadow-xl">
                <div className="flex items-center justify-around px-2 py-3">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => history.push(item.path)}
                            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300 ${item.active
                                    ? 'text-emerald-600'
                                    : 'text-slate-400 hover:text-emerald-600'
                                }`}
                        >
                            <item.icon className="w-6 h-6" />
                            <span className="text-xs font-bold">{item.label}</span>
                        </button>
                    ))}
                </div>
            </nav>

            {/* Hide MapLibre attribution */}
            <style>{`
                .maplibregl-ctrl-attrib,
                .maplibregl-ctrl-logo {
                    display: none !important;
                }
            `}</style>
        </div>
    )
}

export default DashboardPage
