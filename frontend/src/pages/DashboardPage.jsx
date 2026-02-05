import React, { useState, useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import * as turf from '@turf/turf'
import { useHistory } from 'react-router-dom'
import { getPlots } from '../services/api'

// ==========================================
// ICON COMPONENTS
// ==========================================
const HomeIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
)

const MapIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
    </svg>
)

const DashboardIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
)

const UserIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
)

const HistoryIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
)

const CarbonIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
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
    const markersRef = useRef([])

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

    const [showMobileStats, setShowMobileStats] = useState(false)
    const [userProfile, setUserProfile] = useState(null)

    // Clear markers helper
    const clearMarkers = () => {
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
    }

    // ==========================================
    // UNIFIED MAP DATA UPDATE EFFECT
    // Handles Sources, Layers, and HTML Markers
    // ==========================================
    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        const sourceId = 'dashboard-source';
        const fillId = 'dashboard-fill';
        const lineId = 'dashboard-line';
        const glowId = 'dashboard-glow';

        // 1. Clear existing markers
        clearMarkers();

        // 2. Prepare GeoJSON
        const geojson = {
            type: 'FeatureCollection',
            features: accumulatedPlots
                .filter(p => p.geometry)
                .map(p => ({
                    type: 'Feature',
                    geometry: p.geometry,
                    properties: {
                        id: p.id,
                        carbon: p.carbon,
                        area: p.areaRai,
                        selected: p.id === selectedPlotId
                    }
                }))
        };

        // 3. Update or Add Source & Layers
        if (map.current.getSource(sourceId)) {
            map.current.getSource(sourceId).setData(geojson);
        } else {
            map.current.addSource(sourceId, { type: 'geojson', data: geojson });

            // Glow Layer (Selection highlight)
            map.current.addLayer({
                id: glowId,
                type: 'line',
                source: sourceId,
                paint: {
                    'line-color': ['case', ['get', 'selected'], '#fbbf24', '#10b981'],
                    'line-width': ['case', ['get', 'selected'], 12, 0],
                    'line-blur': 8,
                    'line-opacity': ['case', ['get', 'selected'], 0.8, 0]
                }
            });

            // Fill Layer
            map.current.addLayer({
                id: fillId,
                type: 'fill',
                source: sourceId,
                paint: {
                    'fill-color': ['case', ['get', 'selected'], '#fbbf24', '#10b981'],
                    'fill-opacity': ['case', ['get', 'selected'], 0.5, 0.3]
                }
            });

            // Line Layer
            map.current.addLayer({
                id: lineId,
                type: 'line',
                source: sourceId,
                paint: {
                    'line-color': ['case', ['get', 'selected'], '#f59e0b', '#059669'],
                    'line-width': ['case', ['get', 'selected'], 2, 1.5]
                }
            });
        }

        // 4. Create HTML Markers for each plot
        accumulatedPlots.forEach(plot => {
            if (!plot.geometry) return;

            let center;
            try {
                if (plot.geometry.type === 'Point') {
                    center = plot.geometry.coordinates;
                } else {
                    const centroid = turf.centroid(plot.geometry);
                    center = centroid.geometry.coordinates;
                }
            } catch (e) { return; }

            if (!center) return;

            const el = document.createElement('div');
            const isSelected = plot.id === selectedPlotId;
            el.className = 'custom-marker-container';
            el.style.cssText = `
                width: 40px;
                height: 40px;
                cursor: pointer;
                transition: all 0.3s ease;
                z-index: ${isSelected ? 50 : 10};
            `;

            el.innerHTML = `
                <div class="relative w-full h-full group">
                    <div class="absolute inset-0 bg-emerald-500 rounded-full opacity-20 animate-ping group-hover:opacity-40"></div>
                    <div class="relative w-10 h-10 bg-gradient-to-br ${isSelected ? 'from-amber-400 to-orange-500 scale-110' : 'from-emerald-500 to-teal-600'} rounded-full shadow-lg border-2 border-white flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16.21 4.5C14.53 4.5 13.06 5.4 12.28 6.78C11.58 5.75 10.37 5 9 5C6.79 5 5 6.79 5 9C5 9.17 5.01 9.33 5.04 9.49C3.26 9.8 2 11.28 2 13C2 15.21 3.79 17 6 17H11V22H13V17H18C20.21 17 22 15.21 22 13C22 10.96 20.47 9.27 18.5 9.04C18.82 8.42 19 7.73 19 7C19 5.62 17.8 4.5 16.21 4.5Z" />
                        </svg>
                    </div>
                </div>
            `;

            el.addEventListener('click', (e) => {
                e.stopPropagation();
                zoomToPlot(plot);
            });

            const marker = new maplibregl.Marker({
                element: el,
                anchor: 'bottom',
                offset: [0, -5]
            })
                .setLngLat(center)
                .addTo(map.current);

            markersRef.current.push(marker);
        });

    }, [accumulatedPlots, mapLoaded, selectedPlotId]);

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

    // Function to zoom to all plots
    const zoomToAllPlots = () => {
        if (!map.current || accumulatedPlots.length === 0) return;

        const validPlots = accumulatedPlots.filter(p => p.geometry);
        if (validPlots.length === 0) return;

        try {
            const collection = {
                type: 'FeatureCollection',
                features: validPlots.map(p => ({
                    type: 'Feature',
                    geometry: p.geometry,
                    properties: {}
                }))
            };

            const bbox = turf.bbox(collection);

            map.current.fitBounds(
                [[bbox[0], bbox[1]], [bbox[2], bbox[3]]],
                {
                    padding: { top: 100, bottom: 100, left: 100, right: window.innerWidth < 768 ? 100 : 450 },
                    duration: 1500,
                    maxZoom: 14
                }
            );
        } catch (error) {
            console.error('Error in zoomToAllPlots:', error);
        }

        setSelectedPlotId(null);
    };

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
                            name: p.name || p.farmer_name || `แปลงที่ ${p.id}`,
                            tambon: p.tambon || p.subdistrict || '-',
                            amphoe: p.amphoe || p.district || '-',
                            province: p.province || 'เชียงใหม่',
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
            zoom: 2, // Start zoomed out to see the globe
            pitch: 0,
            bearing: 0,
            antialias: true,
            projection: { type: 'globe' } // Explicit object configuration
        })

        map.current.on('style.load', () => {
            // Force projection on style load just in case
            map.current.setProjection({ type: 'globe' });
        });


        map.current.on('load', () => {
            setMapLoaded(true)

            // Set Atmosphere to match standard map feel (dark but not pitch black)
            if (map.current.setFog) {
                map.current.setFog({
                    'range': [0.5, 10],
                    'color': 'rgb(255, 255, 255)',
                    'high-color': '#245cdf',
                    'horizon-blend': 0.1,
                    'space-color': '#111827', // Gray 900 (Softer than black)
                    'star-intensity': 0.15 // Subtle stars
                });
            }
        })

        return () => {
            if (map.current) {
                map.current.remove()
                map.current = null
            }
        }
    }, [])

    // Unified Map Data Update Effect
    // (Consolidated duplicate logic that was previously at lines 444-561)



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
        <div className="relative w-full h-screen overflow-hidden bg-gray-900">
            {/* FULLSCREEN MAP - True Color (No Opacity/Blend) */}
            <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

            {/* No Overlay - Pure Map View */}

            {/* 
                DYNAMIC STATS TOGGLE (Mobile Only) 
            */}
            <div className="md:hidden absolute top-6 right-6 z-[45]">
                <button
                    onClick={() => setShowMobileStats(!showMobileStats)}
                    className={`w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-all ${showMobileStats ? 'rotate-45 opacity-50' : 'rotate-0 opacity-100'}`}
                >
                    <SparklesIcon className="w-5 h-5 text-emerald-400" />
                </button>
            </div>

            {/* BACKDROP (Mobile Only) - Click anywhere outside to close */}
            {window.innerWidth < 768 && showMobileStats && (
                <div
                    className="fixed inset-0 z-30 bg-black/5 backdrop-blur-[1px] md:hidden animate-in fade-in duration-300"
                    onClick={() => setShowMobileStats(false)}
                />
            )}

            {/* การ์ดสถิติแบบ Premium Glassmorphism - ตัดกับพื้นหลังเข้ม */}
            <div
                className={`
                    absolute top-5 left-5 right-5 z-40 max-w-4xl mx-auto transition-all duration-500
                    ${window.innerWidth < 768 && !showMobileStats ? 'opacity-0 -translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'}
                `}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the cards themselves
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* การ์ดคาร์บอน */}
                    <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-all duration-500" />
                        <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-xl hover:shadow-emerald-500/20 transition-all duration-500 hover:-translate-y-1">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                                    <CarbonIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-0.5">ปริมาณคาร์บอน</p>
                                    <div className="flex items-baseline gap-2">
                                        <h2 className="text-2xl font-black text-white leading-none tracking-tight">
                                            {stats.totalCarbon.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                                        </h2>
                                        <span className="text-emerald-400 text-xs font-bold">ตัน CO₂</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* การ์ดพื้นที่ */}
                    <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-all duration-500" />
                        <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-xl hover:shadow-emerald-500/20 transition-all duration-500 hover:-translate-y-1">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                                    <MapIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-0.5">พื้นที่ทั้งหมด</p>
                                    <div className="flex items-baseline gap-2">
                                        <h2 className="text-2xl font-black text-white leading-none tracking-tight">
                                            {stats.totalArea.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                                        </h2>
                                        <span className="text-emerald-400 text-xs font-bold">ไร่</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* การ์ดผู้เข้าร่วม */}
                    <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-all duration-500" />
                        <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-xl hover:shadow-emerald-500/20 transition-all duration-500 hover:-translate-y-1">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                                    <UserIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-0.5">ผู้เข้าร่วม</p>
                                    <div className="flex items-baseline gap-2">
                                        <h2 className="text-2xl font-black text-white leading-none tracking-tight">
                                            {stats.totalPlots.toLocaleString('th-TH')}
                                        </h2>
                                        <span className="text-emerald-400 text-xs font-bold">ราย</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==========================================
                SIDEBAR TOGGLE BUTTON (Bottom Right)
            ========================================== */}
            <button
                onClick={() => setShowPlotListModal(!showPlotListModal)}
                className={`absolute bottom-28 right-6 z-50 transition-all duration-300 ${showPlotListModal ? 'translate-x-20 opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
                <div className="relative w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 group">
                    <MenuIcon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    {recentPlots.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[9px] font-bold text-white items-center justify-center">
                                {recentPlots.length}
                            </span>
                        </span>
                    )}
                </div>
            </button>

            {/* ==========================================
                VERTICAL PLOT SIDEBAR (Floating Card Style) - Glassmorphism Theme
            ========================================== */}
            <div
                className={`fixed top-24 bottom-32 right-6 w-[85vw] md:w-80 z-[60] transform transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${showPlotListModal ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0 pointer-events-none'
                    }`}
            >
                {/* Backdrop for mobile only (optional) */}
                {showPlotListModal && (
                    <div
                        className="fixed inset-0 bg-transparent -z-10 md:hidden"
                        onClick={() => setShowPlotListModal(false)}
                    />
                )}

                <div className="h-full w-full bg-white/60 backdrop-blur-3xl border border-white/40 overflow-hidden shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] flex flex-col rounded-[2rem]">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-white/30 flex flex-col gap-3 bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 drop-shadow-sm">รายการแปลง</h3>
                                <p className="text-xs text-slate-600 mt-0.5">ทั้งหมด {accumulatedPlots.length} แปลง</p>
                            </div>
                            <button
                                onClick={() => setShowPlotListModal(false)}
                                className="w-8 h-8 rounded-full bg-white/40 hover:bg-white/60 flex items-center justify-center text-slate-600 hover:text-slate-800 transition-colors shadow-sm"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Zoom to All Button */}
                        <button
                            onClick={() => { zoomToAllPlots(); setShowPlotListModal(false); }}
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                            ดูแปลงทั้งหมด
                        </button>
                    </div>

                    {/* Check / Search */}
                    <div className="p-4 border-b border-white/20 bg-white/20">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="ค้นหาแปลง..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/50 border border-white/40 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-white/70 transition-all placeholder-slate-500 shadow-inner"
                            />
                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin scrollbar-thumb-white/50 scrollbar-track-transparent">
                        {filteredPlots.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-slate-500 text-sm font-medium">ไม่พบข้อมูล</p>
                            </div>
                        ) : (
                            filteredPlots.map((plot, idx) => (
                                <div
                                    key={plot.id}
                                    onClick={() => {
                                        zoomToPlot(plot);
                                        if (window.innerWidth < 768) setShowPlotListModal(false);
                                    }}
                                    className={`group relative p-3 rounded-2xl border transition-all cursor-pointer backdrop-blur-md ${selectedPlotId === plot.id
                                        ? 'bg-emerald-50/90 border-emerald-400 shadow-md shadow-emerald-500/10'
                                        : 'bg-white/40 border-white/40 hover:bg-white/60 hover:shadow-lg hover:-translate-y-0.5'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-colors shadow-sm ${selectedPlotId === plot.id
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-white/70 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700'
                                                }`}>
                                                #{idx + 1}
                                            </div>
                                            <div>
                                                <h4 className={`text-sm font-bold ${selectedPlotId === plot.id ? 'text-emerald-800' : 'text-slate-800'}`}>
                                                    แปลง #{plot.id}
                                                </h4>
                                                <p className="text-[10px] text-slate-500">
                                                    {new Date(plot.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        {selectedPlotId === plot.id && (
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <div className="bg-white/40 rounded-lg px-2.5 py-1.5 flex flex-col border border-white/30">
                                            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">พื้นที่</span>
                                            <span className="text-xs font-black text-slate-700">{plot.areaRai.toFixed(1)} ไร่</span>
                                        </div>
                                        <div className="bg-emerald-50/50 rounded-lg px-2.5 py-1.5 flex flex-col border border-emerald-100/30">
                                            <span className="text-[9px] text-emerald-700/70 uppercase font-bold tracking-wider">คาร์บอน</span>
                                            <span className="text-xs font-black text-emerald-600">{plot.carbon.toFixed(0)} tCO₂e</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ==========================================
                CRYSTAL NAVBAR (Bottom) - DASHBOARD ACTIVE
                Exact Match to MapPage.jsx (http://localhost:3000/map)
            ========================================== */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
                <nav className="flex items-center gap-4 px-6 py-3 bg-black/20 backdrop-blur-2xl rounded-full border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:bg-black/30 transition-all duration-300">

                    {/* Home */}
                    <button
                        onClick={() => history.push('/')}
                        className="group relative flex flex-col items-center justify-center w-10 h-10 transition-all"
                    >
                        <div className="text-white/70 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                            <HomeIcon />
                        </div>
                        <span className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-white font-medium bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-md">หน้าหลัก</span>
                    </button>

                    {/* Map */}
                    <button
                        onClick={() => history.push('/map')}
                        className="group relative flex flex-col items-center justify-center w-10 h-10 transition-all"
                    >
                        <div className="text-white/70 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                            <MapIcon />
                        </div>
                        <span className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-white font-medium bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-md">แผนที่</span>
                    </button>

                    {/* Dashboard (Active - Blue Crystal) */}
                    <div className="relative flex flex-col items-center justify-center w-12 h-12">
                        <div className="absolute inset-0 bg-blue-500/80 blur-xl rounded-full opacity-40 animate-pulse" />
                        <div className="relative w-12 h-12 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white shadow-lg border border-white/20 transform scale-110">
                            <DashboardIcon />
                        </div>
                    </div>

                    {/* Personal */}
                    <button
                        onClick={() => history.push('/dashboard/personal')}
                        className="group relative flex flex-col items-center justify-center w-10 h-10 transition-all"
                    >
                        {userProfile?.picture ? (
                            <img src={userProfile.picture} alt="Profile" className="w-7 h-7 rounded-md object-cover group-hover:scale-110 transition-all duration-300" />
                        ) : (
                            <div className="text-white/70 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                                <UserIcon />
                            </div>
                        )}
                        <span className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-white font-medium bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-md">ส่วนตัว</span>
                    </button>

                    {/* History */}
                    <button
                        onClick={() => history.push('/dashboard/history')}
                        className="group relative flex flex-col items-center justify-center w-10 h-10 transition-all"
                    >
                        <div className="text-white/70 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                            <HistoryIcon />
                        </div>
                        <span className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-white font-medium bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-md">ประวัติ</span>
                    </button>
                </nav>
            </div>

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
