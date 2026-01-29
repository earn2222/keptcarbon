import React, { useState, useEffect, useRef } from 'react';
import { calculateCarbon, createPlot } from '../../services/api';
import * as turf from '@turf/turf';
import shp from 'shpjs';

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const LeafWhiteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 18a8.25 8.25 0 100-16.5 8.25 8.25 0 000 16.5zM12 7.5a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V8.25A.75.75 0 0112 7.5zM12 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
);

const StepIndicator = ({ currentStep, totalSteps = 4 }) => {
    return (
        <div className="flex items-center gap-1.5 mb-10 overflow-hidden">
            {[...Array(totalSteps)].map((_, i) => (
                <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-700 ${i + 1 <= currentStep ? 'bg-emerald-500' : 'bg-slate-100'
                        }`}
                />
            ))}
        </div>
    );
};

export default function WorkflowModal({ isOpen, onClose, mode, initialData, onStartDrawing, onFileUpload, onSave }) {
    const [step, setStep] = useState(1);
    const [unit, setUnit] = useState('rai');
    const [calcGroup, setCalcGroup] = useState(1);
    const fileInputRef = useRef(null);

    // SHP Import State
    const [shpPlots, setShpPlots] = useState([]);
    const [selectedPlots, setSelectedPlots] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        farmerName: '',
        variety: 'RRIM 600',
        areaRai: '',
        areaNgan: '',
        areaSqWah: '',
        areaSqm: '',
        plantingYear: new Date().getFullYear() - 10,
        age: 10,
        height: '',
        dbh: '',
        methodManual: 'eq1',
        methodSat: 'ndvi',
    });

    // Sync initialData
    useEffect(() => {
        if (initialData && isOpen) {
            setFormData(prev => ({
                ...prev,
                farmerName: initialData.farmerName || '',
                variety: initialData.variety || 'RRIM 600',
                areaRai: initialData.areaRai || '',
                areaNgan: initialData.areaNgan || '',
                areaSqWah: initialData.areaSqWah || '',
                areaSqm: initialData.areaSqm || '',
                plantingYear: initialData.plantingYear || (new Date().getFullYear() - 10),
                age: initialData.age || 10,
                dbh: initialData.dbh || '',
                height: initialData.height || '',
                id: initialData.id || null
            }));

            // If it's an existing successful result, we might want to skip to result step
            if (initialData.carbon) {
                setResult({
                    carbon: initialData.carbon,
                    area: `${initialData.areaRai}-${initialData.areaNgan}-${initialData.areaSqWah} ไร่`,
                    age: initialData.age,
                    method: initialData.method || 'ประวัติเดิม'
                });
            } else {
                setResult(null);
                setStep(1);
            }
        }
    }, [initialData, isOpen]);

    const [isCalculating, setIsCalculating] = useState(false);
    const [result, setResult] = useState(null);

    // Auto-calculate age
    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const age = currentYear - parseInt(formData.plantingYear);
        setFormData(prev => ({ ...prev, age: age > 0 ? age : 0 }));
    }, [formData.plantingYear]);

    // Handle SHP File Upload
    const handleShpUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const geojson = await shp(arrayBuffer);

            const plots = geojson.features.map((feature, index) => {
                const area = turf.area(feature);
                const areaRaiTotal = area / 1600;
                const rai = Math.floor(areaRaiTotal);
                const ngan = Math.floor((areaRaiTotal - rai) * 4);
                const sqWah = ((areaRaiTotal - rai - ngan / 4) * 400).toFixed(1);

                return {
                    id: index,
                    name: feature.properties?.NAME || feature.properties?.name || `แปลงที่ ${index + 1}`,
                    area: area.toFixed(2),
                    areaRai: rai,
                    areaNgan: ngan,
                    areaSqWah: sqWah,
                    geometry: feature.geometry,
                    properties: feature.properties
                };
            });

            setShpPlots(plots);
            setStep(0.5); // Special step for plot selection
            setIsUploading(false);
        } catch (error) {
            console.error('Error parsing SHP:', error);
            alert('ไม่สามารถอ่านไฟล์ SHP ได้ กรุณาตรวจสอบไฟล์');
            setIsUploading(false);
        }
    };

    const togglePlotSelection = (plotId) => {
        setSelectedPlots(prev =>
            prev.includes(plotId)
                ? prev.filter(id => id !== plotId)
                : [...prev, plotId]
        );
    };

    const proceedWithSelectedPlots = () => {
        if (selectedPlots.length === 0) {
            alert('กรุณาเลือกอย่างน้อย 1 แปลง');
            return;
        }
        // For now, use first selected plot
        const firstPlot = shpPlots.find(p => p.id === selectedPlots[0]);
        if (firstPlot) {
            setFormData(prev => ({
                ...prev,
                areaRai: firstPlot.areaRai,
                areaNgan: firstPlot.areaNgan,
                areaSqWah: firstPlot.areaSqWah,
                areaSqm: firstPlot.area
            }));
        }
        setStep(1);
    };

    if (!isOpen) return null;

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const calculateLocalCarbon = () => {
        setIsCalculating(true);
        setTimeout(() => {
            let carbon = 0;
            const dbh = parseFloat(formData.dbh) || 20;
            const areaRai = parseFloat(formData.areaRai) || 0;
            const treeDensity = 70; // Assumed trees per rai
            const totalTrees = areaRai * treeDensity;

            if (calcGroup === 1) {
                // Manual Equations
                if (formData.methodManual === 'eq1') {
                    // AGB = 0.118 × DBH^2.53
                    carbon = 0.118 * Math.pow(dbh, 2.53);
                } else {
                    // AGB = 0.062 × DBH^2.23
                    carbon = 0.062 * Math.pow(dbh, 2.23);
                }
            } else {
                // Satellite Equations (Mocking GEE input for now)
                const mockNDVI = 0.65;
                const mockTCARI = 0.45;
                if (formData.methodSat === 'ndvi') {
                    // AGB = 34.2 × NDVI + 5.8
                    carbon = 34.2 * mockNDVI + 5.8;
                } else {
                    // AGB = 13.57 × TCARI + 7.45
                    carbon = 13.57 * mockTCARI + 7.45;
                }
            }

            // AGB is usually in kg/tree or tons/hectare, let's normalize to tons/plot
            const totalCarbonTons = (carbon * totalTrees) / 1000;

            setResult({
                carbon: totalCarbonTons.toFixed(2),
                area: `${formData.areaRai}-${formData.areaNgan}-${formData.areaSqWah} ไร่`,
                age: formData.age,
                method: calcGroup === 1 ? 'การวัดระดับพื้นที่ (Manual)' : 'ภาพถ่ายดาวเทียม (Satellite)'
            });
            setIsCalculating(false);
            setStep(3);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-500"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden animate-modalIn border border-white/50">
                {/* Header */}
                <div className="px-10 pt-10 pb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Step {step === 0.5 ? 'Selection' : step} of 4</span>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all hover:rotate-90"
                        >
                            <CloseIcon />
                        </button>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-6">
                        {mode === 'draw' ? 'รายละเอียดเเปลง' : 'นำเข้าข้อมูล SHP'}
                    </h2>
                    <StepIndicator currentStep={step === 0.5 ? 1 : step} />
                </div>

                {/* Body Content */}
                <div className="px-10 pb-10 max-h-[70vh] overflow-y-auto scrollbar-hide">

                    {/* STEP 0.5: SHP Plot Selection (Import Mode Only) */}
                    {step === 0.5 && mode === 'import' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <p className="text-sm font-bold text-emerald-700">พบ {shpPlots.length} แปลงในไฟล์</p>
                                <p className="text-xs text-emerald-600 mt-1">เลือกแปลงที่ต้องการคำนวณคาร์บอน</p>
                            </div>

                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {shpPlots.map(plot => (
                                    <button
                                        key={plot.id}
                                        onClick={() => togglePlotSelection(plot.id)}
                                        className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${selectedPlots.includes(plot.id)
                                            ? 'border-emerald-500 bg-emerald-50'
                                            : 'border-slate-100 bg-white hover:border-slate-200'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-slate-800">{plot.name}</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    พื้นที่: {plot.areaRai}-{plot.areaNgan}-{plot.areaSqWah} ไร่
                                                </p>
                                            </div>
                                            {selectedPlots.includes(plot.id) && (
                                                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={proceedWithSelectedPlots}
                                disabled={selectedPlots.length === 0}
                                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold font-black shadow-xl hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ดำเนินการต่อ ({selectedPlots.length} แปลง)
                            </button>
                        </div>
                    )}

                    {/* STEP 1: Basic Info - Simplified */}
                    {step === 1 && (
                        <div className="space-y-8 animate-fadeIn">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">เจ้าของเเปลง</label>
                                <input
                                    type="text"
                                    placeholder="ระบุชื่อ-นามสกุล หรือชื่อเเปลง"
                                    className="w-full bg-slate-50 border-none rounded-3xl px-7 py-5 text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500/10 transition-all font-bold text-lg"
                                    value={formData.farmerName}
                                    onChange={e => setFormData({ ...formData, farmerName: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">ปีที่เริ่มปลูก</label>
                                    <input
                                        type="number"
                                        placeholder="พ.ศ."
                                        className="w-full bg-slate-50 border-none rounded-3xl px-7 py-5 text-slate-800 font-bold text-lg"
                                        value={formData.plantingYear}
                                        onChange={e => setFormData({ ...formData, plantingYear: e.target.value })}
                                    />
                                </div>
                                <div className="bg-emerald-50 rounded-3xl flex flex-col items-center justify-center border border-emerald-100/50">
                                    <span className="text-[9px] font-black text-emerald-600/70 uppercase tracking-widest">อายุต้นยาง</span>
                                    <span className="text-3xl font-black text-emerald-600 mt-1">{formData.age}<span className="text-xs ml-1">ปี</span></span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">สายพันธุ์ยางพารา</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['RRIM 600', 'RRIT 251', 'PB 235', 'อื่นๆ'].map(v => (
                                        <button
                                            key={v}
                                            onClick={() => setFormData({ ...formData, variety: v })}
                                            className={`py-4 rounded-2xl border-2 transition-all font-bold text-sm ${formData.variety === v
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                                                }`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* SHP Upload Button (Import Mode) */}
                            {mode === 'import' && shpPlots.length === 0 && (
                                <div className="space-y-3">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".zip,.shp"
                                        onChange={handleShpUpload}
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        {isUploading ? 'กำลังประมวลผล...' : 'อัปโหลดไฟล์ SHP'}
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={handleNext}
                                className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-bold shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98] mt-4 uppercase tracking-widest text-sm"
                            >
                                ถัดไป
                            </button>
                        </div>
                    )}

                    {/* STEP 2: Area & Method - Minimalist */}
                    {step === 2 && (
                        <div className="space-y-8 animate-fadeIn">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between pl-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ขนาดพื้นที่เเปลง</label>
                                    <div className="flex bg-slate-100 p-0.5 rounded-xl">
                                        <button onClick={() => setUnit('rai')} className={`px-3 py-1 text-[9px] font-black rounded-lg transition-all ${unit === 'rai' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>RAI</button>
                                        <button onClick={() => setUnit('sqm')} className={`px-3 py-1 text-[9px] font-black rounded-lg transition-all ${unit === 'sqm' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>M²</button>
                                    </div>
                                </div>

                                {unit === 'rai' ? (
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-slate-50 p-4 rounded-[2rem] border border-slate-100/50">
                                            <input type="number" className="w-full bg-transparent border-none p-0 text-center font-black text-xl text-slate-800" value={formData.areaRai} onChange={e => setFormData({ ...formData, areaRai: e.target.value })} />
                                            <div className="text-[8px] text-center text-slate-400 font-black uppercase mt-1 tracking-tighter">ไร่</div>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-[2rem] border border-slate-100/50">
                                            <input type="number" className="w-full bg-transparent border-none p-0 text-center font-black text-xl text-slate-800" value={formData.areaNgan} onChange={e => setFormData({ ...formData, areaNgan: e.target.value })} />
                                            <div className="text-[8px] text-center text-slate-400 font-black uppercase mt-1 tracking-tighter">งาน</div>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-[2rem] border border-slate-100/50">
                                            <input type="number" className="w-full bg-transparent border-none p-0 text-center font-black text-xl text-slate-800" value={formData.areaSqWah} onChange={e => setFormData({ ...formData, areaSqWah: e.target.value })} />
                                            <div className="text-[8px] text-center text-slate-400 font-black uppercase mt-1 tracking-tighter">ตร.ว.</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100/50">
                                        <input type="number" className="w-full bg-transparent border-none p-0 text-center font-black text-3xl text-emerald-600" value={formData.areaSqm} onChange={e => setFormData({ ...formData, areaSqm: e.target.value })} />
                                        <div className="text-[9px] text-center text-slate-400 font-black uppercase mt-2">ตารางเมตร</div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">เลือกวิธีประเมินคาร์บอน</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setCalcGroup(1)}
                                        className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${calcGroup === 1 ? 'border-slate-900 bg-slate-900 text-white shadow-xl' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                                    >
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth={2} /></svg>
                                        <div className="text-[10px] font-black uppercase tracking-tighter">วัดระดับพื้นดิน</div>
                                    </button>
                                    <button
                                        onClick={() => setCalcGroup(2)}
                                        className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${calcGroup === 2 ? 'border-slate-900 bg-slate-900 text-white shadow-xl' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                                    >
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2} /></svg>
                                        <div className="text-[10px] font-black uppercase tracking-tighter">ภาพถ่ายดาวเทียม</div>
                                    </button>
                                </div>
                            </div>

                            {/* Conditional Inputs */}
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6 shadow-xl">
                                {calcGroup === 1 ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <span className="text-[9px] font-black opacity-40 uppercase tracking-widest pl-1">เส้นผ่าศูนย์กลาง (DBH)</span>
                                                <input type="number" placeholder="ซม." className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-1 focus:ring-emerald-500/50 transition-all font-bold" value={formData.dbh} onChange={e => setFormData({ ...formData, dbh: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <span className="text-[9px] font-black opacity-40 uppercase tracking-widest pl-1">ความสูง (H)</span>
                                                <input type="number" placeholder="เมตร" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-1 focus:ring-emerald-500/50 transition-all font-bold" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <span className="text-[9px] font-black opacity-40 uppercase tracking-widest pl-1">เลือกรูปแบบสมการ</span>
                                            <div className="space-y-2">
                                                <label className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${formData.methodManual === 'eq1' ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                                    <input type="radio" name="eq_manual" checked={formData.methodManual === 'eq1'} onChange={() => setFormData({ ...formData, methodManual: 'eq1' })} className="accent-emerald-400 w-4 h-4" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-mono font-bold text-emerald-400">AGB = 0.118 × DBH^2.53</span>
                                                        <span className="text-[8px] font-bold opacity-40 uppercase tracking-tighter mt-0.5">Primary Growth Formula</span>
                                                    </div>
                                                </label>
                                                <label className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${formData.methodManual === 'eq2' ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                                    <input type="radio" name="eq_manual" checked={formData.methodManual === 'eq2'} onChange={() => setFormData({ ...formData, methodManual: 'eq2' })} className="accent-emerald-400 w-4 h-4" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-mono font-bold text-emerald-400">AGB = 0.062 × DBH^2.23</span>
                                                        <span className="text-[8px] font-bold opacity-40 uppercase tracking-tighter mt-0.5">Secondary Growth Formula</span>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center animate-pulse shadow-lg shadow-emerald-500/20 text-white">
                                                <LeafWhiteIcon />
                                            </div>
                                            <div className="text-xs">
                                                <p className="font-black tracking-tight">Google Earth Engine</p>
                                                <p className="opacity-40 text-[9px] font-bold uppercase mt-1 tracking-widest">Auto NDVI/TCARI Sync</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <span className="text-[9px] font-black opacity-40 uppercase tracking-widest pl-1">เลือกรูปแบบสมการ</span>
                                            <div className="space-y-2">
                                                <label className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${formData.methodSat === 'ndvi' ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                                    <input type="radio" name="eq_sat" checked={formData.methodSat === 'ndvi'} onChange={() => setFormData({ ...formData, methodSat: 'ndvi' })} className="accent-emerald-400 w-4 h-4" />
                                                    <span className="text-[10px] font-mono font-bold text-emerald-400">AGB = 34.2 × NDVI + 5.8</span>
                                                </label>
                                                <label className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${formData.methodSat === 'tcari' ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                                    <input type="radio" name="eq_sat" checked={formData.methodSat === 'tcari'} onChange={() => setFormData({ ...formData, methodSat: 'tcari' })} className="accent-emerald-400 w-4 h-4" />
                                                    <span className="text-[10px] font-mono font-bold text-emerald-400">AGB = 13.57 × TCARI + 7.45</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <button onClick={handleBack} className="w-1/3 py-5 bg-slate-100 text-slate-400 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all active:scale-[0.98]">ย้อนกลับ</button>
                                <button
                                    onClick={calculateLocalCarbon}
                                    className="flex-1 py-5 bg-emerald-600 text-white rounded-[2rem] font-black shadow-2xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-[11px]"
                                >
                                    ประมวลผลคาร์บอน
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Results & Preview */}
                    {step === 3 && (
                        <div className="space-y-8 animate-fadeIn">
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl border border-white/5">
                                <div className="absolute top-0 right-0 p-10 opacity-5">
                                    <LeafWhiteIcon />
                                </div>
                                <div className="text-center relative z-10">
                                    <p className="text-[10px] font-black uppercase tracking-[4px] text-emerald-400/80 mb-4">ค่ากักเก็บคาร์บอนสุทธิ</p>
                                    <h2 className="text-7xl font-black text-white tabular-nums tracking-tighter">
                                        {result?.carbon}
                                    </h2>
                                    <p className="text-xs font-bold mt-4 opacity-40 uppercase tracking-widest">Metric Tons (tCO₂e)</p>
                                </div>

                                <div className="mt-10 grid grid-cols-2 gap-y-6 gap-x-8 border-t border-white/10 pt-10">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black opacity-30 uppercase tracking-widest">เจ้าของเเปลง</p>
                                        <p className="text-sm font-black truncate">{formData.farmerName || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black opacity-30 uppercase tracking-widest">พื้นที่เเปลง</p>
                                        <p className="text-sm font-black">{result?.area}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black opacity-30 uppercase tracking-widest">อายุต้นยาง</p>
                                        <p className="text-sm font-black text-emerald-400">{result?.age} ปี</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black opacity-30 uppercase tracking-widest">วิธีการ</p>
                                        <p className="text-[10px] font-black uppercase leading-tight">{result?.method}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => onSave({ ...formData, carbon: result?.carbon, method: result?.method }, true)}
                                    className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[10px]"
                                >
                                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    บันทึกเเละวาดเเปลงเพิ่ม
                                </button>

                                <button
                                    onClick={handleNext}
                                    className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black shadow-2xl shadow-emerald-500/30 hover:bg-emerald-700 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-[11px]"
                                >
                                    สรุปข้อมูลเพื่อบันทึก
                                </button>

                                <button onClick={handleBack} className="w-full py-3 text-slate-300 text-[10px] font-black hover:text-slate-600 transition-colors uppercase tracking-[0.3em]">ย้อนกลับไปเเก้ไข</button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Confirm & Save - Minimalist Card */}
                    {step === 4 && (
                        <div className="space-y-8 animate-fadeIn">
                            <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100/50 flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/20">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <h4 className="text-xl font-black text-slate-900">บันทึกข้อมูลสำเร็จ</h4>
                                <p className="text-slate-500 text-sm mt-2 font-medium">ข้อมูลแปลงของคุณพร้อมสำหรับ<br />การแสดงผลในหน้าแดชบอร์ดแล้ว</p>
                            </div>

                            <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-4 border border-slate-100">
                                <div className="flex justify-between items-center py-2 border-b border-slate-200/40">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ชื่อเกษตรกร</span>
                                    <span className="text-sm font-black text-slate-700">{formData.farmerName || 'ไม่ระบุ'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-200/40">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">พื้นที่</span>
                                    <span className="text-sm font-black text-slate-700">{result?.area}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ยอดรวมคาร์บอนสถิติ</span>
                                    <span className="text-2xl font-black text-emerald-600">{result?.carbon} <span className="text-xs">Tons</span></span>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    if (onSave) {
                                        onSave({ ...formData, carbon: result?.carbon, method: result?.method }, false);
                                    } else {
                                        alert('บันทึกข้อมูลสำเร็จ!');
                                        onClose();
                                    }
                                }}
                                className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black shadow-2xl hover:bg-slate-800 transition-all active:scale-[0.98] mt-4 uppercase tracking-[0.2em] text-sm"
                            >
                                ยืนยันเเละเสร็จสิ้น
                            </button>
                            <button onClick={handleBack} className="w-full py-3 text-slate-300 text-[10px] font-black hover:text-slate-600 transition-colors uppercase tracking-[0.3em]">แก้รายละเอียดอีกครั้ง</button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes modalIn {
                    from { opacity: 0; transform: translateY(40px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateX(10px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
