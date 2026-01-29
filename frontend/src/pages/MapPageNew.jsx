import React, { useState, useEffect, useRef, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { provinceCoords } from '../data/province-coords'
import * as turf from '@turf/turf'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import WorkflowModal from '../components/organisms/WorkflowModal'

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

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
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
function MapPageNew() {
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
    const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0, zoom: 0 })

    // Draw state
    const draw = useRef(null)

    // Search state
    const [selectedProvince, setSelectedProvince] = useState('')
    const [provinceSearch, setProvinceSearch] = useState('')
    const [filteredProvinces, setFilteredProvinces] = useState(thaiProvinces)

    // Multi-plot State
    const [accumulatedPlots, setAccumulatedPlots] = useState([])

    // ... (rest of search logic)



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

        // Enable 3D Globe projection
        map.current.on('load', () => {
            // Set globe projection (MapLibre GL v4+)
            try {
                map.current.setProjection({ type: 'globe' })
            } catch (e) {
                console.log('Globe projection not available, using mercator')
            }

            // Add atmosphere effect
            if (map.current.setFog) {
                map.current.setFog({
                    color: 'rgb(186, 210, 235)',
                    'high-color': 'rgb(36, 92, 223)',
                    'horizon-blend': 0.02,
                    'space-color': 'rgb(11, 11, 25)',
                    'star-intensity': 0.6
                })
            }

            // Add Navigation Control (Zoom/Compass)
            map.current.addControl(new maplibregl.NavigationControl(), 'bottom-right');

            setMapLoaded(true)
            startIntroAnimation()

            // Initialize Draw with a bit more robustness
            console.log('Initializing Draw...');
            try {
                draw.current = new MapboxDraw({
                    displayControlsDefault: false,
                    controls: {
                        polygon: false,
                        trash: false
                    },
                    defaultMode: 'simple_select',
                    styles: [
                        // ACTIVE (HOT)
                        {
                            'id': 'gl-draw-polygon-fill-active',
                            'type': 'fill',
                            'filter': ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
                            'paint': {
                                'fill-color': '#10b981',
                                'fill-opacity': 0.3
                            }
                        },
                        {
                            'id': 'gl-draw-polygon-stroke-active',
                            'type': 'line',
                            'filter': ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
                            'layout': { 'line-cap': 'round', 'line-join': 'round' },
                            'paint': {
                                'line-color': '#059669',
                                'line-width': 3
                            }
                        },
                        // INACTIVE (COLD)
                        {
                            'id': 'gl-draw-polygon-fill-inactive',
                            'type': 'fill',
                            'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'static']],
                            'paint': {
                                'fill-color': '#059669',
                                'fill-opacity': 0.2
                            }
                        },
                        {
                            'id': 'gl-draw-polygon-stroke-inactive',
                            'type': 'line',
                            'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'static']],
                            'layout': { 'line-cap': 'round', 'line-join': 'round' },
                            'paint': {
                                'line-color': '#059669',
                                'line-width': 2
                            }
                        },
                        // VERTICES
                        {
                            'id': 'gl-draw-polygon-and-line-vertex-active',
                            'type': 'circle',
                            'filter': ['all', ['==', '$type', 'Point'], ['==', 'meta', 'vertex']],
                            'paint': {
                                'circle-radius': 6,
                                'circle-color': '#ffffff',
                                'circle-stroke-color': '#059669',
                                'circle-stroke-width': 2
                            }
                        },
                        {
                            'id': 'gl-draw-polygon-and-line-vertex-inactive',
                            'type': 'circle',
                            'filter': ['all', ['==', '$type', 'Point'], ['==', 'meta', 'vertex'], ['==', 'mode', 'static']],
                            'paint': {
                                'circle-radius': 4,
                                'circle-color': '#ffffff',
                                'circle-stroke-color': '#94a3b8',
                                'circle-stroke-width': 1
                            }
                        },
                        // MIDPOINTS
                        {
                            'id': 'gl-draw-polygon-and-line-midpoint',
                            'type': 'circle',
                            'filter': ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
                            'paint': {
                                'circle-radius': 4,
                                'circle-color': '#10b981'
                            }
                        }
                    ]
                })
                map.current.addControl(draw.current, 'top-left')
                console.log('Draw initialized and added to map');
            } catch (err) {
                console.error('Failed to initialize Draw:', err);
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

        return () => {
            if (map.current) {
                map.current.remove()
                map.current = null
            }
        }
    }, [])

    // ==========================================
    // MAP DATA SYNC & DRAWING LOGIC
    // ==========================================


    // ==========================================
    // PERSIST SAVED PLOTS ON MAP
    // ==========================================
    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        const sourceId = 'saved-plots-source';
        const fillLayerId = 'saved-plots-fill';
        const lineLayerId = 'saved-plots-line';

        const updateMap = () => {
            if (!map.current) return;
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
                            carbon: p.carbon
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
                        'fill-color': '#059669',
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
            }
        };

        updateMap();
    }, [accumulatedPlots, mapLoaded]);

    // ==========================================
    // INTRO ANIMATION - Globe to Thailand
    // ==========================================
    const startIntroAnimation = useCallback(() => {
        if (!map.current) return

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
        console.log('Attempting to start digitizing...', draw.current);
        if (!draw.current) {
            alert('เครื่องมือวาดกำลังโหลด กรุณารอสักครู่...');
            return;
        }
        setDigitizeMode(true);
        draw.current.changeMode('draw_polygon');
    }

    const cancelDigitizing = () => {
        if (!draw.current) return
        draw.current.changeMode('simple_select')
        draw.current.deleteAll()
        setDigitizeMode(false)
    }

    const finishDigitizing = () => {
        const data = draw.current.getAll()
        if (data.features.length > 0) {
            const areaSqm = turf.area(data.features[0])
            const areaRaiTotal = areaSqm / 1600
            const rai = Math.floor(areaRaiTotal)
            const ngan = Math.floor((areaRaiTotal - rai) * 4)
            const sqWah = ((areaRaiTotal - rai - ngan / 4) * 400).toFixed(1)

            setWorkflowModal({
                isOpen: true,
                mode: 'draw',
                initialData: {
                    areaSqm: areaSqm.toFixed(2),
                    areaRai: rai,
                    areaNgan: ngan,
                    areaSqWah: sqWah,
                    geometry: data.features[0].geometry
                }
            })
            setDigitizeMode(false)
        }
    }

    function updateArea(e) {
        const data = draw.current.getAll()
        if (data.features.length > 0) {
            // Can show live area HUD here if needed
        }
    }

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
                COORDINATES DISPLAY (Top Left)
            ========================================== */}
            <div className="absolute top-4 left-4 z-30">
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl px-4 py-2.5 shadow-lg border border-white/20">
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-medium">LAT</span>
                            <span className="text-slate-700 font-medium tabular-nums">{coordinates.lat}</span>
                        </div>
                        <div className="w-px h-4 bg-slate-200"></div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-medium">LNG</span>
                            <span className="text-slate-700 font-medium tabular-nums">{coordinates.lng}</span>
                        </div>
                        <div className="w-px h-4 bg-slate-200"></div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-medium">ZOOM</span>
                            <span className="text-emerald-600 font-medium tabular-nums">{coordinates.zoom}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==========================================
                TOP RIGHT CONTROLS
            ========================================== */}
            <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
                {/* Search Button */}
                <button
                    onClick={() => setShowSearchPanel(!showSearchPanel)}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95
                        ${showSearchPanel
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white/90 backdrop-blur-xl text-slate-600 hover:text-emerald-500'
                        }`}
                >
                    <SearchIcon />
                </button>

                {/* Layers Button */}
                <button
                    onClick={() => setShowLayerPanel(!showLayerPanel)}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95
                        ${showLayerPanel
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white/90 backdrop-blur-xl text-slate-600 hover:text-emerald-500'
                        }`}
                >
                    <LayersIcon />
                </button>

                {/* Settings */}
                <button
                    className="w-11 h-11 rounded-xl bg-white/90 backdrop-blur-xl flex items-center justify-center text-slate-600 hover:text-emerald-500 shadow-lg transition-all duration-200 active:scale-95"
                >
                    <SettingsIcon />
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
                                <h3 className="text-sm font-medium text-slate-700">ค้นหาสถานที่</h3>
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
            )}

            {/* ==========================================
                LAYER PANEL
            ========================================== */}
            {showLayerPanel && (
                <div className="absolute top-36 right-4 z-40 w-56 animate-slideInRight">
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                        <div className="p-3 border-b border-slate-100">
                            <h3 className="text-sm font-medium text-slate-700">เลือกแผนที่</h3>
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
            )}

            {/* ==========================================
                ZOOM CONTROLS (Right Side)
            ========================================== */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1">
                <button
                    onClick={zoomIn}
                    className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-xl flex items-center justify-center text-slate-600 hover:text-emerald-500 shadow-lg transition-all active:scale-95"
                >
                    <ZoomInIcon />
                </button>
                <button
                    onClick={zoomOut}
                    className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-xl flex items-center justify-center text-slate-600 hover:text-emerald-500 shadow-lg transition-all active:scale-95"
                >
                    <ZoomOutIcon />
                </button>
                <button
                    onClick={resetNorth}
                    className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-xl flex items-center justify-center text-slate-600 hover:text-emerald-500 shadow-lg transition-all active:scale-95"
                >
                    <CompassIcon />
                </button>
            </div>

            {/* ==========================================
                MY LOCATION BUTTON (Bottom Left)
            ========================================== */}
            <div className="absolute bottom-28 left-4 z-30">
                <button
                    onClick={locateUser}
                    className="w-12 h-12 rounded-2xl bg-white/95 backdrop-blur-xl flex items-center justify-center text-emerald-500 hover:text-emerald-600 hover:bg-white shadow-xl transition-all active:scale-95 border border-white/20"
                    title="ตำแหน่งของฉัน"
                >
                    <LocationIcon />
                </button>
            </div>

            {/* ==========================================
                PREMIUM FAB MENU (Bottom Right)
            ========================================== */}
            <div className="absolute bottom-28 right-6 z-50 flex flex-col items-end gap-4">
                {/* Action Items */}
                <div className={`flex flex-col gap-4 mb-2 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${showFABMenu ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-50 pointer-events-none'}`}>

                    {/* Option 0: My Dashboard */}
                    <button
                        onClick={() => {
                            setShowFABMenu(false);
                            setWorkflowModal({ isOpen: true, mode: 'list' });
                        }}
                        className="group flex items-center justify-end gap-3"
                    >
                        <div className="bg-emerald-500/90 backdrop-blur-md border border-emerald-400/30 px-4 py-2 rounded-2xl shadow-xl transform transition-all duration-300 group-hover:-translate-x-1">
                            <span className="text-white text-[13px] font-medium tracking-wide whitespace-nowrap uppercase">รายการคาร์บอนของฉัน ({accumulatedPlots.length})</span>
                        </div>
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 active:scale-95 border border-white/20">
                                <DashboardIcon size={20} />
                            </div>
                            {accumulatedPlots.length > 0 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-black text-white">
                                    {accumulatedPlots.length}
                                </div>
                            )}
                        </div>
                    </button>

                    {/* Option 1: Draw */}
                    <button
                        onClick={() => {
                            setShowFABMenu(false);
                            startDigitizing();
                        }}
                        className="group flex items-center justify-end gap-3"
                    >
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl shadow-xl transform transition-all duration-300 group-hover:-translate-x-1">
                            <span className="text-white/90 text-[13px] font-medium tracking-wide whitespace-nowrap">วาดเองดิจิไตส์ยางพารา</span>
                        </div>
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 active:scale-95">
                                <PencilIcon size={20} />
                            </div>
                        </div>
                    </button>

                    {/* Option 2: Import */}
                    <button
                        onClick={() => {
                            setShowFABMenu(false);
                            setWorkflowModal({ isOpen: true, mode: 'import' });
                        }}
                        className="group flex items-center justify-end gap-3"
                    >
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl shadow-xl transform transition-all duration-300 group-hover:-translate-x-1">
                            <span className="text-white/90 text-[13px] font-medium tracking-wide whitespace-nowrap">นำเข้าเเปลง SHP</span>
                        </div>
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 active:scale-95">
                                <UploadIcon size={20} />
                            </div>
                        </div>
                    </button>
                </div>

                {/* Main Toggle Button */}
                <div className="relative">
                    {/* Ring Pulse Effect */}
                    {!showFABMenu && (
                        <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
                    )}

                    <button
                        onClick={() => setShowFABMenu(!showFABMenu)}
                        className={`relative w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-2 border-white/50 transition-all duration-500 ease-out active:scale-90
                            ${showFABMenu
                                ? 'bg-slate-900 text-white rotate-180 rounded-full'
                                : 'bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white rotate-0'}
                        `}
                    >
                        {showFABMenu ? (
                            <CloseIcon className="w-6 h-6" />
                        ) : (
                            <PlusIcon className="w-8 h-8" />
                        )}
                    </button>
                </div>
            </div>




            {/* ==========================================
                FLOATING NAVBAR (Bottom Center)
            ========================================== */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40">
                <nav className="flex items-center gap-1 bg-white/95 backdrop-blur-xl rounded-2xl p-1.5 shadow-2xl border border-white/20">
                    {/* Home */}
                    <button
                        onClick={() => handleNavClick('/')}
                        className="flex flex-col items-center justify-center w-14 h-12 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <HomeIcon />
                        <span className="text-[10px] mt-0.5 font-medium">หน้าหลัก</span>
                    </button>

                    {/* Map - Active */}
                    <button
                        className="flex flex-col items-center justify-center w-14 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition-all"
                    >
                        <MapIcon />
                        <span className="text-[10px] mt-0.5 font-medium">แผนที่</span>
                    </button>

                    {/* Dashboard Overview */}
                    <button
                        onClick={() => handleNavClick('/dashboard')}
                        className="flex flex-col items-center justify-center w-14 h-12 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <DashboardIcon />
                        <span className="text-[10px] mt-0.5 font-medium">แดชบอร์ด</span>
                    </button>

                    {/* Personal Dashboard */}
                    <button
                        onClick={() => handleNavClick('/dashboard?view=personal')}
                        className="flex flex-col items-center justify-center w-14 h-12 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <UserIcon />
                        <span className="text-[10px] mt-0.5 font-medium">ส่วนตัว</span>
                    </button>

                    {/* History */}
                    <button
                        onClick={() => handleNavClick('/dashboard/history')}
                        className="flex flex-col items-center justify-center w-14 h-12 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <HistoryIcon />
                        <span className="text-[10px] mt-0.5 font-medium">ประวัติ</span>
                    </button>
                </nav>
            </div>



            {/* ==========================================
                SIDEBAR INTEGRATION
            ========================================== */}
            {/* Sidebar removed as requested */}


            {/* DIGITIZING HUD & TOOLBAR */}
            {digitizeMode && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-4">
                    {/* Floating Step Guide */}
                    <div className="bg-slate-900/95 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-4 animate-bounce-subtle">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                            <PencilIcon />
                        </div>
                        <div className="text-white">
                            <p className="text-xs font-medium leading-none">กำลังวาดแปลงยางพารา</p>
                            <p className="text-[10px] opacity-60 mt-1 uppercase tracking-widest">จุดแปลงบนแผนที่ให้ครบทุกมุม</p>
                        </div>
                    </div>

                    {/* Vertical Toolbar (Matches User Screenshot) */}
                    <div className="fixed top-24 left-6 z-[999] flex flex-col items-center bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 gap-1.5" style={{ zIndex: 9999 }}>
                        {/* Draw Polygon */}
                        <button
                            onClick={() => {
                                console.log('Draw polygon clicked');
                                if (draw.current) draw.current.changeMode('draw_polygon');
                            }}
                            className="w-14 h-14 flex items-center justify-center rounded-xl text-slate-600 hover:text-emerald-500 hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-200 active:scale-95"
                            title="วาดรูปแปลง"
                        >
                            <DrawPolygonIcon />
                        </button>

                        {/* Direct Select (Edit Nodes) */}
                        <button
                            onClick={() => {
                                console.log('Direct select clicked');
                                if (draw.current) {
                                    const features = draw.current.getAll().features;
                                    if (features.length > 0) {
                                        draw.current.changeMode('direct_select', { featureId: features[0].id });
                                    }
                                }
                            }}
                            className="w-14 h-14 flex items-center justify-center rounded-xl text-slate-600 hover:text-emerald-500 hover:bg-emerald-50 transition-all active:scale-95"
                            title="แก้ไขจุด"
                        >
                            <PointerIcon />
                        </button>

                        {/* Simple Select (Move) */}
                        <button
                            onClick={() => {
                                console.log('Simple select clicked');
                                if (draw.current) draw.current.changeMode('simple_select');
                            }}
                            className="w-14 h-14 flex items-center justify-center rounded-xl text-slate-600 hover:text-emerald-500 hover:bg-emerald-50 transition-all active:scale-95"
                            title="เครื่องมือเลือก"
                        >
                            <MoveIcon />
                        </button>

                        <div className="w-10 h-[1px] bg-slate-200 my-1"></div>

                        {/* Delete */}
                        <button
                            onClick={() => {
                                console.log('Trash clicked');
                                if (draw.current) draw.current.trash();
                            }}
                            className="w-14 h-14 flex items-center justify-center rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 transition-all active:scale-95"
                            title="ลบส่วนที่เลือก"
                        >
                            <TrashIconSmall />
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={cancelDigitizing}
                            className="bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-xl text-slate-600 font-medium text-xs shadow-xl active:scale-95 transition-all border border-slate-100"
                        >
                            ยกเลิก
                        </button>
                        <button
                            onClick={finishDigitizing}
                            className="bg-emerald-600 px-5 py-2.5 rounded-xl text-white font-medium text-xs shadow-xl active:scale-95 transition-all shadow-emerald-500/30"
                        >
                            เสร็จสิ้นและคำนวณ
                        </button>
                    </div>
                </div>
            )}

            {/* Workflow Modal Integration */}
            <WorkflowModal
                isOpen={workflowModal.isOpen}
                mode={workflowModal.mode}
                initialData={workflowModal.initialData}
                accumulatedPlots={accumulatedPlots}
                onClose={() => setWorkflowModal({ isOpen: false, mode: null })}
                onStartDrawing={() => {
                    setWorkflowModal({ ...workflowModal, isOpen: false });
                    startDigitizing();
                }}
                onAddAnother={(plotData) => {
                    // Save processed plot
                    setAccumulatedPlots(prev => {
                        const exists = prev.find(p => p.id === plotData.id);
                        if (exists) return prev.map(p => p.id === plotData.id ? plotData : p);
                        return [...prev, { ...plotData, id: plotData.id || Date.now() }];
                    });

                    // console.log("Added plot to list. Keeping modal open for summary.");
                }}
                onUpdatePlot={(id, updatedData) => {
                    setAccumulatedPlots(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
                }}
                onDeletePlot={(id) => {
                    setAccumulatedPlots(prev => prev.filter(p => p.id !== id));
                }}
                onSave={(finalData, shouldClose) => {
                    if (finalData) {
                        setAccumulatedPlots(prev => {
                            const exists = prev.find(p => p.id === finalData.id);
                            if (exists) return prev.map(p => p.id === finalData.id ? finalData : p);
                            return [...prev, { ...finalData, id: finalData.id || Date.now() }];
                        });
                    }

                    if (shouldClose) {
                        setWorkflowModal({ isOpen: false, mode: null });
                        if (draw.current) draw.current.deleteAll();

                        // Show success message only on final save
                        setTimeout(() => {
                            alert("บันทึกข้อมูลแปลงทั้งหมดเรียบร้อยแล้ว");
                        }, 500);
                    }
                }}
            />

            <style>{`
                .user-marker {
                    position: relative;
                    width: 24px;
                    height: 24px;
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

                .mapboxgl-ctrl-group, .maplibregl-ctrl-group {
                    /* display: none !important; */
                }
            `}</style>
        </div>
    )
}

export default MapPageNew
