import React, { useState, useEffect, useRef, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import * as turf from '@turf/turf'
import { useHistory } from 'react-router-dom'
import { getPlots } from '../services/api'

// ==========================================
// ICON COMPONENTS
// ==========================================
const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
)

const MapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
    </svg>
)

const LeafIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10a6 6 0 0 0-6-6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2a6 6 0 0 0-6 6Z" />
    </svg>
)

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
)

const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
)

// ==========================================
// DASHBOARD COMPONENT
// ==========================================
function DashboardPage() {
    const history = useHistory()
    const mapContainer = useRef(null)
    const map = useRef(null)
    const popupRef = useRef(null)

    // State
    const [mapLoaded, setMapLoaded] = useState(false)
    const [accumulatedPlots, setAccumulatedPlots] = useState([])
    const [selectedPlot, setSelectedPlot] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [showPlotList, setShowPlotList] = useState(false)
    const [stats, setStats] = useState({
        totalPlots: 0,
        totalArea: 0,
        totalCarbon: 0
    })

    // ==========================================
    // INITIALIZE MAP & FETCH DATA
    // ==========================================
    useEffect(() => {
        const loadPlots = async () => {
            try {
                const plots = await getPlots()
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
                            farmerName: p.name || p.farmer_name || 'ไม่ระบุชื่อ',
                            carbon: parseFloat(p.carbon_tons) || 0,
                            areaRai: parseFloat(p.area_rai) || 0,
                            geometry: geometry,
                            plantingYearBE: p.planting_year ? parseInt(p.planting_year) + 543 : '-',
                            variety: p.notes?.includes('พันธุ์:') ? p.notes.split('พันธุ์:')[1]?.trim() : 'PB 235'
                        };
                    });

                    const validPlots = processed.filter(p => p.geometry);
                    setAccumulatedPlots(validPlots)

                    const totalPlots = plots.length
                    const totalArea = plots.reduce((sum, p) => sum + (parseFloat(p.area_rai) || 0), 0)
                    const totalCarbon = plots.reduce((sum, p) => sum + (parseFloat(p.carbon_tons) || 0), 0)
                    setStats({ totalPlots, totalArea, totalCarbon })
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
            zoom: 5,
            pitch: 0,
            bearing: 0,
            maxPitch: 85,
            antialias: true
        })

        map.current.on('load', () => {
            try {
                map.current.setProjection({ type: 'globe' })
            } catch (e) {
                console.log('Globe projection not available')
            }

            if (map.current.setFog) {
                map.current.setFog({
                    color: 'rgb(186, 210, 235)',
                    'high-color': 'rgb(36, 92, 223)',
                    'horizon-blend': 0.02,
                    'space-color': 'rgb(11, 11, 25)',
                    'star-intensity': 0.6
                })
            }

            setMapLoaded(true)
            startIntroAnimation()
        })

        return () => {
            if (map.current) {
                map.current.remove()
                map.current = null
            }
        }
    }, [])

    // ==========================================
    // PERSIST SAVED PLOTS ON MAP
    // ==========================================
    useEffect(() => {
        if (!map.current || !mapLoaded || accumulatedPlots.length === 0) return;

        const sourceId = 'dashboard-plots-source';
        const fillLayerId = 'dashboard-plots-fill';
        const lineLayerId = 'dashboard-plots-line';

        const geojson = {
            type: 'FeatureCollection',
            features: accumulatedPlots
                .filter(p => p.geometry)
                .map(p => ({
                    type: 'Feature',
                    geometry: p.geometry,
                    properties: {
                        id: p.id,
                        farmerName: p.farmerName,
                        carbon: p.carbon,
                        area: p.areaRai,
                        allData: JSON.stringify(p)
                    }
                }))
        };

        if (map.current.getSource(sourceId)) {
            map.current.getSource(sourceId).setData(geojson);
        } else {
            map.current.addSource(sourceId, {
                type: 'geojson',
                data: geojson
            });

            map.current.addLayer({
                id: fillLayerId,
                type: 'fill',
                source: sourceId,
                paint: {
                    'fill-color': '#10b981',
                    'fill-opacity': 0.5
                }
            });

            map.current.addLayer({
                id: lineLayerId,
                type: 'line',
                source: sourceId,
                paint: {
                    'line-color': '#ffffff',
                    'line-width': 2.5
                }
            });

            // Click handler
            map.current.on('click', fillLayerId, (e) => {
                try {
                    const feature = e.features[0];
                    if (!feature) return;

                    const plotData = JSON.parse(feature.properties.allData);
                    setSelectedPlot(plotData);

                    // Zoom to plot
                    if (feature.geometry) {
                        const bbox = turf.bbox(feature.geometry);
                        map.current.fitBounds(bbox, {
                            padding: { top: 100, bottom: 300, left: 50, right: 50 },
                            maxZoom: 17,
                            duration: 1500
                        });
                    }
                } catch (err) {
                    console.error('Error handling map click:', err);
                }
            });

            map.current.on('mouseenter', fillLayerId, () => {
                map.current.getCanvas().style.cursor = 'pointer';
            });
            map.current.on('mouseleave', fillLayerId, () => {
                map.current.getCanvas().style.cursor = '';
            });
        }
    }, [accumulatedPlots, mapLoaded]);

    // ==========================================
    // ANIMATIONS & HANDLERS
    // ==========================================
    const startIntroAnimation = useCallback(() => {
        if (!map.current) return
        map.current.flyTo({
            center: [100.5018, 13.7563],
            zoom: 6,
            pitch: 45,
            bearing: 15,
            duration: 3000,
            essential: true,
            curve: 1.5
        })
    }, [])

    const handleZoomToPlot = (plot) => {
        if (!plot.geometry || !map.current) return;

        setSelectedPlot(plot);
        setShowPlotList(false);

        if (plot.geometry.type === 'Point') {
            map.current.flyTo({
                center: plot.geometry.coordinates,
                zoom: 17,
                duration: 1500
            });
        } else {
            const bbox = turf.bbox(plot.geometry);
            map.current.fitBounds(bbox, {
                padding: { top: 100, bottom: 300, left: 50, right: 50 },
                maxZoom: 17,
                duration: 1500
            });
        }
    }

    const filteredPlots = accumulatedPlots.filter(p =>
        p.farmerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative w-full h-screen bg-slate-900 overflow-hidden font-sans">
            {/* Map Container */}
            <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

            {/* ==========================================
                TOP STATS BAR
            ========================================== */}
            <div className="absolute top-4 left-4 right-4 z-30 flex justify-center">
                <div className="bg-white/95 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-xl border border-white/50 flex items-center gap-6 md:gap-10">
                    {/* Total Plots */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <MapIcon />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">จำนวนแปลง</p>
                            <p className="text-xl font-black text-slate-800">{stats.totalPlots} <span className="text-xs font-semibold text-slate-400">แปลง</span></p>
                        </div>
                    </div>

                    <div className="hidden sm:block w-px h-10 bg-slate-200"></div>

                    {/* Total Area */}
                    <div className="hidden sm:flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">พื้นที่รวม</p>
                            <p className="text-xl font-black text-slate-800">{stats.totalArea.toFixed(1)} <span className="text-xs font-semibold text-slate-400">ไร่</span></p>
                        </div>
                    </div>

                    <div className="hidden md:block w-px h-10 bg-slate-200"></div>

                    {/* Total Carbon */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                            <LeafIcon />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">คาร์บอนรวม</p>
                            <p className="text-xl font-black text-emerald-600">{stats.totalCarbon.toFixed(2)} <span className="text-xs font-semibold text-slate-400">tCO₂e</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==========================================
                PLOT LIST TOGGLE BUTTON (Mobile)
            ========================================== */}
            <button
                onClick={() => setShowPlotList(!showPlotList)}
                className="absolute bottom-24 left-4 z-40 bg-white text-slate-700 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 font-semibold text-sm active:scale-95 transition-transform md:hidden"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                รายการแปลง ({stats.totalPlots})
            </button>

            {/* ==========================================
                SIDE PANEL - PLOT LIST
            ========================================== */}
            <div className={`fixed top-0 left-0 bottom-0 z-50 w-full sm:w-80 md:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-out ${showPlotList ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:z-30`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-400 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <LeafIcon />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">KEPTCARBON</h2>
                                <p className="text-xs text-white/70">Carbon Credit Dashboard</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowPlotList(false)}
                            className="md:hidden w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อเกษตร..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/20 text-white placeholder-white/60 px-4 py-3 pl-10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                        />
                        <SearchIcon />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
                            <SearchIcon />
                        </div>
                    </div>
                </div>

                {/* Plot List */}
                <div className="overflow-y-auto h-[calc(100%-180px)] p-4 space-y-3">
                    {filteredPlots.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                            <LeafIcon />
                            <p className="mt-2 text-sm">ไม่พบข้อมูลแปลง</p>
                        </div>
                    ) : (
                        filteredPlots.map((plot) => (
                            <button
                                key={plot.id}
                                onClick={() => handleZoomToPlot(plot)}
                                className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${selectedPlot?.id === plot.id
                                        ? 'bg-emerald-50 border-2 border-emerald-400 shadow-md'
                                        : 'bg-slate-50 border-2 border-transparent hover:bg-emerald-50/50 hover:border-emerald-200'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-800 truncate">{plot.farmerName}</h3>
                                        <p className="text-xs text-slate-500 mt-1">{plot.areaRai.toFixed(2)} ไร่ • {plot.variety}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-emerald-600">{plot.carbon.toFixed(2)}</p>
                                        <p className="text-[10px] text-emerald-500 font-semibold">tCO₂e</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                                    <LocationIcon />
                                    <span>คลิกเพื่อดูตำแหน่งบนแผนที่</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Add New Button */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
                    <button
                        onClick={() => history.push('/map')}
                        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 active:scale-98 transition-transform"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        เพิ่มแปลงใหม่
                    </button>
                </div>
            </div>

            {/* ==========================================
                SELECTED PLOT DETAIL CARD
            ========================================== */}
            {selectedPlot && (
                <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-40 animate-slide-up">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                        {/* Header */}
                        <div className="bg-slate-50 p-4 border-b flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                                    <LeafIcon />
                                </div>
                                <div>
                                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">ข้อมูลแปลง</p>
                                    <h3 className="font-bold text-slate-800">{selectedPlot.farmerName}</h3>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedPlot(null)}
                                className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-4">
                            {/* Carbon Highlight */}
                            <div className="bg-emerald-50 rounded-xl p-4 text-center">
                                <p className="text-xs text-emerald-600 font-semibold mb-1">คาร์บอนเครดิต</p>
                                <p className="text-4xl font-black text-emerald-600">{selectedPlot.carbon.toFixed(2)}</p>
                                <p className="text-xs text-slate-500">tCO₂e / ปี</p>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 rounded-lg p-3">
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase">พื้นที่</p>
                                    <p className="font-bold text-slate-700">{selectedPlot.areaRai.toFixed(2)} ไร่</p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-3">
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase">พันธุ์ยาง</p>
                                    <p className="font-bold text-slate-700">{selectedPlot.variety}</p>
                                </div>
                            </div>

                            {/* Action */}
                            <button
                                onClick={() => history.push('/map')}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors active:scale-98"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                แก้ไขข้อมูลแปลง
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==========================================
                FLOATING NAVBAR (Bottom)
            ========================================== */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40">
                <nav className="flex items-center gap-1 bg-white/95 backdrop-blur-xl rounded-2xl p-1.5 shadow-xl border border-white/50">
                    <button
                        onClick={() => history.push('/')}
                        className="flex flex-col items-center justify-center w-14 h-12 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                    >
                        <HomeIcon />
                        <span className="text-[9px] mt-0.5 font-semibold">หน้าหลัก</span>
                    </button>

                    <button
                        onClick={() => history.push('/map')}
                        className="flex flex-col items-center justify-center w-14 h-12 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                    >
                        <MapIcon />
                        <span className="text-[9px] mt-0.5 font-semibold">แผนที่</span>
                    </button>

                    <button
                        className="flex flex-col items-center justify-center w-14 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                        </svg>
                        <span className="text-[9px] mt-0.5 font-semibold">แดชบอร์ด</span>
                    </button>
                </nav>
            </div>

            <style>{`
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out forwards;
                }
                .maplibregl-ctrl-attrib, .maplibregl-ctrl-logo {
                    display: none !important;
                }
            `}</style>
        </div>
    )
}

export default DashboardPage
