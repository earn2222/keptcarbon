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
        <div className="flex items-center gap-2 mb-8">
            {[...Array(totalSteps)].map((_, i) => (
                <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i + 1 <= currentStep ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-200'
                        }`}
                />
            ))}
        </div>
    );
};

export default function WorkflowModal({ isOpen, onClose, mode, initialData, onStartDrawing, onFileUpload }) {
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
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                areaRai: initialData.areaRai || '',
                areaNgan: initialData.areaNgan || '',
                areaSqWah: initialData.areaSqWah || '',
                areaSqm: initialData.areaSqm || ''
            }));
            setStep(1);
        }
    }, [initialData]);

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
            <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-modalIn">
                {/* Header */}
                <div className="px-8 pt-8 pb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                            {mode === 'draw' ? 'ดิจิไตส์แปลงยางพารา' : 'นำเข้าแปลง SHP'}
                        </h2>
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">
                            ขั้นตอนที่ {step} จาก 4
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                    >
                        <CloseIcon />
                    </button>
                </div>

                <div className="px-8 pb-4">
                    <StepIndicator currentStep={step} />
                </div>

                {/* Body Content */}
                <div className="px-8 pb-8 max-h-[70vh] overflow-y-auto scrollbar-hide">

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
                                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ดำเนินการต่อ ({selectedPlots.length} แปลง)
                            </button>
                        </div>
                    )}

                    {/* STEP 1: Basic Info */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">ชื่อเกษตรกร</label>
                                <input
                                    type="text"
                                    placeholder="ระบุชื่อ-นามสกุล"
                                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                                    value={formData.farmerName}
                                    onChange={e => setFormData({ ...formData, farmerName: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">ปีที่ปลูก (พ.ศ.)</label>
                                    <input
                                        type="number"
                                        placeholder="เช่น 2555"
                                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-700 font-medium"
                                        value={formData.plantingYear}
                                        onChange={e => setFormData({ ...formData, plantingYear: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 text-center flex flex-col justify-center">
                                    <span className="text-[10px] font-bold text-slate-300 uppercase">อายุต้นยางปัจจุบัน</span>
                                    <span className="text-2xl font-black text-emerald-600">{formData.age} ปี</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">พันธุ์ยางพารา</label>
                                <select
                                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-700 font-medium appearance-none"
                                    value={formData.variety}
                                    onChange={e => setFormData({ ...formData, variety: e.target.value })}
                                >
                                    <option>RRIM 600</option>
                                    <option>RRIT 251</option>
                                    <option>PB 235</option>
                                    <option>GT 1</option>
                                </select>
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
                                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98] mt-4"
                            >
                                ถัดไป
                            </button>
                        </div>
                    )}

                    {/* STEP 2: Area & Method */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ขนาดพื้นที่</label>
                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    <button
                                        onClick={() => setUnit('rai')}
                                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${unit === 'rai' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                                    >
                                        ไร่-งาน-ตรว.
                                    </button>
                                    <button
                                        onClick={() => setUnit('sqm')}
                                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${unit === 'sqm' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                                    >
                                        ตารางเมตร
                                    </button>
                                </div>
                            </div>

                            {unit === 'rai' ? (
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-slate-50 p-3 rounded-2xl">
                                        <input type="number" placeholder="0" className="w-full bg-transparent border-none p-0 text-center font-bold text-lg" value={formData.areaRai} onChange={e => setFormData({ ...formData, areaRai: e.target.value })} />
                                        <div className="text-[9px] text-center text-slate-400 font-bold uppercase mt-1">ไร่</div>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-2xl">
                                        <input type="number" placeholder="0" className="w-full bg-transparent border-none p-0 text-center font-bold text-lg" value={formData.areaNgan} onChange={e => setFormData({ ...formData, areaNgan: e.target.value })} />
                                        <div className="text-[9px] text-center text-slate-400 font-bold uppercase mt-1">งาน</div>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-2xl">
                                        <input type="number" placeholder="0" className="w-full bg-transparent border-none p-0 text-center font-bold text-lg" value={formData.areaSqWah} onChange={e => setFormData({ ...formData, areaSqWah: e.target.value })} />
                                        <div className="text-[9px] text-center text-slate-400 font-bold uppercase mt-1">ตร.ว.</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-slate-50 p-4 rounded-2xl">
                                    <input type="number" placeholder="0.00" className="w-full bg-transparent border-none p-0 text-center font-black text-2xl text-emerald-600" value={formData.areaSqm} onChange={e => setFormData({ ...formData, areaSqm: e.target.value })} />
                                    <div className="text-[10px] text-center text-slate-400 font-bold uppercase mt-1">ตารางเมตร</div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">เลือกกลุ่มวิธีคำนวณ</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setCalcGroup(1)}
                                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${calcGroup === 1 ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-400'}`}
                                    >
                                        <div className="text-[10px] font-black uppercase">กลุ่ม 1</div>
                                        <div className="text-xs font-bold text-center">คำนวณด้วยตัวเอง</div>
                                    </button>
                                    <button
                                        onClick={() => setCalcGroup(2)}
                                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${calcGroup === 2 ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-400'}`}
                                    >
                                        <div className="text-[10px] font-black uppercase">กลุ่ม 2</div>
                                        <div className="text-xs font-bold text-center">ภาพถ่ายดาวเทียม</div>
                                    </button>
                                </div>
                            </div>

                            {/* Conditional Inputs */}
                            <div className="bg-slate-900 rounded-[2rem] p-6 text-white space-y-4">
                                {calcGroup === 1 ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest pl-1">เส้นผ่าศูนย์กลาง (DBH)</span>
                                                <input type="number" placeholder="ซม." className="w-full bg-white/10 border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-white/20" value={formData.dbh} onChange={e => setFormData({ ...formData, dbh: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest pl-1">ความสูง (H)</span>
                                                <input type="number" placeholder="เมตร" className="w-full bg-white/10 border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-white/20" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest pl-1">เลือกสมการ</span>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                                                    <input type="radio" name="eq_manual" checked={formData.methodManual === 'eq1'} onChange={() => setFormData({ ...formData, methodManual: 'eq1' })} className="accent-emerald-400" />
                                                    <span className="text-[10px] font-mono opacity-80">AGB = 0.118 × DBH^2.53</span>
                                                </label>
                                                <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                                                    <input type="radio" name="eq_manual" checked={formData.methodManual === 'eq2'} onChange={() => setFormData({ ...formData, methodManual: 'eq2' })} className="accent-emerald-400" />
                                                    <span className="text-[10px] font-mono opacity-80">AGB = 0.062 × DBH^2.23</span>
                                                </label>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-emerald-500/20 border border-emerald-500/20 rounded-2xl flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center animate-pulse">
                                                <LeafWhiteIcon />
                                            </div>
                                            <div className="text-xs">
                                                <p className="font-bold">เชื่อมต่อ Google Earth Engine</p>
                                                <p className="opacity-60 text-[10px]">ระบบจะดึงค่า NDVI และ TCARI อัตโนมัติ</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest pl-1">เลือกสมการดาวเทียม</span>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                                                    <input type="radio" name="eq_sat" checked={formData.methodSat === 'ndvi'} onChange={() => setFormData({ ...formData, methodSat: 'ndvi' })} className="accent-emerald-400" />
                                                    <span className="text-[10px] font-mono opacity-80">AGB = 34.2 × NDVI + 5.8</span>
                                                </label>
                                                <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                                                    <input type="radio" name="eq_sat" checked={formData.methodSat === 'tcari'} onChange={() => setFormData({ ...formData, methodSat: 'tcari' })} className="accent-emerald-400" />
                                                    <span className="text-[10px] font-mono opacity-80">AGB = 13.57 × TCARI + 7.45</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <button onClick={handleBack} className="w-1/3 py-5 bg-slate-100 text-slate-500 rounded-2xl font-bold transition-all active:scale-[0.98]">ย้อนกลับ</button>
                                <button
                                    onClick={calculateLocalCarbon}
                                    className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-[0.98]"
                                >
                                    คำนวณคาร์บอน
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Results & Preview */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <LeafWhiteIcon />
                                </div>
                                <div className="text-center relative z-10">
                                    <p className="text-[11px] font-black uppercase tracking-[3px] opacity-60 mb-2">ค่ากักเก็บคาร์บอนสุทธิ</p>
                                    <h2 className="text-6xl font-black text-emerald-400 tabular-nums">
                                        {result?.carbon}
                                    </h2>
                                    <p className="text-sm font-bold mt-2 opacity-80">ตันคาร์บอน (tCO2e)</p>
                                </div>

                                <div className="mt-8 grid grid-cols-2 gap-y-4 gap-x-6 border-t border-white/10 pt-8">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">ชื่อเกษตรกร</p>
                                        <p className="text-xs font-bold truncate">{formData.farmerName || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">ขนาดพื้นที่</p>
                                        <p className="text-xs font-bold">{result?.area}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">อายุต้นยาง</p>
                                        <p className="text-xs font-bold text-emerald-400">{result?.age} ปี</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">สายพันธุ์</p>
                                        <p className="text-xs font-bold">{formData.variety}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">วิธีคำนวณ: {result?.method}</p>
                                <button
                                    onClick={handleNext}
                                    className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl hover:bg-emerald-700 transition-all active:scale-[0.98]"
                                >
                                    ต่อไปเพื่อบันทึกผล
                                </button>
                                <button onClick={handleBack} className="w-full py-3 text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors">แก้ไขข้อมูล</button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Confirm & Save */}
                    {step === 4 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-500/30">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800">ตรวจสอบข้อมูลเป็นครั้งสุดท้าย</h4>
                                        <p className="text-slate-500 text-xs mt-1">กรุณายืนยันความถูกต้องของข้อมูลก่อนทำการบันทึกลงสู่ระบบฐานข้อมูล</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 bg-slate-50 p-6 rounded-3xl">
                                <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase">ชื่อเจ้าของแปลง</span>
                                    <span className="text-sm font-bold text-slate-700">{formData.farmerName}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase">พื้นที่ทั้งหมด</span>
                                    <span className="text-sm font-bold text-slate-700">{result?.area}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase">ยอดรวมคาร์บอน</span>
                                    <span className="text-lg font-black text-emerald-600">{result?.carbon} Tons</span>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    alert('บันทึกข้อมูลสำเร็จ!');
                                    onClose();
                                }}
                                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold shadow-2xl hover:shadow-emerald-500/20 transition-all active:scale-[0.98] mt-4"
                            >
                                ยืนยันและบันทึกผล
                            </button>
                            <button onClick={handleBack} className="w-full py-3 text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors">ย้อนกลับ</button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes modalIn {
                    from { opacity: 0; transform: translateY(40px) scale(0.9); }
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
