import React, { useState, useEffect, useRef, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import * as turf from '@turf/turf'
import { Link, useHistory } from 'react-router-dom'
import { getPlots } from '../services/api'

// ==========================================
// ICON COMPONENTS (Consistent with MapPageNew)
// ==========================================
const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
)

const MapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
    </svg>
)

const DashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
)

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
)

const HistoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
)

const TrendingUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
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
    const [stats, setStats] = useState({
        totalPlots: 0,
        totalArea: 0,
        totalCarbon: 0
    })

    // ==========================================
    // INITIALIZE MAP & FETCH DATA
    // ==========================================
    useEffect(() => {
        // Fetch plots from backend
        const loadPlots = async () => {
            try {
                const plots = await getPlots()
                if (!plots || !Array.isArray(plots)) {
                    console.warn('Plots data is not an array:', plots);
                    return;
                }

                // Process for map (need to ensure geometry exists)
                const processedPlots = plots
                    .filter(p => p.geometry || (p.lat && p.lng))
                    .map(p => {
                        const geometry = p.geometry || {
                            type: 'Point',
                            coordinates: [parseFloat(p.lng), parseFloat(p.lat)]
                        };
                        return {
                            ...p,
                            id: p.id,
                            farmerName: p.name || p.farmer_name || 'ไม่ระบุชื่อ',
                            carbon: parseFloat(p.carbon_tons) || 0,
                            areaRai: parseFloat(p.area_rai) || 0,
                            geometry: geometry
                        }
                    })

                setAccumulatedPlots(processedPlots)

                // Calculate stats
                const totalPlots = plots.length
                const totalArea = plots.reduce((sum, p) => sum + (parseFloat(p.area_rai) || 0), 0)
                const totalCarbon = plots.reduce((sum, p) => sum + (parseFloat(p.carbon_tons) || 0), 0)
                setStats({ totalPlots, totalArea, totalCarbon })

            } catch (err) {
                console.error('Failed to load plots for dashboard:', err)
            }
        }

        loadPlots()

        if (map.current) return

        // Create map with Globe projection
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
                            'https://mt2.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
                            'https://mt3.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
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
            center: [100.5018, 13.7563], // Bangkok
            zoom: 1.5,
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
        const markerLayerId = 'dashboard-plots-marker';

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
                        area: p.areaRai
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
                    'fill-opacity': 0.4
                }
            });

            map.current.addLayer({
                id: lineLayerId,
                type: 'line',
                source: sourceId,
                paint: {
                    'line-color': '#ffffff',
                    'line-width': 2
                }
            });

            map.current.addLayer({
                id: markerLayerId,
                type: 'circle',
                source: sourceId,
                paint: {
                    'circle-radius': 8,
                    'circle-color': '#ffffff',
                    'circle-stroke-color': '#059669',
                    'circle-stroke-width': 3
                }
            });

            // Interaction
            map.current.on('click', fillLayerId, (e) => {
                const feature = e.features[0];
                if (!feature) return;

                const center = turf.center(feature.geometry);
                const [lng, lat] = center.geometry.coordinates;

                if (popupRef.current) popupRef.current.remove();

                const plotData = {
                    id: feature.properties.id,
                    farmerName: feature.properties.farmerName,
                    carbon: feature.properties.carbon,
                    area: feature.properties.area,
                    geometry: JSON.parse(JSON.stringify(feature.geometry))
                };

                setSelectedPlot(plotData);
                map.current.flyTo({ center: [lng, lat], zoom: 16, duration: 1500 });
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
    // ANIMATIONS
    // ==========================================
    const startIntroAnimation = useCallback(() => {
        if (!map.current) return
        map.current.flyTo({
            center: [100.5018, 13.7563],
            zoom: 6,
            pitch: 45,
            bearing: 15,
            duration: 3500,
            essential: true,
            curve: 1.5
        })
    }, [])

    const handleNavClick = (route) => {
        history.push(route)
    }

    return (
        <div className="relative w-full h-screen bg-slate-900 overflow-hidden font-sans">
            {/* Map Container */}
            <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

            {/* Premium Stats Overlay (Top Center) */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 w-full max-w-[90%] md:max-w-3xl">
                <div className="bg-white/90 backdrop-blur-2xl px-8 py-5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/40 flex flex-wrap items-center justify-between gap-6 md:gap-12">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#eff6ff] flex items-center justify-center text-blue-600 shadow-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px]">จำนวนแปลง</p>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-black text-slate-800 tracking-tighter">{stats.totalPlots}</span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">แปลง</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden sm:block w-px h-10 bg-slate-200"></div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#ecfdf5] flex items-center justify-center text-emerald-600 shadow-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px]">พื้นที่รวม</p>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-black text-slate-800 tracking-tighter">{stats.totalArea.toLocaleString()}</span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">ไร่</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden sm:block w-px h-10 bg-slate-200"></div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                            <TrendingUpIcon />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-teal-600 uppercase tracking-[2px]">คาร์บอนรวม</p>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-black text-slate-800 tracking-tighter">{stats.totalCarbon.toLocaleString()}</span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">tCO₂e</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Public Access Badge */}
            <div className="absolute top-4 left-4 z-40 bg-slate-900/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Public Dashboard View</span>
            </div>

            {/* ==========================================
                SIDE DETAIL PANEL
            ========================================== */}
            <div className={`fixed top-1/2 -translate-y-1/2 right-6 z-50 w-[340px] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${selectedPlot ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}>
                <div className="bg-white/90 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.2)] border border-white/50 overflow-hidden relative">
                    {/* Close Button */}
                    <button
                        onClick={() => setSelectedPlot(null)}
                        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100/50 hover:bg-slate-200/50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all active:scale-90"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>

                    <div className="p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-50">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 10a6 6 0 0 0-6-6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2a6 6 0 0 0-6 6Z" /><path d="M8 10a4 4 0 0 1 8 0V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v6Z" /></svg>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[2px] mb-1 block">รายละเอียดแปลงยาง</span>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">{selectedPlot?.farmerName}</h3>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Area Info */}
                            <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">ขนาดพื้นที่สำรวจ</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-slate-700">{selectedPlot?.area}</span>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">ไร่โดยประมาณ</span>
                                </div>
                            </div>

                            {/* Carbon Info */}
                            <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100/50">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">ปริมาณคาร์บอนสุทธิ</p>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-emerald-600 tracking-tighter">{selectedPlot?.carbon}</span>
                                    <span className="text-sm font-bold text-emerald-400 uppercase tracking-tighter">tCO₂e / ปี</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-2 flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        if (selectedPlot?.geometry && map.current) {
                                            if (selectedPlot.geometry.type === 'Point') {
                                                map.current.flyTo({
                                                    center: selectedPlot.geometry.coordinates,
                                                    zoom: 17,
                                                    duration: 1500
                                                });
                                            } else {
                                                const bbox = turf.bbox(selectedPlot.geometry);
                                                map.current.fitBounds(bbox, { padding: 100, duration: 1500 });
                                            }
                                        }
                                    }}
                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    ซูมไปที่ตำแหน่งแปลง
                                </button>

                                <button
                                    onClick={() => handleNavClick('/map')}
                                    className="w-full py-4 bg-white text-emerald-600 border border-emerald-100 rounded-2xl font-bold text-sm hover:bg-emerald-50 transition-all active:scale-95"
                                >
                                    เพิ่มแปลงใหม่ของฉัน
                                </button>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            </div>
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-tight">ข้อมูลผ่านการรับรอง<br />โดยระบบ KEPTCARBON</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==========================================
                FLOATING NAVBAR (Bottom Center)
            ========================================== */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40">
                <nav className="flex items-center gap-1.5 bg-white/95 backdrop-blur-3xl rounded-3xl p-2 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-white/50">
                    {/* Home */}
                    <button
                        onClick={() => handleNavClick('/')}
                        className="flex flex-col items-center justify-center w-16 h-14 rounded-2xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all active:scale-90"
                    >
                        <HomeIcon />
                        <span className="text-[10px] mt-1 font-bold uppercase tracking-tighter">หน้าหลัก</span>
                    </button>

                    {/* Map */}
                    <button
                        onClick={() => handleNavClick('/map')}
                        className="flex flex-col items-center justify-center w-16 h-14 rounded-2xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all active:scale-90"
                    >
                        <MapIcon />
                        <span className="text-[10px] mt-1 font-bold uppercase tracking-tighter">แผนที่</span>
                    </button>

                    {/* Dashboard - Active */}
                    <button
                        className="flex flex-col items-center justify-center w-16 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-xl shadow-emerald-500/30 transition-all"
                    >
                        <DashboardIcon />
                        <span className="text-[10px] mt-1 font-bold uppercase tracking-tighter">แดชบอร์ด</span>
                    </button>

                    {/* Personal */}
                    <button
                        onClick={() => handleNavClick('/dashboard?view=personal')}
                        className="flex flex-col items-center justify-center w-16 h-14 rounded-2xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all active:scale-90"
                    >
                        <UserIcon />
                        <span className="text-[10px] mt-1 font-bold uppercase tracking-tighter">ส่วนตัว</span>
                    </button>

                    {/* History */}
                    <button
                        onClick={() => handleNavClick('/dashboard/history')}
                        className="flex flex-col items-center justify-center w-16 h-14 rounded-2xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all active:scale-90"
                    >
                        <HistoryIcon />
                        <span className="text-[10px] mt-1 font-bold uppercase tracking-tighter">ประวัติ</span>
                    </button>
                </nav>
            </div>

            <style>{`
                .modern-public-popup .maplibregl-popup-content {
                    padding: 0;
                    border-radius: 2.5rem;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    border: 1px solid rgba(255,255,255,0.4);
                    background: rgba(255,255,255,0.95);
                    backdrop-filter: blur(16px);
                }
                .maplibregl-ctrl-attrib, .maplibregl-ctrl-logo {
                    display: none !important;
                }
            `}</style>
        </div>
    )
}

export default DashboardPage
