import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, FeatureGroup, useMap, LayersControl, GeoJSON } from 'react-leaflet'
import * as L from 'leaflet'
import '@geoman-io/leaflet-geoman-free'
import * as turf from '@turf/turf'
import { PlotSidebar } from '../components/organisms'
import { calculateCarbon, createPlot, getPlots } from '../services/api'

// Set default icon for Leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Geoman Control Component
const GeomanControls = ({ onDrawCreated, onDrawEdited }) => {
    const map = useMap()

    useEffect(() => {
        if (!map) return;

        // Init Geoman
        map.pm.addControls({
            position: 'topleft',
            drawCircle: false,
            drawCircleMarker: false,
            drawMarker: false,
            drawPolyline: false,
            drawRectangle: false,
            drawPolygon: true,
            editMode: true,
            dragMode: true,
            cutPolygon: false,
            removalMode: true,
        })

        map.pm.setLang('en')

        const handleCreate = (e) => {
            if (onDrawCreated) onDrawCreated(e)
        }

        const handleUpdate = (e) => {
            if (onDrawEdited) onDrawEdited(e)
        }

        map.on('pm:create', handleCreate)
        map.on('pm:remove', handleUpdate)

        return () => {
            if (map.pm) map.pm.removeControls()
            map.off('pm:create', handleCreate)
            map.off('pm:remove', handleUpdate)
        }
    }, [map, onDrawCreated, onDrawEdited])

    return null
}

// Helper Component to control map zoom
const FlyToFeature = ({ focusedGeometry }) => {
    const map = useMap();

    useEffect(() => {
        if (focusedGeometry && Object.keys(focusedGeometry).length > 0) {
            try {
                // Create a temporary GeoJSON layer to calculate bounds
                const layer = L.geoJSON(focusedGeometry);
                const bounds = layer.getBounds();

                if (bounds.isValid()) {
                    map.flyToBounds(bounds, {
                        padding: [50, 50],
                        maxZoom: 16,
                        duration: 1.5
                    });
                }
            } catch (e) {
                console.error("Invalid geometry for zoom", e);
            }
        }
    }, [focusedGeometry, map]);

    return null;
}

function MapPage() {
    const [center] = useState([8.4304, 99.9631]) // Nakhon Si Thammarat
    const [zoom] = useState(13)

    // Data States
    const [plots, setPlots] = useState([])

    // Zoom State
    const [focusedGeometry, setFocusedGeometry] = useState(null);

    // Calculation States
    const [selectedAreaRai, setSelectedAreaRai] = useState(0)
    const [calculationResult, setCalculationResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [currentLayer, setCurrentLayer] = useState(null)

    // Load Plots
    useEffect(() => {
        fetchPlots();
    }, []);

    const fetchPlots = async () => {
        try {
            const data = await getPlots();
            const mappedPlots = data.map(p => ({
                id: p.id,
                name: p.name,
                area: p.area_rai ? `${p.area_rai.toFixed(2)} ไร่` : '0 ไร่',
                year: p.planting_year,
                status: 'complete',
                geometry: p.geometry,
                carbon: p.carbon_tons ? p.carbon_tons.toFixed(2) : null, // Mapped here
                carbonData: p.tree_age && p.area_rai ? {
                    carbon_tons: p.carbon_tons || 0,
                } : null
            }));
            setPlots(mappedPlots);
        } catch (error) {
            console.error("Failed to load plots", error);
        }
    }

    const handlePlotSelect = (plot) => {
        if (plot.geometry) {
            setFocusedGeometry(plot.geometry);
        } else {
            alert('แปลงนี้ไม่มีข้อมูลพิกัดแผนที่');
        }
    }

    const handleDrawCreated = (e) => {
        const layer = e.layer
        const geojson = layer.toGeoJSON()

        // Calculate Area using Turf.js
        const areaSqm = turf.area(geojson)
        const areaRai = areaSqm / 1600 // 1 Rai = 1600 Sqm

        setCurrentLayer(layer)
        setSelectedAreaRai(areaRai)
        setCalculationResult(null)

        layer.on('pm:edit', () => {
            const newGeoSync = layer.toGeoJSON()
            const newArea = turf.area(newGeoSync) / 1600
            setSelectedAreaRai(newArea)
            setCalculationResult(null)
        })
    }

    const handleDrawEdited = () => {
        if (!currentLayer || !currentLayer._map) {
            setSelectedAreaRai(0)
            setCalculationResult(null)
            setCurrentLayer(null)
        }
    }

    const handleCalculate = async (age, area) => {
        setLoading(true)
        try {
            const result = await calculateCarbon(age, area)
            setCalculationResult(result)
        } catch (error) {
            alert('เกิดข้อผิดพลาดในการคำนวณ API')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleSavePlot = async (plotData) => {
        setLoading(true);
        try {
            let geometry = null;
            if (currentLayer) {
                geometry = currentLayer.toGeoJSON().geometry;
            }

            const payload = {
                name: plotData.name,
                planting_year: parseInt(plotData.year),
                notes: `Area: ${plotData.area}`,
                geometry: geometry
            }

            await createPlot(payload);
            await fetchPlots();

            if (currentLayer) {
                currentLayer.remove();
            }

            setCurrentLayer(null)
            setSelectedAreaRai(0)
            setCalculationResult(null)
            alert('บันทึกแปลงเรียบร้อยแล้ว');

        } catch (error) {
            alert('ไม่สามารถบันทึกแปลงได้: ' + error.message);
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="h-[calc(100vh-150px)] flex gap-6">
            {/* Map Area */}
            <div className="flex-1 bg-white rounded-2xl shadow-card overflow-hidden relative z-0">
                <MapContainer
                    center={center}
                    zoom={zoom}
                    style={{ height: "100%", width: "100%" }}
                    className="z-0"
                >
                    <LayersControl position="topright">
                        <LayersControl.BaseLayer checked name="OpenStreetMap">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                        </LayersControl.BaseLayer>

                        <LayersControl.BaseLayer name="Google Satellite">
                            <TileLayer
                                url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                                attribution='&copy; Google Maps'
                                maxZoom={20}
                            />
                        </LayersControl.BaseLayer>

                        <LayersControl.BaseLayer name="Google Hybrid">
                            <TileLayer
                                url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                                attribution='&copy; Google Maps'
                                maxZoom={20}
                            />
                        </LayersControl.BaseLayer>
                    </LayersControl>

                    <FeatureGroup>
                        <GeomanControls
                            onDrawCreated={handleDrawCreated}
                            onDrawEdited={handleDrawEdited}
                        />
                    </FeatureGroup>

                    <FlyToFeature focusedGeometry={focusedGeometry} />

                    {plots.map((plot) => (
                        plot.geometry && (
                            <GeoJSON
                                key={plot.id}
                                data={plot.geometry}
                                style={{ color: '#3cc2cf', weight: 2, fillOpacity: 0.4 }}
                                onEachFeature={(feature, layer) => {
                                    layer.bindPopup(
                                        `<b>${plot.name}</b><br/>พื้นที่: ${plot.area}<br/>ปีที่ปลูก: ${plot.year}`
                                    );
                                }}
                            />
                        )
                    ))}

                </MapContainer>
            </div>

            {/* Sidebar */}
            <PlotSidebar
                plots={plots}
                selectedAreaRai={selectedAreaRai}
                onCalculate={handleCalculate}
                calculationResult={calculationResult}
                onSavePlot={handleSavePlot}
                onPlotSelect={handlePlotSelect}
            />
        </div>
    )
}

export default MapPage
