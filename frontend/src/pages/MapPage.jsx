import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { provinceCoords } from '../data/province-coords'
import * as turf from '@turf/turf'
import thailandAddressData from '../data/thailand-address.json'
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
    const popupRef = useRef(null)

    // Draw state
    const draw = useRef(null)

    const [userProfile, setUserProfile] = useState(null)
    const [selectedProvince, setSelectedProvince] = useState('')
    const [provinceSearch, setProvinceSearch] = useState('')
    const [filteredProvinces, setFilteredProvinces] = useState(thaiProvinces)

    // ==========================================
    // CASCADING SEARCH STATES
    // ==========================================
    const [searchTab, setSearchTab] = useState('location') // 'location' | 'coords'
    const [selectedProvinceCode, setSelectedProvinceCode] = useState(null)
    const [selectedDistrictCode, setSelectedDistrictCode] = useState(null)
    const [selectedSubdistrictCode, setSelectedSubdistrictCode] = useState(null)
    const [districtSearch, setDistrictSearch] = useState('')
    const [subdistrictSearch, setSubdistrictSearch] = useState('')
    const [breadcrumbs, setBreadcrumbs] = useState([])
    const [searchLoading, setSearchLoading] = useState(false)
    const [activeBoundaryLevel, setActiveBoundaryLevel] = useState(null)
    const [coordLat, setCoordLat] = useState('')
    const [coordLng, setCoordLng] = useState('')

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



    // ==========================================
    // INITIALIZE MAP
    // ==========================================
    useEffect(() => {
        // Initialize global cache for plot methods
        window.plotMethodsCache = {};

        // Global handler for price updates from slider
        window.handlePopupPrice = (plotId) => {
            const slider = document.getElementById(`price-slider-${plotId}`);
            const unitPriceDisplay = document.getElementById(`unit-price-${plotId}`);
            const totalPriceDisplay = document.getElementById(`popup-price-${plotId}`);
            const container = document.getElementById(`popup-nav-${plotId}`);

            if (!slider || !totalPriceDisplay) return;

            const currentPrice = parseInt(slider.value);
            if (unitPriceDisplay) unitPriceDisplay.textContent = `฿${currentPrice}/ตัน`;

            // Get Current Carbon
            let currentCarbon = 0;
            const plotMethods = window.plotMethodsCache[plotId] || [];

            if (container && plotMethods.length > 0) {
                const idx = parseInt(container.getAttribute('data-index') || '0');
                currentCarbon = parseFloat(plotMethods[idx].carbon) || 0;
            } else {
                // Fallback if no navigation (single method)
                // We need to find the carbon value from DOM or cache
                // Simplest is to assume cache exists with at least 1 item
                if (plotMethods.length > 0) {
                    currentCarbon = parseFloat(plotMethods[0].carbon) || 0;
                }
            }

            const totalValue = (currentCarbon * currentPrice).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            totalPriceDisplay.textContent = totalValue;
        };

        // Global handler for popup navigation
        window.handlePopupNav = (plotId, direction) => {
            const plotMethods = window.plotMethodsCache[plotId];
            if (!plotMethods || plotMethods.length <= 1) return;

            const container = document.getElementById(`popup-nav-${plotId}`);
            if (!container) return;

            let currentIndex = parseInt(container.getAttribute('data-index') || '0');
            let newIndex = currentIndex + direction;

            // Loop navigation
            if (newIndex < 0) newIndex = plotMethods.length - 1;
            if (newIndex >= plotMethods.length) newIndex = 0;

            // Update Index
            container.setAttribute('data-index', newIndex);

            // Update Display Content
            const method = plotMethods[newIndex];

            // Get current price from slider if exists (dynamic), else default 250
            const slider = document.getElementById(`price-slider-${plotId}`);
            const currentPrice = slider ? parseInt(slider.value) : 250;

            const priceVal = (parseFloat(method.carbon) * currentPrice).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            const agbVal = method.agb || ((parseFloat(method.carbon) || 0) / 0.47).toFixed(2);

            // Elements to update
            const elCarbon = document.getElementById(`popup-carbon-${plotId}`);
            const elAgb = document.getElementById(`popup-agb-${plotId}`); // New
            const elMethod = document.getElementById(`popup-method-${plotId}`);
            const elPrice = document.getElementById(`popup-price-${plotId}`);
            const elIndex = document.getElementById(`popup-count-${plotId}`);

            // Animate changes (fade quick)
            if (elCarbon) {
                elCarbon.style.opacity = '0.5';
                elCarbon.textContent = method.carbon;
                setTimeout(() => elCarbon.style.opacity = '1', 150);
            }
            if (elAgb) elAgb.textContent = agbVal; // New
            if (elMethod) elMethod.textContent = method.name || method.formula;
            if (elPrice) elPrice.textContent = priceVal;
            if (elIndex) elIndex.textContent = `${newIndex + 1}/${plotMethods.length}`;
        };

        if (map.current) return

        // Create map with Globe 3D projection (MapLibre)
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
            center: [100.5018, 13.7563], // Bangkok
            zoom: 2, // Start zoomed out to see the globe
            pitch: 0,
            bearing: 0,
            maxPitch: 85,
            antialias: true,
            projection: { type: 'globe' } // Explicit object configuration
        })

        // Force projection and set atmosphere on style load
        map.current.on('style.load', () => {
            map.current.setProjection({ type: 'globe' });
        });

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
                            agb: p.agb ? parseFloat(p.agb) : (parseFloat(p.carbon_tons || 0) / 0.47).toFixed(2),
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

        // Map Load Event
        map.current.on('load', () => {
            console.log('🌍 Map loaded successfully with Globe 3D projection!');
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
            map.current.on('draw.create', (e) => {
                const data = draw.current.getAll();
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

                    // Exit draw mode to prevent accidental edits while modal is open
                    // setTimeout(() => draw.current.changeMode('simple_select'), 100);
                }
            })
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

            try {
                const feature = e.features[0];
                let plotData = {};

                // Safe Parsing
                try {
                    plotData = typeof feature.properties.allData === 'string'
                        ? JSON.parse(feature.properties.allData)
                        : feature.properties.allData;
                } catch (parseErr) {
                    console.error('Error parsing plot data:', parseErr);
                    return; // Stop if data is invalid
                }

                if (!plotData) return;

                const coordinates = e.lngLat;

                // Remove existing popup
                if (popupRef.current) popupRef.current.remove();

                // Setup methods data
                const methods = plotData.methods && plotData.methods.length > 0
                    ? plotData.methods
                    : [{
                        carbon: plotData.carbon,
                        method: plotData.method || 'สมการที่ 1 (0.118 × DBH^2.53)',
                        name: 'สมการมาตรฐาน'
                    }];

                // Cache methods for navigation
                window.plotMethodsCache[plotData.id] = methods;

                // Navigation UI logic
                const hasMultiple = methods.length > 1;
                const navArrows = hasMultiple ? `
                    <button onclick="window.handlePopupNav('${plotData.id}', -1)" style="background:none; border:none; color:#10b981; cursor:pointer; padding:0 4px; display:flex; align-items:center;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <span id="popup-count-${plotData.id}" style="font-size:9px; font-weight:700; color:#10b981; min-width:20px; text-align:center;">1/${methods.length}</span>
                    <button onclick="window.handlePopupNav('${plotData.id}', 1)" style="background:none; border:none; color:#10b981; cursor:pointer; padding:0 4px; display:flex; align-items:center;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                ` : '';

                // Create content HTML string - Enhanced with Multi-Method Support
                const popupContent = `
                    <div class="m-card" style="padding: 16px; font-family: 'Prompt', 'Inter', system-ui, sans-serif;">
                        <!-- Header -->
                        <div class="m-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                            <div class="m-badge" style="background: #ecfdf5; color: #059669; padding: 4px 10px; border-radius: 12px; display: inline-flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 700;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                ข้อมูลรายแปลง
                            </div>
                            <button id="open-edit-btn-${plotData.id}" class="m-edit-btn" style="width: 28px; height: 28px; border-radius: 50%; background: #f1f5f9; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; transition: all 0.2s; flex-shrink: 0;" title="แก้ไขข้อมูล">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                            </button>
                        </div>
                        
                        <!-- Farmer Name with Icon -->
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                            <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </div>
                            <h2 class="m-name" style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.3px; line-height: 1.2;">
                                ${plotData.farmerName || 'ไม่ระบุชื่อ'}
                            </h2>
                        </div>
                        
                        <!-- Info Row with Icons -->
                        <div class="m-info" style="display: flex; gap: 8px; margin-bottom: 12px; padding-bottom: 0;">
                            <div style="flex: 1; background: #f8fafc; border-radius: 12px; padding: 8px 10px; border: 1px solid #f1f5f9;">
                                <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 3px;">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    <span style="font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">ปีที่ปลูก / อายุ</span>
                                </div>
                                <span style="display: block; font-size: 12px; font-weight: 700; color: #334155;">พ.ศ. ${plotData.plantingYearBE || '-'} (${plotData.age || '-'} ปี)</span>
                            </div>
                            <div style="flex: 1; background: #f8fafc; border-radius: 12px; padding: 8px 10px; border: 1px solid #f1f5f9; text-align: right;">
                                <div style="display: flex; align-items: center; gap: 4px; justify-content: flex-end; margin-bottom: 3px;">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.77 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>
                                    <span style="font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">พันธุ์ยาง</span>
                                </div>
                                <span style="display: block; font-size: 12px; font-weight: 700; color: #334155;">${plotData.variety || 'RRIM 600'}</span>
                            </div>
                        </div>
                        
                        <!-- Carbon Section (Green) with Navigation -->
                        <div id="popup-nav-${plotData.id}" data-index="0" style="padding: 14px 12px; background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 16px; text-align: center; position: relative; overflow: hidden; margin-bottom: 8px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.05);">
                            <div style="display: flex; align-items: center; justify-content: center; gap: 5px; margin-bottom: 6px;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.35C19 21 22 15 22 9c0-5-4-4-4-4-4 0-5 2-11 5"></path><path d="M15.54 8.46a5 5 0 0 0-7.08 0"></path></svg>
                                <span style="font-size: 10px; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 0.5px;">ปริมาณคาร์บอนสุทธิ</span>
                            </div>
                            <div style="display: flex; align-items: baseline; justify-content: center; gap: 3px; margin-bottom: 8px;">
                                <span id="popup-carbon-${plotData.id}" style="font-size: 30px; font-weight: 800; color: #047857; letter-spacing: -1px; line-height: 1; transition: opacity 0.15s;">${methods[0].carbon || '0.00'}</span>
                                <span style="font-size: 11px; font-weight: 700; color: #059669;">tCO<sub>2</sub>e</span>
                            </div>
                            <div style="background: rgba(255,255,255,0.9); border-radius: 8px; padding: 4px 6px; display: inline-flex; align-items: center; gap: 4px; min-width: 140px; justify-content: space-between;">
                                ${hasMultiple ? `
                                    <button onclick="window.handlePopupNav('${plotData.id}', -1)" style="border:none; background:none; cursor:pointer; color:#059669; padding:0;">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                                    </button>
                                ` : ''}
                                <span id="popup-method-${plotData.id}" style="font-size: 9px; font-weight: 600; color: #059669; flex:1; text-align:center;">${methods[0].name || methods[0].method || 'สมการมาตรฐาน'}</span>
                                ${hasMultiple ? `
                                    <button onclick="window.handlePopupNav('${plotData.id}', 1)" style="border:none; background:none; cursor:pointer; color:#059669; padding:0;">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                                    </button>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Biomass Section (Blue-Cyan) -->
                        <div style="padding: 10px 12px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 16px; display: flex; align-items: center; gap: 10px; margin-bottom: 8px; box-shadow: 0 2px 4px rgba(14, 165, 233, 0.05);">
                            <!-- Icon -->
                            <div style="width: 38px; height: 38px; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3); flex-shrink: 0; color: white;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10v9.5m-3-3l3 3 3-3"/><path d="M19 10c0-3.87-3.13-7-7-7s-7 3.13-7 7a6.97 6.97 0 0 0 1.5 4.33"/><path d="M12 21a9 9 0 0 0 9-9 9 9 0 0 0-9-9 9 9 0 0 0-9 9"/></svg>
                            </div>
                            
                            <!-- Text -->
                            <div style="flex: 1; min-width: 0;">
                                <div style="display: flex; align-items: baseline; gap: 4px;">
                                    <span id="popup-agb-${plotData.id}" style="font-size: 18px; font-weight: 800; color: #0369a1; line-height: 1; letter-spacing: -0.5px;">${methods[0].agb || ((parseFloat(methods[0].carbon) || 0) / 0.47).toFixed(2)}</span>
                                    <span style="font-size: 10px; font-weight: 700; color: #0284c7;">ตัน</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 3px; margin-top: 2px;">
                                    <span style="font-size: 9px; font-weight: 600; color: #0ea5e9;">มวลชีวภาพ (AGB)</span>
                                </div>
                            </div>
                        </div>

                        <!-- Valuation Section (Green-Gold) -->
                        <div style="padding: 10px 12px; background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-radius: 16px; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 2px 4px rgba(245, 158, 11, 0.05);">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <!-- Coin Icon with Trend Arrow -->
                                <div style="width: 38px; height: 38px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3); flex-shrink: 0; color: white;">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                                </div>
                                
                                <!-- Text -->
                                <div style="flex: 1; min-width: 0;">
                                    <div style="display: flex; align-items: baseline; gap: 4px;">
                                        <span id="popup-price-${plotData.id}" style="font-size: 18px; font-weight: 800; color: #b45309; line-height: 1; letter-spacing: -0.5px;">${((parseFloat(methods[0].carbon) || 0) * 250).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                                        <span style="font-size: 10px; font-weight: 700; color: #d97706;">บาท</span>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 3px; margin-top: 2px;">
                                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                                        <span style="font-size: 9px; font-weight: 600; color: #f59e0b;">มูลค่าประเมิน (ประมาณการ)</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Slider Section -->

                        </div>
                        
                        ${hasMultiple ? `
                        <div style="text-align: center; margin-top: 6px;">
                            <span id="popup-count-${plotData.id}" style="font-size: 9px; font-weight: 700; color: #9ca3af; background: #f3f4f6; padding: 2px 8px; border-radius: 10px;">1 / ${methods.length} วิธี</span>
                        </div>
                        ` : ''}
                    </div>
                `;

                // Create new popup
                const popup = new maplibregl.Popup({
                    closeButton: false,
                    maxWidth: '260px', // Reduced width for minimal look
                    anchor: 'bottom',
                    offset: [0, -10],
                    className: 'minimal-popup'
                })
                    .setLngLat(coordinates)
                    .setHTML(popupContent)
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

            } catch (err) {
                console.error('Error showing popup:', err);
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
                // 1. Zoom to plot AND show target marker
                // This identifies the plot location clearly
                handleZoomToPlot(plot.geometry, true);

                // 2. Highlight the plot as "Active" (Red) on the map immediately
                // This fulfills "up plot in map" (ขึ้นแปลงในแผนที่) without opening a modal popup
                setPreviewPlots([{
                    ...plot,
                    isPreview: true,
                    isActive: true,
                    id: plot.id
                }]);

                // Clear URL param to prevent re-triggering on manual refresh
                const newUrl = window.location.pathname;
                window.history.replaceState({}, '', newUrl);
            }
        }
    }, [mapLoaded, savedPlots]);

    // ==========================================
    // MAP DATA SYNC & DRAWING LOGIC
    // ==========================================
    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        // Filter out plots with missing geometry to prevent map errors
        // Also: Filter out original saved plots if they are currently being edited or saved (present in preview or pending)
        const previewIds = previewPlots.map(p => p.id);
        const pendingIds = pendingPlots.map(p => p.id);
        const activeIds = [...previewIds, ...pendingIds];

        const filteredSaved = savedPlots.filter(p => !activeIds.includes(p.id));

        const allPlots = [...filteredSaved, ...pendingPlots, ...previewPlots].filter(p => p.geometry);
        console.log(`Map updating with ${allPlots.length} total plots:`, {
            saved: filteredSaved.length,
            hiddenForEdit: savedPlots.length - filteredSaved.length,
            pending: pendingPlots.length,
            preview: previewPlots.length,
            active: allPlots.filter(p => p.isActive).length
        });

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
                        ['get', 'isActive'], '#ef4444', // Red for currently processing
                        ['get', 'isPreview'], '#3b82f6',
                        ['get', 'isPending'], '#fbbf24',
                        '#10b981'
                    ],
                    'fill-opacity': [
                        'case',
                        ['get', 'isActive'], 0.5,
                        0.3
                    ],
                    'fill-outline-color': [
                        'case',
                        ['get', 'isActive'], '#b91c1c',
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
                        ['get', 'isActive'], '#dc2626',
                        ['get', 'isPreview'], '#2563eb',
                        ['get', 'isPending'], '#d97706',
                        '#059669'
                    ],
                    'line-width': [
                        'case',
                        ['get', 'isActive'], 3,
                        2
                    ]
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
                        isActive: plot.isActive || false,
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

                // Pass ALL fields to createPlot for full normalization
                const fullData = {
                    ...p,
                    farmerName: p.farmerName || 'ไม่ระบุชื่อ',
                    carbon: parseFloat(p.carbon || 0),
                    areaRai: parseFloat(p.areaRai || 0),
                    areaSqm: p.areaSqm,
                    plantingYearBE: p.plantingYearBE,
                    variety: p.variety || 'RRIM 600',
                    methods: p.methods || [],
                    geometry: geometryObj,
                    dbh: p.dbh,
                    height: p.height,
                };

                console.log('Sending fullData to createPlot:', fullData);
                return createPlot(fullData);
            });

            const results = await Promise.all(savePromises);
            console.log('Successfully saved plots:', results);

            // Map results back to local format if needed
            const newlySaved = results.map((result, index) => ({
                ...pendingPlots[index],
                ...result,
                id: result.id || pendingPlots[index].id,
                isPending: false
            }));

            setSavedPlots(prev => [...prev, ...newlySaved]);
            setPendingPlots([]);
            alert(`บันทึกเรียบร้อยทั้งหมด ${newlySaved.length} แปลง!\nข้อมูลพร้อมแสดงผลบนแดชบอร์ดและประวัติแล้ว`);
        } catch (err) {
            console.error('Failed to save plots to API:', err);
            const errorMsg = err.message || 'Unknown error';
            alert(`เกิดข้อผิดพลาดในการบันทึกข้อมูล:\n${errorMsg}\n\nกรุณาตรวจสอบว่าเซิร์ฟเวอร์ Backend ทำงานอยู่ที่พอร์ต 8000`);
        }
    };

    const handleZoomToPlot = (geometry, showMarker = false) => {
        if (!map.current || !geometry) return;
        try {
            console.log('handleZoomToPlot called with:', geometry.type, 'showMarker:', showMarker);

            // Handle both Geometry objects and Feature objects
            const feature = (geometry.type === 'Feature' || geometry.type === 'FeatureCollection')
                ? geometry
                : turf.feature(geometry);

            const bbox = turf.bbox(feature);

            // Check for valid bbox
            if (bbox.some(coord => isNaN(coord))) {
                console.error('Invalid BBOX calculated:', bbox);
                return;
            }

            // Fly to for smoother feeling
            map.current.fitBounds(bbox, {
                padding: { top: 100, bottom: 250, left: 100, right: window.innerWidth > 1024 ? 380 : 100 },
                maxZoom: 19,
                duration: 2000,
                essential: true
            });

            // Cleanup ALL existing markers FIRST
            const existingMarkers = document.getElementsByClassName('edit-target-marker');
            while (existingMarkers[0]) {
                const parent = existingMarkers[0].parentNode;
                if (parent && parent.remove) parent.remove();
                else if (parent && parent.parentNode) parent.parentNode.removeChild(parent);
                else break;
            }

            // ONLY show marker if explicitly requested (e.g. during EDIT mode from Dashboard)
            if (showMarker) {
                const center = turf.center(feature);
                const el = document.createElement('div');
                el.className = 'edit-target-marker';
                el.innerHTML = `
                    <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
                        <div style="width: 28px; height: 28px; background: rgba(239, 68, 68, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; animation: pulse-red-ring 2s infinite;">
                            <div style="width: 12px; height: 12px; background: #ef4444; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>
                        </div>
                        <div style="position: absolute; top: 32px; left: 50%; transform: translateX(-50%); white-space: nowrap; background: #ef4444; color: white; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 900; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4); text-transform: uppercase; letter-spacing: 0.05em;">
                            แปลงที่คุณเลือก
                        </div>
                    </div>
                    <style>
                        @keyframes pulse-red-ring {
                            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); }
                            70% { box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
                            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                        }
                    </style>
                `;

                const marker = new maplibregl.Marker({ element: el })
                    .setLngLat(center.geometry.coordinates)
                    .addTo(map.current);

                // Auto-remove marker after 8 seconds
                setTimeout(() => {
                    try { marker.remove(); } catch (e) { }
                }, 8000);
            }

        } catch (err) {
            console.error('Zoom error details:', err);
        }
    };

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
    // SEARCH PROVINCE (Legacy)
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
                center: [coords[1], coords[0]],
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
    // CASCADING SEARCH LOGIC
    // ==========================================
    const uniqueProvinces = useMemo(() => {
        const map = new Map()
        thailandAddressData.forEach(item => {
            if (!map.has(item.provinceCode)) {
                map.set(item.provinceCode, {
                    code: item.provinceCode,
                    nameTh: item.provinceNameTh,
                    nameEn: item.provinceNameEn || ''
                })
            }
        })
        let arr = Array.from(map.values()).sort((a, b) => a.nameTh.localeCompare(b.nameTh, 'th'))
        if (provinceSearch) arr = arr.filter(p => p.nameTh.includes(provinceSearch) || p.nameEn.toLowerCase().includes(provinceSearch.toLowerCase()))
        return arr
    }, [provinceSearch])

    const filteredDistricts = useMemo(() => {
        if (!selectedProvinceCode) return []
        const map = new Map()
        thailandAddressData.filter(i => i.provinceCode === selectedProvinceCode).forEach(item => {
            if (!map.has(item.districtCode)) {
                map.set(item.districtCode, {
                    code: item.districtCode,
                    nameTh: item.districtNameTh,
                    nameEn: item.districtNameEn || ''
                })
            }
        })
        let arr = Array.from(map.values()).sort((a, b) => a.nameTh.localeCompare(b.nameTh, 'th'))
        if (districtSearch) arr = arr.filter(d => d.nameTh.includes(districtSearch) || d.nameEn.toLowerCase().includes(districtSearch.toLowerCase()))
        return arr
    }, [selectedProvinceCode, districtSearch])

    const filteredSubdistricts = useMemo(() => {
        if (!selectedDistrictCode) return []
        const map = new Map()
        thailandAddressData.filter(i => i.districtCode === selectedDistrictCode).forEach(item => {
            if (!map.has(item.subdistrictCode)) {
                map.set(item.subdistrictCode, {
                    code: item.subdistrictCode,
                    nameTh: item.subdistrictNameTh,
                    nameEn: item.subdistrictNameEn || ''
                })
            }
        })
        let arr = Array.from(map.values()).sort((a, b) => a.nameTh.localeCompare(b.nameTh, 'th'))
        if (subdistrictSearch) arr = arr.filter(d => d.nameTh.includes(subdistrictSearch) || d.nameEn.toLowerCase().includes(subdistrictSearch.toLowerCase()))
        return arr
    }, [selectedDistrictCode, subdistrictSearch])

    // ==========================================
    // BOUNDARY DISPLAY FUNCTIONS
    // ==========================================
    const clearBoundaryLayers = useCallback(() => {
        if (!map.current) return
        const ids = ['admin-boundary-fill', 'admin-boundary-line', 'admin-boundary-line-glow', 'village-points', 'village-labels', 'village-points-glow']
        ids.forEach(id => { try { if (map.current.getLayer(id)) map.current.removeLayer(id) } catch (e) { } })
            ;['admin-boundary', 'village-data'].forEach(id => { try { if (map.current.getSource(id)) map.current.removeSource(id) } catch (e) { } })
        setActiveBoundaryLevel(null)
    }, [])

    const showBoundary = useCallback((geojson, level, zoomLevel) => {
        if (!map.current || !geojson) return
        clearBoundaryLayers()
        const colors = {
            province: { fill: 'rgba(59, 130, 246, 0.12)', line: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' },
            district: { fill: 'rgba(139, 92, 246, 0.12)', line: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)' },
            subdistrict: { fill: 'rgba(16, 185, 129, 0.15)', line: '#10b981', glow: 'rgba(16, 185, 129, 0.5)' }
        }
        const c = colors[level] || colors.province
        map.current.addSource('admin-boundary', { type: 'geojson', data: geojson })
        map.current.addLayer({ id: 'admin-boundary-line-glow', type: 'line', source: 'admin-boundary', paint: { 'line-color': c.glow, 'line-width': 8, 'line-blur': 6, 'line-opacity': 0.6 } })
        map.current.addLayer({ id: 'admin-boundary-fill', type: 'fill', source: 'admin-boundary', paint: { 'fill-color': c.fill, 'fill-opacity': 0.5 } })
        map.current.addLayer({ id: 'admin-boundary-line', type: 'line', source: 'admin-boundary', paint: { 'line-color': c.line, 'line-width': level === 'subdistrict' ? 2 : 3, 'line-dasharray': level === 'subdistrict' ? [3, 2] : [1] } })
        try {
            const bbox = turf.bbox(geojson)
            map.current.fitBounds(bbox, { padding: 60, maxZoom: zoomLevel || 12, duration: 2000 })
        } catch (e) { console.warn('Could not fit bounds:', e) }
        setActiveBoundaryLevel(level)
    }, [clearBoundaryLayers])

    // Show village markers with labels on the map
    const showVillageMarkers = useCallback((villages) => {
        if (!map.current || !villages || villages.length === 0) return
            // Remove old village layers
            ;['village-points', 'village-labels', 'village-points-glow'].forEach(id => { try { if (map.current.getLayer(id)) map.current.removeLayer(id) } catch (e) { } })
        try { if (map.current.getSource('village-data')) map.current.removeSource('village-data') } catch (e) { }

        const geojson = {
            type: 'FeatureCollection',
            features: villages.map((v, i) => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [v.lng, v.lat] },
                properties: { name: v.name, id: i }
            }))
        }
        map.current.addSource('village-data', { type: 'geojson', data: geojson })

        // Outer glow circle
        map.current.addLayer({
            id: 'village-points-glow',
            type: 'circle',
            source: 'village-data',
            paint: {
                'circle-radius': 12,
                'circle-color': '#f59e0b',
                'circle-opacity': 0.15,
                'circle-blur': 0.8
            }
        })

        // Village point circles  
        map.current.addLayer({
            id: 'village-points',
            type: 'circle',
            source: 'village-data',
            paint: {
                'circle-radius': 6,
                'circle-color': '#f59e0b',
                'circle-stroke-width': 2.5,
                'circle-stroke-color': '#ffffff',
                'circle-opacity': 0.9
            }
        })

        // Village name labels
        map.current.addLayer({
            id: 'village-labels',
            type: 'symbol',
            source: 'village-data',
            layout: {
                'text-field': ['get', 'name'],
                'text-size': 12,
                'text-offset': [0, 1.8],
                'text-anchor': 'top',
                'text-font': ['Open Sans Regular'],
                'text-max-width': 10,
                'text-allow-overlap': false,
                'text-ignore-placement': false
            },
            paint: {
                'text-color': '#92400e',
                'text-halo-color': '#ffffff',
                'text-halo-width': 2,
                'text-halo-blur': 0.5
            }
        })
    }, [])

    // ==========================================
    // RESOURCE FETCHING (LOCAL GEOJSON)
    // ==========================================

    // Helper to fetch and filter local GeoJSON
    const fetchLocalGeoJSON = async (url) => {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return await res.json();
        } catch (e) {
            console.error(`Failed to load ${url}:`, e);
            return null;
        }
    }

    // Fetch villages from local GeoJSON
    const fetchVillages = useCallback(async (subdistrictName, districtName, provinceName) => {
        try {
            // Note: thailand_villages.geojson is large (~21MB), so this might take a moment on first load
            const data = await fetchLocalGeoJSON('/boundaries/thailand_villages.geojson');

            if (data && data.features) {
                // Filter by subdistrict name (and ideally district/province to be safe, but file structure varies)
                // properties: { tam_name_th, amp_name_th, prov_name_th, name_th, ... }
                const villages = data.features
                    .filter(f => {
                        const p = f.properties;
                        // Loose matching to handle potential whitespace or minor spelling diffs
                        return p.tam_name_th?.includes(subdistrictName) &&
                            (districtName ? p.amp_name_th?.includes(districtName) : true);
                    })
                    .map((f, i) => ({
                        lat: f.geometry.coordinates[1],
                        lng: f.geometry.coordinates[0],
                        name: f.properties.name_th,
                        id: f.properties.code || i
                    }));

                if (villages.length > 0) {
                    showVillageMarkers(villages);
                } else {
                    console.log('No villages found in local file for:', subdistrictName);
                }
            }
        } catch (err) { console.warn('Village fetch failed:', err) }
    }, [showVillageMarkers])

    // Fetch administrative boundaries from local GeoJSONs
    const fetchBoundary = useCallback(async (name, level, extraContext = {}) => {
        setSearchLoading(true);
        try {
            let url = '';
            let filterFn = null;
            let zoomLevel = 10;

            if (level === 'province') {
                url = '/boundaries/thailand_provinces.geojson';
                zoomLevel = 9;
                // Match by ID if we have it, otherwise name
                // extraContext.code sent from handleProvinceSelect would be ideal, but we can match name
                // thailand_provinces: { code, name_th, name_en }
                filterFn = (f) => f.properties.name_th === name || f.properties.name_en === name;

                // If we have a code in extraContext, prefer it
                if (extraContext.code) {
                    filterFn = (f) => f.properties.code == extraContext.code;
                }

            } else if (level === 'district') {
                url = '/boundaries/thailand_districts.geojson';
                zoomLevel = 11;
                // thailand_districts: { AMP_CODE, AMP_NAME_T, PRV_CODE ... }
                // Match by AMP_CODE if valid
                if (extraContext.code) {
                    filterFn = (f) => f.properties.AMP_CODE == extraContext.code;
                } else {
                    filterFn = (f) => f.properties.AMP_NAME_T === name;
                }

            } else if (level === 'subdistrict') {
                url = '/boundaries/thailand_subdistricts.geojson';
                zoomLevel = 13;
                // thailand_subdistricts: { prov_code, amp_code, tam_code, name_th ... }
                // Construct ID from parts if we have full context
                if (extraContext.code && extraContext.code.length === 6) {
                    const p = extraContext.code.substring(0, 2);
                    const a = extraContext.code.substring(2, 4);
                    const t = extraContext.code.substring(4, 6);
                    filterFn = (f) => f.properties.prov_code == p && f.properties.amp_code == a && f.properties.tam_code == t;
                } else {
                    filterFn = (f) => f.properties.name_th === name;
                }
            }

            if (!url) return;

            const data = await fetchLocalGeoJSON(url);
            if (data && data.features) {
                const feature = data.features.find(filterFn);

                if (feature) {
                    showBoundary(feature, level, zoomLevel);

                    // Specific logic for subdistrict: fetch villages matches
                    if (level === 'subdistrict') {
                        // Pass names for filtering
                        fetchVillages(name, extraContext.distName, extraContext.provName);
                    }
                } else {
                    console.warn(`Boundary not found in ${url} for criteria:`, name, extraContext);
                    // Fallback to searching by name loosely if strict match failed?
                    // For now, strict match on code is best.
                }
            }

        } catch (err) {
            console.warn('Boundary fetch failed:', err);
        } finally {
            setSearchLoading(false);
        }
    }, [showBoundary, fetchVillages]);

    // ==========================================
    // CASCADING SEARCH HANDLERS
    // ==========================================
    const handleProvinceSelect = useCallback((prov) => {
        setSelectedProvinceCode(prov.code)
        setSelectedDistrictCode(null)
        setSelectedSubdistrictCode(null)
        setDistrictSearch('')
        setSubdistrictSearch('')
        setBreadcrumbs([{ label: prov.nameTh, level: 'province', code: prov.code }])
        fetchBoundary(prov.nameTh, 'province', { code: prov.code })
    }, [fetchBoundary])

    const handleDistrictSelect = useCallback((dist) => {
        setSelectedDistrictCode(dist.code)
        setSelectedSubdistrictCode(null)
        setSubdistrictSearch('')
        setBreadcrumbs(prev => [...prev.slice(0, 1), { label: dist.nameTh, level: 'district', code: dist.code }])
        const provName = breadcrumbs[0]?.label || ''
        fetchBoundary(dist.nameTh, 'district', { provName, code: dist.code })
    }, [breadcrumbs, fetchBoundary])

    const handleSubdistrictSelect = useCallback((sub) => {
        setSelectedSubdistrictCode(sub.code)
        setBreadcrumbs(prev => [...prev.slice(0, 2), { label: sub.nameTh, level: 'subdistrict', code: sub.code }])
        const distName = breadcrumbs[1]?.label || ''
        const provName = breadcrumbs[0]?.label || ''
        fetchBoundary(sub.nameTh, 'subdistrict', { distName, provName, code: sub.code })
    }, [breadcrumbs, fetchBoundary])

    const handleBreadcrumbClick = useCallback((index) => {
        if (index === -1) {
            setSelectedProvinceCode(null)
            setSelectedDistrictCode(null)
            setSelectedSubdistrictCode(null)
            setProvinceSearch('')
            setDistrictSearch('')
            setSubdistrictSearch('')
            setBreadcrumbs([])
            clearBoundaryLayers()
            return
        }
        const bc = breadcrumbs[index]
        if (bc.level === 'province') {
            setSelectedDistrictCode(null)
            setSelectedSubdistrictCode(null)
            setDistrictSearch('')
            setSubdistrictSearch('')
            setBreadcrumbs(prev => prev.slice(0, 1))
            fetchBoundary(bc.label, 'province', { code: bc.code })
        } else if (bc.level === 'district') {
            setSelectedSubdistrictCode(null)
            setSubdistrictSearch('')
            setBreadcrumbs(prev => prev.slice(0, 2))
            const provName = breadcrumbs[0]?.label || ''
            fetchBoundary(bc.label, 'district', { provName, code: bc.code })
        }
    }, [breadcrumbs, fetchBoundary, clearBoundaryLayers])

    const resetSearch = useCallback(() => {
        setSelectedProvinceCode(null)
        setSelectedDistrictCode(null)
        setSelectedSubdistrictCode(null)
        setProvinceSearch('')
        setDistrictSearch('')
        setSubdistrictSearch('')
        setBreadcrumbs([])
        clearBoundaryLayers()
    }, [clearBoundaryLayers])

    // ==========================================
    // COORDINATE SEARCH
    // ==========================================
    const handleCoordSearch = useCallback(() => {
        const latitude = parseFloat(coordLat)
        const longitude = parseFloat(coordLng)
        if (isNaN(latitude) || isNaN(longitude)) { alert('กรุณากรอกพิกัดให้ถูกต้อง'); return }
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) { alert('พิกัดไม่ถูกต้อง (Lat: -90~90, Lng: -180~180)'); return }
        clearBoundaryLayers()
        map.current.flyTo({ center: [longitude, latitude], zoom: 14, pitch: 45, duration: 2000 })
        if (userMarker.current) {
            userMarker.current.setLngLat([longitude, latitude])
        } else {
            const el = document.createElement('div')
            el.className = 'user-marker'
            el.innerHTML = `<div class="user-marker-pulse" style="background:rgba(239,68,68,0.3)"></div><div class="user-marker-dot" style="background:linear-gradient(135deg,#ef4444,#dc2626)"></div>`
            userMarker.current = new maplibregl.Marker({ element: el }).setLngLat([longitude, latitude]).addTo(map.current)
        }
    }, [coordLat, coordLng, clearBoundaryLayers])

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
    // CORE WORKFLOW HANDLERS (New Implementation)
    // ==========================================
    const handleCoreSave = async (plotData, isBatchSave = false) => {
        try {
            console.log('Core Save Triggered:', { plotData, isBatchSave });

            // 1. Batch Save (Save All)
            if (isBatchSave || !plotData) {
                if (pendingPlots.length === 0) {
                    alert('ไม่พบข้อมูลแปลงที่ต้องการบันทึก');
                    return;
                }

                // Batch Persist - ensure all fields are passed
                try {
                    const promises = pendingPlots.map(plot => {
                        const fullPlotData = {
                            ...plot,
                            farmerName: plot.farmerName || 'ไม่ระบุชื่อ',
                            carbon: parseFloat(plot.carbon || 0),
                            areaRai: parseFloat(plot.areaRai || 0),
                            areaSqm: plot.areaSqm,
                            plantingYearBE: plot.plantingYearBE,
                            variety: plot.variety || 'RRIM 600',
                            methods: plot.methods || [],
                            geometry: plot.geometry,
                            dbh: plot.dbh,
                            height: plot.height,
                        };
                        return createPlot(fullPlotData);
                    });
                    await Promise.all(promises);
                } catch (e) {
                    console.error("Batch save error (continuing local):", e);
                }

                // Add all pending to saved
                setSavedPlots(prev => {
                    const newPlots = pendingPlots.filter(p => !prev.some(existing => existing.id === p.id));
                    return [...prev, ...newPlots];
                });

                setPendingPlots([]);
                setWorkflowModal(prev => ({ ...prev, isOpen: false }));
                setDigitizeMode(false);

                if (draw.current) {
                    draw.current.deleteAll();
                    draw.current.changeMode('simple_select');
                }
                return;
            }

            // 2. Single Plot Save
            if (!plotData.geometry) {
                // Fallback: Try to get from draw current if active
                if (draw.current) {
                    const all = draw.current.getAll();
                    if (all.features.length > 0) {
                        plotData.geometry = all.features[0].geometry;
                    }
                }

                if (!plotData.geometry) {
                    console.error('Missing Geometry:', plotData);
                    alert('ไม่พบข้อมูลพิกัดแปลง (Geometry Missing)');
                    return;
                }
            }

            // Generate ID & prepare full data with all fields
            const plotId = plotData.id || `temp_${Date.now()}`;
            const finalPlot = {
                ...plotData,
                id: plotId,
                farmerName: plotData.farmerName || 'ไม่ระบุชื่อ',
                carbon: parseFloat(plotData.carbon || 0),
                areaRai: parseFloat(plotData.areaRai || 0),
                areaSqm: plotData.areaSqm,
                plantingYearBE: plotData.plantingYearBE,
                variety: plotData.variety || 'RRIM 600',
                dbh: plotData.dbh,
                height: plotData.height,
                // Ensure methods are saved if available
                methods: plotData.methods || (window.plotMethodsCache && window.plotMethodsCache[plotId]) || [],
                geometry: plotData.geometry,
            };

            // Persist Single - createPlot will normalize for localStorage
            await createPlot(finalPlot);

            // Update State
            setSavedPlots(prev => {
                const existing = prev.find(p => p.id === plotId);
                if (existing) {
                    return prev.map(p => p.id === plotId ? finalPlot : p);
                }
                return [...prev, finalPlot];
            });

            // Remove from Pending
            setPendingPlots(prev => prev.filter(p => p.id !== plotId));

            if (pendingPlots.length <= 1) {
                setWorkflowModal(prev => ({ ...prev, isOpen: false }));
                setDigitizeMode(false);
                if (draw.current) {
                    draw.current.deleteAll();
                    draw.current.changeMode('simple_select');
                }
            }

            console.log('Saved Plot:', finalPlot);

        } catch (err) {
            console.error('Core Save Error:', err);
            alert('เกิดข้อผิดพลาด: ' + err.message);
        }
    };

    const handleCoreAddAnother = (plotData) => {
        // Just Update Pending State - Do NOT close modal, Do NOT restart digitizing
        setPendingPlots(prev => {
            const plotId = plotData.id;
            const existing = prev.find(p => p.id === plotId);
            if (existing) {
                return prev.map(p => p.id === plotId ? plotData : p);
            }
            return [...prev, plotData];
        });
    };


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
            {/* ==========================================
                CRYSTAL COORDINATES (Top Left) - Redesigned
            ========================================== */}
            {/* ==========================================
                COORDINATES (Vertical Stack) - Mobile Optimized
            ========================================== */}
            <div className="absolute top-4 left-4 z-30 flex flex-col gap-2 font-sans select-none">

                {/* 1. LATITUDE */}
                <div
                    className="group flex items-center gap-2 px-2.5 py-1.5 bg-slate-900/60 backdrop-blur-md rounded-lg border border-white/5 shadow-lg shadow-black/10 hover:bg-slate-900/80 hover:border-emerald-500/30 hover:pl-3 transition-all duration-300 cursor-pointer active:scale-95 w-fit"
                    onClick={() => { navigator.clipboard.writeText(coordinates.lat); }}
                    title="Copy Latitude"
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] group-hover:animate-pulse" />
                    <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Lat</span>
                        <span className="text-[11px] font-mono font-medium text-emerald-50 leading-none mt-0.5">{coordinates.lat}</span>
                    </div>
                </div>

                {/* 2. LONGITUDE */}
                <div
                    className="group flex items-center gap-2 px-2.5 py-1.5 bg-slate-900/60 backdrop-blur-md rounded-lg border border-white/5 shadow-lg shadow-black/10 hover:bg-slate-900/80 hover:border-blue-500/30 hover:pl-3 transition-all duration-300 cursor-pointer active:scale-95 w-fit"
                    onClick={() => { navigator.clipboard.writeText(coordinates.lng); }}
                    title="Copy Longitude"
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] group-hover:animate-spin" />
                    <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Lng</span>
                        <span className="text-[11px] font-mono font-medium text-blue-50 leading-none mt-0.5">{coordinates.lng}</span>
                    </div>
                </div>

                {/* 3. ZOOM */}
                <div className="group flex items-center gap-2 px-2.5 py-1.5 bg-slate-900/60 backdrop-blur-md rounded-lg border border-white/5 shadow-lg shadow-black/10 hover:bg-slate-900/80 hover:border-amber-500/30 hover:pl-3 transition-all duration-300 cursor-default w-fit">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] group-hover:scale-150 transition-transform" />
                    <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Zoom</span>
                        <span className="text-[11px] font-mono font-black text-amber-50 leading-none mt-0.5">{coordinates.zoom}</span>
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
                ENHANCED SEARCH PANEL
            ========================================== */}
            {showSearchPanel && (
                <div className="absolute top-20 right-4 z-40 w-80 animate-slideInRight">
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                        {/* Header */}
                        <div className="p-4 border-b border-slate-100">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-slate-700">ค้นหาสถานที่</h3>
                                <button onClick={() => setShowSearchPanel(false)} className="p-1 text-slate-400 hover:text-slate-600">
                                    <CloseIcon />
                                </button>
                            </div>
                            {/* Tabs */}
                            <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                                <button onClick={() => setSearchTab('location')} className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 ${searchTab === 'location' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                    ค้นหาตำแหน่ง
                                </button>
                                <button onClick={() => setSearchTab('coords')} className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 ${searchTab === 'coords' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                    พิกัด Lat/Lng
                                </button>
                            </div>
                        </div>

                        {/* Location Search Tab */}
                        {searchTab === 'location' && (
                            <div>
                                {/* Breadcrumbs */}
                                {breadcrumbs.length > 0 && (
                                    <div className="px-4 pt-3 flex items-center gap-1 flex-wrap">
                                        <button onClick={() => handleBreadcrumbClick(-1)} className="text-[10px] font-bold text-emerald-600 hover:underline">ทั้งหมด</button>
                                        {breadcrumbs.map((bc, i) => (
                                            <span key={i} className="flex items-center gap-1">
                                                <span className="text-slate-300 text-[10px]">›</span>
                                                <button onClick={() => handleBreadcrumbClick(i)} className={`text-[10px] font-bold ${i === breadcrumbs.length - 1 ? 'text-slate-700' : 'text-emerald-600 hover:underline'}`}>
                                                    {bc.label}
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Loading */}
                                {searchLoading && (
                                    <div className="mx-4 mt-2">
                                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1 text-center">กำลังโหลดขอบเขต...</p>
                                    </div>
                                )}

                                {/* Active Boundary Badge */}
                                {activeBoundaryLevel && !searchLoading && (
                                    <div className="mx-4 mt-2 flex items-center justify-between">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${activeBoundaryLevel === 'province' ? 'bg-blue-50 text-blue-600' :
                                            activeBoundaryLevel === 'district' ? 'bg-purple-50 text-purple-600' :
                                                'bg-emerald-50 text-emerald-600'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${activeBoundaryLevel === 'province' ? 'bg-blue-500' :
                                                activeBoundaryLevel === 'district' ? 'bg-purple-500' :
                                                    'bg-emerald-500'
                                                }`}></div>
                                            แสดงขอบเขต{activeBoundaryLevel === 'province' ? 'จังหวัด' : activeBoundaryLevel === 'district' ? 'อำเภอ' : 'ตำบล'}
                                        </span>
                                        <button onClick={clearBoundaryLayers} className="text-[10px] text-red-400 hover:text-red-600 font-medium">ล้าง</button>
                                    </div>
                                )}

                                {/* Province List */}
                                {!selectedProvinceCode && (
                                    <div>
                                        <div className="p-3">
                                            <input
                                                type="text"
                                                placeholder="ค้นหาจังหวัด..."
                                                value={provinceSearch}
                                                onChange={(e) => setProvinceSearch(e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                                            />
                                        </div>
                                        <div className="max-h-64 overflow-y-auto scrollbar-subtle pb-2">
                                            {uniqueProvinces.map(prov => (
                                                <button key={prov.code} onClick={() => handleProvinceSelect(prov)} className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-emerald-50 flex items-center gap-3 group">
                                                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-100 transition-colors flex-shrink-0">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-xs font-semibold text-slate-700 truncate">{prov.nameTh}</span>
                                                        {prov.nameEn && <span className="text-[10px] text-slate-400 truncate">{prov.nameEn}</span>}
                                                    </div>
                                                    <svg className="w-4 h-4 text-slate-300 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7" /></svg>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* District List */}
                                {selectedProvinceCode && !selectedDistrictCode && (
                                    <div>
                                        <div className="p-3">
                                            <input
                                                type="text"
                                                placeholder="ค้นหาอำเภอ..."
                                                value={districtSearch}
                                                onChange={(e) => setDistrictSearch(e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all"
                                            />
                                        </div>
                                        <div className="max-h-64 overflow-y-auto scrollbar-subtle pb-2">
                                            {filteredDistricts.map(dist => (
                                                <button key={dist.code} onClick={() => handleDistrictSelect(dist)} className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-purple-50 flex items-center gap-3 group">
                                                    <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500 group-hover:bg-purple-100 transition-colors flex-shrink-0">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 12h18M12 3v18" /></svg>
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-xs font-semibold text-slate-700 truncate">{dist.nameTh}</span>
                                                        {dist.nameEn && <span className="text-[10px] text-slate-400 truncate">{dist.nameEn}</span>}
                                                    </div>
                                                    <svg className="w-4 h-4 text-slate-300 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7" /></svg>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Sub-district List */}
                                {selectedDistrictCode && (
                                    <div>
                                        <div className="p-3">
                                            <input
                                                type="text"
                                                placeholder="ค้นหาตำบล..."
                                                value={subdistrictSearch}
                                                onChange={(e) => setSubdistrictSearch(e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                                            />
                                        </div>
                                        <div className="max-h-64 overflow-y-auto scrollbar-subtle pb-2">
                                            {filteredSubdistricts.map(sub => (
                                                <button key={sub.code} onClick={() => handleSubdistrictSelect(sub)} className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-emerald-50 flex items-center gap-3 group ${selectedSubdistrictCode === sub.code ? 'bg-emerald-50' : ''}`}>
                                                    <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-100 transition-colors flex-shrink-0">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l9 4.5v11L12 22l-9-4.5v-11L12 2z" /></svg>
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-xs font-semibold text-slate-700 truncate">{sub.nameTh}</span>
                                                        {sub.nameEn && <span className="text-[10px] text-slate-400 truncate">{sub.nameEn}</span>}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Coordinate Search Tab */}
                        {searchTab === 'coords' && (
                            <div className="p-4 space-y-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Latitude</label>
                                    <input type="number" step="any" value={coordLat} onChange={(e) => setCoordLat(e.target.value)} placeholder="เช่น 13.7563" className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Longitude</label>
                                    <input type="number" step="any" value={coordLng} onChange={(e) => setCoordLng(e.target.value)} placeholder="เช่น 100.5018" className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
                                </div>

                                <button onClick={handleCoordSearch} className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md shadow-blue-500/20 active:scale-[0.98]">
                                    ไปยังพิกัดนี้
                                </button>
                                <div className="bg-blue-50 rounded-xl p-3">
                                    <p className="text-[10px] text-blue-600 font-medium">💡 กรอกพิกัดทศนิยม เช่น Lat: 13.7563, Lng: 100.5018</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

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
                            setWorkflowModal({ isOpen: true, mode: 'draw_instruction' });
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
                            setWorkflowModal({ isOpen: true, mode: 'import_instruction' });
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
                        onClick={() => handleNavClick('/dashboard/personal')}
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
                onSave={handleCoreSave}
                onAddAnother={handleCoreAddAnother}
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
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                .animate-bounce-subtle {
                    animation: bounce-subtle 2s ease-in-out infinite;
                }
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
                /* ==========================================
                   MINIMAL POPUP - Glassmorphism & Soft
                   ========================================== */
                .minimal-popup {
                    z-index: 50;
                }
                .minimal-popup .maplibregl-popup-content {
                    padding: 0;
                    border-radius: 24px;
                    background: transparent;
                    box-shadow: none;
                }
                .minimal-popup .maplibregl-popup-tip {
                    border-top-color: rgba(255, 255, 255, 0.95);
                    margin-top: -1px; /* seamless tip */
                }
                .minimal-popup .maplibregl-popup-close-button {
                    display: none;
                }

                /* Card Container */
                .m-card {
                    font-family: 'Prompt', 'Inter', system-ui, sans-serif;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px); /* Safari support */
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 
                        0 20px 40px -8px rgba(0, 0, 0, 0.12), 
                        0 12px 16px -8px rgba(0, 0, 0, 0.04),
                        0 0 0 1px rgba(255,255,255,0.6) inset; /* Inner glow */
                    border: 1px solid rgba(0,0,0,0.05);
                    transform-origin: bottom center;
                    animation: m-pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                /* Header */
                .m-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding-bottom: 4px;
                }
                
                /* Status Badge */
                .m-badge {
                    box-shadow: 0 2px 6px rgba(16, 185, 129, 0.15);
                }

                /* Edit Button */
                .m-edit-btn:hover {
                    background: #ecfdf5 !important;
                    color: #059669 !important;
                    transform: rotate(15deg) scale(1.1);
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
                }
                .m-edit-btn:active {
                    transform: scale(0.95);
                }

                /* Body Content */
                .m-name {
                    font-feature-settings: "kern";
                }

                /* Animation */
                @keyframes m-pop-in {
                    0% { 
                        opacity: 0; 
                        transform: translateY(20px) scale(0.9) perspective(500px) rotateX(10deg); 
                    }
                    100% { 
                        opacity: 1; 
                        transform: translateY(0) scale(1) perspective(500px) rotateX(0deg); 
                    }
                }
            `}</style>
        </div>
    )
}

export default MapPage
