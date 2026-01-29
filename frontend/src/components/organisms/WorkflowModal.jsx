import React, { useState, useEffect, useRef } from 'react';
import * as turf from '@turf/turf';
import shp from 'shpjs';
import {
    Loader2, Trash2, PenLine, Leaf, ScanLine,
    Calculator, Database, X, ChevronRight,
    Plus, CheckCircle2, ListFilter
} from "lucide-react";
import { cn } from "../../lib/utils";

// ==========================================
// MINIMALIST WORKFLOW MODAL
// ==========================================
export default function WorkflowModal({
    isOpen,
    onClose,
    mode = 'draw', // 'draw' | 'import' | 'edit' | 'list'
    initialData,
    accumulatedPlots = [],
    onAddAnother,
    onSave,
    onDeletePlot,
    onUpdatePlot,
    onStartDrawing
}) {
    const [currentStep, setCurrentStep] = useState(1); // 0=Import, 1=Info, 2=Method, 3=Result, 4=Summary List
    const [calcGroup, setCalcGroup] = useState(1);
    const [loading, setLoading] = useState(false);
    const [viewUnit, setViewUnit] = useState('thai');

    // Form Data
    const [formData, setFormData] = useState({
        farmerName: '',
        areaRai: '',
        areaNgan: '',
        areaSqWah: '',
        areaSqm: '',
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
    const [isUploading, setIsUploading] = useState(false);
    const [shpError, setShpError] = useState(null);

    const containerRef = useRef(null);

    // ==========================================
    // INITIALIZATION
    // ==========================================
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(prev => ({
                    ...prev,
                    ...initialData,
                    farmerName: initialData.farmerName || '',
                    plantingYearBE: initialData.plantingYearBE || '',
                    svgPath: initialData.svgPath || (initialData.geometry ? generateSvgPath(initialData.geometry) : '')
                }));
            }

            if (mode === 'import') setCurrentStep(0);
            else if (mode === 'list') setCurrentStep(4);
            else setCurrentStep(1);

            setResult(null);
        }
    }, [isOpen, mode, initialData]);

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
    // AUTO-ADVANCE LOGIC
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
    // AUTO-ADVANCE LOGIC
    // ==========================================
    useEffect(() => {
        // Step 1 -> Step 2
        if (currentStep === 1 && formData.farmerName && formData.plantingYearBE && formData.variety) {
            const timer = setTimeout(() => setCurrentStep(2), 600);
            return () => clearTimeout(timer);
        }
    }, [formData, currentStep]);

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
                const sqWah = ((raiTotal - rai - ngan / 4) * 400).toFixed(1);

                return {
                    id: Date.now() + i,
                    farmerName: f.properties?.FARMER || f.properties?.NAME || '',
                    areaSqm: area.toFixed(2),
                    areaRai: rai,
                    areaNgan: ngan,
                    areaSqWah: sqWah,
                    geometry: f.geometry,
                    svgPath: generateSvgPath(f.geometry)
                };
            });
            setShpPlots(plots);
        } catch (e) {
            setShpError('ไม่สามารถอ่านไฟล์ SHP ได้ กรุณาใช้ไฟล์ .zip');
        } finally {
            setIsUploading(false);
        }
    };

    const calculateCarbon = () => {
        if (!formData.farmerName) return alert('กรุณาระบุชื่อเกษตรกร');
        if (!formData.variety) return alert('กรุณาเลือกพันธุ์ยาง');

        setLoading(true);
        setTimeout(() => {
            const dbh = parseFloat(formData.dbh) || 20;
            const height = parseFloat(formData.height) || 12;
            const areaRai = parseFloat(formData.areaRai) || 0;
            const totalTrees = areaRai * 70; // 70 trees per Rai

            let carbonPerTree = 0;
            let resultMethod = '';

            if (calcGroup === 1) {
                // Group 1: Manual DBH & Height
                if (formData.methodManual === 'eq1') {
                    carbonPerTree = 0.118 * Math.pow(dbh, 2.53);
                    resultMethod = 'สมการ 0.118 × DBH^2.53';
                } else {
                    carbonPerTree = 0.062 * Math.pow(dbh, 2.23);
                    resultMethod = 'สมการ 0.062 × DBH^2.23';
                }
            } else {
                // Group 2: Satellite (NDVI/TCARI)
                const { ndvi, tcari } = satData;
                if (formData.methodSat === 'ndvi') {
                    carbonPerTree = 34.2 * ndvi + 5.8;
                    resultMethod = `Satellite (NDVI: 34.2 × ${ndvi} + 5.8)`;
                } else {
                    carbonPerTree = 13.57 * tcari + 7.45;
                    resultMethod = `Satellite (TCARI: 13.57 × ${tcari} + 7.45)`;
                }
            }

            // AGB (Above Ground Biomass) to Tons CO2: (AGB * trees) / 1000 * 0.47 (Simplified Carbon Fraction)
            const totalCarbonTons = ((carbonPerTree * totalTrees) / 1000) * 0.47;

            setResult({
                carbon: totalCarbonTons.toFixed(2),
                method: resultMethod
            });
            setLoading(false);
            setCurrentStep(3);
        }, 1200);
    };

    const handleAddToList = () => {
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
            alert(`บันทึกข้อมูลแปลงของ ${formData.farmerName || 'เกษตรกร'} เรียบร้อยแล้ว`);
            setCurrentStep(4);
        } catch (error) {
            console.error("Save Error:", error);
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + error.message);
        }
    };

    const handleFinalSave = () => {
        onSave(null, true);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-md transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-[420px] bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-white/40 animate-in fade-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="px-6 py-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-medium text-slate-800 tracking-tight">
                            {currentStep === 4 ? 'รายการแปลงที่บันทึก' : 'ประมวลผลแปลง'}
                        </h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                {currentStep === 4 ? `${accumulatedPlots.length} แปลงในรายการ` : `ขั้นตอนที่ ${currentStep}/3`}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100/50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div ref={containerRef} className="flex-1 overflow-y-auto px-6 pb-8 space-y-6 scrollbar-hide">
                    {currentStep === 0 && (
                        <div className="space-y-4 animate-in slide-in-from-bottom-4">
                            <div className="p-10 border-2 border-dashed border-slate-100 rounded-[2rem] text-center hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer relative group">
                                <input type="file" accept=".zip" onChange={handleShpUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                {isUploading ? <Loader2 className="w-8 h-8 mx-auto mb-3 text-emerald-500 animate-spin" /> : <Database className="w-8 h-8 mx-auto mb-3 text-slate-300 group-hover:text-emerald-500 transition-colors" />}
                                <p className="text-sm text-slate-500 font-normal">{isUploading ? 'กำลังประมวลผลไฟล์...' : 'เลือกไฟล์ .zip (SHP)'}</p>
                            </div>
                            {shpPlots.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    {shpPlots.map(p => (
                                        <button key={p.id} onClick={() => { setFormData({ ...formData, ...p }); setCurrentStep(1); }} className="w-full p-4 bg-slate-50/50 hover:bg-white border border-transparent hover:border-emerald-100 rounded-2xl flex items-center gap-4 transition-all group">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 group-hover:border-emerald-200">
                                                <svg viewBox="0 0 100 100" className="w-6 h-6 text-emerald-500 fill-current opacity-60"><polygon points={p.svgPath} /></svg>
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="text-sm font-medium text-slate-700">{p.farmerName || 'ไม่ระบุชื่อ'}</p>
                                                <p className="text-[10px] text-slate-400 font-normal">{p.areaRai} ไร่ {p.areaNgan} งาน</p>
                                            </div>
                                            <Plus size={16} className="text-slate-300" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4">
                            <div className="bg-emerald-50/50 p-5 rounded-[1.5rem] flex items-center justify-between border border-emerald-100/50">
                                <div>
                                    <p className="text-[10px] font-medium text-emerald-600/60 uppercase tracking-widest mb-1">พื้นที่ดำเนินการ</p>
                                    <h3 className="text-base font-medium text-slate-800">{formData.areaRai} ไร่ {formData.areaNgan} งาน {formData.areaSqWah} วา²</h3>
                                </div>
                                <Leaf className="text-emerald-500/40" size={24} strokeWidth={1.5} />
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider ml-1">ชื่อเกษตรกร</label>
                                    <input type="text" placeholder="พิมพ์ชื่อ-นามสกุล..." value={formData.farmerName} onChange={e => setFormData({ ...formData, farmerName: e.target.value })} className="w-full h-12 bg-slate-50 rounded-2xl px-4 text-sm font-normal border-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider ml-1">ปีที่ปลูก (พ.ศ.)</label>
                                    <select value={formData.plantingYearBE} onChange={e => setFormData({ ...formData, plantingYearBE: e.target.value })} className="w-full h-12 bg-slate-50 rounded-2xl px-4 text-sm font-normal border-none cursor-pointer">
                                        <option value="">เลือกปี พ.ศ. ก่อน</option>
                                        {Array.from({ length: 40 }, (_, i) => new Date().getFullYear() + 543 - i).map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider ml-1">พันธุ์ยางพารา</label>
                                    <select value={formData.variety} onChange={e => setFormData({ ...formData, variety: e.target.value })} className="w-full h-12 bg-slate-50 rounded-2xl px-4 text-sm font-normal border-none cursor-pointer">
                                        <option value="" disabled>เลือกสายพันธุ์</option>
                                        <option value="RRIM 600">RRIM 600</option>
                                        <option value="PB 235">PB 235</option>
                                        <option value="RRIT 251">RRIT 251</option>
                                    </select>
                                </div>
                            </div>
                            {(!formData.farmerName || !formData.plantingYearBE || !formData.variety) && (
                                <p className="text-[10px] text-center text-slate-400 font-normal italic animate-pulse">กรอกข้อมูลให้ครบเพื่อไปยังขั้นตอนถัดไปอัตโนมัติ</p>
                            )}
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4">
                            <div className="flex p-1 bg-slate-100 rounded-2xl">
                                {['ภาคสนาม', 'ดาวเทียม'].map((t, i) => (
                                    <button key={i} onClick={() => setCalcGroup(i + 1)} className={cn("flex-1 py-2.5 text-xs font-medium rounded-xl transition-all", calcGroup === i + 1 ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400")}>{t}</button>
                                ))}
                            </div>
                            <div className="space-y-5">
                                {calcGroup === 1 ? (
                                    <div className="space-y-5 animate-in fade-in duration-500">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">เส้นผ่านศูนย์กลาง (ซม.)</label>
                                                <input type="number" placeholder="DBH" value={formData.dbh} onChange={e => setFormData({ ...formData, dbh: e.target.value })} className="w-full h-11 bg-slate-50 rounded-xl px-4 text-sm border-none" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">ความสูงต้น (ม.)</label>
                                                <input type="number" placeholder="Height" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} className="w-full h-11 bg-slate-50 rounded-xl px-4 text-sm border-none" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest px-1">เลือกรูปแบบการคำนวณ</p>
                                            <label className={cn("flex items-center gap-3 p-4 bg-white border rounded-2xl cursor-pointer transition-all", formData.methodManual === 'eq1' ? "border-emerald-500 bg-emerald-50/30" : "border-slate-100 hover:border-emerald-200")}>
                                                <input type="radio" name="manualEq" checked={formData.methodManual === 'eq1'} onChange={() => setFormData({ ...formData, methodManual: 'eq1' })} className="accent-emerald-500" />
                                                <div className="flex-1">
                                                    <p className="text-xs text-slate-700 font-medium">สมการที่ 1</p>
                                                    <p className="text-[10px] text-slate-400 font-normal">AGB = 0.118 × DBH^2.53</p>
                                                </div>
                                            </label>
                                            <label className={cn("flex items-center gap-3 p-4 bg-white border rounded-2xl cursor-pointer transition-all", formData.methodManual === 'eq2' ? "border-emerald-500 bg-emerald-50/30" : "border-slate-100 hover:border-emerald-200")}>
                                                <input type="radio" name="manualEq" checked={formData.methodManual === 'eq2'} onChange={() => setFormData({ ...formData, methodManual: 'eq2' })} className="accent-emerald-500" />
                                                <div className="flex-1">
                                                    <p className="text-xs text-slate-700 font-medium">สมการที่ 2</p>
                                                    <p className="text-[10px] text-slate-400 font-normal">AGB = 0.062 × DBH^2.23</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-5 animate-in fade-in duration-500">
                                        <div className="p-5 bg-slate-900 rounded-[1.5rem] flex items-center gap-4 relative overflow-hidden">
                                            {loadingSat && <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex items-center justify-center gap-3">
                                                <Loader2 size={16} className="text-emerald-400 animate-spin" />
                                                <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-widest">Fetching GEE Data...</span>
                                            </div>}
                                            <Database size={20} className="text-emerald-400" />
                                            <div className="flex-1">
                                                <p className="text-[10px] text-emerald-400/80 font-medium uppercase tracking-wider">Fetched from GEE</p>
                                                <div className="flex gap-4 mt-1 text-xs text-white">
                                                    <span>NDVI: <span className="text-emerald-200">{satData.ndvi || '0.00'}</span></span>
                                                    <span>TCARI: <span className="text-emerald-200">{satData.tcari || '0.00'}</span></span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest px-1">เลือกรูปแบบการประมวลผล</p>
                                            <label className={cn("flex items-center gap-3 p-4 bg-white border rounded-2xl cursor-pointer transition-all", formData.methodSat === 'ndvi' ? "border-emerald-500 bg-emerald-50/30" : "border-slate-100 hover:border-emerald-200")}>
                                                <input type="radio" name="satEq" checked={formData.methodSat === 'ndvi'} onChange={() => setFormData({ ...formData, methodSat: 'ndvi' })} className="accent-emerald-500" />
                                                <div className="flex-1">
                                                    <p className="text-xs text-slate-700 font-medium">ดัชนี NDVI</p>
                                                    <p className="text-[10px] text-slate-400 font-normal">AGB = 34.2 × NDVI + 5.8</p>
                                                </div>
                                            </label>
                                            <label className={cn("flex items-center gap-3 p-4 bg-white border rounded-2xl cursor-pointer transition-all", formData.methodSat === 'tcari' ? "border-emerald-500 bg-emerald-50/30" : "border-slate-100 hover:border-emerald-200")}>
                                                <input type="radio" name="satEq" checked={formData.methodSat === 'tcari'} onChange={() => setFormData({ ...formData, methodSat: 'tcari' })} className="accent-emerald-500" />
                                                <div className="flex-1">
                                                    <p className="text-xs text-slate-700 font-medium">ดัชนี TCARI</p>
                                                    <p className="text-[10px] text-slate-400 font-normal">AGB = 13.57 × TCARI + 7.45</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button onClick={calculateCarbon} disabled={loading || (calcGroup === 1 && (!formData.dbh || !formData.height))} className="w-full h-14 bg-emerald-600 text-white rounded-2xl text-sm font-medium shadow-lg disabled:bg-slate-100 disabled:text-slate-400 transition-all flex items-center justify-center gap-2">
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Calculator size={18} />}
                                {loading ? 'กำลังประมวลผล...' : 'เริ่มการประมวลผล'}
                            </button>
                        </div>
                    )}

                    {currentStep === 3 && result && (
                        <div className="space-y-8 animate-in zoom-in-95 duration-500">
                            <div className="p-10 bg-slate-900 rounded-[2.5rem] text-center relative overflow-hidden">
                                <p className="text-[10px] font-medium text-emerald-400 uppercase tracking-[3px] mb-4">กักเก็บคาร์บอนรวม</p>
                                <h2 className="text-6xl font-light text-white tracking-tighter">{result.carbon}</h2>
                                <p className="text-[10px] text-slate-500 font-medium mt-3 uppercase tracking-wider">ตันคาร์บอน (tCO₂e)</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setCurrentStep(1)} className="h-14 rounded-2xl bg-slate-50 text-slate-500 text-[13px] font-medium border border-slate-100 hover:bg-slate-100 transition-all">แก้ไขข้อมูล</button>
                                <button onClick={handleAddToList} className="h-14 rounded-2xl bg-emerald-600 text-white text-[13px] font-medium shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 hover:bg-emerald-700 transition-all">
                                    <CheckCircle2 size={18} /> บันทึกผลและกักเก็บ
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4">
                            {accumulatedPlots.length === 0 ? (
                                <div className="py-12 text-center text-slate-400">
                                    <ListFilter size={40} className="mx-auto mb-3 opacity-20" />
                                    <p className="text-sm">ยังไม่มีเเปลงเเสดงผล</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {accumulatedPlots.map((plot) => (
                                        <div key={plot.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-4">
                                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 shrink-0">
                                                <svg viewBox="0 0 100 100" className="w-6 h-6 text-emerald-500 fill-current opacity-60"><polygon points={plot.svgPath} /></svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-700 truncate">{plot.farmerName}</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{plot.areaRai} ไร่ | {plot.carbon} tCO₂e</p>
                                            </div>
                                            <button onClick={() => onDeletePlot(plot.id)} className="p-2 text-slate-300 hover:text-red-400"><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button onClick={() => { onClose(); onStartDrawing(); }} className="h-14 rounded-2xl border border-emerald-200 text-emerald-600 text-xs font-medium flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all">
                                    <ScanLine size={16} /> เพิ่มเเปลงเพิ่ม
                                </button>
                                <button onClick={handleFinalSave} disabled={accumulatedPlots.length === 0} className="h-14 rounded-2xl bg-slate-900 text-white text-xs font-medium shadow-xl flex items-center justify-center gap-2 disabled:opacity-50">
                                    <CheckCircle2 size={16} /> บันทึกทั้งหมด
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
