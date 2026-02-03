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

const MenuIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
)

const MapPinIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
)

const SparklesIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
)

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================
function DashboardPage() {
    const history = useHistory()
    const mapContainer = useRef(null)
    const map = useRef(null)

    const [mapLoaded, setMapLoaded] = useState(false)
    const [accumulatedPlots, setAccumulatedPlots] = useState([])
    const [selectedPlotId, setSelectedPlotId] = useState(null)
    const [showPlotListModal, setShowPlotListModal] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [stats, setStats] = useState({
        totalPlots: 0,
        totalArea: 0,
        totalCarbon: 0
    })

    // Function to zoom to a specific plot
    const zoomToPlot = (plot) => {
        if (!map.current || !plot.geometry) return;

        setSelectedPlotId(plot.id);

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
                    const processed = plots.map(p => {
                        let geometry = p.geometry;
                        if (typeof geometry === 'string') {
                            try { geometry = JSON.parse(geometry); } catch (e) {
                                console.warn('Dashboard: Failed to parse geometry for plot:', p.id);
                            }
                        }

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

        if (map.current) return

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
                    properties: { id: p.id, carbon: p.carbon, area: p.areaRai, selected: p.id === selectedPlotId }
                }))
        };

        if (map.current.getSource(sourceId)) {
            map.current.getSource(sourceId).setData(geojson);
        } else {
            map.current.addSource(sourceId, { type: 'geojson', data: geojson });

            map.current.addLayer({
                id: glowId,
                type: 'line',
                source: sourceId,
                paint: {
                    'line-color': ['case', ['get', 'selected'], '#fbbf24', '#10b981'],
                    'line-width': ['case', ['get', 'selected'], 12, 10],
                    'line-blur': 8,
                    'line-opacity': ['case', ['get', 'selected'], 0.8, 0.5]
                }
            });

            map.current.addLayer({
                id: fillId,
                type: 'fill',
                source: sourceId,
                paint: {
                    'fill-color': ['case', ['get', 'selected'], '#fbbf24', '#10b981'],
                    'fill-opacity': ['case', ['get', 'selected'], 0.5, 0.3]
                }
            });

            map.current.addLayer({
                id: lineId,
                type: 'line',
                source: sourceId,
                paint: {
                    'line-color': ['case', ['get', 'selected'], '#f59e0b', '#10b981'],
                    'line-width': ['case', ['get', 'selected'], 3, 2]
                }
            });
        }
    }, [accumulatedPlots, mapLoaded, selectedPlotId]);

    const navItems = [
        { id: 'home', label: 'หน้าหลัก', icon: HomeIcon, path: '/' },
        { id: 'map', label: 'แผนที่', icon: MapIcon, path: '/map' },
        { id: 'dashboard', label: 'แดชบอร์ด', icon: DashboardIcon, path: '/dashboard', active: true },
        { id: 'personal', label: 'ส่วนตัว', icon: UserIcon, path: '/dashboard?view=personal' },
        { id: 'history', label: 'ประวัติ', icon: HistoryIcon, path: '/dashboard/history' },
    ]

    const recentPlots = [...accumulatedPlots]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10)

    // Filter plots based on search query
    const filteredPlots = recentPlots.filter(plot => {
        const searchLower = searchQuery.toLowerCase()
        const plotIdStr = plot.id.toString().padStart(4, '0')
        const dateStr = new Date(plot.date).toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
        return plotIdStr.includes(searchLower) || dateStr.includes(searchQuery)
    })

    return (
        <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
            {/* FULLSCREEN MAP */}
            <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

            {/* การ์ดสถิติแบบมินิมอล - ขนาดกลาง */}
            <div className="absolute top-5 left-5 right-5 z-40 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* การ์ดคาร์บอน */}
                    <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500 animate-pulse" />
                        <div className="relative bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 shadow-lg hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-0.5">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/30">
                                    <LeafIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-emerald-300 text-[10px] font-semibold uppercase tracking-wider leading-none">ปริมาณคาร์บอน</p>
                                    <div className="flex items-baseline gap-1.5 mt-0.5">
                                        <h2 className="text-2xl font-black text-white leading-none">
                                            {stats.totalCarbon.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                                        </h2>
                                        <span className="text-emerald-300 text-[10px] font-bold">ตัน CO₂</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* การ์ดพื้นที่ */}
                    <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                        <div className="relative bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 shadow-lg hover:shadow-green-500/10 transition-all duration-500 hover:-translate-y-0.5">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-md shadow-green-500/30">
                                    <MapPinIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-green-300 text-[10px] font-semibold uppercase tracking-wider leading-none">พื้นที่ทั้งหมด</p>
                                    <div className="flex items-baseline gap-1.5 mt-0.5">
                                        <h2 className="text-2xl font-black text-white leading-none">
                                            {stats.totalArea.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                                        </h2>
                                        <span className="text-green-300 text-[10px] font-bold">ไร่</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* การ์ดผู้เข้าร่วม */}
                    <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                        <div className="relative bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 shadow-lg hover:shadow-teal-500/10 transition-all duration-500 hover:-translate-y-0.5">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-md shadow-teal-500/30">
                                    <UserIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-teal-300 text-[10px] font-semibold uppercase tracking-wider leading-none">ผู้เข้าร่วม</p>
                                    <div className="flex items-baseline gap-1.5 mt-0.5">
                                        <h2 className="text-2xl font-black text-white leading-none">
                                            {stats.totalPlots.toLocaleString('th-TH')}
                                        </h2>
                                        <span className="text-teal-300 text-[10px] font-bold">ราย</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FLOATING PLOT LIST BUTTON */}
            <button
                onClick={() => setShowPlotListModal(!showPlotListModal)}
                className="absolute top-6 right-6 z-50 group"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300 animate-pulse" />
                <div className="relative w-16 h-16 bg-white/10 backdrop-blur-2xl rounded-full border border-white/20 shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300">
                    <MenuIcon className="w-7 h-7 text-emerald-300 group-hover:text-emerald-200" />
                    {recentPlots.length > 0 && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-[11px] text-white font-black shadow-lg shadow-emerald-500/50 border-2 border-white/20">
                            {recentPlots.length}
                        </div>
                    )}
                </div>
            </button>

            {/* PLOT LIST MODAL */}
            {showPlotListModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowPlotListModal(false)}
                    />

                    <div className="relative max-w-3xl w-full max-h-[85vh]">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-3xl blur-2xl" />
                        <div className="relative bg-white/10 backdrop-blur-3xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="relative bg-gradient-to-r from-emerald-600 to-green-600 px-8 py-6">
                                <div className="absolute inset-0 bg-white/10" />
                                <div className="relative flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
                                            <MenuIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-white">รายการแปลงทั้งหมด</h3>
                                            <p className="text-emerald-100 text-sm mt-1">คลิกเพื่อดูรายละเอียดและซูมแผนที่</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowPlotListModal(false)}
                                        className="w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-xl flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/20"
                                    >
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Search Box */}
                            <div className="px-6 pt-4 pb-2">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="ค้นหาแปลง... (เช่น #0001)"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-3 pl-12 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300"
                                    />
                                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300"
                                        >
                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* List */}
                            <div className="overflow-y-auto max-h-[calc(85vh-220px)] p-6">
                                {filteredPlots.length === 0 ? (
                                    <div className="text-center text-white/60 py-16">
                                        {searchQuery ? (
                                            <>
                                                <svg className="w-16 h-16 mx-auto mb-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                                <p className="text-lg">ไม่พบแปลงที่ค้นหา</p>
                                                <p className="text-sm mt-2">ลองค้นหาด้วยคำอื่น</p>
                                            </>
                                        ) : (
                                            <p className="text-lg">ยังไม่มีข้อมูลแปลง</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {filteredPlots.map((plot, idx) => (
                                            <div
                                                key={plot.id}
                                                onClick={() => {
                                                    zoomToPlot(plot)
                                                    setShowPlotListModal(false)
                                                }}
                                                className="group relative cursor-pointer"
                                            >
                                                <div className={`absolute inset-0 ${selectedPlotId === plot.id
                                                    ? 'bg-gradient-to-br from-amber-400 to-amber-600'
                                                    : 'bg-gradient-to-br from-emerald-400 to-green-600'
                                                    } rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300`} />
                                                <div className={`relative bg-white/10 backdrop-blur-2xl rounded-2xl p-5 border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${selectedPlotId === plot.id
                                                    ? 'border-amber-400/50 shadow-amber-500/20'
                                                    : 'border-white/20 hover:border-emerald-400/50'
                                                    }`}>
                                                    <div className="flex items-start gap-4">
                                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg ${selectedPlotId === plot.id
                                                            ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/40'
                                                            : 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-500/40'
                                                            }`}>
                                                            #{idx + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-white font-black text-lg">แปลง #{plot.id.toString().padStart(4, '0')}</p>
                                                            <p className={`text-sm font-semibold mt-1 ${selectedPlotId === plot.id ? 'text-amber-300' : 'text-emerald-300'
                                                                }`}>
                                                                {new Date(plot.date).toLocaleDateString('th-TH', {
                                                                    day: 'numeric',
                                                                    month: 'long',
                                                                    year: 'numeric'
                                                                })}
                                                            </p>
                                                            <div className="flex items-center gap-4 mt-3">
                                                                <div className="flex items-center gap-2">
                                                                    <MapPinIcon className="w-4 h-4 text-green-400" />
                                                                    <span className="text-white text-sm font-bold">{plot.areaRai.toFixed(1)} ไร่</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <LeafIcon className="w-4 h-4 text-emerald-400" />
                                                                    <span className="text-white text-sm font-bold">{plot.carbon.toFixed(0)} ตัน</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* BOTTOM NAVIGATION */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 via-green-500/30 to-emerald-500/30 rounded-full blur-xl animate-pulse" />
                    <nav className="relative flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-3xl rounded-full border border-white/20 shadow-2xl">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => history.push(item.path)}
                                className="group relative transition-all"
                                title={item.label}
                            >
                                {item.active ? (
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full blur-lg animate-pulse" />
                                        <div className="relative w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/50 border-2 border-white/20">
                                            <item.icon className="w-7 h-7" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 hover:scale-110">
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                )}
                                <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-white font-semibold bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg border border-white/10">
                                    {item.label}
                                </span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <style>{`
                .maplibregl-ctrl-attrib,
                .maplibregl-ctrl-logo {
                    display: none !important;
                }
                @keyframes pulse {
                    0%, 100% {
                        opacity: 0.5;
                    }
                    50% {
                        opacity: 0.8;
                    }
                }
            `}</style>
        </div>
    )
}

export default DashboardPage
