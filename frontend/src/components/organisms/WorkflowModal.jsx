import React, { useState, useEffect, useRef } from 'react';
import * as turf from '@turf/turf';
import shp from 'shpjs';
import {
    Loader2, Trash2, Edit3, Leaf, Zap,
    Calculator, Upload, X, ChevronRight, ArrowLeft,
    CheckCircle2, Map, TreeDeciduous, List, Repeat, Eye,
    Search, Calendar, Coins, Scaling, Ruler, FileText, Globe,
    LayoutDashboard, Clock, Plus
} from "lucide-react";
import { cn } from "../../lib/utils";

// ==========================================
// INTERNAL ICON COMPONENTS
// ==========================================
const PencilIcon = ({ size = 20, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className} style={{ width: size, height: size }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
)

const UploadIcon = ({ size = 20, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className} style={{ width: size, height: size }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
)

const TargetIcon = ({ size = 20, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className} style={{ width: size, height: size }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20v2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M22 12h-2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 12H2" />
    </svg>
)

const DrawPolygonIcon = ({ size = 20, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} style={{ width: size, height: size }}>
        <path d="M21 7.374l-2 2V12.5a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5v-1a1 1 0 00-1-1h-1a1 1 0 00-1 1v1h-1v-2a2 2 0 012-2h1a3 3 0 10-2-5.732 2 2 0 01-2 2h-1v-1a1 1 0 00-1-1h-1a1 1 0 00-1 1v1a1 1 0 001 1h1v1h-1a2 2 0 01-2-2V5.5a3 3 0 10-2 0V7a3 3 0 102 5.732 2 2 0 012-2h1v1a1 1 0 001 1h1a1 1 0 001-1v-1h1v1.5a1.5 1.5 0 001.5 1.5h2a1.5 1.5 0 001.5-1.5v-3.126l2-2v4.252a1 1 0 002 0v-6.378a1 1 0 00-2 0v4.252z" />
    </svg>
)

// ==========================================
// MOBILE-FIRST MINIMAL MODAL
// ==========================================
export default function WorkflowModal({
    isOpen,
    onClose,
    mode = 'draw',
    initialData,
    accumulatedPlots = [],
    onAddAnother,
    onSave,
    onDeletePlot,
    onUpdatePlot,
    onStartDrawing,
    onZoomToPlot,
    onPreviewPlots,
    isEditing = false,
    carbonPrice = 250,
    currentFormattedAddress = 'ไม่ระบุสถานที่'
}) {
    const [currentPrice, setCurrentPrice] = useState(carbonPrice);

    // Sync if prop changes
    useEffect(() => {
        if (carbonPrice) setCurrentPrice(carbonPrice);
    }, [carbonPrice]);
    const [currentStep, setCurrentStep] = useState(-1);
    const [selectedMethods, setSelectedMethods] = useState(['eq1']);
    const [loading, setLoading] = useState(false);
    const [loadingSat, setLoadingSat] = useState(false);
    const [satData, setSatData] = useState({ ndvi: 0, tcari: 0 });

    const [formData, setFormData] = useState({
        farmerName: '',
        originalShpName: '',
        areaRai: 0,
        areaNgan: 0,
        areaSqWah: 0,
        areaSqm: 0,
        plantingYearBE: '',
        age: 0,
        manualAge: '', // New optional field
        variety: '',
        dbh: '',
        height: '',
        methodManual: 'eq1',
        methodSat: 'ndvi',
        svgPath: '',
        geometry: null
    });

    const [result, setResult] = useState(null); // { methods: [{id, name, formula, carbon}], bestCarbon, avgCarbon }
    const [shpPlots, setShpPlots] = useState([]);
    const [selectedShpPlotIds, setSelectedShpPlotIds] = useState([]);
    const [processingQueue, setProcessingQueue] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [shpError, setShpError] = useState(null);
    const [useMetricUnit, setUseMetricUnit] = useState(false); // Toggle for Rai/Sqm
    const [searchTerm, setSearchTerm] = useState('');

    const [expandedPlotId, setExpandedPlotId] = useState(null);
    const [activeMethodTabs, setActiveMethodTabs] = useState({}); // { [plotId]: methodIndex }
    const containerRef = useRef(null);
    const fileInputRef = useRef(null);
    const [showShpInfo, setShowShpInfo] = useState(false);
    const methodSectionRef = useRef(null);
    const fieldDataRef = useRef(null);
    const [farmerComplete, setFarmerComplete] = useState(false);
    const [methodsComplete, setMethodsComplete] = useState(false);

    // ==========================================
    // SYNC PREVIEW PLOTS TO MAP
    // ==========================================
    // Use JSON string as dependency to ensure deep comparison without infinite loops
    // We include currentStep and formData.geometry in the dependency to trigger updates when moving between steps
    const shpPlotsJson = JSON.stringify(shpPlots.map(p => ({ id: p.id, check: 'list' })));
    const activePlotJson = JSON.stringify(formData.geometry ? { type: formData.geometry.type, coords: formData.geometry.coordinates } : null);

    useEffect(() => {
        if (!onPreviewPlots) return;

        let plotsToSend = [];

        // MODE 1: Import List (Step 0) - Show ALL plots as previews
        if (currentStep === 0 && shpPlots.length > 0) {
            plotsToSend = shpPlots.map(p => ({
                ...p,
                isPreview: true,
                isActive: false
            }));
        }
        // MODE 2: Processing (Step 1+) - Show CURRENT active plot + OTHERS from SHP list as context
        else if (currentStep > 0 && formData.geometry) {
            // 1. Add current actively processed plot (High emphasis)
            // But ONLY if we are NOT in the final list view (Step 4), as it is already saved in accumulatedPlots
            if (currentStep !== 4) {
                const isResultStep = currentStep === 3;

                plotsToSend.push({
                    ...formData,
                    // Merge Result Data if available (for Step 3)
                    ...(result || {}),
                    id: formData.id || 'current-processing',
                    // Step 3 (Result) -> Green (Saved style) | Step 1-2 -> Red (Active/Processing)
                    isPreview: !isResultStep,
                    isActive: !isResultStep,
                    // Explicitly pass carbon for Map Page to pick up
                    carbon: result ? result.carbon : (formData.carbon || 0)
                });
            }

            // 2. Add other SHP plots that were selected but not currently processing (Context)
            // This prevents them from "disappearing" which was requested by user
            const otherShpPreviews = shpPlots
                .filter(p => selectedShpPlotIds.includes(p.id) && p.id !== formData.id)
                .map(p => ({
                    ...p,
                    isPreview: true,
                    isActive: false
                }));

            plotsToSend = [...plotsToSend, ...otherShpPreviews];
        }

        onPreviewPlots(plotsToSend);

    }, [shpPlotsJson, activePlotJson, currentStep, onPreviewPlots, isEditing, selectedShpPlotIds, result]);

    // Ensure we clear previews when truly done (unmount or close)
    useEffect(() => {
        return () => {
            // Note: We don't clear here because unmount might be due to parent unmount
            // The cleanup is handled by the empty array send above when shpPlots becomes empty
        };
    }, []);

    // ==========================================
    // INITIALIZATION
    // ==========================================
    const generateSvgPath = (geometry) => {
        try {
            const feature = turf.feature(geometry);
            const bbox = turf.bbox(feature);
            const scale = Math.max(bbox[2] - bbox[0], bbox[3] - bbox[1]) || 0.0001;
            const coords = geometry.type === 'Polygon' ? geometry.coordinates[0] : geometry.coordinates[0][0];

            if (coords) {
                return coords.map(c => {
                    const x = ((c[0] - bbox[0]) / scale) * 80 + 10;
                    const y = (1 - ((c[1] - bbox[1]) / scale)) * 80 + 10;
                    return `${x},${y}`;
                }).join(' ');
            }
        } catch (e) { console.error("SVG Error:", e); }
        return '';
    };
    // ==========================================
    // INITIALIZATION
    // ==========================================
    // Effect 1: Handle OPEN/CLOSE and MODE adjustments
    useEffect(() => {
        if (isOpen) {
            // Only set init step if we are NOT already in a deeper step (unless switching modes)
            // But simplify: If mode is import, start at 0. If list, start at 4.
            // We use a ref or check current state to avoid resetting if we are just updating data.

            // For now, simple logic:
            if (mode === 'draw_instruction') {
                setCurrentStep(-1);
            } else if (mode === 'import_instruction') {
                setCurrentStep(-2);
            } else if (mode === 'import' && processingQueue.length === 0 && shpPlots.length === 0) {
                // Fresh import start
                setCurrentStep(0);
            } else if (mode === 'list') {
                setCurrentStep(4);
            } else if (mode === 'draw' && !initialData) {
                // Only if not editing an existing plot
                setCurrentStep(1);
            }

            setResult(null);
        } else {
            // Cleanup on Close
            if (processingQueue.length === 0) {
                setShpPlots([]);
                setSelectedShpPlotIds([]);
            }
            setShowShpInfo(false);
        }
    }, [isOpen, mode]);

    // Effect 2: Handle Initial Data (Editing)
    useEffect(() => {
        if (isOpen && initialData) {
            console.log("Loading initialData:", initialData);
            setFormData(prev => ({
                ...prev,
                ...initialData,
                farmerName: initialData.farmerName || '',
                originalShpName: initialData.originalShpName || '',
                plantingYearBE: initialData.plantingYearBE || '',
                variety: initialData.variety || '',
                age: initialData.age || 0,
                manualAge: initialData.manualAge || '', // Restore manual age
                dbh: initialData.dbh || '',
                height: initialData.height || '',
                areaRai: initialData.areaRai || 0,
                areaNgan: initialData.areaNgan || 0,
                areaSqWah: initialData.areaSqWah || 0,
                areaSqm: initialData.areaSqm || 0,
                svgPath: initialData.svgPath || (initialData.geometry ? generateSvgPath(initialData.geometry) : '')
            }));

            // Restore Selected Methods
            if (initialData.selectedMethods && Array.isArray(initialData.selectedMethods)) {
                setSelectedMethods(initialData.selectedMethods);
            } else if (initialData.methods && Array.isArray(initialData.methods)) {
                setSelectedMethods(initialData.methods.map(m => m.id));
            } else {
                // Fallback for older data
                const methods = [];
                if (initialData.methodManual) methods.push(initialData.methodManual);
                if (initialData.methodSat) methods.push(initialData.methodSat);
                setSelectedMethods(methods.length > 0 ? methods : ['eq1']);
            }

            // Restore Satellite Data
            if (initialData.satData) {
                setSatData(initialData.satData);
            }

            // If editing, we start at step 1 usually
            if (mode !== 'list' && mode !== 'import') {
                setCurrentStep(1);
            }
        }
    }, [isOpen, initialData, mode]);

    useEffect(() => {
        if (formData.plantingYearBE) {
            const currentYearBE = new Date().getFullYear() + 543;
            const age = currentYearBE - parseInt(formData.plantingYearBE);
            setFormData(prev => ({ ...prev, age: age >= 0 ? age : 0 }));
        }
    }, [formData.plantingYearBE]);

    // ==========================================
    // SATELLITE DATA
    // ==========================================

    useEffect(() => {
        const hasSatMethod = selectedMethods.includes('ndvi') || selectedMethods.includes('tcari');
        if (hasSatMethod && satData.ndvi === 0) {
            setLoadingSat(true);
            setTimeout(() => {
                setSatData({
                    ndvi: 0.72,
                    tcari: 0.45,
                    date: '14',
                    month: 'กุมภาพันธ์',
                    year: '2569',
                    source: 'Sentinel-2'
                });
                setLoadingSat(false);
            }, 1500);
        }
    }, [selectedMethods, satData.ndvi]);

    // ==========================================
    // AUTO-SCROLL within combined step (farmer info → methods)
    // ==========================================
    useEffect(() => {
        const isFarmerDone = formData.farmerName && formData.plantingYearBE && formData.variety;
        if (isFarmerDone && !farmerComplete && currentStep === 1) {
            setFarmerComplete(true);
            setTimeout(() => {
                methodSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 400);
        }
        if (!isFarmerDone) setFarmerComplete(false);
    }, [formData.farmerName, formData.plantingYearBE, formData.variety, currentStep, farmerComplete]);

    // Auto-scroll to field data when methods selected
    useEffect(() => {
        if (currentStep === 1 && selectedMethods.length > 0 && farmerComplete) {
            setTimeout(() => {
                fieldDataRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        }
    }, [selectedMethods, currentStep, farmerComplete]);

    // ==========================================
    // HANDLERS
    // ==========================================

    const handleShpUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setIsUploading(true);
        setShpError(null);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const geojson = await shp(arrayBuffer);
            let features = Array.isArray(geojson) ? geojson.flatMap(fc => fc.features) : geojson.features;

            const plots = features.map((f, i) => {
                const area = turf.area(f);
                const raiTotal = area / 1600;
                const rai = Math.floor(raiTotal);
                const ngan = Math.floor((raiTotal - rai) * 4);
                const sqWah = parseFloat(((raiTotal - rai - ngan / 4) * 400).toFixed(1));

                // Extract properties with fallbacks
                const props = f.properties || {};
                const farmer = props.FARMER || props.NAME || props.farmer || props.name || `แปลงที่ ${i + 1}`;
                const variety = props.VARIETY || props.variety || '';
                const plantYear = props.PLANT_YEAR || props.plant_year || props.YEAR || props.year || '';

                return {
                    id: Date.now() + i,
                    farmerName: farmer,
                    variety: variety,
                    plantingYearBE: plantYear,
                    areaSqm: parseFloat(area.toFixed(2)),
                    areaRai: rai,
                    areaNgan: ngan,
                    areaSqWah: sqWah,
                    geometry: f.geometry,
                    svgPath: generateSvgPath(f.geometry)
                };
            });

            setShpPlots(plots);
            setSelectedShpPlotIds([]);
            setSearchTerm('');
        } catch (e) {
            console.error("SHP Parse Error:", e);
            setShpError('ไม่สามารถอ่านไฟล์ SHP ได้ กรุณาใช้ไฟล์ .zip');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSelectShpPlot = (plotId) => {
        const plot = shpPlots.find(p => p.id === plotId);
        console.log("Selecting SHP Plot:", plotId, !!plot);

        // Zoom to plot when clicked
        if (onZoomToPlot && plot?.geometry) {
            console.log("Triggering onZoomToPlot for selection");
            onZoomToPlot(plot.geometry);
        }

        setSelectedShpPlotIds(prev => {
            const isSelecting = !prev.includes(plotId);
            if (!isSelecting) {
                return prev.filter(id => id !== plotId);
            } else {
                return [...prev, plotId];
            }
        });
    };

    const handleSelectAllPlots = () => {
        const filteredPlots = shpPlots.filter(p =>
            p.farmerName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const areAllSelected = selectedShpPlotIds.length === filteredPlots.length &&
            filteredPlots.every(p => selectedShpPlotIds.includes(p.id));

        if (areAllSelected) {
            setSelectedShpPlotIds([]);
        } else {
            const allIds = filteredPlots.map(p => p.id);
            setSelectedShpPlotIds(allIds);

            // Zoom to show all selected plots together
            if (onZoomToPlot && filteredPlots.length > 0) {
                try {
                    const collection = {
                        type: 'FeatureCollection',
                        features: filteredPlots.map(p => ({
                            type: 'Feature',
                            geometry: p.geometry,
                            properties: {}
                        }))
                    };
                    onZoomToPlot(collection);
                } catch (e) {
                    console.error("Zoom all error:", e);
                }
            }
        }
    };

    const handleDeleteShpPlot = (e, plotId) => {
        e.stopPropagation();
        if (window.confirm('ยืนยันการลบแปลงนี้?')) {
            setShpPlots(prev => prev.filter(p => p.id !== plotId));
            setSelectedShpPlotIds(prev => prev.filter(id => id !== plotId));
        }
    };

    const handleClearAllShpPlots = () => {
        if (window.confirm('ยืนยันการลบแปลงที่พบทั้งหมด?')) {
            setShpPlots([]);
            setSelectedShpPlotIds([]);
            setSearchTerm('');
        }
    };

    const loadPlotForProcessing = (plot) => {
        console.log("Loading plot for processing:", plot);
        setFormData(prev => ({
            ...prev,
            id: plot.id,
            farmerName: plot.farmerName || '',
            originalShpName: plot.farmerName,
            areaRai: plot.areaRai,
            areaNgan: plot.areaNgan,
            areaSqWah: plot.areaSqWah,
            areaSqm: plot.areaSqm,
            geometry: plot.geometry,
            svgPath: plot.svgPath,
            plantingYearBE: plot.plantingYearBE || '',
            variety: plot.variety || '',
            age: 0,
            dbh: '',
            height: '',
            methodManual: 'eq1',
            methodSat: 'ndvi',
        }));
        setResult(null);

        if (onZoomToPlot && plot.geometry) {
            onZoomToPlot(plot.geometry);
        }
    };

    const handleProceedFromShp = () => {
        console.log("Proceeding from SHP list with selection:", selectedShpPlotIds);
        if (selectedShpPlotIds.length === 0) {
            return alert('กรุณาเลือกแปลงที่ต้องการคำนวณ');
        }

        const selectedPlots = shpPlots.filter(p => selectedShpPlotIds.includes(p.id));
        const [first, ...rest] = selectedPlots;

        console.log(`Starting processing queue with ${selectedPlots.length} plots`);
        setProcessingQueue(rest);
        loadPlotForProcessing(first);
        setCurrentStep(1);
    };

    const calculateCarbon = () => {
        if (!formData.farmerName) return alert('กรุณาระบุชื่อเกษตรกร');
        if (!formData.variety) return alert('กรุณาเลือกพันธุ์ยาง');
        if (selectedMethods.length === 0) return alert('กรุณาเลือกวิธีคำนวณอย่างน้อย 1 วิธี');

        const hasFieldMethod = selectedMethods.includes('eq1') || selectedMethods.includes('eq2');
        const hasSatMethod = selectedMethods.includes('ndvi') || selectedMethods.includes('tcari');

        if (hasFieldMethod && (!formData.dbh || !formData.height)) {
            return alert('กรุณาระบุขนาดเส้นผ่านศูนย์กลางและความสูงให้ครบถ้วน');
        }

        if (hasSatMethod && (!satData || (satData.ndvi === 0 && satData.tcari === 0))) {
            setLoadingSat(true);
            setTimeout(() => {
                setSatData({
                    ndvi: 0.72,
                    tcari: 0.45,
                    date: '14',
                    month: 'กุมภาพันธ์',
                    year: '2569',
                    source: 'Sentinel-2'
                });
                setLoadingSat(false);
                calculateCarbon();
            }, 1000);
            return;
        }

        setLoading(true);
        setTimeout(() => {
            try {
                const dbh = parseFloat(formData.dbh) || 0;
                const areaSqm = parseFloat(formData.areaSqm) || 0;
                const areaRaiTotal = areaSqm / 1600;

                if (areaRaiTotal <= 0) {
                    setLoading(false);
                    return alert('ไม่พบข้อมูลพื้นที่แปลง กรุณาวาดแปลงใหม่อีกครั้ง');
                }

                const totalTrees = areaRaiTotal * 70;
                const currentSatData = satData || { ndvi: 0, tcari: 0 };

                const METHOD_DEFS = {
                    eq1: { name: 'สมการที่ 1 (ภาคสนาม)', formula: 'AGB = 0.118 × DBH^2.53', icon: '🌿', color: '#10b981', calc: () => 0.118 * Math.pow(dbh, 2.53) },
                    eq2: { name: 'สมการที่ 2 (ภาคสนาม)', formula: 'AGB = 0.062 × DBH^2.23', icon: '🌱', color: '#059669', calc: () => 0.062 * Math.pow(dbh, 2.23) },
                    ndvi: { name: 'ดัชนี NDVI (ดาวเทียม)', formula: `AGB = 34.2 × ${currentSatData.ndvi} + 5.8`, icon: '🛰️', color: '#3b82f6', calc: () => 34.2 * (currentSatData.ndvi || 0) + 5.8 },
                    tcari: { name: 'ดัชนี TCARI (ดาวเทียม)', formula: `AGB = 13.57 × ${currentSatData.tcari || 0.45} + 7.45`, icon: '📡', color: '#8b5cf6', calc: () => 13.57 * (currentSatData.tcari || 0.45) + 7.45 }
                };

                const methodResults = selectedMethods.map(methodId => {
                    const def = METHOD_DEFS[methodId];
                    const agbPerTree = def.calc();
                    const totalAgbTons = (agbPerTree * totalTrees) / 1000;
                    const totalCarbonTons = totalAgbTons * 0.47; // Carbon Stock (approx)
                    return {
                        id: methodId,
                        name: def.name,
                        formula: def.formula,
                        icon: def.icon,
                        color: def.color,
                        carbon: totalCarbonTons.toFixed(2),
                        agb: totalAgbTons.toFixed(2),
                        carbonPerTree: agbPerTree.toFixed(4)
                    };
                });

                const carbonValues = methodResults.map(m => parseFloat(m.carbon));
                const agbValues = methodResults.map(m => parseFloat(m.agb));
                const avgCarbon = (carbonValues.reduce((a, b) => a + b, 0) / carbonValues.length).toFixed(2);
                const avgAgb = (agbValues.reduce((a, b) => a + b, 0) / agbValues.length).toFixed(2);
                const bestCarbon = Math.max(...carbonValues).toFixed(2);
                const minCarbon = Math.min(...carbonValues).toFixed(2);

                if (methodResults.some(m => isNaN(parseFloat(m.carbon)))) {
                    throw new Error("ผลลัพธ์การคำนวณไม่ถูกต้อง (NaN)");
                }

                setResult({
                    methods: methodResults,
                    avgCarbon,
                    bestCarbon,
                    minCarbon,
                    carbon: avgCarbon,
                    agb: avgAgb,
                    method: methodResults.map(m => m.name).join(' + ')
                });
                setLoading(false);
                setCurrentStep(3);
            } catch (error) {
                console.error("Calculation Error:", error);
                alert("เกิดข้อผิดพลาดในการคำนวณ: " + error.message);
                setLoading(false);
            }
        }, 1200);
    };

    const handleSaveToList = () => {
        if (!result) return;

        const plotData = {
            ...formData,
            id: formData.id || Date.now(),
            carbon: result.carbon,
            agb: result.agb,
            method: result.method,
            methods: result.methods || [],
            selectedMethods: selectedMethods,
            satData: satData,
            avgCarbon: result.avgCarbon,
            bestCarbon: result.bestCarbon,
            savedAt: new Date().toISOString(),
            address: formData.address || currentFormattedAddress // Add address
        };

        console.log("Saving plot Data:", plotData);

        try {
            onAddAnother(plotData);

            // Zoom to plot immediately when saved
            if (onZoomToPlot && formData.geometry) {
                onZoomToPlot(formData.geometry);
            }

            // Check Queue
            if (processingQueue.length > 0) {
                const [nextPlot, ...remainingQueue] = processingQueue;
                setProcessingQueue(remainingQueue);
                loadPlotForProcessing(nextPlot);
                setCurrentStep(1); // Go back to start for next plot
                // alert(`บันทึกสำเร็จ! กำลังดำเนินการแปลงต่อไป (${remainingQueue.length + 1} ที่เหลือ)`);
            } else {
                // All done
                setCurrentStep(4);
            }

        } catch (error) {
            console.error("Save Error:", error);
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + error.message);
        }
    };

    const handleDigitizeMore = () => {
        setFormData({
            farmerName: '',
            areaRai: 0,
            areaNgan: 0,
            areaSqWah: 0,
            areaSqm: 0,
            plantingYearBE: '',
            age: 0,
            variety: '',
            dbh: '',
            height: '',
            methodManual: 'eq1',
            methodSat: 'ndvi',
            svgPath: '',
            geometry: null
        });
        setResult(null);
        onClose();
        onStartDrawing();
    };

    const handleFinalSave = () => {
        // ล้าง SHP data เมื่อบันทึกเสร็จแล้ว
        setShpPlots([]);
        setSelectedShpPlotIds([]);
        setProcessingQueue([]);
        onSave(null, true);
    };

    const handleEditAccumulatedPlot = (plot) => {
        setFormData(prev => ({
            ...prev,
            ...plot,
            id: plot.id,
            farmerName: plot.farmerName || '',
            originalShpName: plot.originalShpName || '',
            plantingYearBE: plot.plantingYearBE || '',
            variety: plot.variety || '',
            age: plot.age || 0,
            dbh: plot.dbh || '',
            height: plot.height || '',
            areaRai: plot.areaRai || 0,
            areaNgan: plot.areaNgan || 0,
            areaSqWah: plot.areaSqWah || 0,
            areaSqm: plot.areaSqm || 0,
            geometry: plot.geometry,
            svgPath: plot.svgPath || (plot.geometry ? generateSvgPath(plot.geometry) : '')
        }));

        if (plot.selectedMethods) {
            setSelectedMethods(plot.selectedMethods);
        }

        if (plot.satData) {
            setSatData(plot.satData);
        }

        setCurrentStep(1);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center sm:items-start sm:justify-end pointer-events-none p-4 sm:p-8">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] pointer-events-auto" onClick={onClose} />

            {/* Modal / Side Panel */}
            <div className={cn(
                "relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] pointer-events-auto transition-all duration-500",
                "sm:w-[380px] sm:max-h-[calc(100vh-64px)] sm:rounded-[32px] border border-white/20",
                isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95"
            )}>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-[60] w-10 h-10 rounded-full bg-gray-100/50 hover:bg-gray-200/50 text-gray-500 flex items-center justify-center transition-all backdrop-blur-sm active:scale-90"
                >
                    <X size={20} strokeWidth={2.5} />
                </button>

                {/* Content */}
                <div ref={containerRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">

                    {/* STEP -1: DRAW INSTRUCTION */}
                    {currentStep === -1 && (
                        <div className="space-y-6 pt-2">
                            <div className="text-center pb-2">
                                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-emerald-100/50">
                                    <PencilIcon size={28} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight">ขั้นตอนการวาดเเปลง</h2>
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Digitizing Guide</p>
                            </div>

                            <div className="relative space-y-8 pl-4">
                                {/* Connecting Line */}
                                <div className="absolute left-7 top-2 bottom-2 w-0.5 bg-gradient-to-b from-emerald-500/20 via-emerald-500/10 to-transparent" />

                                {[
                                    { title: 'เริ่มวาด', desc: 'คลิกจุดเริ่มบนแผนที่เพื่อสร้างพิกัดแรกของแปลง', icon: <TargetIcon size={14} /> },
                                    { title: 'กำหนดรูปทรง', desc: 'คลิกจุดต่อๆ ไปตามแนวเขตแปลงที่ต้องการ', icon: <DrawPolygonIcon size={16} /> },
                                    { title: 'กรอกข้อมูลสวน', desc: 'ระบุชื่อเกษตรกรและปีที่ปลูกในแบบฟอร์ม', icon: <Edit3 size={14} /> },
                                    { title: 'คำนวณคาร์บอน', desc: 'ระบบจะประเมินค่าคาร์บอนและมูลค่าเบื้องต้น', icon: <Calculator size={14} /> },
                                    { title: 'บันทึก & สรุปผล', desc: 'จัดเก็บข้อมูลลงระบบเพื่อดูภาพรวมใน Dashboard', icon: <LayoutDashboard size={14} /> }
                                ].map((step, idx) => (
                                    <div key={idx} className="relative flex gap-6 group">
                                        <div className="relative z-10 w-6 h-6 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center text-[10px] font-black text-emerald-600 shadow-sm transition-transform group-hover:scale-110">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="text-emerald-500">{step.icon}</div>
                                                <h3 className="text-sm font-bold text-slate-700 leading-none">{step.title}</h3>
                                            </div>
                                            <p className="text-[11px] text-slate-500 leading-relaxed">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => {
                                    onClose();
                                    onStartDrawing();
                                }}
                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-emerald-200/50 flex items-center justify-center gap-2 group"
                            >
                                <span>เริ่มวาดแปลงทันที</span>
                                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    )}

                    {/* STEP -2: IMPORT INSTRUCTION */}
                    {currentStep === -2 && (
                        <div className="space-y-6 pt-2">
                            <div className="text-center pb-2">
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-100/50">
                                    <UploadIcon size={28} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight">ขั้นตอนนำเข้า SHP</h2>
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Import Guide</p>
                            </div>

                            <div className="relative space-y-8 pl-4">
                                {/* Connecting Line */}
                                <div className="absolute left-7 top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-500/20 via-blue-500/10 to-transparent" />

                                {[
                                    { title: 'เตรียมไฟล์ .zip', desc: 'รวมไฟล์ .shp .shx .dbf .prj เข้าด้วยกัน', icon: <FileText size={14} /> },
                                    { title: 'อัปโหลดนำเข้า', desc: 'เลือกไฟล์ .zip เพื่อนำข้อมูลแปลงเข้าสู่ระบบ', icon: <UploadIcon size={14} /> },
                                    { title: 'กรอกข้อมูลสวน', desc: 'ระบุชื่อเกษตรกรและปีที่ปลูกในแบบฟอร์ม', icon: <Edit3 size={14} /> },
                                    { title: 'คำนวณคาร์บอน', desc: 'ระบบจะประเมินค่าคาร์บอนและมูลค่าเบื้องต้น', icon: <Calculator size={14} /> },
                                    { title: 'บันทึก & สรุปผล', desc: 'จัดเก็บข้อมูลลงระบบเพื่อดูภาพรวมใน Dashboard', icon: <LayoutDashboard size={14} /> }
                                ].map((step, idx) => (
                                    <div key={idx} className="relative flex gap-6 group">
                                        <div className="relative z-10 w-6 h-6 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center text-[10px] font-black text-blue-600 shadow-sm transition-transform group-hover:scale-110">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="text-blue-500">{step.icon}</div>
                                                <h3 className="text-sm font-bold text-slate-700 leading-none">{step.title}</h3>
                                            </div>
                                            <p className="text-[11px] text-slate-500 leading-relaxed">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentStep(0)}
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-blue-200/50 flex items-center justify-center gap-2 group"
                            >
                                <span>ไปที่หน้าอัปโหลด</span>
                                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    )}

                    {/* STEP 0: SHP IMPORT */}
                    {currentStep === 0 && (
                        <div className="space-y-4 pt-2">
                            {/* Sub-step 1: Requirement Info (Shown when clicking to upload) */}
                            {showShpInfo && shpPlots.length === 0 ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="text-center pb-2">
                                        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-amber-100/50">
                                            <Zap size={32} strokeWidth={1.5} className="fill-amber-400" />
                                        </div>
                                        <h2 className="text-xl font-bold text-amber-600 tracking-tight">ข้อมูลที่จำเป็นต้องมี</h2>
                                        <p className="text-sm font-medium text-slate-400 mt-1">กรุณาตรวจสอบความพร้อมของไฟล์</p>
                                    </div>

                                    <div className="space-y-3">
                                        {/* Component Files Card */}
                                        <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex items-start gap-4 hover:border-emerald-100 transition-colors">
                                            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                                                <FileText size={24} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[15px] font-bold text-slate-800 mb-1">ส่วนประกอบไฟล์ .zip</p>
                                                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                                    ต้องประกอบด้วย <span className="text-slate-800 font-bold">.shp, .shx, .dbf</span> และ <span className="text-slate-800 font-bold">.prj</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Column Info Card */}
                                        <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex items-start gap-4 hover:border-orange-100 transition-colors">
                                            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
                                                <List size={24} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[15px] font-bold text-slate-800 mb-1">ตารางคอลัมน์ที่รองรับใน .dbf</p>
                                                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                                    <span className="text-slate-800 font-bold">FARMER</span> (ชื่อ),
                                                    <span className="text-slate-800 font-bold ml-1">VARIETY</span> (พันธุ์),
                                                    <span className="text-slate-800 font-bold ml-1">YEAR</span> (ปี)
                                                </p>
                                            </div>
                                        </div>

                                        {/* CRS Info Card */}
                                        <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex items-start gap-4 hover:border-blue-100 transition-colors">
                                            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                                <Globe size={24} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[15px] font-bold text-slate-800 mb-1">ระบบพิกัดที่รองรับ</p>
                                                <p className="text-xs text-slate-500 font-medium leading-relaxed uppercase">
                                                    <span className="text-slate-800 font-bold">UTM Zone 47N</span> และ <span className="text-slate-800 font-bold">48N (WGS84)</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 pt-4">
                                        <button
                                            onClick={() => fileInputRef.current.click()}
                                            className="w-full h-14 bg-gray-900 hover:bg-black text-white rounded-2xl text-base font-bold transition-all shadow-lg flex items-center justify-center gap-3 active:scale-[0.98]"
                                        >
                                            <UploadIcon size={20} />
                                            เลือกไฟล์ .zip ทันที
                                        </button>
                                        <button
                                            onClick={() => setShowShpInfo(false)}
                                            className="w-full h-12 bg-white text-slate-400 hover:text-slate-600 rounded-xl text-sm font-bold transition-all flex items-center justify-center"
                                        >
                                            ย้อนกลับ
                                        </button>
                                    </div>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept=".zip"
                                        onChange={(e) => {
                                            handleShpUpload(e);
                                            setShowShpInfo(false);
                                        }}
                                        className="hidden"
                                    />
                                </div>
                            ) : shpPlots.length === 0 ? (
                                /* Sub-step 0: Initial Import Screen */
                                <>
                                    <div className="text-center pb-2">
                                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100/50">
                                            <Upload size={32} strokeWidth={1.5} />
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">นำเข้า Shapefile</h2>
                                        <p className="text-sm font-medium text-slate-400 mt-1">เลือกไฟล์ .zip เพื่อเริ่มต้น</p>
                                    </div>

                                    <div
                                        onClick={() => setShowShpInfo(true)}
                                        className="relative p-10 border-2 border-dashed border-gray-100 rounded-3xl text-center hover:border-emerald-300 hover:bg-emerald-50/20 transition-all cursor-pointer group"
                                    >
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-gray-300 group-hover:text-emerald-500 transition-colors">
                                            <UploadIcon size={28} />
                                        </div>
                                        <p className="text-sm font-semibold text-slate-400">
                                            {isUploading ? 'กำลังอ่านข้อมูล...' : 'คลิกเพื่อเริ่มนำเข้าไฟล์ .zip'}
                                        </p>
                                    </div>
                                </>
                            ) : null}

                            {/* Sub-step 2: Plot List (Only shown if plots are loaded) */}
                            {shpPlots.length > 0 && (
                                <>
                                    <div className="text-center pb-2">
                                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100/50">
                                            <List size={32} strokeWidth={1.5} />
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">รายการแปลงที่พบ</h2>
                                        <p className="text-sm font-medium text-slate-400 mt-1">ตรวจสอบและเลือกแปลงที่ต้องการคำนวณ</p>
                                    </div>
                                </>
                            )}

                            {shpError && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                                    {shpError}
                                </div>
                            )}

                            {/* Search and Filter */}
                            {shpPlots.length > 0 && (
                                <div className="space-y-4 pt-2">
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            placeholder="ค้นหาชื่อแปลง..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full h-12 bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-4 text-sm focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                                        />
                                    </div>

                                    <div className="flex justify-between items-center px-2">
                                        <span className="text-xs font-bold text-slate-400 tracking-wider">พบ {shpPlots.filter(p => p.farmerName.toLowerCase().includes(searchTerm.toLowerCase())).length} แปลง</span>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={handleSelectAllPlots}
                                                className="text-xs text-emerald-600 font-bold uppercase tracking-wider hover:opacity-70 transition-opacity"
                                            >
                                                {selectedShpPlotIds.length > 0 && selectedShpPlotIds.length === shpPlots.filter(p => p.farmerName.toLowerCase().includes(searchTerm.toLowerCase())).length ? 'ยกเลิก' : 'เลือกทั้งหมด'}
                                            </button>
                                            {shpPlots.length > 0 && (
                                                <button
                                                    onClick={handleClearAllShpPlots}
                                                    className="text-[10px] text-rose-500 font-bold uppercase tracking-wider hover:opacity-70 transition-opacity"
                                                >
                                                    ลบทั้งหมด
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {shpPlots.length > 0 && (
                                <div className="space-y-2">
                                    <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1 scrollbar-thin">
                                        {shpPlots
                                            .filter(p => p.farmerName.toLowerCase().includes(searchTerm.toLowerCase()))
                                            .map(p => {
                                                const isSelected = selectedShpPlotIds.includes(p.id);
                                                return (
                                                    <div
                                                        key={p.id}
                                                        onClick={() => handleSelectShpPlot(p.id)}
                                                        className={cn(
                                                            "w-full p-3 rounded-2xl flex items-center gap-3 transition-all border cursor-pointer active:scale-[0.98]",
                                                            isSelected ? "bg-emerald-50 border-emerald-200" : "bg-white border-gray-100 hover:border-gray-200"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                                            isSelected ? "bg-emerald-500 text-white" : "bg-gray-50 text-emerald-500"
                                                        )}>
                                                            {p.svgPath ? (
                                                                <svg viewBox="0 0 100 100" className="w-6 h-6">
                                                                    <polygon
                                                                        points={p.svgPath}
                                                                        fill="currentColor"
                                                                        fillOpacity={isSelected ? 0.3 : 0.1}
                                                                        stroke="currentColor"
                                                                        strokeWidth="4"
                                                                    />
                                                                </svg>
                                                            ) : <Map size={20} />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-slate-700 truncate">{p.farmerName}</p>
                                                            <p className="text-[10px] text-slate-400 font-medium tracking-tight">
                                                                {p.areaRai}-{p.areaNgan}-{p.areaSqWah} ไร่ • {parseFloat(p.areaSqm).toLocaleString()} ตร.ม.
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {isSelected && <CheckCircle2 size={18} className="text-emerald-500" />}
                                                            <button
                                                                onClick={(e) => handleDeleteShpPlot(e, p.id)}
                                                                className="w-8 h-8 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 flex items-center justify-center transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                    <button
                                        onClick={handleProceedFromShp}
                                        disabled={selectedShpPlotIds.length === 0}
                                        className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-sm font-bold disabled:bg-gray-100 disabled:text-gray-400 transition-all shadow-lg shadow-emerald-200/50"
                                    >
                                        ดำเนินการต่อ ({selectedShpPlotIds.length})
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 1: COMBINED FARMER INFO + METHODS (Auto-scroll) */}
                    {currentStep === 1 && (
                        <div className="space-y-5 pt-4">
                            {/* Progress indicator */}
                            <div className="flex items-center gap-2 px-1">
                                <div className={cn("flex-1 h-1.5 rounded-full transition-all duration-700", farmerComplete ? "bg-emerald-500" : "bg-gray-100")} />
                                <div className={cn("flex-1 h-1.5 rounded-full transition-all duration-700", farmerComplete && selectedMethods.length > 0 ? "bg-emerald-500" : "bg-gray-100")} />
                                <div className={cn("flex-1 h-1.5 rounded-full transition-all duration-700", farmerComplete && selectedMethods.length > 0 && ((selectedMethods.includes('eq1') || selectedMethods.includes('eq2')) ? (formData.dbh && formData.height) : true) ? "bg-emerald-500" : "bg-gray-100")} />
                            </div>

                            <div className="text-center">
                                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-200/60">
                                    <TreeDeciduous size={28} className="text-white" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-800 tracking-tight">{isEditing ? 'แก้ไขข้อมูลแปลง' : 'ข้อมูลแปลงยางพารา'}</h2>
                                <p className="text-[11px] font-medium text-slate-400 mt-0.5">{isEditing ? 'แก้ไขข้อมูลด้านล่าง • กดบันทึกเมื่อเสร็จสิ้น' : 'กรอกข้อมูลด้านล่าง • ระบบจะเลื่อนอัตโนมัติ'}</p>
                            </div>

                            {/* Area Display with Toggle */}
                            <div className="text-center p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200 relative">
                                <button
                                    onClick={() => setUseMetricUnit(!useMetricUnit)}
                                    className="absolute top-3 right-3 w-8 h-8 bg-white hover:bg-emerald-50 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                                    title="สลับหน่วย"
                                >
                                    <Repeat size={16} className="text-emerald-600" />
                                </button>
                                <p className="text-[10px] text-emerald-600/70 font-bold uppercase tracking-widest mb-1.5">พื้นที่แปลงปลูก</p>
                                {useMetricUnit ? (
                                    <>
                                        <p className="text-2xl font-semibold text-slate-800 tracking-tight">
                                            {parseFloat(formData.areaSqm || 0).toLocaleString()} <span className="text-xs opacity-50 font-medium">ตร.ม.</span>
                                        </p>
                                        <p className="text-[11px] text-emerald-600 mt-1 font-bold">
                                            {formData.areaRai} ไร่ {formData.areaNgan} งาน {parseFloat(formData.areaSqWah).toFixed(1)} ตร.วา
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-xl font-semibold text-slate-800 tracking-tight">
                                            {formData.areaRai} <span className="text-xs opacity-50 font-medium">ไร่</span> {formData.areaNgan} <span className="text-xs opacity-50 font-medium">งาน</span> {parseFloat(formData.areaSqWah).toFixed(1)} <span className="text-xs opacity-50 font-medium">ตร.วา</span>
                                        </p>
                                        <p className="text-[11px] text-emerald-600 mt-1 font-bold uppercase tracking-tight">
                                            {parseFloat(formData.areaSqm || 0).toLocaleString()} ตร.ม.
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Input Fields */}
                            <div className="space-y-4">
                                <div>
                                    <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                        ชื่อเกษตรกร
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="กรอกชื่อ-นามสกุล"
                                        value={formData.farmerName}
                                        onChange={e => setFormData({ ...formData, farmerName: e.target.value })}
                                        className="w-full h-12 bg-gray-50 rounded-xl px-4 text-base border border-gray-200 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
                                    />
                                    {formData.originalShpName && !formData.farmerName && (
                                        <p className="text-xs text-gray-400 mt-1 ml-1">
                                            จากไฟล์: {formData.originalShpName}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                        </div>
                                        ปีที่ปลูก (พ.ศ.)
                                    </label>
                                    <select
                                        value={formData.plantingYearBE}
                                        onChange={e => setFormData({ ...formData, plantingYearBE: e.target.value })}
                                        className={cn(
                                            "w-full h-12 bg-gray-50 rounded-xl px-4 text-base border border-gray-200 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all outline-none appearance-none",
                                            formData.plantingYearBE === '' ? "text-gray-400" : "text-gray-600"
                                        )}
                                    >
                                        <option value="">เลือกปี</option>
                                        {Array.from({ length: 40 }, (_, i) => new Date().getFullYear() + 543 - i).map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <Calendar size={14} />
                                        </div>
                                        อายุยางพารา <span className="text-xs text-gray-400 font-normal">(ไม่บังคับ)</span>
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="ระบุอายุ (ปี) หากทราบ"
                                        value={formData.manualAge}
                                        onChange={e => setFormData({ ...formData, manualAge: e.target.value })}
                                        className="w-full h-12 bg-gray-50 rounded-xl px-4 text-base border border-gray-200 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.77 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>
                                        </div>
                                        พันธุ์ยางพารา
                                    </label>
                                    <select
                                        value={formData.variety}
                                        onChange={e => setFormData({ ...formData, variety: e.target.value })}
                                        className={cn(
                                            "w-full h-12 bg-gray-50 rounded-xl px-4 text-base border border-gray-200 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all outline-none appearance-none",
                                            formData.variety === '' ? "text-gray-400" : "text-gray-600"
                                        )}
                                    >
                                        <option value="" disabled>เลือกพันธุ์ยางพารา</option>
                                        <option value="RRIM 600">RRIM 600</option>
                                        <option value="PB 235">PB 235</option>
                                        <option value="RRIT 251">RRIT 251</option>
                                    </select>
                                </div>
                            </div>

                            {/* Farmer complete indicator */}
                            {farmerComplete && !isEditing && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100 animate-fadeIn">
                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                    <span className="text-[11px] font-bold text-emerald-600">ข้อมูลเกษตรกรครบแล้ว</span>
                                    <button onClick={() => { setFarmerComplete(false); containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }} className="ml-auto text-[10px] text-emerald-500 font-bold hover:underline">แก้ไข</button>
                                </div>
                            )}



                            {/* ===== METHODS SECTION (auto-revealed) ===== */}
                            {farmerComplete && (
                                <div ref={methodSectionRef} className="space-y-4 pt-2 animate-fadeIn">
                                    {/* Divider */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <Calculator size={12} /> วิธีคำนวณ
                                        </span>
                                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                                    </div>

                                    {/* Quick select */}
                                    <div className="flex items-center justify-between px-1">
                                        <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                                            เลือกแล้ว {selectedMethods.length}/4 วิธี
                                        </span>
                                        <button
                                            onClick={() => setSelectedMethods(selectedMethods.length === 4 ? [] : ['eq1', 'eq2', 'ndvi', 'tcari'])}
                                            className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider hover:opacity-70 transition-opacity"
                                        >
                                            {selectedMethods.length === 4 ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
                                        </button>
                                    </div>

                                    {/* Method Cards */}
                                    {(() => {
                                        const allMethods = [
                                            { id: 'eq1', name: 'สมการที่ 1', formula: 'AGB = 0.118 × DBH²·⁵³', icon: '🌿', color: '#10b981', group: 'field', desc: 'ภาคสนาม' },
                                            { id: 'eq2', name: 'สมการที่ 2', formula: 'AGB = 0.062 × DBH²·²³', icon: '🌱', color: '#059669', group: 'field', desc: 'ภาคสนาม' },
                                            { id: 'ndvi', name: 'ดัชนี NDVI', formula: 'AGB = 34.2 × NDVI + 5.8', icon: '🛰️', color: '#3b82f6', group: 'sat', desc: 'ดาวเทียม' },
                                            { id: 'tcari', name: 'ดัชนี TCARI', formula: 'AGB = 13.57 × TCARI + 7.45', icon: '📡', color: '#8b5cf6', group: 'sat', desc: 'ดาวเทียม' }
                                        ];
                                        const toggleMethod = (id) => {
                                            setSelectedMethods(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
                                        };
                                        return (
                                            <div className="grid grid-cols-2 gap-2">
                                                {allMethods.map(m => {
                                                    const isSelected = selectedMethods.includes(m.id);
                                                    return (
                                                        <button
                                                            key={m.id}
                                                            onClick={() => toggleMethod(m.id)}
                                                            className={cn(
                                                                "relative p-3 rounded-2xl text-left transition-all duration-300 border-2 active:scale-[0.97] overflow-hidden",
                                                                isSelected ? "border-current shadow-lg" : "border-gray-100 bg-white hover:border-gray-200"
                                                            )}
                                                            style={isSelected ? { borderColor: m.color, backgroundColor: `${m.color}08` } : {}}
                                                        >
                                                            {isSelected && (
                                                                <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full blur-2xl opacity-30" style={{ backgroundColor: m.color }} />
                                                            )}
                                                            <div className="relative">
                                                                <div className="flex items-center justify-between mb-1.5">
                                                                    <span className="text-lg">{m.icon}</span>
                                                                    <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all", isSelected ? "border-current" : "border-gray-300")}
                                                                        style={isSelected ? { borderColor: m.color, backgroundColor: m.color } : {}}
                                                                    >
                                                                        {isSelected && (
                                                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <p className="text-xs font-bold text-gray-800 leading-tight">{m.name}</p>
                                                                <p className="text-[9px] font-medium mt-0.5 px-1.5 py-0.5 rounded-md inline-block"
                                                                    style={isSelected ? { color: m.color, backgroundColor: `${m.color}15` } : { color: '#9ca3af' }}
                                                                >{m.desc}</p>
                                                                <p className="text-[9px] text-gray-400 font-mono mt-1 leading-tight">{m.formula}</p>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })()}

                                    {/* Field Data Inputs - auto-revealed */}
                                    {(selectedMethods.includes('eq1') || selectedMethods.includes('eq2')) && (
                                        <div ref={fieldDataRef} className="p-4 bg-gradient-to-br from-emerald-50/80 to-green-50/80 rounded-2xl border border-emerald-100 space-y-3 animate-fadeIn">
                                            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-1.5">
                                                <span>🌿</span> ข้อมูลภาคสนาม
                                            </p>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5 ml-1">DBH (ซม.)</label>
                                                    <input type="number" placeholder="0.00" value={formData.dbh}
                                                        onChange={e => setFormData({ ...formData, dbh: e.target.value })}
                                                        className="w-full h-10 bg-white rounded-xl px-4 text-sm border border-emerald-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5 ml-1">ความสูง (ม.)</label>
                                                    <input type="number" placeholder="0.00" value={formData.height}
                                                        onChange={e => setFormData({ ...formData, height: e.target.value })}
                                                        className="w-full h-10 bg-white rounded-xl px-4 text-sm border border-emerald-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Satellite Data */}
                                    {(selectedMethods.includes('ndvi') || selectedMethods.includes('tcari')) && (
                                        <div className="p-4 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-2xl border border-blue-100 animate-fadeIn">
                                            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
                                                <span>🛰️</span> ข้อมูลดาวเทียม
                                            </p>
                                            {loadingSat ? (
                                                <div className="flex items-center justify-center gap-2 text-blue-500 py-2">
                                                    <Loader2 size={18} className="animate-spin" />
                                                    <span className="text-xs font-medium">กำลังดึงข้อมูลดาวเทียม...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-1 bg-white rounded-xl px-3 py-2.5 border border-blue-100">
                                                        <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest">NDVI</p>
                                                        <p className="text-lg font-bold text-gray-800">{satData.ndvi}</p>
                                                    </div>
                                                    <div className="flex-1 bg-white rounded-xl px-3 py-2.5 border border-purple-100">
                                                        <p className="text-[9px] text-purple-500 font-bold uppercase tracking-widest">TCARI</p>
                                                        <p className="text-lg font-bold text-gray-800">{satData.tcari}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {!loadingSat && (
                                                <div className="mt-3 flex items-center justify-between text-[10px] text-blue-400 font-medium px-1 border-t border-blue-100/50 pt-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <Globe size={10} />
                                                        <span>ที่มา: {satData.source || 'Sentinel-2'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={10} />
                                                        <span>ข้อมูลล่าสุด: {satData.date} {satData.month} {satData.year}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Calculate Button */}
                                    <button
                                        onClick={calculateCarbon}
                                        disabled={loading || selectedMethods.length === 0}
                                        className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-2xl text-sm font-bold disabled:bg-gray-100 disabled:from-gray-100 disabled:to-gray-100 disabled:text-gray-400 transition-all shadow-lg shadow-emerald-200/50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 size={16} className="animate-spin" />
                                                กำลังคำนวณ {selectedMethods.length} วิธี...
                                            </span>
                                        ) : (
                                            <>
                                                <Calculator size={16} />
                                                คำนวณคาร์บอน ({selectedMethods.length} วิธี)
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Processing Queue */}
                            {processingQueue.length > 0 && (
                                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <List size={16} className="text-blue-600" />
                                        <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                                            แปลงที่เหลือในคิว ({processingQueue.length})
                                        </p>
                                    </div>
                                    <div className="space-y-1.5 max-h-24 overflow-y-auto scrollbar-thin">
                                        {processingQueue.map((plot, index) => (
                                            <div key={plot.id} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 text-xs">
                                                <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">{index + 1}</span>
                                                <span className="flex-1 text-slate-700 font-medium truncate">{plot.farmerName}</span>
                                                <span className="text-[10px] text-slate-400">{plot.areaRai}-{plot.areaNgan}-{parseFloat(plot.areaSqWah).toFixed(1)} ไร่</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 3: RESULT - Multi-Method Comparison */}
                    {currentStep === 3 && result && (
                        <div className="space-y-4 pt-2">
                            {/* Header Card */}
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 relative">
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-b border-r border-gray-100 rotate-45"></div>
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                                        <TreeDeciduous size={24} className="text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-gray-800 truncate">{formData.farmerName || 'ไม่ระบุชื่อ'}</h3>
                                        <p className="text-sm text-gray-500 mb-1.5">{formData.variety || '-'} • {formData.age || 0} ปี</p>

                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5">
                                                <Map size={10} className="text-gray-400" />
                                                <span className="text-[10px] text-gray-500 font-medium">{formData.address || currentFormattedAddress || 'ไม่ระบุสถานที่'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Globe size={10} className="text-gray-400" />
                                                <span className="text-[10px] text-gray-500 font-mono">
                                                    {(() => {
                                                        try {
                                                            if (formData.geometry) {
                                                                const center = turf.center(formData.geometry);
                                                                const [lng, lat] = center.geometry.coordinates;
                                                                return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                                                            }
                                                            return '-';
                                                        } catch (e) { return '-'; }
                                                    })()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-gray-50 rounded-xl p-2">
                                        <p className="text-[9px] text-gray-400 font-bold">พื้นที่</p>
                                        <p className="text-xs font-bold text-gray-700">{formData.areaRai} ไร่ {formData.areaNgan} งาน {parseFloat(formData.areaSqWah).toFixed(0)} วา</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-2">
                                        <p className="text-[9px] text-gray-400 font-bold">ปีปลูก / อายุ</p>
                                        <div className="flex flex-col">
                                            <p className="text-xs font-bold text-gray-700">{formData.plantingYearBE || '-'}</p>
                                            {formData.manualAge && (
                                                <p className="text-[9px] text-emerald-600 font-medium">(ระบุเอง: {formData.manualAge} ปี)</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-2">
                                        <p className="text-[9px] text-gray-400 font-bold">จำนวนวิธี</p>
                                        <p className="text-xs font-bold text-emerald-600">{result.methods?.length || 1}</p>
                                    </div>
                                </div>
                            </div>

                            {/* NEW: Age Verification Section (Optional) */}
                            {formData.manualAge && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                                            <Search size={16} />
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-800">ตรวจสอบความถูกต้องของข้อมูล</h4>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-slate-500 font-medium">อายุคำนวณจากปีปลูก ({formData.plantingYearBE})</span>
                                            <span className="text-sm font-bold text-slate-700">{formData.age} ปี</span>
                                        </div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs text-slate-500 font-medium">อายุที่ระบุเอง (Manual Input)</span>
                                            <span className="text-sm font-bold text-indigo-600">{formData.manualAge} ปี</span>
                                        </div>

                                        {/* Verification Status */}
                                        <div className={cn(
                                            "flex items-center gap-2 p-2 rounded-lg border transition-all",
                                            parseInt(formData.age) === parseInt(formData.manualAge)
                                                ? "bg-emerald-50/50 border-emerald-100 text-emerald-700"
                                                : "bg-amber-50/50 border-amber-100 text-amber-700"
                                        )}>
                                            {parseInt(formData.age) === parseInt(formData.manualAge) ? (
                                                <>
                                                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                                    <span className="text-xs font-bold">ข้อมูลตรงกัน (Verified)</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-4 h-4 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center font-bold text-[10px] shrink-0">!</div>
                                                    <span className="text-xs font-bold">ข้อมูลแตกต่างกัน {Math.abs(parseInt(formData.age) - parseInt(formData.manualAge))} ปี</span>
                                                    <span className="text-[10px] text-amber-600/70 ml-auto font-normal">โปรดตรวจสอบ</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Multi-Method Results - Individual Cards */}
                            <div className="space-y-3">
                                {result.methods && result.methods.length > 0 ? (
                                    result.methods.map((m, i) => {
                                        const carbonVal = parseFloat(m.carbon || 0);
                                        const priceVal = carbonVal * currentPrice;

                                        return (
                                            <div key={m.id}
                                                className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
                                                style={{ animationDelay: `${i * 100}ms` }}
                                            >
                                                {/* Decorative background blob */}
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-emerald-50/50 rounded-full blur-2xl -mr-10 -mt-10 opacity-60"></div>

                                                <div className="relative">
                                                    {/* Header: Icon + Name */}
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm" style={{ backgroundColor: `${m.color}15` }}>
                                                                {m.icon}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-gray-800 text-sm">{m.name}</h4>
                                                                <p className="text-[10px] text-gray-400 font-mono mt-0.5">{m.formula}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="block text-[9px] font-bold text-emerald-600/80 mb-0.5 text-right">คาร์บอน</span>
                                                            <span className="block text-2xl font-black text-emerald-600 tracking-tight leading-none">
                                                                {m.carbon}
                                                            </span>
                                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">tCO₂e</span>
                                                        </div>
                                                    </div>

                                                    {/* Divider with dash */}
                                                    {/* Biomass Row */}
                                                    <div className="flex items-center justify-between mb-2.5 bg-blue-50/50 p-2 rounded-lg border border-blue-100/50">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                                                                <TreeDeciduous size={12} strokeWidth={2.5} />
                                                            </div>
                                                            <span className="text-[10px] text-blue-800 font-bold">มวลชีวภาพ (AGB)</span>
                                                        </div>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-sm font-black text-blue-700">{m.agb}</span>
                                                            <span className="text-[9px] text-blue-500 font-bold">ตัน</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-200">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="p-1 bg-amber-50 rounded-md">
                                                                <Coins size={12} className="text-amber-500" />
                                                            </div>
                                                            <span className="text-[10px] text-gray-500 font-medium">มูลค่าประเมิน (@฿{currentPrice})</span>
                                                        </div>
                                                        <div className="text-amber-600 font-bold text-lg">
                                                            ฿{priceVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    /* Fallback for single result (legacy structure) */
                                    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                                        <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-50">
                                            <span className="text-sm font-bold text-gray-700">ผลลัพธ์การคำนวณ</span>
                                            <span className="text-xl font-black text-emerald-600">{result.carbon} <span className="text-xs font-bold text-gray-400">tCO₂e</span></span>
                                        </div>
                                        {result.agb && (
                                            <div className="flex justify-between items-center mb-2 bg-blue-50/50 p-2 rounded-lg">
                                                <span className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                                                    <TreeDeciduous size={12} /> มวลชีวภาพ (AGB)
                                                </span>
                                                <span className="text-sm font-bold text-blue-800">{result.agb} ตัน</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-xs text-gray-500">มูลค่าประเมิน (@฿{currentPrice})</span>
                                            <span className="text-base font-bold text-amber-600">
                                                ฿{((parseFloat(result.carbon || 0)) * currentPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Price Slider Tool */}
                            <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-100 flex items-center justify-between gap-3 shadow-sm">
                                <div className="flex items-center gap-2 shrink-0">
                                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                        <Coins size={16} className="text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">ราคาตลาด</p>
                                        <p className="text-[9px] text-amber-600/70">บาท/ตันคาร์บอน</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <input
                                        type="range"
                                        min="0"
                                        max="500"
                                        step="10"
                                        value={currentPrice}
                                        onChange={(e) => setCurrentPrice(parseInt(e.target.value))}
                                        className="flex-1 h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                    />
                                    <div className="bg-white px-2 py-1 rounded-lg border border-amber-100 shadow-sm min-w-[60px] text-center">
                                        <span className="text-xs font-black text-amber-600">฿{currentPrice}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => setCurrentStep(1)}
                                    className="w-12 h-12 bg-gray-100 active:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
                                    title="แก้ไข"
                                >
                                    <Edit3 size={18} className="text-gray-600" />
                                </button>
                                <button
                                    onClick={handleSaveToList}
                                    className="flex-1 h-12 bg-gray-900 hover:bg-gray-800 active:bg-black text-white rounded-xl text-base font-medium transition-all shadow-sm active:scale-[0.98]"
                                >
                                    บันทึกข้อมูล
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: SUCCESS SUMMARY & FINAL DECISION */}
                    {currentStep === 4 && (
                        <div className="space-y-5 pt-2">
                            {/* ─── Header ─── */}
                            <div className="text-center">
                                <div className="w-16 h-16 bg-emerald-500 text-white rounded-[24px] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-200 relative">
                                    <CheckCircle2 size={32} />
                                    <div className="absolute inset-0 bg-emerald-400 rounded-[24px] animate-ping opacity-20" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">คำนวณเรียบร้อยแล้ว</h3>
                                <p className="text-xs text-gray-500 font-medium mt-1">นี่คือสรุปผลลัพธ์ทั้งหมดที่คุณทำรายการ</p>
                            </div>

                            {/* ─── Summary Totals ─── */}
                            <div className="bg-gradient-to-br from-slate-50 to-emerald-50/40 rounded-2xl p-3 border border-gray-100 shadow-sm">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2 px-1">ภาพรวมทั้งหมด</p>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-white rounded-xl p-2.5 text-center border border-emerald-100 shadow-sm flex flex-col justify-center min-h-[72px]">
                                        <p className="text-[9px] uppercase font-bold text-emerald-600 tracking-wider mb-1">คาร์บอน</p>
                                        <span className="text-lg font-black text-emerald-700 tracking-tight leading-none">
                                            {accumulatedPlots.reduce((sum, p) => sum + parseFloat(p.carbon || 0), 0).toFixed(2)}
                                        </span>
                                        <span className="text-[8px] font-bold text-emerald-500/60 mt-0.5">tCO₂e</span>
                                    </div>
                                    <div className="bg-white rounded-xl p-2.5 text-center border border-blue-100 shadow-sm flex flex-col justify-center min-h-[72px]">
                                        <p className="text-[9px] uppercase font-bold text-blue-600 tracking-wider mb-1">มวลชีวภาพ</p>
                                        <span className="text-lg font-black text-blue-700 tracking-tight leading-none">
                                            {accumulatedPlots.reduce((sum, p) => sum + parseFloat(p.agb || ((parseFloat(p.carbon || 0) / 0.47))), 0).toFixed(2)}
                                        </span>
                                        <span className="text-[8px] font-bold text-blue-500/60 mt-0.5">ตัน</span>
                                    </div>
                                    <div className="bg-white rounded-xl p-2.5 text-center border border-amber-100 shadow-sm flex flex-col justify-center min-h-[72px]">
                                        <p className="text-[9px] uppercase font-bold text-amber-600 tracking-wider mb-1">มูลค่ารวม</p>
                                        <span className="text-lg font-black text-amber-700 tracking-tight leading-none">
                                            {(accumulatedPlots.reduce((sum, p) => sum + parseFloat(p.carbon || 0), 0) * currentPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </span>
                                        <span className="text-[8px] font-bold text-amber-500/60 mt-0.5">บาท</span>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Plot List ─── */}
                            <div>
                                <div className="flex justify-between items-center px-1 mb-2.5">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        รายการแปลง ({accumulatedPlots.length})
                                    </span>
                                    <button
                                        className="text-[10px] font-bold text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded-lg transition-colors"
                                        onClick={() => onSave(null, true)}
                                    >
                                        บันทึกทั้งหมด
                                    </button>
                                </div>

                                {/* Scrollable Accordion List */}
                                <div className="space-y-2.5 max-h-[40vh] overflow-y-auto pr-1 scrollbar-thin pb-2">
                                    {accumulatedPlots.map((plot, idx) => {
                                        const hasMultipleMethods = plot.methods && plot.methods.length > 1;
                                        const isExpanded = expandedPlotId === plot.id;
                                        const activeTabIdx = activeMethodTabs[plot.id] ?? 0;
                                        const activeMethod = (plot.methods && plot.methods[activeTabIdx]) || null;
                                        const displayCarbon = activeMethod ? activeMethod.carbon : parseFloat(plot.carbon || 0).toFixed(2);
                                        const displayAgb = activeMethod ? activeMethod.agb : parseFloat(plot.agb || (parseFloat(plot.carbon || 0) / 0.47)).toFixed(2);
                                        const displayPrice = (parseFloat(displayCarbon) * currentPrice).toLocaleString(undefined, { maximumFractionDigits: 0 });

                                        return (
                                            <div
                                                key={plot.id}
                                                className={cn(
                                                    "relative bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-300",
                                                    isExpanded ? "border-emerald-200 shadow-emerald-100/80 shadow-md" : "border-gray-100 hover:border-gray-200 hover:shadow-md"
                                                )}
                                            >
                                                {/* Decorative left stripe */}
                                                <div className={cn(
                                                    "absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-all duration-300",
                                                    isExpanded ? "bg-emerald-400" : "bg-gray-100"
                                                )} />

                                                {/* ── Card Header (always visible) ── */}
                                                {/* ── Card Header (Premium Redesign) ── */}
                                                <div className="pl-4 pr-3 pt-4 pb-2">
                                                    <div className="flex justify-between items-start">
                                                        {/* Left: Icon + Info */}
                                                        <div
                                                            className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer group"
                                                            onClick={() => hasMultipleMethods && setExpandedPlotId(isExpanded ? null : plot.id)}
                                                        >
                                                            <div className="w-11 h-11 bg-emerald-500 text-white rounded-[18px] flex items-center justify-center shadow-lg shadow-emerald-100 shrink-0 border-2 border-white mt-0.5 transition-all group-hover:scale-105 group-hover:rotate-3">
                                                                <TreeDeciduous size={20} strokeWidth={2.5} />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                                    <h4 className="font-black text-gray-900 text-[15px] leading-tight truncate">{plot.farmerName || 'ไม่ระบุชื่อ'}</h4>
                                                                    {hasMultipleMethods && (
                                                                        <div className="px-1.5 py-0.5 bg-gray-900 rounded-md shadow-sm flex items-center gap-1 shrink-0">
                                                                            <span className="text-[7px] font-black text-white/50 uppercase tracking-tighter">วิธีคำนวณ</span>
                                                                            <span className="text-[9px] font-black text-white leading-none">{plot.methods.length}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-[9px] font-bold mb-1.5">
                                                                    <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md uppercase tracking-wider">พันธุ์ {plot.variety || '-'}</span>
                                                                    <span className="text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md">{plot.age || 0} ปี</span>
                                                                </div>
                                                                <div className="space-y-1 opacity-80">
                                                                    <div className="flex items-center gap-1">
                                                                        <Map size={9} className="text-gray-400 shrink-0" />
                                                                        <span className="text-[9px] text-gray-500 font-medium whitespace-nowrap">{plot.address || 'ไม่ระบุสถานที่'}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Globe size={9} className="text-gray-400 shrink-0" />
                                                                        <span className="text-[9px] text-slate-400 font-mono">
                                                                            {(() => {
                                                                                try {
                                                                                    if (plot.geometry) {
                                                                                        const center = turf.center(plot.geometry);
                                                                                        const [lng, lat] = center.geometry.coordinates;
                                                                                        return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                                                                                    }
                                                                                    return '-';
                                                                                } catch (e) { return '-'; }
                                                                            })()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Right: Action Buttons */}
                                                        <div className="flex flex-col gap-1 items-end -mt-1">
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleEditAccumulatedPlot(plot); }}
                                                                    className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-center border border-slate-100/50"
                                                                    title="แก้ไข"
                                                                >
                                                                    <Edit3 size={13} />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); onDeletePlot(plot.id); }}
                                                                    className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center border border-slate-100/50"
                                                                    title="ลบ"
                                                                >
                                                                    <Trash2 size={13} />
                                                                </button>
                                                                {hasMultipleMethods && (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); setExpandedPlotId(isExpanded ? null : plot.id); }}
                                                                        className={cn(
                                                                            "w-8 h-8 rounded-xl transition-all flex items-center justify-center border",
                                                                            isExpanded
                                                                                ? "bg-emerald-500 text-white border-emerald-400"
                                                                                : "bg-slate-50 text-slate-400 border-slate-100/50 hover:bg-emerald-50 hover:text-emerald-500"
                                                                        )}
                                                                    >
                                                                        <ChevronRight size={13} className={cn("transition-transform duration-300", isExpanded ? "rotate-[-90deg]" : "rotate-90")} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* ── Method Selector Banner (Only when collapsed) ── */}
                                                    {hasMultipleMethods && !isExpanded && (
                                                        <div className="mt-4 mb-2">
                                                            <div className="relative p-[1px] rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-500/20 via-blue-500/10 to-transparent">
                                                                <div className="bg-white rounded-[15px] px-3 py-2 flex items-center justify-between shadow-sm border border-white/50">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const newIdx = activeTabIdx > 0 ? activeTabIdx - 1 : plot.methods.length - 1;
                                                                            setActiveMethodTabs(prev => ({ ...prev, [plot.id]: newIdx }));
                                                                        }}
                                                                        className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-center border border-slate-100/50 active:scale-90"
                                                                    >
                                                                        <ChevronRight size={14} className="rotate-180" />
                                                                    </button>

                                                                    <div className="flex-1 px-3 text-center min-w-0">
                                                                        <div className="flex items-center justify-center gap-1.5 mb-0.5">
                                                                            <div className="w-5 h-5 rounded-lg flex items-center justify-center text-xs shrink-0" style={{ backgroundColor: `${activeMethod?.color}15`, color: activeMethod?.color }}>
                                                                                {activeMethod?.icon}
                                                                            </div>
                                                                            <span className="text-[11px] font-black text-gray-800 uppercase tracking-tight truncate">
                                                                                {activeMethod?.name}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center justify-center gap-1.5">
                                                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{activeMethod?.desc}</span>
                                                                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{activeTabIdx + 1}/{plot.methods.length} วิธี</span>
                                                                        </div>
                                                                    </div>

                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const newIdx = activeTabIdx < plot.methods.length - 1 ? activeTabIdx + 1 : 0;
                                                                            setActiveMethodTabs(prev => ({ ...prev, [plot.id]: newIdx }));
                                                                        }}
                                                                        className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-center border border-slate-100/50 active:scale-90"
                                                                    >
                                                                        <ChevronRight size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* ── Stats Display (Only when collapsed) ── */}
                                                    {!isExpanded && (
                                                        <div className="grid grid-cols-3 gap-2.5 mt-2 pb-2">
                                                            {/* CO2e Stat */}
                                                            <div className="bg-gradient-to-br from-emerald-50/80 to-white rounded-2xl p-3 border border-emerald-100/50 shadow-[0_4px_12px_-4px_rgba(16,185,129,0.1)] relative overflow-hidden group">
                                                                <span className="block text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1.5 opacity-70">CO₂e</span>
                                                                <div className="flex items-baseline gap-0.5">
                                                                    <span className="text-xl font-black text-emerald-700 leading-none">{displayCarbon}</span>
                                                                    <span className="text-[8px] font-bold text-emerald-500/60 uppercase">t</span>
                                                                </div>
                                                            </div>

                                                            {/* AGB Stat */}
                                                            <div className="bg-gradient-to-br from-blue-50/80 to-white rounded-2xl p-3 border border-blue-100/50 shadow-[0_4px_12px_-4px_rgba(59,130,246,0.1)] relative overflow-hidden">
                                                                <span className="block text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1.5 opacity-70">AGB</span>
                                                                <div className="flex items-baseline gap-0.5">
                                                                    <span className="text-xl font-black text-blue-700 leading-none">{displayAgb}</span>
                                                                    <span className="text-[8px] font-bold text-blue-500/60 uppercase">t</span>
                                                                </div>
                                                            </div>

                                                            {/* Price Stat */}
                                                            <div className="bg-gradient-to-br from-amber-50/80 to-white rounded-2xl p-3 border border-amber-100/50 shadow-[0_4px_12px_-4px_rgba(245,158,11,0.1)] relative overflow-hidden">
                                                                <span className="block text-[8px] font-black text-amber-600 uppercase tracking-widest mb-1.5 opacity-70">มูลค่า</span>
                                                                <div className="flex items-baseline gap-0.5">
                                                                    <span className="text-[14px] font-black text-amber-700 leading-none">฿{displayPrice}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* ── Expanded: Per-Method Tabs ── */}
                                                {isExpanded && hasMultipleMethods && (
                                                    <div
                                                        className="border-t border-dashed border-emerald-100 bg-gradient-to-b from-emerald-50/30 to-white px-3 pb-3 pt-3"
                                                        style={{ animation: 'expandDown 0.25s ease-out' }}
                                                    >
                                                        {/* Method Tabs */}
                                                        <div className="flex gap-1.5 overflow-x-auto scrollbar-thin pb-1 mb-3">
                                                            {plot.methods.map((m, mIdx) => (
                                                                <button
                                                                    key={m.id}
                                                                    onClick={() => setActiveMethodTabs(prev => ({ ...prev, [plot.id]: mIdx }))}
                                                                    className={cn(
                                                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all duration-200 shrink-0 border",
                                                                        activeTabIdx === mIdx
                                                                            ? "text-white shadow-md scale-105"
                                                                            : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
                                                                    )}
                                                                    style={activeTabIdx === mIdx ? { backgroundColor: m.color, borderColor: m.color, boxShadow: `0 4px 12px ${m.color}40` } : {}}
                                                                >
                                                                    <span>{m.icon}</span>
                                                                    <span className="truncate max-w-[80px]">{m.name.replace('สมการที่ ', 'สมการ ').replace(' (ภาคสนาม)', '').replace(' (ดาวเทียม)', '')}</span>
                                                                </button>
                                                            ))}
                                                        </div>

                                                        {/* Active Method Detail */}
                                                        {activeMethod && (
                                                            <div
                                                                key={activeMethod.id}
                                                                className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200"
                                                            >
                                                                {/* Formula badge */}
                                                                <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-gray-100">
                                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0" style={{ backgroundColor: `${activeMethod.color}18` }}>
                                                                        {activeMethod.icon}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="text-[10px] font-bold text-gray-700 truncate">{activeMethod.name}</p>
                                                                        <p className="text-[9px] font-mono text-gray-400 truncate">{activeMethod.formula}</p>
                                                                    </div>
                                                                </div>

                                                                {/* Result Stats */}
                                                                <div className="grid grid-cols-3 gap-1.5">
                                                                    <div className="rounded-xl p-2.5 text-center border" style={{ backgroundColor: `${activeMethod.color}0D`, borderColor: `${activeMethod.color}30` }}>
                                                                        <span className="block text-[8px] font-bold uppercase tracking-wider mb-1" style={{ color: activeMethod.color }}>CO₂e</span>
                                                                        <span className="text-sm font-black leading-none" style={{ color: activeMethod.color }}>{activeMethod.carbon}</span>
                                                                        <span className="block text-[7px] font-medium mt-0.5" style={{ color: `${activeMethod.color}80` }}>tCO₂e</span>
                                                                    </div>
                                                                    <div className="bg-blue-50 rounded-xl p-2.5 text-center border border-blue-100">
                                                                        <span className="block text-[8px] font-bold text-blue-600 uppercase tracking-wider mb-1">AGB</span>
                                                                        <span className="text-sm font-black text-blue-700 leading-none">{activeMethod.agb}</span>
                                                                        <span className="block text-[7px] font-medium text-blue-500/60 mt-0.5">ตัน</span>
                                                                    </div>
                                                                    <div className="bg-amber-50 rounded-xl p-2.5 text-center border border-amber-100">
                                                                        <span className="block text-[8px] font-bold text-amber-600 uppercase tracking-wider mb-1">มูลค่า</span>
                                                                        <span className="text-sm font-black text-amber-700 leading-none">
                                                                            {(parseFloat(activeMethod.carbon) * currentPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                                        </span>
                                                                        <span className="block text-[7px] font-medium text-amber-500/60 mt-0.5">บาท</span>
                                                                    </div>
                                                                </div>

                                                                {/* Hint: shows avg */}
                                                                <div className="flex items-center justify-between px-1">
                                                                    <span className="text-[9px] text-gray-400">ค่าเฉลี่ยทุกวิธี:</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[9px] font-bold text-emerald-600">{parseFloat(plot.carbon || 0).toFixed(2)} tCO₂e</span>
                                                                        <span className="text-[9px] text-gray-300">|</span>
                                                                        <span className="text-[9px] font-bold text-amber-600">
                                                                            ฿{(parseFloat(plot.carbon || 0) * currentPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ─── Footer Buttons ─── */}
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <button
                                    onClick={handleDigitizeMore}
                                    className="h-11 bg-white hover:bg-emerald-50 border border-emerald-100 hover:border-emerald-200 text-emerald-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.97]"
                                >
                                    <Plus size={14} strokeWidth={3} />
                                    เพิ่มแปลงใหม่
                                </button>
                                <button
                                    onClick={() => onSave(null, true)}
                                    disabled={accumulatedPlots.length === 0}
                                    className="h-11 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold disabled:bg-gray-100 disabled:text-gray-400 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.97]"
                                >
                                    <CheckCircle2 size={16} />
                                    ยืนยันการบันทึก
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}
