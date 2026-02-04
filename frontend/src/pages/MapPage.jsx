import React, { useState, useEffect, useRef, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { provinceCoords } from '../data/province-coords'
import * as turf from '@turf/turf'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import WorkflowModal from '../components/organisms/WorkflowModal'
import { getPlots, createPlot } from '../services/api'

// ==========================================
// THAI ADDRESS DATA (Compact)
// ==========================================
const thaiProvinces = Object.keys(provinceCoords)

// ==========================================
// MAP STYLES / BASEMAPS
// ==========================================
const mapStyles = {
    satellite: {
        name: 'ดาวเทียม',
        url: 'https://api.maptiler.com/maps/hybrid/style.json?key=get_your_own_key',
        // Fallback to OSM Raster for demo
        fallbackTiles: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
    },
    streets: {
        name: 'ถนน',
        url: 'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_key',
        fallbackTiles: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    },
    terrain: {
        name: 'ภูมิประเทศ',
        url: 'https://api.maptiler.com/maps/outdoor/style.json?key=get_your_own_key',
        fallbackTiles: 'https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg'
    },
    dark: {
        name: 'มืด',
        url: 'https://api.maptiler.com/maps/backdrop-dark/style.json?key=get_your_own_key',
        fallbackTiles: 'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png'
    }
}

// ==========================================
// ICON COMPONENTS
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

const LayersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
    </svg>
)

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
)

const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
)

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
)

const PencilIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
)

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
)

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
)

const TargetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20v2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M22 12h-2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 12H2" />
    </svg>
)

const ZoomInIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
)

const ZoomOutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
)

const CompassIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
        <polygon points="12,6 14,12 12,18 10,12" fill="#ef4444" />
        <polygon points="12,6 10,12 12,18 14,12" fill="#374151" opacity="0.6" />
    </svg>
)

const GlobeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
)

const DrawPolygonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M21 7.374l-2 2V12.5a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5v-1a1 1 0 00-1-1h-1a1 1 0 00-1 1v1h-1v-2a2 2 0 012-2h1a3 3 0 10-2-5.732 2 2 0 01-2 2h-1v-1a1 1 0 00-1-1h-1a1 1 0 00-1 1v1a1 1 0 001 1h1v1h-1a2 2 0 01-2-2V5.5a3 3 0 10-2 0V7a3 3 0 102 5.732 2 2 0 012-2h1v1a1 1 0 001 1h1a1 1 0 001-1v-1h1v1.5a1.5 1.5 0 001.5 1.5h2a1.5 1.5 0 001.5-1.5v-3.126l2-2v4.252a1 1 0 002 0v-6.378a1 1 0 00-2 0v4.252z" />
    </svg>
)

const PointerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M13.162 18.994l4.544 2.324a.5.5 0 00.714-.542l-.993-4.834 3.723-3.033a.5.5 0 00-.28-.888l-5.011-.423-2.008-4.634a.5.5 0 00-.918 0l-2.008 4.634-5.011.423a.5.5 0 00-.28.888l3.723 3.033-.993 4.834a.5.5 0 00.714.542l4.544-2.324z" />
    </svg>
)

const MoveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M18 11V8l4 4-4 4v-3h-5v5h3l-4 4-4-4h3v-5H6v3l-4-4 4-4v3h5V6H8l4-4 4 4h-3v5h5z" />
    </svg>
)

const TrashIconSmall = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5 0l.508 8.5a.75.75 0 101.5-.09l-.508-8.41zm5.98 0a.75.75 0 10-1.5 0l-.508 8.41a.75.75 0 001.5.09l.508-8.5z" clipRule="evenodd" />
    </svg>
)

