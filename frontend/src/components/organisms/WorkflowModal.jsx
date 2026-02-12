import React, { useState, useEffect, useRef } from 'react';
import * as turf from '@turf/turf';
import shp from 'shpjs';
import {
    Loader2, Trash2, Edit3, Leaf, Zap,
    Calculator, Upload, X, ChevronRight, ArrowLeft,
    CheckCircle2, Map, TreeDeciduous, List, Repeat, Eye,
    Search, Calendar, Coins, Scaling, Ruler
} from "lucide-react";
import { cn } from "../../lib/utils";

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
    carbonPrice = 250
}) {
    const [currentStep, setCurrentStep] = useState(1);
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

    const containerRef = useRef(null);

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
            if (mode === 'import' && processingQueue.length === 0 && shpPlots.length === 0) {
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
                setSatData({ ndvi: 0.72, tcari: 0.45 });
                setLoadingSat(false);
            }, 1500);
        }
    }, [selectedMethods, satData.ndvi]);

    // ==========================================
    // AUTO-ADVANCE (Only when creating new plot)
    // ==========================================
    useEffect(() => {
        if (!isEditing && currentStep === 1 && formData.farmerName && formData.plantingYearBE && formData.variety) {
            const timer = setTimeout(() => setCurrentStep(2), 800);
            return () => clearTimeout(timer);
        }
    }, [formData.farmerName, formData.plantingYearBE, formData.variety, currentStep, isEditing]);

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

                console.log(`Plot ${i + 1} area calculation:`, { area, raiTotal, rai, ngan, sqWah });

                return {
                    id: Date.now() + i,
                    farmerName: f.properties?.FARMER || f.properties?.NAME || f.properties?.farmer || f.properties?.name || `แปลงที่ ${i + 1}`,
                    areaSqm: parseFloat(area.toFixed(2)),
                    areaRai: rai,
                    areaNgan: ngan,
                    areaSqWah: sqWah,
                    geometry: f.geometry,
                    svgPath: generateSvgPath(f.geometry)
                };
            });

            console.log("Parsed SHP Plots with areas:", plots);
            console.log("Parsed SHP Plots with areas:", plots);
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
            id: plot.id, // CRITICAL: Keep ID reference for preview logic and map filtering
            farmerName: '', // Reset name to allow fresh entry
            originalShpName: plot.farmerName, // Keep original name reference if needed
            areaRai: plot.areaRai,
            areaNgan: plot.areaNgan,
            areaSqWah: plot.areaSqWah,
            areaSqm: plot.areaSqm,
            geometry: plot.geometry,
            svgPath: plot.svgPath,
            plantingYearBE: '',
            age: 0,
            variety: '',
            dbh: '',
            height: '',
            methodManual: 'eq1',
            methodSat: 'ndvi',
        }));
        setResult(null);

        // Zoom to this specific plot when loading for processing
        if (onZoomToPlot && plot.geometry) {
            console.log("Zooming to loaded plot geometry...");
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
                setSatData({ ndvi: 0.72, tcari: 0.45 });
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
                    const carbonPerTree = def.calc();
                    const totalCarbonTons = ((carbonPerTree * totalTrees) / 1000) * 0.47;
                    return {
                        id: methodId,
                        name: def.name,
                        formula: def.formula,
                        icon: def.icon,
                        color: def.color,
                        carbon: totalCarbonTons.toFixed(2),
                        carbonPerTree: carbonPerTree.toFixed(4)
                    };
                });

                const carbonValues = methodResults.map(m => parseFloat(m.carbon));
                const avgCarbon = (carbonValues.reduce((a, b) => a + b, 0) / carbonValues.length).toFixed(2);
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
            method: result.method,
            methods: result.methods || [],
            selectedMethods: selectedMethods,
            satData: satData,
            avgCarbon: result.avgCarbon,
            bestCarbon: result.bestCarbon,
            minCarbon: result.minCarbon,
            savedAt: new Date().toISOString()
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
                    className="absolute top-5 right-5 z-50 w-8 h-8 rounded-full bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-all active:scale-95"
                >
                    <X size={18} />
                </button>

                {/* Content */}
                <div ref={containerRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">

                    {/* STEP 0: SHP IMPORT */}
                    {currentStep === 0 && (
                        <div className="space-y-4 pt-2">
                            <div className="text-center pb-2">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-emerald-100/50">
                                    <Upload size={24} />
                                </div>
                                <h2 className="text-lg font-semibold text-slate-800 tracking-tight">นำเข้า Shapefile</h2>
                                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest mt-0.5 whitespace-nowrap">เลือกไฟล์ .zip เพื่อเริ่มต้น</p>
                            </div>

                            <div className="relative p-8 border-2 border-dashed border-gray-100 rounded-2xl text-center hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer group">
                                <input
                                    type="file"
                                    accept=".zip"
                                    onChange={handleShpUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                {isUploading ? (
                                    <Loader2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 animate-spin" />
                                ) : (
                                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                                )}
                                <p className="text-xs font-medium text-slate-400">
                                    {isUploading ? 'กำลังอ่านข้อมูล...' : 'คลิกเพื่ออัพโหลดไฟล์ .zip'}
                                </p>
                            </div>

                            {shpError && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                                    {shpError}
                                </div>
                            )}

                            {/* Search and Filter */}
                            <div className="space-y-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                    <input
                                        type="text"
                                        placeholder="ค้นหาชื่อแปลง..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full h-10 bg-gray-50 border border-gray-100 rounded-xl pl-9 pr-4 text-sm focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                                    />
                                </div>

                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] font-bold text-slate-400 tracking-wider">พบ {shpPlots.filter(p => p.farmerName.toLowerCase().includes(searchTerm.toLowerCase())).length} แปลง</span>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleSelectAllPlots}
                                            className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider hover:opacity-70 transition-opacity"
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

                    {/* STEP 1: FARMER INFO */}
                    {currentStep === 1 && (
                        <div className="space-y-5 pt-4">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg animate-pulse">
                                    <TreeDeciduous size={32} className="text-white" />
                                </div>
                                <h2 className="text-xl font-semibold text-slate-800 tracking-tight">ข้อมูลแปลงยางพารา</h2>
                                <p className="text-xs font-medium text-slate-400 mt-1">กรอกข้อมูลเกษตรกรและรายละเอียดแปลง</p>
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
                                            {formData.areaRai}-{formData.areaNgan}-{parseFloat(formData.areaSqWah).toFixed(1)} ไร่
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-2xl font-semibold text-slate-800 tracking-tight">
                                            {formData.areaRai}-{formData.areaNgan}-{parseFloat(formData.areaSqWah).toFixed(1)} <span className="text-xs opacity-50 font-medium">ไร่</span>
                                        </p>
                                        <p className="text-[11px] text-emerald-600 mt-1 font-bold uppercase tracking-tight">
                                            {parseFloat(formData.areaSqm || 0).toLocaleString()} ตร.ม.
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Processing Queue Display */}
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
                                                <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">
                                                    {index + 1}
                                                </span>
                                                <span className="flex-1 text-slate-700 font-medium truncate">{plot.farmerName}</span>
                                                <span className="text-[10px] text-slate-400">{plot.areaRai}-{plot.areaNgan}-{parseFloat(plot.areaSqWah).toFixed(1)} ไร่</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}


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

                            {/* Only show 'Next' button if in editing mode */}
                            {isEditing ? (
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => {
                                            if (window.confirm("ยืนยันการลบแปลงนี้?")) {
                                                onDeletePlot(formData.id);
                                                onClose();
                                            }
                                        }}
                                        className="w-12 h-11 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl flex items-center justify-center transition-all border border-red-100"
                                        title="ลบแปลง"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentStep(2)}
                                        disabled={!formData.farmerName || !formData.plantingYearBE || !formData.variety}
                                        className="flex-1 h-11 bg-emerald-500 active:bg-emerald-600 text-white rounded-xl text-sm font-bold disabled:bg-gray-100 disabled:text-gray-400 transition-all shadow-lg shadow-emerald-200/50"
                                    >
                                        ถัดไป
                                    </button>
                                </div>
                            ) : (
                                formData.farmerName && formData.plantingYearBE && formData.variety && (
                                    <div className="flex items-center justify-center gap-2 text-emerald-500 py-3 animate-pulse">
                                        <p className="text-xs font-bold">กำลังไปขั้นตอนถัดไป...</p>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    {/* STEP 2: CALCULATION METHOD - MULTI SELECT */}
                    {currentStep === 2 && (
                        <div className="space-y-5 pt-4">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                                    <Calculator size={32} className="text-white animate-bounce" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800">เลือกวิธีคำนวณ</h2>
                                <p className="text-sm text-gray-500 mt-1">เลือกได้มากกว่า 1 วิธี เพื่อเปรียบเทียบผลลัพธ์</p>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                                    เลือกแล้ว {selectedMethods.length}/4 วิธี
                                </span>
                                <button
                                    onClick={() => setSelectedMethods(selectedMethods.length === 4 ? [] : ['eq1', 'eq2', 'ndvi', 'tcari'])}
                                    className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider hover:opacity-70 transition-opacity"
                                >
                                    {selectedMethods.length === 4 ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด 4 วิธี'}
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
                                    <div className="grid grid-cols-2 gap-2.5">
                                        {allMethods.map(m => {
                                            const isSelected = selectedMethods.includes(m.id);
                                            return (
                                                <button
                                                    key={m.id}
                                                    onClick={() => toggleMethod(m.id)}
                                                    className={cn(
                                                        "relative p-3.5 rounded-2xl text-left transition-all duration-300 border-2 active:scale-[0.97] overflow-hidden",
                                                        isSelected
                                                            ? "border-current shadow-lg"
                                                            : "border-gray-100 bg-white hover:border-gray-200"
                                                    )}
                                                    style={isSelected ? { borderColor: m.color, backgroundColor: `${m.color}08` } : {}}
                                                >
                                                    {/* Glow effect */}
                                                    {isSelected && (
                                                        <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full blur-2xl opacity-30"
                                                            style={{ backgroundColor: m.color }} />
                                                    )}
                                                    <div className="relative">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xl">{m.icon}</span>
                                                            <div className={cn(
                                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                                                isSelected ? "border-current" : "border-gray-300"
                                                            )}
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
                                                        >
                                                            {m.desc}
                                                        </p>
                                                        <p className="text-[9px] text-gray-400 font-mono mt-1.5 leading-tight">{m.formula}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                );
                            })()}

                            {/* Field Data Inputs - Show if any field method selected */}
                            {(selectedMethods.includes('eq1') || selectedMethods.includes('eq2')) && (
                                <div className="p-4 bg-gradient-to-br from-emerald-50/80 to-green-50/80 rounded-2xl border border-emerald-100 space-y-3 animate-fadeIn">
                                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-1.5">
                                        <span>🌿</span> ข้อมูลภาคสนาม
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 mb-1.5 ml-1">DBH (ซม.)</label>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                value={formData.dbh}
                                                onChange={e => setFormData({ ...formData, dbh: e.target.value })}
                                                className="w-full h-10 bg-white rounded-xl px-4 text-sm border border-emerald-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 mb-1.5 ml-1">ความสูง (ม.)</label>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                value={formData.height}
                                                onChange={e => setFormData({ ...formData, height: e.target.value })}
                                                className="w-full h-10 bg-white rounded-xl px-4 text-sm border border-emerald-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Satellite Data - Show if any sat method selected */}
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
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => setCurrentStep(1)}
                                    className="w-11 h-11 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors border border-gray-100"
                                    title="ย้อนกลับ"
                                >
                                    <ArrowLeft size={18} className="text-gray-400" />
                                </button>
                                <button
                                    onClick={calculateCarbon}
                                    disabled={loading || selectedMethods.length === 0}
                                    className="flex-1 h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold disabled:bg-gray-100 disabled:text-gray-400 transition-all shadow-lg shadow-emerald-200/50"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 size={16} className="animate-spin" />
                                            กำลังคำนวณ {selectedMethods.length} วิธี...
                                        </span>
                                    ) : (
                                        `คำนวณ ${selectedMethods.length} วิธี`
                                    )}
                                </button>
                            </div>
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
                                        <h3 className="text-lg font-bold text-gray-800 truncate">{formData.farmerName}</h3>
                                        <p className="text-sm text-gray-500">{formData.variety} • {formData.age} ปี</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-gray-50 rounded-xl p-2">
                                        <p className="text-[9px] text-gray-400 font-bold">พื้นที่</p>
                                        <p className="text-xs font-bold text-gray-700">{formData.areaRai}-{formData.areaNgan}-{parseFloat(formData.areaSqWah).toFixed(0)}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-2">
                                        <p className="text-[9px] text-gray-400 font-bold">ปีปลูก</p>
                                        <p className="text-xs font-bold text-gray-700">{formData.plantingYearBE}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-2">
                                        <p className="text-[9px] text-gray-400 font-bold">จำนวนวิธี</p>
                                        <p className="text-xs font-bold text-emerald-600">{result.methods?.length || 1}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Multi-Method Results - Individual Cards */}
                            <div className="space-y-3">
                                {result.methods && result.methods.length > 0 ? (
                                    result.methods.map((m, i) => {
                                        const carbonVal = parseFloat(m.carbon || 0);
                                        const currentPrice = carbonPrice || 250;
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
                                                            <span className="block text-2xl font-black text-emerald-600 tracking-tight leading-none">
                                                                {m.carbon}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">tCO₂e</span>
                                                        </div>
                                                    </div>

                                                    {/* Divider with dash */}
                                                    <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent my-3 border-t border-dashed border-gray-200"></div>

                                                    {/* Footer: Valuation */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="p-1 bg-amber-50 rounded-md">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
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
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-bold text-gray-700">ผลลัพธ์การคำนวณ</span>
                                            <span className="text-xl font-black text-emerald-600">{result.carbon} tCO₂e</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                            <span className="text-xs text-gray-500">มูลค่าประเมิน</span>
                                            <span className="text-base font-bold text-amber-600">
                                                ฿{((parseFloat(result.carbon || 0)) * (carbonPrice || 250)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => setCurrentStep(2)}
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

                    {/* STEP 4: SUCCESS SUMMARY */}
                    {currentStep === 4 && (
                        <div className="space-y-6 pt-2">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-emerald-500 text-white rounded-[24px] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-200 relative">
                                    <CheckCircle2 size={32} />
                                    <div className="absolute inset-0 bg-emerald-400 rounded-[24px] animate-ping opacity-20" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">บันทึกสำเร็จ</h3>
                                <p className="text-xs text-gray-400 font-bold tracking-widest mt-1">
                                    รวมทั้งหมด <span className="text-emerald-500">{accumulatedPlots.length} แปลง</span> แล้ว
                                </p>
                            </div>

                            {/* Cards List */}
                            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin pb-4">
                                {accumulatedPlots.map((plot, idx) => {
                                    const price = (parseFloat(plot.carbon || 0) * (carbonPrice || 250)).toLocaleString(undefined, { maximumFractionDigits: 0 });
                                    const areaLabel = `${plot.areaRai}-${plot.areaNgan}-${parseInt(plot.areaSqWah || 0)}`;

                                    return (
                                        <div key={plot.id} className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-4 overflow-hidden hover:shadow-md transition-all group">
                                            {/* Decorative Background */}
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-50 to-transparent rounded-bl-full opacity-50 pointer-events-none" />

                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-3 relative z-10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md shrink-0">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-gray-800 text-sm truncate">{plot.farmerName || 'ไม่ระบุชื่อ'}</h4>
                                                        <p className="text-[10px] text-gray-400 font-medium truncate">พันธุ์ {plot.variety || '-'} • ปี {plot.plantingYearBE || '-'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-1 shrink-0">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setFormData({ ...plot });
                                                            setResult({ carbon: plot.carbon, method: plot.method });
                                                            setCurrentStep(1);
                                                        }}
                                                        className="w-7 h-7 rounded-lg bg-gray-50 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center justify-center"
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm("ยืนยันการลบรายการนี้?")) {
                                                                onDeletePlot(plot.id);
                                                            }
                                                        }}
                                                        className="w-7 h-7 rounded-lg bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Data Grid */}
                                            {/* Top Row: Basic Info */}
                                            <div className="flex gap-2 mb-2">
                                                {/* Age */}
                                                <div className="flex-1 bg-orange-50/80 rounded-xl p-2 flex items-center justify-between border border-orange-100/50">
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center shrink-0 text-orange-500">
                                                            <Calendar size={10} strokeWidth={2.5} />
                                                        </div>
                                                        <span className="text-[10px] text-orange-800 font-bold truncate">อายุยาง</span>
                                                    </div>
                                                    <span className="text-xs font-bold text-orange-700">{plot.age || 0} <span className="text-[9px] font-normal opacity-70">ปี</span></span>
                                                </div>

                                                {/* Area */}
                                                <div className="flex-1 bg-blue-50/80 rounded-xl p-2 flex items-center justify-between border border-blue-100/50">
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-500">
                                                            <Scaling size={10} strokeWidth={2.5} />
                                                        </div>
                                                        <span className="text-[10px] text-blue-800 font-bold truncate">พื้นที่</span>
                                                    </div>
                                                    <span className="text-xs font-bold text-blue-700 truncate ml-1">{areaLabel}</span>
                                                </div>
                                            </div>

                                            {/* Bottom Row: Results (Premium Look) */}
                                            <div className="grid grid-cols-2 gap-2">
                                                {/* Carbon Credit */}
                                                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-2.5 flex flex-col items-center justify-center border border-emerald-100 relative overflow-hidden group-hover:border-emerald-200 transition-colors">
                                                    <div className="absolute top-0 right-0 p-1 opacity-10 transform translate-x-1 -translate-y-1">
                                                        <Leaf size={24} />
                                                    </div>
                                                    <div className="flex items-center gap-1 mb-1 text-emerald-600">
                                                        <Leaf size={10} strokeWidth={2.5} />
                                                        <span className="text-[9px] font-bold uppercase tracking-wider">คาร์บอนเครดิต</span>
                                                    </div>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-lg font-extrabold text-emerald-700 tracking-tight leading-none">{plot.carbon}</span>
                                                        <span className="text-[9px] font-bold text-emerald-600">tCO₂e</span>
                                                    </div>
                                                </div>

                                                {/* Price */}
                                                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-2.5 flex flex-col items-center justify-center border border-amber-100 relative overflow-hidden group-hover:border-amber-200 transition-colors">
                                                    <div className="absolute top-0 right-0 p-1 opacity-10 transform translate-x-1 -translate-y-1">
                                                        <Coins size={24} />
                                                    </div>
                                                    <div className="flex items-center gap-1 mb-1 text-amber-600">
                                                        <Coins size={10} strokeWidth={2.5} />
                                                        <span className="text-[9px] font-bold uppercase tracking-wider">มูลค่าประเมิน</span>
                                                    </div>
                                                    <div className="flex items-baseline gap-0.5">
                                                        <span className="text-xs font-bold text-amber-600 mt-[1px]">฿</span>
                                                        <span className="text-lg font-extrabold text-amber-700 tracking-tight leading-none">{price}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Footer Buttons */}
                            <div className="space-y-2 pt-2">
                                <button
                                    onClick={onStartDrawing ? onStartDrawing : handleDigitizeMore}
                                    className="w-full h-11 bg-white border border-emerald-500 text-emerald-600 rounded-2xl text-xs font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <Map size={16} />
                                    เพิ่มแปลงถัดไป
                                </button>
                                <button
                                    onClick={() => onSave(null, true)}
                                    disabled={accumulatedPlots.length === 0}
                                    className="w-full h-11 bg-gray-900 hover:bg-black text-white rounded-2xl text-xs font-bold disabled:bg-gray-100 disabled:text-gray-400 transition-all shadow-lg flex items-center justify-center gap-2 tracking-widest"
                                >
                                    <CheckCircle2 size={16} />
                                    บันทึกข้อมูลทั้งหมด
                                </button>
                            </div>
                        </div>
                    )}


                </div>
            </div>
        </div >
    );
}
