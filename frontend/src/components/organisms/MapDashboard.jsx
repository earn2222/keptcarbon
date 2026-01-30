import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as turf from '@turf/turf';
import {
    Layers, ZoomIn, ZoomOut, Maximize, Navigation, Info,
    X, Calendar, Leaf, MapPin
} from 'lucide-react';
import { cn } from '../../lib/utils';

// ==========================================
// MAP DASHBOARD WITH PLOTS
// ==========================================
export default function MapDashboard({ plots = [], selectedPlot, onSelectPlot, onClose }) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [showLayers, setShowLayers] = useState(false);
    const [baseLayer, setBaseLayer] = useState('satellite');

    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        // Initialize map
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: `https://api.maptiler.com/maps/hybrid/style.json?key=YOUR_MAPTILER_KEY`,
            center: [100.5, 13.7], // Thailand
            zoom: 6,
            pitch: 0,
            bearing: 0
        });

        map.current.on('load', () => {
            setMapLoaded(true);

            // Add plots to map
            if (plots.length > 0) {
                plots.forEach((plot, index) => {
                    if (plot.geometry) {
                        // Add plot polygon
                        map.current.addSource(`plot-${plot.id}`, {
                            type: 'geojson',
                            data: {
                                type: 'Feature',
                                geometry: plot.geometry,
                                properties: plot
                            }
                        });

                        map.current.addLayer({
                            id: `plot-fill-${plot.id}`,
                            type: 'fill',
                            source: `plot-${plot.id}`,
                            paint: {
                                'fill-color': '#10b981',
                                'fill-opacity': 0.3
                            }
                        });

                        map.current.addLayer({
                            id: `plot-outline-${plot.id}`,
                            type: 'line',
                            source: `plot-${plot.id}`,
                            paint: {
                                'line-color': '#059669',
                                'line-width': 2
                            }
                        });

                        // Add click handler
                        map.current.on('click', `plot-fill-${plot.id}`, () => {
                            onSelectPlot(plot);
                        });

                        // Change cursor on hover
                        map.current.on('mouseenter', `plot-fill-${plot.id}`, () => {
                            map.current.getCanvas().style.cursor = 'pointer';
                        });
                        map.current.on('mouseleave', `plot-fill-${plot.id}`, () => {
                            map.current.getCanvas().style.cursor = '';
                        });
                    }
                });

                // Fit bounds to all plots
                const bounds = new maplibregl.LngLatBounds();
                plots.forEach(plot => {
                    if (plot.geometry) {
                        const coords = plot.geometry.type === 'Polygon'
                            ? plot.geometry.coordinates[0]
                            : plot.geometry.coordinates[0][0];
                        coords.forEach(coord => bounds.extend(coord));
                    }
                });
                map.current.fitBounds(bounds, { padding: 50 });
            }
        });

        // Add navigation controls
        map.current.addControl(new maplibregl.NavigationControl(), 'bottom-right');

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    // Highlight selected plot
    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        plots.forEach(plot => {
            if (map.current.getLayer(`plot-fill-${plot.id}`)) {
                map.current.setPaintProperty(
                    `plot-fill-${plot.id}`,
                    'fill-opacity',
                    plot.id === selectedPlot?.id ? 0.6 : 0.3
                );
                map.current.setPaintProperty(
                    `plot-outline-${plot.id}`,
                    'line-width',
                    plot.id === selectedPlot?.id ? 4 : 2
                );
            }
        });
    }, [selectedPlot, plots, mapLoaded]);

    return (
        <div className="relative w-full h-screen bg-gray-900">
            {/* Map Container */}
            <div ref={mapContainer} className="absolute inset-0" />

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                            <MapPin size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-800">แผนที่แปลงยางพารา</h2>
                            <p className="text-xs text-gray-500">{plots.length} แปลง</p>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-10">
                <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-4 space-y-2">
                    <h3 className="text-sm font-bold text-gray-800 mb-3">สถิติ</h3>
                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-4 h-4 bg-emerald-500/30 border-2 border-emerald-600 rounded"></div>
                        <span className="text-gray-700">แปลงยางพารา</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                        คลิกที่แปลงเพื่อดูรายละเอียด
                    </div>
                </div>
            </div>

            {/* Plot Info Panel */}
            {selectedPlot && (
                <div className="absolute top-24 right-4 z-10 w-80 max-w-[calc(100vw-2rem)]">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 animate-in slide-in-from-right duration-300">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                                    <Leaf size={24} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">{selectedPlot.farmerName}</h3>
                                    <p className="text-xs text-gray-500">{selectedPlot.variety}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => onSelectPlot(null)}
                                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                                <span className="text-gray-500">พื้นที่</span>
                                <span className="font-semibold text-gray-800">
                                    {selectedPlot.areaRai}-{selectedPlot.areaNgan}-{selectedPlot.areaSqWah} ไร่
                                </span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                                <span className="text-gray-500">ปีที่ปลูก</span>
                                <span className="font-semibold text-gray-800">พ.ศ. {selectedPlot.plantingYearBE}</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                                <span className="text-gray-500">อายุ</span>
                                <span className="font-semibold text-gray-800">{selectedPlot.age} ปี</span>
                            </div>
                            <div className="flex justify-between items-center py-3 px-3 bg-emerald-50 rounded-lg border border-emerald-200 mt-3">
                                <span className="text-sm font-medium text-gray-700">ค่าคาร์บอนดูด</span>
                                <span className="text-xl font-bold text-emerald-600">
                                    {selectedPlot.carbon} <span className="text-sm font-normal">tCO₂e</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Plot List */}
            {!selectedPlot && plots.length > 0 && (
                <div className="absolute top-24 right-4 z-10 w-80 max-w-[calc(100vw-2rem)]">
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4">
                        <h3 className="text-sm font-bold text-gray-800 mb-3">รายการแปลง</h3>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {plots.slice(0, 5).map(plot => (
                                <button
                                    key={plot.id}
                                    onClick={() => onSelectPlot(plot)}
                                    className="w-full flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-emerald-50 transition-colors text-left"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shrink-0">
                                        <Leaf size={16} className="text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{plot.farmerName}</p>
                                        <p className="text-xs text-gray-500">{plot.carbon} tCO₂e</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                        {plots.length > 5 && (
                            <p className="text-xs text-gray-500 text-center mt-3">
                                และอีก {plots.length - 5} แปลง
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
