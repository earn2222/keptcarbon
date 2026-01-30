import React, { useState, useEffect, useRef } from 'react';
import * as turf from '@turf/turf';
import shp from 'shpjs';
import {
    Loader2, Trash2, Edit3, Leaf, Zap,
    Calculator, Upload, X, ChevronRight, ArrowLeft,
    CheckCircle2, Map, TreeDeciduous, List, Repeat, Eye
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
    onZoomToPlot
}) {
    const [currentStep, setCurrentStep] = useState(1);
    const [calcGroup, setCalcGroup] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
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

    const [result, setResult] = useState(null);
    const [shpPlots, setShpPlots] = useState([]);
    const [selectedShpPlotId, setSelectedShpPlotId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [shpError, setShpError] = useState(null);
    const [useMetricUnit, setUseMetricUnit] = useState(false); // Toggle for Rai/Sqm

    const containerRef = useRef(null);

    // ==========================================
    // INITIALIZATION
    // ==========================================
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                console.log("Loading initialData:", initialData);
                setFormData(prev => ({
                    ...prev,
                    ...initialData,
                    farmerName: initialData.farmerName || '',
                    plantingYearBE: initialData.plantingYearBE || '',
                    areaRai: initialData.areaRai || 0,
                    areaNgan: initialData.areaNgan || 0,
                    areaSqWah: initialData.areaSqWah || 0,
                    areaSqm: initialData.areaSqm || 0,
                    svgPath: initialData.svgPath || (initialData.geometry ? generateSvgPath(initialData.geometry) : '')
                }));
            }

            if (mode === 'import') setCurrentStep(0);
            else if (mode === 'list') setCurrentStep(4);
            else setCurrentStep(1);

            setResult(null);
        }
    }, [isOpen, mode, initialData]);

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
    // AUTO-ADVANCE
    // ==========================================
    useEffect(() => {
        if (currentStep === 1 && formData.farmerName && formData.plantingYearBE && formData.variety) {
            const timer = setTimeout(() => setCurrentStep(2), 800);
            return () => clearTimeout(timer);
        }
    }, [formData.farmerName, formData.plantingYearBE, formData.variety, currentStep]);

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
            setShpPlots(plots);
            setSelectedShpPlotId(null);
        } catch (e) {
            console.error("SHP Parse Error:", e);
            setShpError('ไม่สามารถอ่านไฟล์ SHP ได้ กรุณาใช้ไฟล์ .zip');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSelectShpPlot = (plotId) => {
        setSelectedShpPlotId(plotId);
        const selectedPlot = shpPlots.find(p => p.id === plotId);
        if (selectedPlot) {
            console.log("Selected Plot Data with areas:", selectedPlot);
            setFormData(prev => ({
                ...prev,
                farmerName: selectedPlot.farmerName,
                areaRai: selectedPlot.areaRai,
                areaNgan: selectedPlot.areaNgan,
                areaSqWah: selectedPlot.areaSqWah,
                areaSqm: selectedPlot.areaSqm,
                geometry: selectedPlot.geometry,
                svgPath: selectedPlot.svgPath
            }));
        }
    };

    const handleProceedFromShp = () => {
        if (!selectedShpPlotId) {
            return alert('กรุณาเลือกแปลงที่ต้องการคำนวณ');
        }
        setCurrentStep(1);
    };

    const calculateCarbon = () => {
        if (!formData.farmerName) return alert('กรุณาระบุชื่อเกษตรกร');
        if (!formData.variety) return alert('กรุณาเลือกพันธุ์ยาง');

        setLoading(true);
        setTimeout(() => {
            try {
                const dbh = parseFloat(formData.dbh) || 20;
                const height = parseFloat(formData.height) || 12;
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
                        resultMethod = 'ภาคสนาม (สมการที่ 1)';
                    } else {
                        carbonPerTree = 0.062 * Math.pow(dbh, 2.23);
                        resultMethod = 'ภาคสนาม (สมการที่ 2)';
                    }
                } else {
                    const { ndvi, tcari } = satData;
                    if (formData.methodSat === 'ndvi') {
                        carbonPerTree = 34.2 * ndvi + 5.8;
                        resultMethod = 'ดาวเทียม (NDVI)';
                    } else {
                        carbonPerTree = 13.57 * tcari + 7.45;
                        resultMethod = 'ดาวเทียม (TCARI)';
                    }
                }

                const totalCarbonTons = ((carbonPerTree * totalTrees) / 1000) * 0.47;

                console.log("Calculation Result:", {
                    formula: resultMethod,
                    agbTree: carbonPerTree,
                    totalTons: totalCarbonTons,
                    areaRai: areaRaiTotal
                });

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

            // Zoom to plot immediately when saved
            if (onZoomToPlot && formData.geometry) {
                onZoomToPlot(formData.geometry);
            }

            // Go to Step 4 (Summary List)
            setCurrentStep(4);
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
        onSave(null, true);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] animate-in slide-in-from-bottom sm:fade-in sm:zoom-in-95 duration-300">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 w-9 h-9 rounded-full bg-white shadow-lg hover:shadow-xl flex items-center justify-center text-gray-400 hover:text-gray-700 transition-all active:scale-95"
                >
                    <X size={20} />
                </button>

                {/* Content */}
                <div ref={containerRef} className="flex-1 overflow-y-auto p-6 pb-8 space-y-6">

                    {/* STEP 0: SHP IMPORT */}
                    {currentStep === 0 && (
                        <div className="space-y-5 pt-4">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                                    <Upload size={32} className="text-white" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800">นำเข้าไฟล์ Shapefile</h2>
                                <p className="text-sm text-gray-500 mt-1">เลือกไฟล์ .zip ที่มีข้อมูลแปลง</p>
                            </div>

                            <div className="relative p-12 border-2 border-dashed border-gray-200 rounded-2xl text-center hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer group">
                                <input
                                    type="file"
                                    accept=".zip"
                                    onChange={handleShpUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                {isUploading ? (
                                    <Loader2 className="w-12 h-12 mx-auto mb-3 text-emerald-500 animate-spin" />
                                ) : (
                                    <Upload className="w-12 h-12 mx-auto mb-3 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                                )}
                                <p className="text-sm font-medium text-gray-700">
                                    {isUploading ? 'กำลังประมวลผล...' : 'คลิกเพื่ออัพโหลดไฟล์'}
                                </p>
                            </div>

                            {shpError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                                    {shpError}
                                </div>
                            )}

                            {shpPlots.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-sm font-semibold text-gray-700 text-center">พบ {shpPlots.length} แปลง</p>
                                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                        {shpPlots.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => handleSelectShpPlot(p.id)}
                                                className={cn(
                                                    "w-full p-4 rounded-xl flex items-center gap-3 transition-all border-2",
                                                    selectedShpPlotId === p.id
                                                        ? "bg-emerald-50 border-emerald-400 shadow-sm"
                                                        : "bg-gray-50 border-transparent active:bg-gray-100"
                                                )}
                                            >
                                                {/* SVG Preview */}
                                                <div className={cn(
                                                    "w-14 h-14 rounded-xl flex items-center justify-center shrink-0 p-2",
                                                    selectedShpPlotId === p.id
                                                        ? "bg-emerald-500"
                                                        : "bg-white border-2 border-gray-200"
                                                )}>
                                                    {p.svgPath ? (
                                                        <svg viewBox="0 0 100 100" className="w-full h-full">
                                                            <polygon
                                                                points={p.svgPath}
                                                                fill={selectedShpPlotId === p.id ? "rgba(255,255,255,0.3)" : "rgba(16,185,129,0.3)"}
                                                                stroke={selectedShpPlotId === p.id ? "#ffffff" : "#10b981"}
                                                                strokeWidth="2"
                                                            />
                                                        </svg>
                                                    ) : (
                                                        <Map size={22} className={selectedShpPlotId === p.id ? "text-white" : "text-gray-400"} />
                                                    )}
                                                </div>
                                                <div className="flex-1 text-left min-w-0">
                                                    <p className="text-base font-semibold text-gray-800 truncate">{p.farmerName}</p>
                                                    <p className="text-sm text-gray-600 mt-0.5">
                                                        {p.areaRai}-{p.areaNgan}-{p.areaSqWah} ไร่
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {parseFloat(p.areaSqm).toLocaleString()} ตร.ม.
                                                    </p>
                                                </div>
                                                {selectedShpPlotId === p.id && (
                                                    <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleProceedFromShp}
                                        disabled={!selectedShpPlotId}
                                        className="w-full h-12 bg-emerald-500 active:bg-emerald-600 text-white rounded-xl text-base font-medium disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm active:scale-[0.98]"
                                    >
                                        ดำเนินการต่อ
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
                                <h2 className="text-xl font-semibold text-gray-800">ข้อมูลแปลงยางพารา</h2>
                                <p className="text-sm text-gray-500 mt-1">กรอกข้อมูลเกษตรกรและแปลงปลูก</p>
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
                                <p className="text-xs text-emerald-700 font-medium mb-1">พื้นที่แปลง</p>
                                {useMetricUnit ? (
                                    <>
                                        <p className="text-2xl font-bold text-gray-800">
                                            {parseFloat(formData.areaSqm || 0).toLocaleString()} ตร.ม.
                                        </p>
                                        <p className="text-xs text-emerald-600 mt-1 font-medium">
                                            {formData.areaRai}-{formData.areaNgan}-{parseFloat(formData.areaSqWah).toFixed(1)} ไร่
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-2xl font-bold text-gray-800">
                                            {formData.areaRai}-{formData.areaNgan}-{parseFloat(formData.areaSqWah).toFixed(1)} ไร่
                                        </p>
                                        <p className="text-xs text-emerald-600 mt-1 font-medium">
                                            {parseFloat(formData.areaSqm || 0).toLocaleString()} ตร.ม.
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Input Fields */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อเกษตรกร</label>
                                    <input
                                        type="text"
                                        placeholder="กรอกชื่อ-นามสกุล"
                                        value={formData.farmerName}
                                        onChange={e => setFormData({ ...formData, farmerName: e.target.value })}
                                        className="w-full h-12 bg-gray-50 rounded-xl px-4 text-base border border-gray-200 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">ปีที่ปลูก (พ.ศ.)</label>
                                    <select
                                        value={formData.plantingYearBE}
                                        onChange={e => setFormData({ ...formData, plantingYearBE: e.target.value })}
                                        className="w-full h-12 bg-gray-50 rounded-xl px-4 text-base border border-gray-200 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
                                    >
                                        <option value="">เลือกปี</option>
                                        {Array.from({ length: 40 }, (_, i) => new Date().getFullYear() + 543 - i).map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">พันธุ์ยางพารา</label>
                                    <select
                                        value={formData.variety}
                                        onChange={e => setFormData({ ...formData, variety: e.target.value })}
                                        className="w-full h-12 bg-gray-50 rounded-xl px-4 text-base border border-gray-200 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
                                    >
                                        <option value="" disabled>เลือกพันธุ์ยาง</option>
                                        <option value="RRIM 600">RRIM 600</option>
                                        <option value="PB 235">PB 235</option>
                                        <option value="RRIT 251">RRIT 251</option>
                                    </select>
                                </div>
                            </div>

                            {formData.farmerName && formData.plantingYearBE && formData.variety && (
                                <div className="flex items-center justify-center gap-2 text-emerald-600 py-2">
                                    <Loader2 size={18} className="animate-spin" />
                                    <p className="text-sm font-medium">กำลังดำเนินการ...</p>
                                </div>
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
                            <div className="flex p-1.5 bg-gray-100 rounded-xl">
                                {['ภาคสนาม', 'ดาวเทียม'].map((t, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCalcGroup(i + 1)}
                                        className={cn(
                                            "flex-1 py-3 text-base font-medium rounded-lg transition-all",
                                            calcGroup === i + 1
                                                ? "bg-white text-emerald-600 shadow-sm"
                                                : "text-gray-500"
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
                                            <label className="block text-sm font-medium text-gray-700 mb-2">เส้นผ่านศูนย์กลาง (ซม.)</label>
                                            <input
                                                type="number"
                                                placeholder="20"
                                                value={formData.dbh}
                                                onChange={e => setFormData({ ...formData, dbh: e.target.value })}
                                                className="w-full h-12 bg-gray-50 rounded-lg px-3 text-base border border-gray-200 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">ความสูง (ม.)</label>
                                            <input
                                                type="number"
                                                placeholder="12"
                                                value={formData.height}
                                                onChange={e => setFormData({ ...formData, height: e.target.value })}
                                                className="w-full h-12 bg-gray-50 rounded-lg px-3 text-base border border-gray-200 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {[
                                            { id: 'eq1', name: 'สมการที่ 1', formula: '0.118 × DBH²·⁵³' },
                                            { id: 'eq2', name: 'สมการที่ 2', formula: '0.062 × DBH²·²³' }
                                        ].map((eq) => (
                                            <label
                                                key={eq.id}
                                                className={cn(
                                                    "flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border-2",
                                                    formData.methodManual === eq.id
                                                        ? "bg-emerald-50 border-emerald-400"
                                                        : "bg-gray-50 border-transparent active:bg-gray-100"
                                                )}
                                            >
                                                <input
                                                    type="radio"
                                                    name="manualEq"
                                                    checked={formData.methodManual === eq.id}
                                                    onChange={() => setFormData({ ...formData, methodManual: eq.id })}
                                                    className="w-5 h-5 accent-emerald-500"
                                                />
                                                <div className="flex-1">
                                                    <p className="text-base font-semibold text-gray-800">{eq.name}</p>
                                                    <p className="text-sm text-gray-500 mt-0.5">{eq.formula}</p>
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
                                            { id: 'ndvi', name: 'ดัชนี NDVI', formula: '34.2 × NDVI + 5.8' },
                                            { id: 'tcari', name: 'ดัชนี TCARI', formula: '13.57 × TCARI + 7.45' }
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
                                    className="w-12 h-12 bg-gray-100 active:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
                                    title="ย้อนกลับ"
                                >
                                    <ArrowLeft size={20} className="text-gray-600" />
                                </button>
                                <button
                                    onClick={calculateCarbon}
                                    disabled={loading}
                                    className="flex-1 h-12 bg-emerald-500 active:bg-emerald-600 text-white rounded-xl text-base font-medium disabled:bg-gray-200 disabled:text-gray-400 transition-colors shadow-sm active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 size={18} className="animate-spin" />
                                            คำนวณ...
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

                                {/* Action Button */}
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
                                <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-200 animate-bounce">
                                    <CheckCircle2 size={40} className="text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800">บันทึกสำเร็จ</h3>
                                <p className="text-base text-gray-600 mt-1 font-medium">
                                    มีรายการแปลงทั้งหมด <span className="text-emerald-600 font-bold">{accumulatedPlots.length} รายการ</span>
                                </p>
                            </div>

                            {/* Cards List */}
                            <div className="space-y-3 max-h-[280px] overflow-y-auto px-1 -mx-1 scrollbar-thin">
                                {accumulatedPlots.map((plot, idx) => (
                                    <div key={plot.id} className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4 border border-gray-100 shadow-sm group hover:border-emerald-200 transition-colors">
                                        <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-md">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <p className="text-lg font-bold text-gray-800 truncate">{plot.farmerName}</p>
                                            <p className="text-sm font-medium text-gray-500">
                                                {plot.carbon} tCO₂e • {plot.areaRai}-{plot.areaNgan}-{parseInt(plot.areaSqWah || 0)} ไร่
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Load data for editing
                                                    setFormData({ ...plot });
                                                    setResult({ carbon: plot.carbon, method: plot.method });
                                                    setCurrentStep(1);
                                                }}
                                                className="w-10 h-10 rounded-full bg-white hover:bg-orange-50 border border-transparent hover:border-orange-200 flex items-center justify-center text-gray-400 hover:text-orange-500 transition-all shadow-sm"
                                                title="แก้ไขข้อมูล"
                                            >
                                                <Edit3 size={20} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm("ยืนยันการลบรายการนี้?")) {
                                                        onDeletePlot(plot.id);
                                                    }
                                                }}
                                                className="w-10 h-10 rounded-full bg-white hover:bg-red-50 border border-transparent hover:border-red-200 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all shadow-sm"
                                                title="ลบรายการ"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Buttons */}
                            <div className="space-y-3 pt-4">
                                <button
                                    onClick={onStartDrawing ? onStartDrawing : handleDigitizeMore}
                                    className="w-full h-12 bg-white border-2 border-emerald-500 text-emerald-600 rounded-xl text-base font-bold hover:bg-emerald-50 active:bg-emerald-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <Map size={20} />
                                    วาดแปลงเพิ่ม
                                </button>
                                <button
                                    onClick={() => onSave(null, true)}
                                    disabled={accumulatedPlots.length === 0}
                                    className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-base font-bold disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 size={20} />
                                    บันทึกทั้งหมด
                                </button>
                            </div>
                        </div>
                    )}


                </div>
            </div>
        </div >
    );
}
