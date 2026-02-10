import React, { useState, useEffect, useRef } from 'react';
import * as turf from '@turf/turf';
import shp from 'shpjs';
import {
    Loader2, Trash2, Edit3, Leaf, Zap,
    Calculator, Upload, X, ChevronRight, ArrowLeft,
    CheckCircle2, Map, TreeDeciduous, List, Repeat, Eye,
    Search
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
    isEditing = false
}) {
    const [currentStep, setCurrentStep] = useState(1);
    const [calcGroup, setCalcGroup] = useState(1);
    const [loading, setLoading] = useState(false);

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

    const [result, setResult] = useState(null);
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
            plotsToSend.push({
                ...formData,
                id: formData.id || 'current-processing',
                isPreview: true,
                isActive: true
            });

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

    }, [shpPlotsJson, activePlotJson, currentStep, onPreviewPlots, isEditing, selectedShpPlotIds]);

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
    // SATELLITE DATA
    // ==========================================
    const [loadingSat, setLoadingSat] = useState(false);
    const [satData, setSatData] = useState({ ndvi: 0, tcari: 0 });

    useEffect(() => {
        if (calcGroup === 2 && satData.ndvi === 0) {
            setLoadingSat(true);
            setTimeout(() => {
                setSatData({ ndvi: 0.72, tcari: 0.45 });
                setLoadingSat(false);
            }, 1500);
        }
    }, [calcGroup, satData.ndvi]);

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

        // ตรวจสอบภาคสนาม
        if (calcGroup === 1) {
            if (!formData.dbh || !formData.height) {
                setLoading(false);
                return alert('กรุณาระบุขนาดเส้นผ่านศูนย์กลางและความสูงให้ครบถ้วน');
            }
        }

        // ตรวจสอบดาวเทียม
        if (calcGroup === 2) {
            // ถ้าเป็นดาวเทียม ต้องมีค่า satData
            if (!satData || (satData.ndvi === 0 && satData.tcari === 0)) {
                setLoadingSat(true);
                // พยายามโหลดใหม่อีกครั้งถ้ายังไม่มีค่า
                setTimeout(() => {
                    setSatData({ ndvi: 0.72, tcari: 0.45 });
                    setLoadingSat(false);
                    // เรียกตัวเองใหม่อีกครั้งหลังจากโหลดเสร็จ
                    calculateCarbon();
                }, 1000);
                return; // ออกไปก่อน รอโหลดเสร็จ
            }
        }

        setLoading(true);
        setTimeout(() => {
            try {
                const dbh = parseFloat(formData.dbh) || 0;
                const height = parseFloat(formData.height) || 0;
                const areaSqm = parseFloat(formData.areaSqm) || 0;
                const areaRaiTotal = areaSqm / 1600;

                if (areaRaiTotal <= 0) {
                    setLoading(false);
                    return alert('ไม่พบข้อมูลพื้นที่แปลง กรุณาวาดแปลงใหม่อีกครั้ง');
                }

                const totalTrees = areaRaiTotal * 70;

                let carbonPerTree = 0;
                let resultMethod = '';

                if (calcGroup === 1) {
                    if (formData.methodManual === 'eq1') {
                        carbonPerTree = 0.118 * Math.pow(dbh, 2.53);
                        resultMethod = 'สมการที่ 1 (0.118 × DBH^2.53)';
                    } else {
                        // แก้ไข: ใช้ logic สมการที่ 2 ให้ถูกต้อง
                        carbonPerTree = 0.062 * Math.pow(dbh, 2.23);
                        resultMethod = 'สมการที่ 2 (0.062 × DBH^2.23)';
                    }
                } else {
                    // ป้องกัน error: satData is null (ใช้ default object)
                    const currentSatData = satData || { ndvi: 0, tcari: 0 };

                    if (formData.methodSat === 'ndvi') {
                        carbonPerTree = 34.2 * (currentSatData.ndvi || 0) + 5.8;
                        resultMethod = 'ดาวเทียม (34.2 × NDVI + 5.8)';
                    } else {
                        // ตรวจสอบว่ามีค่า TCARI จริงๆ
                        const validTcari = currentSatData.tcari || 0.45; // Fallback ถ้าค่าเป็น 0
                        carbonPerTree = 13.57 * validTcari + 7.45;
                        resultMethod = 'ดาวเทียม (13.57 × TCARI + 7.45)';
                    }
                }

                const totalCarbonTons = ((carbonPerTree * totalTrees) / 1000) * 0.47;

                console.log("Calculation Result:", {
                    formula: resultMethod,
                    agbTree: carbonPerTree,
                    totalTons: totalCarbonTons,
                    areaRai: areaRaiTotal
                });

                if (isNaN(totalCarbonTons)) {
                    throw new Error("ผลลัพธ์การคำนวณไม่ถูกต้อง (NaN)");
                }

                setResult({
                    carbon: totalCarbonTons.toFixed(2),
                    method: resultMethod
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

                    {/* STEP 2: CALCULATION METHOD */}
                    {currentStep === 2 && (
                        <div className="space-y-5 pt-4">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                                    <Calculator size={32} className="text-white animate-bounce" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800">เลือกวิธีคำนวณ</h2>
                                <p className="text-sm text-gray-500 mt-1">เลือกวิธีการประเมินคาร์บอน</p>
                            </div>

                            {/* Method Toggle */}
                            <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-100">
                                {['ภาคสนาม', 'ดาวเทียม'].map((t, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCalcGroup(i + 1)}
                                        className={cn(
                                            "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                                            calcGroup === i + 1
                                                ? "bg-white text-emerald-600 shadow-sm border border-gray-100"
                                                : "text-gray-400"
                                        )}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>

                            {/* Method Content */}
                            {calcGroup === 1 ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 mb-1.5 ml-1">DBH (ซม.)</label>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                value={formData.dbh}
                                                onChange={e => setFormData({ ...formData, dbh: e.target.value })}
                                                className="w-full h-10 bg-gray-50 rounded-xl px-4 text-sm border border-gray-100 focus:border-emerald-400 focus:bg-white transition-all outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 mb-1.5 ml-1">ความสูง (ม.)</label>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                value={formData.height}
                                                onChange={e => setFormData({ ...formData, height: e.target.value })}
                                                className="w-full h-10 bg-gray-50 rounded-xl px-4 text-sm border border-gray-100 focus:border-emerald-400 focus:bg-white transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        {[
                                            { id: 'eq1', name: 'สมการที่ 1', formula: 'AGB = 0.118 × DBH^2.53' },
                                            { id: 'eq2', name: 'สมการที่ 2', formula: 'AGB = 0.062 × DBH^2.23' }
                                        ].map((eq) => (
                                            <label
                                                key={eq.id}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border",
                                                    formData.methodManual === eq.id
                                                        ? "bg-emerald-50 border-emerald-300"
                                                        : "bg-white border-gray-100 hover:border-gray-200"
                                                )}
                                            >
                                                <input
                                                    type="radio"
                                                    name="manualEq"
                                                    checked={formData.methodManual === eq.id}
                                                    onChange={() => setFormData({ ...formData, methodManual: eq.id })}
                                                    className="w-4 h-4 accent-emerald-500"
                                                />
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold text-gray-800">{eq.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">{eq.formula}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-900 rounded-xl">
                                        {loadingSat ? (
                                            <div className="flex items-center justify-center gap-2 text-emerald-400 py-2">
                                                <Loader2 size={18} className="animate-spin" />
                                                <span className="text-sm font-medium">กำลังดึงข้อมูล...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 text-white">
                                                <Leaf size={24} className="text-emerald-400" />
                                                <div className="flex-1 text-base">
                                                    <span>NDVI: <span className="text-emerald-300 font-semibold">{satData.ndvi}</span></span>
                                                    <span className="ml-4">TCARI: <span className="text-emerald-300 font-semibold">{satData.tcari}</span></span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        {[
                                            { id: 'ndvi', name: 'ดัชนี NDVI', formula: 'AGB = 34.2 × NDVI + 5.8' },
                                            { id: 'tcari', name: 'ดัชนี TCARI', formula: 'AGB = 13.57 × TCARI + 7.45' }
                                        ].map((method) => (
                                            <label
                                                key={method.id}
                                                className={cn(
                                                    "flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border-2",
                                                    formData.methodSat === method.id
                                                        ? "bg-emerald-50 border-emerald-400"
                                                        : "bg-gray-50 border-transparent active:bg-gray-100"
                                                )}
                                            >
                                                <input
                                                    type="radio"
                                                    name="satEq"
                                                    checked={formData.methodSat === method.id}
                                                    onChange={() => setFormData({ ...formData, methodSat: method.id })}
                                                    className="w-5 h-5 accent-emerald-500"
                                                />
                                                <div className="flex-1">
                                                    <p className="text-base font-semibold text-gray-800">{method.name}</p>
                                                    <p className="text-sm text-gray-500 mt-0.5">{method.formula}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
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
                                    disabled={loading}
                                    className="flex-1 h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold disabled:bg-gray-100 disabled:text-gray-400 transition-all shadow-lg shadow-emerald-200/50"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 size={16} className="animate-spin" />
                                            กำลังคำนวณ...
                                        </span>
                                    ) : (
                                        'คำนวณคาร์บอน'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: RESULT - Minimal Card Style */}
                    {currentStep === 3 && result && (
                        <div className="space-y-0 pt-2">
                            {/* Compact Info Card */}
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 relative">
                                {/* Tooltip Arrow */}
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-b border-r border-gray-100 rotate-45"></div>

                                {/* Header with Icon */}
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                                        <TreeDeciduous size={24} className="text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-gray-800 truncate">{formData.farmerName}</h3>
                                        <p className="text-sm text-gray-500">{formData.variety}</p>
                                    </div>
                                </div>

                                {/* Plot Shape Preview */}
                                {formData.svgPath && (
                                    <div className="mb-4 flex justify-center">
                                        <div className="w-full flex items-center justify-center py-2 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                            <div className="w-32 h-24">
                                                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                                                    <polygon
                                                        points={formData.svgPath}
                                                        fill="rgba(16,185,129,0.3)"
                                                        stroke="#10b981"
                                                        strokeWidth="2"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Info Grid */}
                                <div className="space-y-2.5 mb-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">พื้นที่</span>
                                        <span className="text-sm font-semibold text-gray-800">
                                            {formData.areaRai}-{formData.areaNgan}-{parseFloat(formData.areaSqWah).toFixed(1)} ไร่
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">ปีที่ปลูก (พ.ศ.)</span>
                                        <span className="text-sm font-semibold text-gray-800">{formData.plantingYearBE}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">อายุยาง</span>
                                        <span className="text-sm font-semibold text-gray-800">{formData.age} ปี</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">วิธีคำนวณ</span>
                                        <span className="text-xs font-medium text-gray-600">{result.method}</span>
                                    </div>
                                </div>

                                {/* Carbon Display - Prominent */}
                                <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                                    <span className="text-sm font-medium text-gray-700">คาร์บอนดูดซับ</span>
                                    <span className="text-xl font-bold text-emerald-600">{result.carbon} tCO₂e</span>
                                </div>

                                {/* Valuation Display - Minimal with Icon */}
                                <div className="relative mt-3 p-4 bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 rounded-2xl border border-teal-200/50 overflow-hidden group hover:shadow-lg transition-all duration-300">
                                    {/* Decorative circles */}
                                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-teal-300/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                                    <div className="absolute -bottom-3 -left-3 w-12 h-12 bg-emerald-300/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>

                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M10.5 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM13.5 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 4.5a.75.75 0 0 1 .75.75v14.25a.75.75 0 0 1-1.5 0V5.25A.75.75 0 0 1 7.5 4.5ZM16.5 4.5a.75.75 0 0 1 .75.75v14.25a.75.75 0 0 1-1.5 0V5.25a.75.75 0 0 1 .75-.75ZM4.5 9v9.75a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h-9a3 3 0 0 0-3 3Z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-teal-700/80 uppercase tracking-widest">มูลค่าประเมิน</p>
                                                <p className="text-[9px] text-teal-600/70 font-medium mt-0.5">@ ฿250/ตัน</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="text-2xl font-black text-teal-700 tracking-tight leading-none">
                                                ฿{(parseFloat(result.carbon) * 250).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </div>
                                            <div className="mt-1 px-2 py-0.5 bg-white/60 rounded-md">
                                                <span className="text-[9px] font-bold text-teal-600 uppercase tracking-wider">ประมาณการ</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 mt-4">
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
                            <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1 scrollbar-thin">
                                {accumulatedPlots.map((plot, idx) => (
                                    <div key={plot.id} className="p-3 bg-white rounded-2xl flex items-center gap-3 border border-gray-100 hover:border-emerald-200 transition-all group">
                                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-black text-xs shrink-0">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-800 truncate">{plot.farmerName}</p>
                                            <p className="text-[10px] text-gray-400 font-bold tracking-tight">
                                                {plot.carbon} tCO₂e • {plot.areaRai}-{plot.areaNgan}-{parseInt(plot.areaSqWah || 0)} ไร่
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFormData({ ...plot });
                                                    setResult({ carbon: plot.carbon, method: plot.method });
                                                    setCurrentStep(1);
                                                }}
                                                className="w-8 h-8 rounded-lg hover:bg-emerald-50 text-gray-300 hover:text-emerald-500 flex items-center justify-center transition-colors"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm("ยืนยันการลบรายการนี้?")) {
                                                        onDeletePlot(plot.id);
                                                    }
                                                }}
                                                className="w-8 h-8 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 flex items-center justify-center transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
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
