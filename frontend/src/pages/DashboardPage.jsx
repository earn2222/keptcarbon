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

const DashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
)

const LeafIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10a6 6 0 0 0-6-6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2a6 6 0 0 0-6 6Z" />
    </svg>
)

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
)

const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
)

const ListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
)

const LayersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
    </svg>
)

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
)

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
)

const HistoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
)

// ==========================================
// DASHBOARD COMPONENT
// ==========================================
function DashboardPage() {
    const history = useHistory()
    const mapContainer = useRef(null)
    const map = useRef(null)
    // Removed old popupRef in favor of selectedPlot logic

    // State
    const [mapLoaded, setMapLoaded] = useState(false)
    const [accumulatedPlots, setAccumulatedPlots] = useState([])
    const [selectedPlot, setSelectedPlot] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')

    // UI State for Panels
    const [activePanel, setActivePanel] = useState(null) // 'list', 'layers', null
    const [currentStyle, setCurrentStyle] = useState('satellite')

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
                    setActivePanel(null);

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
        setActivePanel(null); // Close panel after selection

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

    const locateUser = () => {
        if (!navigator.geolocation) {
            alert('ไม่สามารถระบุตำแหน่งได้');
            return;
        }
        navigator.geolocation.getCurrentPosition((pos) => {
            map.current.flyTo({
                center: [pos.coords.longitude, pos.coords.latitude],
                zoom: 15,
                pitch: 45
            });
            // Add User Marker
            new maplibregl.Marker({ color: '#3b82f6' })
                .setLngLat([pos.coords.longitude, pos.coords.latitude])
                .addTo(map.current);
        });
    }

    const changeMapStyle = (styleId) => {
        if (!map.current) return;
        const source = map.current.getSource('satellite-layer');

        const styleUrls = {
            satellite: 'https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
            streets: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            terrain: 'https://tile.opentopomap.org/{z}/{x}/{y}.png'
        };

        if (source && styleUrls[styleId]) {
            // Re-create source logic or just update tiles if supported by style (raster)
            // For simple Google/OSM raster switch, we can just replace the source definition or tiles
            // MapLibre doesn't allow setTiles easily on existing source without style reload, usually better to update source.
            // But here we initialized with 'satellite' source.
            const styleLayer = map.current.getSource('satellite');
            if (styleLayer) {
                styleLayer.setTiles([styleUrls[styleId]]);
            }
        }
        setCurrentStyle(styleId);
        setActivePanel(null);
    }


    const filteredPlots = accumulatedPlots.filter(p =>
        p.farmerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative w-full h-screen bg-slate-900 overflow-hidden font-sans">
            {/* Map Container */}
            <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

            {/* ==========================================
                TOP STATS BAR (DASHBOARD STYLE)
            ========================================== */}
            <div className="absolute top-4 left-4 right-4 z-30 flex justify-center">
                <div className="bg-black/20 backdrop-blur-2xl px-6 py-3 rounded-full shadow-lg border border-white/10 flex items-center gap-6 md:gap-8 hover:bg-black/30 transition-all duration-300">
                    {/* Total Plots */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <MapIcon />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">จำนวนแปลง</p>
                            <p className="text-lg font-black text-white">{stats.totalPlots} <span className="text-[10px] font-medium text-slate-300">แปลง</span></p>
                        </div>
                    </div>

                    <div className="hidden sm:block w-px h-8 bg-white/10"></div>

                    {/* Total Area */}
                    <div className="hidden sm:flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">พื้นที่รวม</p>
                            <p className="text-lg font-black text-white">{stats.totalArea.toFixed(1)} <span className="text-[10px] font-medium text-slate-300">ไร่</span></p>
                        </div>
                    </div>

                    <div className="hidden md:block w-px h-8 bg-white/10"></div>

                    {/* Total Carbon */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                            <LeafIcon />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">คาร์บอนรวม</p>
                            <p className="text-lg font-black text-white">{stats.totalCarbon.toFixed(2)} <span className="text-[10px] font-medium text-emerald-400">tCO₂e</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==========================================
                SIDE TOOLBAR (RIGHT) - LIKE MAP PAGE
            ========================================== */}
            <div className="absolute right-4 top-24 bottom-auto flex flex-col gap-3 z-30">
                {/* LIST BUTTON */}
                <button
                    onClick={() => setActivePanel(activePanel === 'list' ? null : 'list')}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all active:scale-95 ${activePanel === 'list' ? 'bg-emerald-500 text-white' : 'bg-white/95 backdrop-blur-xl text-slate-600 hover:text-emerald-500'}`}
                >
                    <ListIcon />
                </button>

                {/* LAYERS BUTTON */}
                <button
                    onClick={() => setActivePanel(activePanel === 'layers' ? null : 'layers')}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all active:scale-95 ${activePanel === 'layers' ? 'bg-emerald-500 text-white' : 'bg-white/95 backdrop-blur-xl text-slate-600 hover:text-emerald-500'}`}
                >
                    <LayersIcon />
                </button>


            </div>

            {/* ==========================================
                POPUP LIST PANEL (FLOATING)
            ========================================== */}
            {activePanel === 'list' && (
                <div className="absolute right-20 top-24 bottom-32 z-40 w-80 animate-slide-left">
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl h-full flex flex-col border border-white/50 overflow-hidden">
                        <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex justify-between items-center">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <ListIcon /> รายการแปลง
                            </h3>
                            <button onClick={() => setActivePanel(null)} className="bg-white/20 hover:bg-white/30 rounded p-1 transition-colors"><CloseIcon /></button>
                        </div>

                        {/* Search */}
                        <div className="p-3 border-b border-slate-100/50">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="ค้นหา..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <SearchIcon />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {filteredPlots.length === 0 ? (
                                <div className="text-center py-10 text-slate-400">
                                    <p>ไม่พบข้อมูลแปลง</p>
                                </div>
                            ) : (
                                filteredPlots.map(plot => (
                                    <button
                                        key={plot.id}
                                        onClick={() => handleZoomToPlot(plot)}
                                        className="w-full bg-white border border-slate-100 p-3 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-200 hover:bg-emerald-50 transition-all text-left group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-slate-800 group-hover:text-emerald-700">{plot.farmerName}</h4>
                                                <p className="text-xs text-slate-500">{plot.areaRai.toFixed(2)} ไร่ • {plot.variety}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-emerald-600">{plot.carbon.toFixed(2)}</p>
                                                <p className="text-[10px] text-emerald-400">tCO₂e</p>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ==========================================
                LAYERS PANEL (FLOATING)
            ========================================== */}
            {activePanel === 'layers' && (
                <div className="absolute right-20 top-36 z-40 animate-pop-in">
                    <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-2 border border-white/50 flex flex-col gap-1 w-40">
                        <div className="px-3 py-2 border-b border-slate-100 mb-1">
                            <span className="text-xs font-bold text-slate-400 uppercase">เลือกแผนที่</span>
                        </div>
                        {[
                            { id: 'satellite', label: 'ดาวเทียม', icon: '🛰️' },
                            { id: 'streets', label: 'แผนที่ถนน', icon: '🗺️' },
                            { id: 'terrain', label: 'ภูมิประเทศ', icon: '⛰️' }
                        ].map(style => (
                            <button
                                key={style.id}
                                onClick={() => changeMapStyle(style.id)}
                                className={`px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-colors flex items-center gap-2 ${currentStyle === style.id ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-slate-100 text-slate-700'
                                    }`}
                            >
                                <span className="text-base">{style.icon}</span> {style.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ==========================================
                SELECTED PLOT DETAIL CARD (Keep Dashboard Style)
            ========================================== */}
            {selectedPlot && (
                <div className="fixed bottom-24 md:bottom-24 left-4 right-4 md:left-auto md:right-auto md:w-80 md:left-1/2 md:-translate-x-1/2 z-40 animate-slide-up">
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                        {/* Header */}
                        <div className="bg-slate-50/50 p-4 border-b flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                                    <LeafIcon />
                                </div>
                                <div>
                                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">ข้อมูลแปลง</p>
                                    <h3 className="font-bold text-slate-800">{selectedPlot.farmerName}</h3>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedPlot(null)}
                                className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors shadow-sm"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-4">
                            {/* Carbon Highlight */}
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 text-center border border-emerald-100">
                                <p className="text-xs text-emerald-600 font-semibold mb-1 uppercase tracking-wide">คาร์บอนเครดิตสุทธิ</p>
                                <div className="flex items-baseline justify-center gap-1">
                                    <p className="text-4xl font-black text-emerald-600">{selectedPlot.carbon.toFixed(2)}</p>
                                    <p className="text-[10px] font-bold text-emerald-500">tCO₂e</p>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase">พื้นที่รวม</p>
                                    <p className="font-bold text-slate-700">{selectedPlot.areaRai.toFixed(2)} ไร่</p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase">พันธุ์ยาง</p>
                                    <p className="font-bold text-slate-700">{selectedPlot.variety}</p>
                                </div>
                            </div>

                            {/* Action */}
                            <button
                                onClick={() => history.push('/map')}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors active:scale-98 shadow-lg"
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
                FLOATING NAVBAR (Bottom) - MAP PAGE STYLE
            ========================================== */}
            {/* ==========================================
                CRYSTAL NAVBAR (Bottom)
            ========================================== */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
                <nav className="flex items-center gap-4 px-6 py-3 bg-black/20 backdrop-blur-2xl rounded-full border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:bg-black/30 transition-all duration-300">

                    {/* Home */}
                    <button
                        onClick={() => history.push('/')}
                        className="group relative flex flex-col items-center justify-center w-10 h-10 transition-all"
                    >
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-full blur-md transition-all sm:hidden" />
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

                    {/* Dashboard (Active) */}
                    <div className="relative flex flex-col items-center justify-center w-12 h-12">
                        <div className="absolute inset-0 bg-emerald-500/80 blur-xl rounded-full opacity-40 animate-pulse" />
                        <div className="relative w-12 h-12 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center text-white shadow-lg border border-white/20 transform scale-110">
                            <DashboardIcon />
                        </div>
                    </div>

                    {/* Personal */}
                    <button
                        onClick={() => history.push('/dashboard?view=personal')}
                        className="group relative flex flex-col items-center justify-center w-10 h-10 transition-all"
                    >
                        <div className="text-white/70 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                            <UserIcon />
                        </div>
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
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out forwards;
                }
                
                @keyframes slide-left {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slide-left { animation: slide-left 0.3s ease-out forwards; }

                @keyframes pop-in {
                    from { opacity: 0; transform: scale(0.9) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-pop-in { animation: pop-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

                .maplibregl-ctrl-attrib, .maplibregl-ctrl-logo {
                    display: none !important;
                }
            `}</style>
        </div>
    )
}

export default DashboardPage