// ==========================================
// MAIN MAP COMPONENT
// ==========================================
function MapPage() {
    const mapContainer = useRef(null)
    const map = useRef(null)
    const userMarker = useRef(null)

    // State
    const [mapLoaded, setMapLoaded] = useState(false)
    const [currentStyle, setCurrentStyle] = useState('satellite')
    const [showLayerPanel, setShowLayerPanel] = useState(false)
    const [showSearchPanel, setShowSearchPanel] = useState(false)
    const [showFABMenu, setShowFABMenu] = useState(false)
    const [workflowModal, setWorkflowModal] = useState({ isOpen: false, mode: null })
    const [digitizeMode, setDigitizeMode] = useState(false)
    const [activeTool, setActiveTool] = useState(null)
    const [savedPlots, setSavedPlots] = useState([])
    const [pendingPlots, setPendingPlots] = useState([])
    const [previewPlots, setPreviewPlots] = useState([])
    const [coordinates, setCoordinates] = useState({ lat: 13.7563, lng: 100.5018, zoom: 5 })
    const [selectedPlotForPopup, setSelectedPlotForPopup] = useState(null)
    const popupRef = useRef(null)

    // Draw state
    const draw = useRef(null)

    // Search state
    const [selectedProvince, setSelectedProvince] = useState('')
    const [provinceSearch, setProvinceSearch] = useState('')
    const [filteredProvinces, setFilteredProvinces] = useState(thaiProvinces)



    // ==========================================
    // INITIALIZE MAP
    // ==========================================
    useEffect(() => {
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

        // Fetch existing plots from API
        const loadInitialPlots = async () => {
            try {
                const plots = await getPlots();
                if (plots && Array.isArray(plots)) {
                    const processed = plots.map(p => {
                        let geometry = p.geometry;
                        if (typeof geometry === 'string') {
                            try { geometry = JSON.parse(geometry); } catch (e) { }
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
                            variety: p.notes?.includes('พันธุ์:') ? p.notes.split('พันธุ์:')[1]?.trim() : (p.variety || 'PB 235')
                        };
                    });
                    setSavedPlots(processed.filter(p => p.geometry));
                }
            } catch (err) {
                console.error('Failed to load plots for map:', err);
            }
        };

        loadInitialPlots();

        // Enable 3D Globe projection
        map.current.on('load', () => {
            // Set globe projection (MapLibre GL v4+)
            try {
                map.current.setProjection({ type: 'globe' })
                console.log('Globe projection enabled');
            } catch (e) {
                console.log('Globe projection not available, using mercator')
            }

            // Add atmosphere effect (optional - only if supported)
            try {
                if (map.current.setFog) {
                    map.current.setFog({
                        color: 'rgb(186, 210, 235)',
                        'high-color': 'rgb(36, 92, 223)',
                        'horizon-blend': 0.02,
                        'space-color': 'rgb(11, 11, 25)',
                        'star-intensity': 0.6
                    })
                    console.log('Fog effect enabled');
                } else {
                    console.log('Fog effect not supported in this MapLibre version');
                }
            } catch (e) {
                console.log('Failed to set fog, continuing without it:', e.message)
            }

            setMapLoaded(true)
            setMapLoaded(true)
            startIntroAnimation()

            // Initialize Draw Control
            if (!draw.current) {
                console.log('✨ Initializing MapboxDraw Control...');
                try {
                    draw.current = new MapboxDraw({
                        displayControlsDefault: false,
                        controls: {},
                        defaultMode: 'simple_select',
                        styles: [
                            // ACTIVE (being drawn)
                            // line stroke
                            {
                                "id": "gl-draw-line",
                                "type": "line",
                                "filter": ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
                                "layout": {
                                    "line-cap": "round",
                                    "line-join": "round"
                                },
                                "paint": {
                                    "line-color": "#10b981",
                                    "line-dasharray": [0.2, 2],
                                    "line-width": 2
                                }
                            },
                            // polygon fill
                            {
                                "id": "gl-draw-polygon-fill-active",
                                "type": "fill",
                                "filter": ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
                                "paint": {
                                    "fill-color": "#10b981",
                                    "fill-outline-color": "#10b981",
                                    "fill-opacity": 0.2
                                }
                            },
                            // polygon mid points
                            {
                                "id": "gl-draw-polygon-midpoint",
                                "type": "circle",
                                "filter": ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
                                "paint": {
                                    "circle-radius": 3,
                                    "circle-color": "#fbb03b"
                                }
                            },
                            // polygon outline stroke
                            {
                                "id": "gl-draw-polygon-stroke-active",
                                "type": "line",
                                "filter": ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
                                "layout": {
                                    "line-cap": "round",
                                    "line-join": "round"
                                },
                                "paint": {
                                    "line-color": "#10b981",
                                    "line-dasharray": [0.2, 2],
                                    "line-width": 2
                                }
                            },
                            // vertex point halos
                            {
                                "id": "gl-draw-polygon-and-line-vertex-halo-active",
                                "type": "circle",
                                "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
                                "paint": {
                                    "circle-radius": 5,
                                    "circle-color": "#FFF"
                                }
                            },
                            // vertex points
                            {
                                "id": "gl-draw-polygon-and-line-vertex-active",
                                "type": "circle",
                                "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
                                "paint": {
                                    "circle-radius": 3,
                                    "circle-color": "#10b981"
                                }
                            },
                            // STATIC
                            {
                                "id": "gl-draw-polygon-fill-static",
                                "type": "fill",
                                "filter": ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
                                "paint": {
                                    "fill-color": "#404040",
                                    "fill-outline-color": "#404040",
                                    "fill-opacity": 0.1
                                }
                            },
                            {
                                "id": "gl-draw-polygon-stroke-static",
                                "type": "line",
                                "filter": ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
                                "layout": {
                                    "line-cap": "round",
                                    "line-join": "round"
                                },
                                "paint": {
                                    "line-color": "#404040",
                                    "line-width": 2
                                }
                            }
                        ]
                    });

                    // Add control to map
                    if (map.current.hasControl(draw.current)) {
                        map.current.removeControl(draw.current);
                    }
                    map.current.addControl(draw.current, 'top-right');
                    console.log('✅ Draw Control added to top-right');

                } catch (e) {
                    console.error('Failed to init draw control:', e);
                }
            }

            // Listen for drawing events
            map.current.on('draw.create', updateArea)
            map.current.on('draw.update', updateArea)
            map.current.on('draw.delete', updateArea)
        })

        // Update coordinates on move
        map.current.on('move', () => {
            const center = map.current.getCenter()
            setCoordinates({
                lat: center.lat.toFixed(5),
                lng: center.lng.toFixed(5),
                zoom: map.current.getZoom().toFixed(1)
            })
        })

        // Click handler for plots
        map.current.on('click', 'saved-plots-layer', (e) => {
            if (!e.features.length) return;
            const feature = e.features[0];
            const plotData = JSON.parse(feature.properties.allData);
            const coordinates = e.lngLat;

            // Remove existing popup
            if (popupRef.current) popupRef.current.remove();

            // Create new popup - Compact Minimal Design
            // Create new popup - Compact Minimal Design
            const popup = new maplibregl.Popup({
                closeButton: false,
                maxWidth: '300px', // Increased width
                anchor: 'bottom',
                offset: [0, -10],
                className: 'minimal-popup'
            })
                .setLngLat(coordinates)
                .setHTML(`
                <div class="m-card">
                    <!-- Header -->
                    <div class="m-header">
                        <div class="m-badge">
                            <span class="m-dot"></span>
                            ข้อมูลรายแปลง
                        </div>
                        <button id="open-edit-btn-${plotData.id}" class="m-edit-btn" title="แก้ไขข้อมูล">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                        </button>
                    </div>
                    
                    <!-- Name -->
                    <h2 class="m-name">${plotData.farmerName}</h2>
                    
                    <!-- Info Row -->
                    <div class="m-info">
                        <div class="m-col">
                            <span class="m-label">ปีที่ปลูก / อายุ</span>
                            <span class="m-val">พ.ศ. ${plotData.plantingYearBE || '-'} (${plotData.age || '-'} ปี)</span>
                        </div>
                        <div class="m-col m-right" style="padding-left: 12px;">
                            <span class="m-label">พันธุ์ยาง</span>
                            <span class="m-val">${plotData.variety || 'RRIM 600'}</span>
                        </div>
                    </div>
                    
                    <!-- Carbon -->
                    <div class="m-carbon">
                        <span class="m-carbon-label">ปริมาณคาร์บอนสุทธิ</span>
                        <div class="m-carbon-row">
                            <span class="m-carbon-num">${plotData.carbon || '0.00'}</span>
                            <span class="m-carbon-unit">TCO<sub>2</sub>E</span>
                        </div>
                        <span class="m-method">${plotData.method || 'สมการที่ 1 (0.118 × DBH^2.53)'}</span>
                    </div>
                </div>
            `)
                .addTo(map.current);

            popupRef.current = popup;

            // Handle button click in popup
            setTimeout(() => {
                const btn = document.getElementById(`open-edit-btn-${plotData.id}`);
                if (btn) {
                    btn.onclick = (event) => {
                        event.stopPropagation();
                        setWorkflowModal({
                            isOpen: true,
                            mode: 'draw',
                            initialData: plotData,
                            isEditing: true
                        });
                        popup.remove();
                    };
                }
            }, 50);

            // Zoom to plot
            if (feature.geometry) {
                const bbox = turf.bbox(feature);
                map.current.fitBounds(bbox, {
                    padding: { top: 120, bottom: 250, left: 120, right: window.innerWidth > 640 ? 450 : 120 },
                    maxZoom: 18,
                    duration: 1000
                });
            }
        });

        // Change cursor on hover
        map.current.on('mouseenter', 'saved-plots-layer', () => {
            map.current.getCanvas().style.cursor = 'pointer';
        });
        map.current.on('mouseleave', 'saved-plots-layer', () => {
            map.current.getCanvas().style.cursor = '';
        });

        return () => {
            if (map.current) {
                map.current.remove()
                map.current = null
            }
        }
    }, [])

    // ==========================================
    // HANDLE URL PARAMS (Edit Plot)
    // ==========================================
    useEffect(() => {
        if (!mapLoaded || savedPlots.length === 0) return;

        const params = new URLSearchParams(window.location.search);
        const editPlotId = params.get('editPlotId');

        if (editPlotId) {
            const plot = savedPlots.find(p => p.id.toString() === editPlotId);
            if (plot) {
                console.log('Found plot to edit:', plot);
                // Zoom to plot
                handleZoomToPlot(plot.geometry);

                // Open Popup REMOVED
                // setSelectedPlotForPopup(plot); // User requested no popup

                // Clear URL param to prevent re-triggering (optional but good UI)
                const newUrl = window.location.pathname;
                window.history.replaceState({}, '', newUrl);
            }
        }
    }, [mapLoaded, savedPlots]);

    // ==========================================
    // RENDER SELECTED POPUP (Effect)
    // ==========================================
    useEffect(() => {
        if (!map.current || !selectedPlotForPopup) return;

        const plot = selectedPlotForPopup;
        // Close existing popup if any
        const existingPopups = document.getElementsByClassName('mapboxgl-popup');
        if (existingPopups.length > 0) {
            Array.from(existingPopups).forEach(p => p.remove());
        }

        // Determine center for popup
        let coordinates;
        if (plot.geometry.type === 'Point') {
            coordinates = plot.geometry.coordinates;
        } else {
            // Use centroid for polygon
            const center = turf.center(plot.geometry);
            coordinates = center.geometry.coordinates;
        }

        // Create Popup HTML (Reuse the design from click handler)
        const htmlContent = `
            <div style="font-family: 'Inter', sans-serif; min-width: 220px; padding: 4px;">
                <h4 style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 2px;">${plot.farmerName}</h4>
                <p style="font-size: 11px; color: #64748b; margin-bottom: 8px;">แปลง ID: ${plot.id}</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; background: #f8fafc; padding: 8px; border-radius: 8px;">
                     <div>
                        <span style="display: block; font-size: 10px; color: #94a3b8;">พื้นที่ (ไร่)</span>
                        <span style="display: block; font-size: 12px; font-weight: 600; color: #475569;">${plot.areaRai}</span>
                    </div>
                    <div>
                        <span style="display: block; font-size: 10px; color: #94a3b8;">คาร์บอน (tCO2e)</span>
                        <span style="display: block; font-size: 12px; font-weight: 600; color: #10b981;">${plot.carbon}</span>
                    </div>
                </div>
                <div style="background: #ecfdf5; color: #047857; text-align: center; padding: 6px; border-radius: 6px; font-size: 11px; font-weight: 600;">
                    คุณกำลังดูแปลงนี้
                </div>
            </div>
        `;

        new maplibregl.Popup({ closeButton: true, maxWidth: '300px', className: 'custom-popup-auto' })
            .setLngLat(coordinates)
            .setHTML(htmlContent)
            .addTo(map.current);

    }, [selectedPlotForPopup]);

    // ==========================================
    // MAP DATA SYNC & DRAWING LOGIC
    // ==========================================
    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        const allPlots = [...savedPlots, ...pendingPlots, ...previewPlots];

        // Add Source if not exists
        if (!map.current.getSource('saved-plots')) {
            map.current.addSource('saved-plots', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: allPlots.map(plot => ({
                        type: 'Feature',
                        geometry: plot.geometry,
                        properties: {
                            id: plot.id,
                            farmerName: plot.farmerName,
                            carbon: plot.carbon,
                            isPending: plot.isPending || false,
                            isPreview: plot.isPreview || false,
                            allData: JSON.stringify(plot)
                        }
                    }))
                }
            });

            map.current.addLayer({
                id: 'saved-plots-layer',
                type: 'fill',
                source: 'saved-plots',
                layout: {},
                paint: {
                    'fill-color': [
                        'case',
                        ['get', 'isPreview'], '#3b82f6',
                        ['get', 'isPending'], '#fbbf24',
                        '#10b981'
                    ],
                    'fill-opacity': 0.3,
                    'fill-outline-color': [
                        'case',
                        ['get', 'isPreview'], '#2563eb',
                        ['get', 'isPending'], '#d97706',
                        '#059669'
                    ]
                }
            });

            map.current.addLayer({
                id: 'saved-plots-outline',
                type: 'line',
                source: 'saved-plots',
                paint: {
                    'line-color': [
                        'case',
                        ['get', 'isPreview'], '#2563eb',
                        ['get', 'isPending'], '#d97706',
                        '#059669'
                    ],
                    'line-width': 2
                }
            });
        } else {
            // Update Source
            map.current.getSource('saved-plots').setData({
                type: 'FeatureCollection',
                features: allPlots.map(plot => ({
                    type: 'Feature',
                    geometry: plot.geometry,
                    properties: {
                        id: plot.id,
                        farmerName: plot.farmerName,
                        carbon: plot.carbon,
                        isPending: plot.isPending || false,
                        isPreview: plot.isPreview || false,
                        allData: JSON.stringify(plot)
                    }
                }))
            });
        }
    }, [savedPlots, pendingPlots, previewPlots, mapLoaded]);

    const handleSavePlot = (plotData, isFinalSave = false) => {
        if (isFinalSave) {
            finalizeAllPending();
            return;
        }

        const timestamp = Date.now();

        let geometry = plotData?.geometry;
        if (!geometry && draw.current) {
            const data = draw.current.getAll();
            if (data.features.length > 0) {
                geometry = data.features[0].geometry;
            }
        }

        if (!geometry) {
            alert('ไม่พบข้อมูลพิกัดแปลง กรุณาวาดใหม่อีกครั้ง');
            return;
        }

        const newPlot = {
            ...plotData,
            id: plotData.id || timestamp,
            isPending: true,
            geometry: geometry
        };

        if (plotData.id) {
            setPendingPlots(prev => prev.map(p => p.id === plotData.id ? newPlot : p));
        } else {
            setPendingPlots(prev => [...prev, newPlot]);
        }

        // Clear drawing
        if (draw.current) {
            draw.current.deleteAll();
            draw.current.changeMode('simple_select');
        }

        setWorkflowModal({ isOpen: false, mode: null });
        setDigitizeMode(false);
    };

    const handleAddAnother = (plotData) => {
        const timestamp = Date.now();
        const newPlot = {
            ...plotData,
            id: plotData.id || timestamp,
            isPending: true
        };
        setPendingPlots(prev => [...prev, newPlot]);

        // Clear drawing if needed
        if (draw.current) {
            draw.current.deleteAll();
        }
    };

    const handleUpdateBasicInfo = (info) => {
        setCurrentSessionInfo(info);
        // Auto Recalculate all plots if needed
        if (pendingPlots.length > 0) {
            const updatedPlots = pendingPlots.map(plot => {
                // Mock recalculation logic
                const age = new Date().getFullYear() - parseInt(info.plantingYear);
                const newCarbon = (parseFloat(plot.areaSqm) * 0.05 * (age / 10)).toFixed(2);
                return { ...plot, ...info, age, carbon: newCarbon };
            });
            setPendingPlots(updatedPlots);
        }
    };

    const finalizeAllPending = async () => {
        if (pendingPlots.length === 0) return;

        try {
            console.log('Finalizing plots:', pendingPlots);
            const savePromises = pendingPlots.map(p => {
                // Parse geometry if it's a string, otherwise use as is
                let geometryObj = p.geometry;
                if (typeof geometryObj === 'string') {
                    try {
                        geometryObj = JSON.parse(geometryObj);
                    } catch (e) {
                        console.error('Failed to parse geometry string:', e);
                    }
                }

                const apiData = {
                    name: p.farmerName || 'ไม่ระบุชื่อ',
                    planting_year: p.plantingYearBE ? parseInt(p.plantingYearBE) - 543 : new Date().getFullYear(),
                    geometry: geometryObj,
                    notes: `พันธุ์: ${p.variety || 'RRIM 600'}${p.notes ? ' | ' + p.notes : ''}`
                };

                console.log('Sending apiData to createPlot:', apiData);
                return createPlot(apiData);
            });

            const results = await Promise.all(savePromises);
            console.log('Successfully saved plots:', results);

            // Map results back to local format if needed
            const newlySaved = results.map((result, index) => ({
                ...pendingPlots[index],
                id: result.id,
                isPending: false
            }));

            setSavedPlots(prev => [...prev, ...newlySaved]);
            setPendingPlots([]);
            alert(`บันทึกเรียบร้อยทั้งหมด ${newlySaved.length} แปลง!\nข้อมูลพร้อมแสดงผลบนแดชบอร์ดแล้ว`);
        } catch (err) {
            console.error('Failed to save plots to API:', err);
            const errorMsg = err.message || 'Unknown error';
            alert(`เกิดข้อผิดพลาดในการบันทึกข้อมูล:\n${errorMsg}\n\nกรุณาตรวจสอบว่าเซิร์ฟเวอร์ Backend ทำงานอยู่ที่พอร์ต 8000`);
        }
    };

    const handleZoomToPlot = (geometry) => {
        if (!map.current || !geometry) return;
        try {
            const feature = geometry.type === 'FeatureCollection' ? geometry : turf.feature(geometry);
            const bbox = turf.bbox(feature);
            map.current.fitBounds(bbox, {
                padding: 100,
                maxZoom: 20, // Maximum satellite zoom
                duration: 2000
            });

            // Add a temporary pulsing marker to clearly show location
            const center = turf.center(feature);
            const el = document.createElement('div');
            el.className = 'edit-target-marker';
            el.innerHTML = `
                <div style="position: relative; display: flex; flex-direction: column; items-align: center;">
                    <div style="width: 20px; height: 20px; background: #ef4444; border-radius: 50%; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); animation: pulse-red 2s infinite;"></div>
                    <div style="position: absolute; top: 24px; left: 50%; transform: translateX(-50%); white-space: nowrap; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                        แปลงที่เลือก
                    </div>
                </div>
                <style>
                    @keyframes pulse-red {
                        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                        70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
                        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                    }
                </style>
            `;

            // Remove existing edit markers
            const existingMarkers = document.getElementsByClassName('edit-target-marker');
            while (existingMarkers[0]) {
                existingMarkers[0].parentNode.remove();
            }

            new maplibregl.Marker({ element: el })
                .setLngLat(center.geometry.coordinates)
                .addTo(map.current);

        } catch (err) {
            console.error('Zoom error:', err);
        }
    };

    // ==========================================
    // INTRO ANIMATION - Globe to Thailand
    // ==========================================
    // ==========================================
    // INTRO ANIMATION - Globe to Thailand
    // ==========================================
    const startIntroAnimation = useCallback(() => {
        if (!map.current) return

        // Check if we are in "Edit Mode" (coming from Dashboard)
        // If so, skip the intro animation to avoid conflicting with the plot zoom
        const params = new URLSearchParams(window.location.search);
        if (params.get('editPlotId')) {
            console.log('Skipping intro animation due to edit mode');
            // Ensure we are in a reasonable view if plot zoom fails, but don't force fly
            map.current.jumpTo({
                center: [100.5018, 13.7563],
                zoom: 6, // Closer start for Thailand
                pitch: 0
            });
            return;
        }

        // Start from space view
        map.current.easeTo({
            center: [100.5018, 13.7563],
            zoom: 1.5,
            pitch: 0,
            bearing: 0,
            duration: 0
        })

        // After a tiny delay, zoom to Thailand
        setTimeout(() => {
            map.current.flyTo({
                center: [100.5018, 13.7563],
                zoom: 6,
                pitch: 45,
                bearing: 15,
                duration: 3500,
                essential: true,
                curve: 1.5
            })
        }, 100)
    }, [])

    // ==========================================
    // CHANGE MAP STYLE
    // ==========================================
    const changeMapStyle = (styleKey) => {
        if (!map.current) return

        const tiles = {
            satellite: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
            streets: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            terrain: 'https://tile.opentopomap.org/{z}/{x}/{y}.png',
            dark: 'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png'
        }

        // Update tile source
        const source = map.current.getSource('satellite')
        if (source) {
            source.setTiles([tiles[styleKey]])
        }

        setCurrentStyle(styleKey)
        setShowLayerPanel(false)
    }

    // ==========================================
    // LOCATE USER
    // ==========================================
    const locateUser = () => {
        if (!navigator.geolocation) {
            alert('เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง')
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords

                map.current.flyTo({
                    center: [longitude, latitude],
                    zoom: 14,
                    pitch: 45,
                    duration: 2000
                })

                // Add or update user marker
                if (userMarker.current) {
                    userMarker.current.setLngLat([longitude, latitude])
                } else {
                    // Create custom marker element
                    const el = document.createElement('div')
                    el.className = 'user-marker'
                    el.innerHTML = `
                        <div class="user-marker-pulse"></div>
                        <div class="user-marker-dot"></div>
                    `

                    userMarker.current = new maplibregl.Marker({ element: el })
                        .setLngLat([longitude, latitude])
                        .addTo(map.current)
                }
            },
            (error) => {
                alert('ไม่สามารถระบุตำแหน่งได้: ' + error.message)
            },
            { enableHighAccuracy: true }
        )
    }

    // ==========================================
    // SEARCH PROVINCE
    // ==========================================
    useEffect(() => {
        if (provinceSearch) {
            const filtered = thaiProvinces.filter(p =>
                p.includes(provinceSearch)
            )
            setFilteredProvinces(filtered)
        } else {
            setFilteredProvinces(thaiProvinces)
        }
    }, [provinceSearch])

    const flyToProvince = (province) => {
        const coords = provinceCoords[province]
        if (coords && map.current) {
            map.current.flyTo({
                center: [coords[1], coords[0]], // Note: coords are [lat, lng], MapLibre uses [lng, lat]
                zoom: 10,
                pitch: 45,
                bearing: 0,
                duration: 2500
            })
            setSelectedProvince(province)
            setShowSearchPanel(false)
        }
    }

    // ==========================================
    // DIGITIZE LOGIC
    // ==========================================
    const startDigitizing = () => {
        console.log('Attempting to start digitizing...', {
            drawExists: !!draw.current,
            mapExists: !!map.current,
            mapLoaded
        });

        if (!draw.current) {
            alert('เครื่องมือวาดกำลังโหลด กรุณารอสักครู่...');
            return;
        }

        try {
            setDigitizeMode(true);
            console.log('Setting mode to draw_polygon');
            draw.current.changeMode('draw_polygon');
            console.log('Draw mode changed successfully');
        } catch (err) {
            console.error('Failed to start drawing:', err);
            alert('เกิดข้อผิดพลาดในการเปิดเครื่องมือวาด กรุณาลองใหม่อีกครั้ง');
        }
    }

    const cancelDigitizing = () => {
        if (!draw.current) return
        try {
            draw.current.changeMode('simple_select')
            draw.current.deleteAll()
            setDigitizeMode(false)
            console.log('Digitizing cancelled');
        } catch (err) {
            console.error('Error cancelling:', err);
        }
    }

    const finishDigitizing = () => {
        if (!draw.current) {
            alert('ไม่พบเครื่องมือวาด');
            return;
        }

        try {
            const data = draw.current.getAll()

            if (data.features.length > 0) {
                const currentFeature = data.features[0];
                const areaSqm = turf.area(currentFeature);
                const areaRaiTotal = areaSqm / 1600;
                const rai = Math.floor(areaRaiTotal);
                const ngan = Math.floor((areaRaiTotal - rai) * 4);
                const sqWah = ((areaRaiTotal - rai - ngan / 4) * 400).toFixed(1);

                setWorkflowModal({
                    isOpen: true,
                    mode: 'draw',
                    initialData: {
                        geometry: currentFeature.geometry,
                        areaSqm: areaSqm.toFixed(2),
                        areaRai: rai,
                        areaNgan: ngan,
                        areaSqWah: sqWah
                    }
                });
                console.log('Digitizing finished, current plot area calculated');
            } else {
                alert('กรุณาวาดพื้นที่บนแผนที่ก่อน');
            }
        } catch (err) {
            console.error('Error finishing digitizing:', err);
            alert('เกิดข้อผิดพลาดในการคำนวณพื้นที่');
        }
    }

    function updateArea(e) {
        if (!draw.current) return;
        try {
            const data = draw.current.getAll()
            if (data.features.length > 0) {
                // Can show live area HUD here if needed
                console.log('Area updated:', turf.area(data.features[0]));
            }
        } catch (err) {
            console.error('Error updating area:', err);
        }
    }

    // ==========================================
    // DRAWING TOOLBAR TOOL MANAGEMENT
    // ==========================================
    const switchTool = (tool) => {
        if (!draw.current || !digitizeMode) return;

        try {
            // If clicking the same tool, deactivate it
            if (activeTool === tool) {
                draw.current.changeMode('simple_select');
                setActiveTool(null);
                return;
            }

            // Switch to the new tool
            switch (tool) {
                case 'draw':
                    draw.current.changeMode('draw_polygon');
                    setActiveTool('draw');
                    break;
                case 'edit':
                    const features = draw.current.getAll().features;
                    if (features.length > 0) {
                        draw.current.changeMode('direct_select', { featureId: features[0].id });
                        setActiveTool('edit');
                    } else {
                        alert('กรุณาวาดแปลงก่อน');
                    }
                    break;
                case 'select':
                    draw.current.changeMode('simple_select');
                    setActiveTool('select');
                    break;
                default:
                    draw.current.changeMode('simple_select');
                    setActiveTool(null);
            }
        } catch (err) {
            console.error('Error switching tool:', err);
        }
    };

    const handleDeletePlot = () => {
        if (!draw.current) return;

        const features = draw.current.getAll().features;
        if (features.length === 0) {
            alert('ไม่มีแปลงให้ลบ');
            return;
        }

        // Confirmation dialog
        const confirmed = window.confirm(
            `คุณต้องการลบแปลงทั้งหมด ${features.length} แปลงใช่หรือไม่?\n\nการกระทำนี้ไม่สามารถย้อนกลับได้`
        );

        if (confirmed) {
            try {
                const ids = features.map(f => f.id);
                draw.current.delete(ids);
                setActiveTool(null);
                console.log(`Deleted ${ids.length} plot(s)`);
            } catch (err) {
                console.error('Error deleting plots:', err);
                alert('เกิดข้อผิดพลาดในการลบแปลง');
            }
        }
    };

    // Auto-activate draw tool when digitize mode starts
    useEffect(() => {
        if (digitizeMode && draw.current) {
            setActiveTool('draw');
        } else {
            setActiveTool(null);
        }
    }, [digitizeMode]);

    // ==========================================
    // NAVIGATION HANDLERS
    // ==========================================
    const handleNavClick = (route) => {
        window.location.href = route
    }

    // ==========================================
    // ZOOM CONTROLS
    // ==========================================
    const zoomIn = () => map.current?.zoomIn({ duration: 300 })
    const zoomOut = () => map.current?.zoomOut({ duration: 300 })
    const resetNorth = () => {
        map.current?.easeTo({
            bearing: 0,
            pitch: 0,
            duration: 500
        })
    }

    return (
        <div className="relative w-full h-screen bg-slate-900 overflow-hidden">
            {/* ==========================================
                MAP CONTAINER
            ========================================== */}
            <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

            {/* ==========================================
                CRYSTAL COORDINATES (Top Left)
            ========================================== */}
            <div className="absolute top-6 left-6 z-30">
                <div className="bg-black/20 backdrop-blur-xl rounded-2xl px-5 py-3 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 hover:bg-black/30 hover:border-white/20 group">
                    <div className="flex items-center gap-8">
                        {/* Latitude */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-all duration-300">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2v20M2 12h20" />
                                    <circle cx="12" cy="12" r="10" opacity="0.3" />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em] leading-none mb-1">LAT</span>
                                <span className="text-[13px] text-white/90 font-mono tracking-tight tabular-nums leading-none">{coordinates.lat}</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-6 bg-white/10" />

                        {/* Longitude */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-all duration-300">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 2v20" opacity="0.3" />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em] leading-none mb-1">LNG</span>
                                <span className="text-[13px] text-white/90 font-mono tracking-tight tabular-nums leading-none">{coordinates.lng}</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-6 bg-white/10" />

                        {/* Zoom */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-all duration-300">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.3-4.3" />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em] leading-none mb-1">ZOOM</span>
                                <span className="text-[13px] text-emerald-400 font-mono font-black tracking-tight tabular-nums leading-none">{coordinates.zoom}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==========================================
                CRYSTAL TOP RIGHT CONTROLS
            ========================================== */}
            <div className="absolute top-6 right-6 z-30 flex flex-col gap-3">
                {/* Search Button */}
                <button
                    onClick={() => setShowSearchPanel(!showSearchPanel)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-xl border transition-all duration-300 active:scale-90 shadow-[0_8px_32px_rgba(0,0,0,0.3)]
                        ${showSearchPanel
                            ? 'bg-emerald-500/80 text-white border-emerald-400/50 shadow-emerald-500/20'
                            : 'bg-black/20 text-white/70 border-white/10 hover:bg-black/40 hover:text-white hover:border-white/20'
                        }`}
                >
                    <SearchIcon />
                </button>

                {/* Layers Button */}
                <button
                    onClick={() => setShowLayerPanel(!showLayerPanel)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-xl border transition-all duration-300 active:scale-90 shadow-[0_8px_32px_rgba(0,0,0,0.3)]
                        ${showLayerPanel
                            ? 'bg-emerald-500/80 text-white border-emerald-400/50 shadow-emerald-500/20'
                            : 'bg-black/20 text-white/70 border-white/10 hover:bg-black/40 hover:text-white hover:border-white/20'
                        }`}
                >
                    <LayersIcon />
                </button>

                {/* My Location Button */}
                <button
                    onClick={locateUser}
                    className="w-12 h-12 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/70 hover:text-emerald-400 hover:bg-black/40 hover:border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 active:scale-90"
                    title="ตำแหน่งของฉัน"
                >
                    <TargetIcon />
                </button>
            </div>

            {/* ==========================================
                SEARCH PANEL
            ========================================== */}
            {showSearchPanel && (
                <div className="absolute top-20 right-4 z-40 w-72 animate-slideInRight">
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                        <div className="p-4 border-b border-slate-100">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-slate-700">ค้นหาสถานที่</h3>
                                <button
                                    onClick={() => setShowSearchPanel(false)}
                                    className="p-1 text-slate-400 hover:text-slate-600"
                                >
                                    <CloseIcon />
                                </button>
                            </div>
                            <input
                                type="text"
                                placeholder="พิมพ์ชื่อจังหวัด..."
                                value={provinceSearch}
                                onChange={(e) => setProvinceSearch(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                            />
                        </div>
                        <div className="max-h-60 overflow-y-auto scrollbar-subtle">
                            {filteredProvinces.slice(0, 15).map((province) => (
                                <button
                                    key={province}
                                    onClick={() => flyToProvince(province)}
                                    className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-emerald-50 flex items-center gap-3
                                        ${selectedProvince === province ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600'}`}
                                >
                                    <LocationIcon />
                                    <span>{province}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )
            }

            {/* ==========================================
                LAYER PANEL
            ========================================== */}
            {
                showLayerPanel && (
                    <div className="absolute top-36 right-4 z-40 w-56 animate-slideInRight">
                        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                            <div className="p-3 border-b border-slate-100">
                                <h3 className="text-sm font-semibold text-slate-700">เลือกแผนที่</h3>
                            </div>
                            <div className="p-2">
                                {Object.entries(mapStyles).map(([key, style]) => (
                                    <button
                                        key={key}
                                        onClick={() => changeMapStyle(key)}
                                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2
                                        ${currentStyle === key
                                                ? 'bg-emerald-500 text-white'
                                                : 'text-slate-600 hover:bg-slate-100'
                                            }`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${currentStyle === key ? 'bg-white' : 'bg-slate-300'}`}></div>
                                        {style.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ==========================================
                CRYSTAL ZOOM CONTROLS
            ========================================== */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2">
                <button
                    onClick={zoomIn}
                    className="w-12 h-12 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/40 hover:border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 active:scale-90"
                >
                    <ZoomInIcon />
                </button>
                <button
                    onClick={zoomOut}
                    className="w-12 h-12 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/40 hover:border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 active:scale-90"
                >
                    <ZoomOutIcon />
                </button>
                <button
                    onClick={resetNorth}
                    className="w-12 h-12 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/40 hover:border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 active:scale-90"
                >
                    <CompassIcon />
                </button>
            </div>

            {/* ==========================================
                MY LOCATION BUTTON (Bottom Left)
            ========================================== */}
            <div className="absolute bottom-28 left-4 z-30 flex flex-col gap-2">
                {pendingPlots.length > 0 && !digitizeMode && (
                    <button
                        onClick={finalizeAllPending}
                        className="h-12 px-4 rounded-full bg-emerald-600 text-white flex items-center justify-center gap-2 shadow-xl animate-bounce-subtle border-2 border-white/40"
                    >
                        <div className="w-6 h-6 rounded-full bg-white text-emerald-600 text-[10px] font-black flex items-center justify-center">
                            {pendingPlots.length}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider">บันทึกทั้งหมด</span>
                    </button>
                )}
            </div>

            {/* ==========================================
                CRYSTAL FAB MENU (Bottom Right)
            ========================================== */}
            <div className="absolute bottom-28 right-6 z-50 flex flex-col items-end gap-5">
                {/* Action Items */}
                <div className={`flex flex-col gap-4 mb-2 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${showFABMenu ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-50 pointer-events-none'}`}>

                    {/* Option 1: Draw */}
                    <button
                        onClick={() => {
                            setShowFABMenu(false);
                            startDigitizing();
                        }}
                        className="group flex items-center justify-end gap-4"
                    >
                        <div className="bg-black/30 backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-2xl shadow-2xl transform transition-all duration-300 group-hover:-translate-x-2">
                            <span className="text-white/90 text-xs font-bold tracking-widest uppercase">วาดเองดิจิไตส์ยางพารา</span>
                        </div>
                        <div className="relative">
                            <div className="w-14 h-14 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 active:scale-90 group-hover:rotate-12">
                                <PencilIcon size={24} />
                            </div>
                        </div>
                    </button>

                    {/* Option 2: Import */}
                    <button
                        onClick={() => {
                            setShowFABMenu(false);
                            setWorkflowModal({ isOpen: true, mode: 'import' });
                        }}
                        className="group flex items-center justify-end gap-4"
                    >
                        <div className="bg-black/30 backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-2xl shadow-2xl transform transition-all duration-300 group-hover:-translate-x-2">
                            <span className="text-white/90 text-xs font-bold tracking-widest uppercase">นำเข้าเเปลง SHP</span>
                        </div>
                        <div className="relative">
                            <div className="w-14 h-14 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 active:scale-90 group-hover:-rotate-12">
                                <UploadIcon size={24} />
                            </div>
                        </div>
                    </button>
                </div>

                {/* Main Toggle Button */}
                <div className="relative">
                    {/* Crystal Pulse Effect */}
                    {!showFABMenu && (
                        <div className="absolute inset-0 bg-emerald-500/30 rounded-full animate-ping blur-xl"></div>
                    )}

                    <button
                        onClick={() => setShowFABMenu(!showFABMenu)}
                        className={`relative w-20 h-20 rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/30 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-90
                            ${showFABMenu
                                ? 'bg-slate-900/90 text-white rotate-[225deg] rounded-full'
                                : 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-500 text-white rotate-0'}
                        `}
                    >
                        <PlusIcon className="w-10 h-10" />
                    </button>
                </div>
            </div>




            {/* ==========================================
                CRYSTAL NAVBAR (Bottom) - MAP ACTIVE
            ========================================== */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
                <nav className="flex items-center gap-4 px-6 py-3 bg-black/20 backdrop-blur-2xl rounded-full border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:bg-black/30 transition-all duration-300">

                    {/* Home */}
                    <button
                        onClick={() => handleNavClick('/')}
                        className="group relative flex flex-col items-center justify-center w-10 h-10 transition-all"
                    >
                        <div className="text-white/70 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                            <HomeIcon />
                        </div>
                        <span className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-white font-medium bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-md">หน้าหลัก</span>
                    </button>

                    {/* Map (Active) */}
                    <div className="relative flex flex-col items-center justify-center w-12 h-12">
                        <div className="absolute inset-0 bg-blue-500/80 blur-xl rounded-full opacity-40 animate-pulse" />
                        <div className="relative w-12 h-12 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white shadow-lg border border-white/20 transform scale-110">
                            <MapIcon />
                        </div>
                    </div>

                    {/* Dashboard */}
                    <button
                        onClick={() => handleNavClick('/dashboard')}
                        className="group relative flex flex-col items-center justify-center w-10 h-10 transition-all"
                    >
                        <div className="text-white/70 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                            <DashboardIcon />
                        </div>
                        <span className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-white font-medium bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-md">แดชบอร์ด</span>
                    </button>

                    {/* Personal */}
                    <button
                        onClick={() => handleNavClick('/dashboard?view=personal')}
                        className="group relative flex flex-col items-center justify-center w-10 h-10 transition-all"
                    >
                        <div className="text-white/70 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                            <UserIcon />
                        </div>
                        <span className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-white font-medium bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-md">ส่วนตัว</span>
                    </button>

                    {/* History */}
                    <button
                        onClick={() => handleNavClick('/dashboard/history')}
                        className="group relative flex flex-col items-center justify-center w-10 h-10 transition-all"
                    >
                        <div className="text-white/70 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                            <HistoryIcon />
                        </div>
                        <span className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-white font-medium bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-md">ประวัติ</span>
                    </button>
                </nav>
            </div>



            {/* ==========================================
                SIDEBAR INTEGRATION
            ========================================== */}
            {/* Sidebar removed as requested */}


            {/* DIGITIZING HUD & TOOLBAR */}
            {
                digitizeMode && (
                    <>
                        {/* 1. TOP INSTRUCTION GUIDE - Multi-mode */}
                        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[110] animate-slide-down">
                            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200/50 shadow-lg flex items-center gap-2.5">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </div>
                                <div className="text-slate-700 flex items-center gap-2">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold leading-none tracking-tight">โหมดวาดแปลง</span>
                                        <span className="text-[9px] text-slate-400 mt-0.5">คลิกบนแผนที่เพื่อวาดรูปทรง</span>
                                    </div>
                                    {pendingPlots.length > 0 && (
                                        <div className="ml-2 pl-3 border-l border-slate-200 flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-black text-emerald-600 tracking-wider">คำนวณแล้ว {pendingPlots.length} แปลง</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>



                        {/* 3. ACTION BUTTONS - Simplified for Mobile */}
                        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[110] flex gap-2 animate-slide-up">
                            <button
                                onClick={cancelDigitizing}
                                className="bg-white/90 backdrop-blur-md px-6 py-2.5 rounded-full text-slate-500 font-bold text-[11px] shadow-lg border border-white/60 hover:bg-white active:scale-95 transition-all uppercase tracking-wider"
                            >
                                ยกเลิก
                            </button>

                            <button
                                onClick={finishDigitizing}
                                className="bg-emerald-600 px-8 py-2.5 rounded-full text-white font-black text-[11px] shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-2 uppercase tracking-wider"
                            >
                                <span>วาดเสร็จแล้ว</span>
                            </button>
                        </div>
                    </>
                )
            }

            {/* Workflow Modal Integration */}
            <WorkflowModal
                isOpen={workflowModal.isOpen}
                mode={workflowModal.mode}
                initialData={workflowModal.initialData}
                accumulatedPlots={pendingPlots}
                onClose={() => setWorkflowModal({ isOpen: false, mode: null })}
                onSave={handleSavePlot}
                onAddAnother={handleAddAnother}
                onDeletePlot={(id) => {
                    setPendingPlots(prev => prev.filter(p => p.id !== id));
                    setSavedPlots(prev => prev.filter(p => p.id !== id));
                }}
                onUpdatePlot={(id, data) => {
                    setPendingPlots(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
                    setSavedPlots(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
                }}
                onStartDrawing={() => {
                    setWorkflowModal({ ...workflowModal, isOpen: false });
                    startDigitizing();
                }}
                onZoomToPlot={handleZoomToPlot}
                onPreviewPlots={setPreviewPlots}
            />

            <style>{`
                .user-marker {
                    position: relative;
                    width: 24px;
                    height: 24px;
                }
                
                /* Hide default map controls as we use custom Crystal UI */
                .maplibregl-ctrl-top-right, .maplibregl-ctrl-bottom-right, 
                .maplibregl-ctrl-top-left, .maplibregl-ctrl-bottom-left,
                .mapboxgl-ctrl-top-right, .mapboxgl-ctrl-bottom-right,
                .mapboxgl-ctrl-top-left, .mapboxgl-ctrl-bottom-left,
                .maplibregl-ctrl-group, .mapboxgl-ctrl-group {
                    display: none !important;
                }

                .user-marker-pulse {
                    position: absolute;
                    width: 40px;
                    height: 40px;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(16, 185, 129, 0.3);
                    border-radius: 50%;
                    animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
                }

                .user-marker-dot {
                    position: absolute;
                    width: 16px;
                    height: 16px;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    background: linear-gradient(135deg, #10b981, #059669);
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                }

                @keyframes pulse-ring {
                    0% {
                        transform: translate(-50%, -50%) scale(0.5);
                        opacity: 0.8;
                    }
                    80%, 100% {
                        transform: translate(-50%, -50%) scale(2);
                        opacity: 0;
                    }
                }

                .maplibregl-canvas {
                    outline: none;
                }

                .maplibregl-ctrl-attrib {
                    display: none !important;
                }

                .maplibregl-ctrl-logo {
                    display: none !important;
                }

                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }

                /* ==========================================
                   MINIMAL POPUP - Rounded & Soft
                   ========================================== */
                .minimal-popup .maplibregl-popup-content {
                    padding: 0;
                    border-radius: 24px;
                    background: transparent;
                    box-shadow: none;
                }
                .minimal-popup .maplibregl-popup-tip {
                    border-top-color: #ffffff;
                }

                /* Card Container */
                .m-card {
                    font-family: 'Prompt', 'Inter', system-ui, sans-serif;
                    background: #ffffff;
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px -8px rgba(0, 0, 0, 0.12), 0 12px 16px -8px rgba(0, 0, 0, 0.04);
                    border: 1px solid rgba(0,0,0,0.02);
                }

                /* Header */
                .m-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px 4px 20px;
                    background: #ffffff;
                }
                
                /* Status Badge */
                .m-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 10px;
                    font-weight: 700;
                    color: #059669; /* Emerald 600 */
                    background: #ecfdf5; /* Emerald 50 */
                    padding: 4px 10px;
                    border-radius: 99px;
                    letter-spacing: 0.3px;
                }
                .m-dot {
                    width: 6px;
                    height: 6px;
                    background: #10b981; /* Emerald 500 */
                    border-radius: 50%;
                    box-shadow: 0 0 0 2px #ecfdf5;
                }

                /* Edit Button */
                .m-edit-btn {
                    width: 32px;
                    height: 32px;
                    background: #f8fafc;
                    border: none;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #94a3b8;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .m-edit-btn:hover {
                    background: #ecfdf5;
                    color: #059669;
                    transform: rotate(15deg);
                }

                /* Body Content */
                .m-name {
                    font-size: 18px;
                    font-weight: 700;
                    color: #1e293b; /* Slate 800 */
                    margin: 8px 20px 16px 20px;
                    line-height: 1.3;
                    letter-spacing: -0.3px;
                }

                /* Info Grid */
                .m-info {
                    display: flex;
                    justify-content: space-between;
                    padding: 0 20px;
                    margin-bottom: 20px;
                    position: relative;
                }
                /* Vertical divider line */
                .m-info::after {
                    content: '';
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    width: 1px;
                    height: 70%;
                    background: #f1f5f9;
                }
                
                .m-col {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .m-right {
                    text-align: right;
                }
                .m-label {
                    font-size: 9px;
                    font-weight: 600;
                    color: #94a3b8; /* Slate 400 */
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                }
                .m-val {
                    font-size: 14px;
                    font-weight: 600;
                    color: #334155; /* Slate 700 */
                    font-variant-numeric: tabular-nums;
                }

                /* Carbon Card (Inner) */
                .m-carbon {
                    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                    margin: 0 8px 8px 8px;
                    padding: 16px;
                    border-radius: 20px;
                    text-align: center;
                    border: 1px solid #ffffff;
                    box-shadow: inset 0 2px 4px rgba(255,255,255,0.8);
                }
                .m-carbon-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: #16a34a;
                    display: block;
                    margin-bottom: 6px;
                    letter-spacing: 0.5px;
                    opacity: 0.9;
                }
                .m-carbon-row {
                    display: flex;
                    align-items: baseline;
                    justify-content: center;
                    gap: 3px;
                    margin-bottom: 8px;
                }
                .m-carbon-num {
                    font-size: 32px;
                    font-weight: 800;
                    color: #15803d; /* Emerald 700 */
                    line-height: 1;
                    letter-spacing: -1px;
                    font-feature-settings: "tnum";
                    
                    /* Text Gradient */
                    background: linear-gradient(135deg, #15803d 0%, #16a34a 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .m-carbon-unit {
                    font-size: 12px;
                    font-weight: 700;
                    color: #16a34a; /* Emerald 600 */
                }
                .m-method {
                    display: inline-block;
                    font-size: 9px;
                    font-weight: 500;
                    color: #16a34a;
                    background: rgba(255, 255, 255, 0.6);
                    padding: 4px 10px;
                    border-radius: 12px;
                    backdrop-filter: blur(4px);
                }

                /* Animation */
                @keyframes m-pop-in {
                    0% { opacity: 0; transform: translateY(12px) scale(0.9); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                .m-card {
                    animation: m-pop-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
            `}</style>
        </div >
    )
}

export default MapPage
