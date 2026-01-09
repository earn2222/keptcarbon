import React, { useState, useRef, useEffect } from 'react'
import { Button, Input, BrandLogo } from '../atoms'
import {
    PlusIcon,
    LeafIcon,
    UploadIcon,
    LayersIcon,
    CheckIcon,
    MapPinIcon,
    ArrowRightIcon,
    BarChartIcon,
    TreeIcon,
    ChevronRightIcon,
    TrashIcon,
    CarbonIcon
} from '../atoms/Icons'

const PlotSidebar = ({
    plots = [],
    onPlotSelect,
    onSavePlot,
    onCalculate,
    calculationResult,
    selectedAreaRai = 0,
    onShpUpload,
    onBulkCalculate,
    onSaveAll,
    onDeletePlot,
    onDeleteAll,
    onDrawingStepChange,
    selectedPlotId
}) => {
    // Steps: 
    // 0 = Choose Method
    // 1 = Data Entry / SHP Selection
    // 2 = Calculation Result List (New Required Step)
    // 3 = Final Confirmation & Sync
    const [step, setStep] = useState(0)
    const [method, setMethod] = useState(null)
    const [plotName, setPlotName] = useState('')
    const [plantingYear, setPlantingYear] = useState('')
    const [selectedPlotIds, setSelectedPlotIds] = useState([])
    const [selectedAge, setSelectedAge] = useState(10) // New: Dynamic age state
    const fileInputRef = useRef(null)

    const [isCollapsed, setIsCollapsed] = useState(false)

    const currentYearAD = new Date().getFullYear();
    const currentYearBE = currentYearAD + 543;
    const yearsList = Array.from({ length: 35 }, (_, i) => currentYearBE - i);

    // Auto-expand when area is selected (drawing finished)
    useEffect(() => {
        if (selectedAreaRai > 0) {
            setIsCollapsed(false);
        }
    }, [selectedAreaRai]);

    const formatThaiArea = (raiValue) => {
        if (!raiValue || raiValue <= 0) return { thai: "0 ไร่ 0 งาน 0 ตร.ว.", sqm: "0 ตร.ม." };
        const sqm = raiValue * 1600;
        const totalWah = sqm / 4;
        const rai = Math.floor(totalWah / 400);
        const remainsWah = totalWah % 400;
        const ngan = Math.floor(remainsWah / 100);
        const wah = (remainsWah % 100).toFixed(1);
        return {
            thai: `${rai} ไร่ ${ngan} งาน ${wah} ตร.ว.`,
            sqm: sqm.toLocaleString('th-TH', { maximumFractionDigits: 1 }) + " ตร.ม."
        };
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file && onShpUpload) {
            onShpUpload(file)
        }
    }

    const resetWorkflow = () => {
        setStep(0)
        setMethod(null)
        setPlotName('')
        setPlantingYear('')
        setSelectedPlotIds([])
        setIsCollapsed(false)
        if (onDrawingStepChange) onDrawingStepChange('idle')
    }

    const handleStartManual = () => {
        setMethod('draw')
        setStep(1)
        setPlantingYear('')
        setSelectedAge(10)
        setIsCollapsed(true)
        if (onDrawingStepChange) onDrawingStepChange('drawing')
    }

    const handleStartShp = () => {
        setMethod('shp')
        setStep(1)
        setPlantingYear('')
        setSelectedAge(10)
        if (onDrawingStepChange) onDrawingStepChange('idle')
    }

    const handleCalculateManual = async () => {
        if (onCalculate && selectedAreaRai > 0) {
            // Using selectedAge instead of hardcoded 10
            await onCalculate(selectedAge, selectedAreaRai)
            setStep(2)
        }
    }

    const handleBulkCalculateShp = async () => {
        if (onBulkCalculate && selectedPlotIds.length > 0) {
            // Only pass selectedAge if user actually picked a year, otherwise let backend/file decide
            await onBulkCalculate(selectedPlotIds, plantingYear ? selectedAge : null)
            setStep(2)
        }
    }

    const handleGoToFinalConfirm = () => {
        setStep(3)
    }

    // Removed auto-jump to step 2 to allow user to enter plot name in step 1
    // useEffect(() => {
    //     if (step === 1 && method === 'draw' && selectedAreaRai > 0) {
    //         handleCalculateManual();
    //     }
    // }, [selectedAreaRai]);

    const handleFinalSync = async () => {
        try {
            if (method === 'draw') {
                await onSavePlot({
                    name: plotName,
                    year: plantingYear ? parseInt(plantingYear) - 543 : currentYearAD - selectedAge,
                    area: selectedAreaRai,
                    carbonData: calculationResult
                })
            } else {
                const tempIds = selectedPlotIds.filter(id => id.toString().startsWith('temp'))
                await onSaveAll(tempIds)
            }
            // Move to success screen instead of resetting
            setStep(3);
            setIsCollapsed(false);
        } catch (err) {
            console.error(err)
            alert('บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
        }
    }

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    }

    return (
        <div
            className={`w-full lg:w-[480px] bg-white lg:bg-white rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-premium flex flex-col border-t lg:border border-gray-100/50 overflow-hidden relative transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                ${isCollapsed ? 'h-[60px] lg:h-full' : 'h-[75vh] lg:h-full'}
            `}
        >

            {/* Mobile Drag Handle & Close Button */}
            <div
                className="w-full flex items-center justify-center pt-3 pb-1 lg:hidden relative cursor-pointer active:opacity-50"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <div className={`w-12 h-1 bg-gray-300 rounded-full transition-all ${isCollapsed ? 'w-12' : 'w-12'}`}></div>

                {/* Mobile Close Button (Visible when expanded) */}
                {!isCollapsed && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsCollapsed(true);
                        }}
                        className="absolute right-6 top-3 p-2 bg-gray-100 rounded-full text-gray-400 hover:bg-gray-200 transition-colors"
                    >
                        <ChevronRightIcon size={20} className="rotate-90" />
                    </button>
                )}
            </div>

            {/* Step Indicator Section - Clean & Simple */}
            <div className="px-6 lg:px-10 pt-10 pb-2 flex-shrink-0 bg-white z-10">
                <div className="flex flex-col gap-8">
                    {/* 4 Segment Progress Bar */}
                    <div className="flex gap-2">
                        {[0, 1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-[#2d992c]' : 'bg-gray-100'}`}
                            />
                        ))}
                    </div>

                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <p className="text-[10px] font-black text-[#2d992c] uppercase tracking-[3px] mb-2 leading-none opacity-90">
                                STEP 0{step + 1}
                            </p>
                            <h2 className="text-3xl lg:text-4xl font-black text-[#2d4a27] tracking-tighter leading-none">
                                {step === 0 && 'เริ่มต้นใช้งาน'}
                                {step === 1 && (method === 'draw' ? "ลงทะเบียนเเปลง" : "เลือกเเปลงที่นำเข้า")}
                                {step === 2 && "สรุปผลการประเมิน"}
                                {step === 3 && "บันทึกเรียบร้อย"}
                            </h2>
                        </div>
                        {step > 0 && step < 3 && (
                            <button
                                onClick={handleBack}
                                className="mb-1 text-xs font-bold text-gray-400 hover:text-[#2d992c] transition-all flex items-center gap-1 group"
                            >
                                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                                </svg>
                                ย้อนกลับ
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Adjusting the content area top padding to control the gap below "เริ่มต้นใช้งาน" */}
            <div className="px-6 lg:px-10 pt-6 flex-1 flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide pb-24 lg:pb-10">

                {/* STEP 0: METHOD SELECTION */}
                {step === 0 && (
                    <div className="flex flex-col h-full animate-fadeIn overflow-hidden">
                        <div className="grid grid-cols-1 gap-4 mb-8">
                            <div
                                onClick={handleStartManual}
                                className="group relative p-6 lg:p-8 rounded-[2.5rem] bg-gradient-to-br from-[#4c7c44] to-[#3d6336] text-white cursor-pointer shadow-[0_20px_40px_-15px_rgba(76,124,68,0.4)] hover:shadow-[0_25px_50px_-12px_rgba(76,124,68,0.6)] active:scale-[0.96] active:shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] overflow-hidden"
                            >
                                <div className="relative z-10 flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner group-active:scale-90 transition-transform duration-300">
                                        <PlusIcon size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold tracking-tight group-active:translate-x-1 transition-transform duration-300">เพิ่มเเปลงใหม่ (วาดเอง)</h3>
                                        <p className="text-[10px] text-white/70 font-medium uppercase tracking-widest mt-0.5">กดเพื่อเริ่มกำหนดจุดบนเเผนที่</p>
                                    </div>
                                </div>
                                {/* Decorative Icon */}
                                <div className="absolute -bottom-6 -right-6 opacity-10 group-hover:opacity-20 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 ease-out">
                                    <MapPinIcon size={120} />
                                </div>
                                {/* Shine Effect */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                            </div>

                            <div
                                onClick={handleStartShp}
                                className="group relative p-6 lg:p-8 rounded-[2.5rem] bg-white border border-gray-100 text-[#2d4a27] cursor-pointer shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] hover:border-[#4c7c44]/50 active:scale-[0.96] active:bg-gray-50 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] overflow-hidden"
                            >
                                <div className="relative z-10 flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-[#eef2e6] flex items-center justify-center text-[#4c7c44] group-active:scale-90 transition-transform duration-300">
                                        <UploadIcon size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold tracking-tight text-[#2d4a27] group-active:translate-x-1 transition-transform duration-300">นำเข้าไฟล์ SHP</h3>
                                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-0.5">ใช้ฐานข้อมูล SHP</p>
                                    </div>
                                </div>
                                <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 group-hover:-rotate-12 transition-all duration-500 ease-out">
                                    <LayersIcon size={120} />
                                </div>
                            </div>
                        </div>

                        {/* Plots List */}
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex justify-between items-center mb-5 px-2">
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px] flex items-center gap-2">
                                    เเปลงที่บันทึกแล้ว • {plots.filter(p => p.isSaved).length}
                                </h3>
                                {plots.filter(p => p.isSaved).length > 0 && (
                                    <button
                                        onClick={() => onDeleteAll('saved')}
                                        className="text-[10px] font-bold text-red-400 hover:text-red-500 transition-all"
                                    >
                                        ลบทั้งหมด
                                    </button>
                                )}
                            </div>

                            <div className="flex-1 overflow-auto space-y-3 pr-1 scrollbar-hide">
                                {plots.filter(p => p.isSaved).length === 0 ? (
                                    <div className="py-10 text-center bg-gray-50 border border-gray-100 rounded-[2.5rem] flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-200 shadow-sm">
                                            <LeafIcon size={24} />
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">ยังไม่มีข้อมูลเเปลงยาง</p>
                                    </div>
                                ) : (
                                    plots.filter(p => p.isSaved || p.id.toString().startsWith('temp')).map((plot) => (
                                        <div
                                            key={plot.id}
                                            onClick={() => onPlotSelect && onPlotSelect(plot)}
                                            className={`p-4 border rounded-[2rem] cursor-pointer transition-all duration-300 ease-out flex items-center gap-4 relative overflow-hidden group active:scale-[0.98]
                                                ${selectedPlotId === plot.id ? 'bg-[#eef2e6] border-[#4c7c44] shadow-md scale-[1.02]' : 'bg-white border-gray-50 hover:border-[#4c7c44]/30 hover:shadow-lg hover:shadow-gray-200/50'}
                                            `}
                                        >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${plot.source === 'shp' ? 'bg-sky-50 text-sky-600' : 'bg-[#eef2e6] text-[#4c7c44]'}`}>
                                                {plot.source === 'shp' ? <LayersIcon size={20} /> : <LeafIcon size={24} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-[#2d4a27] text-sm truncate">{plot.name}</h4>
                                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${plot.source === 'shp' ? 'bg-sky-100 text-sky-700' : 'bg-[#eef2e6] text-[#4c7c44]'}`}>
                                                        {plot.source === 'shp' ? 'SHP' : 'วาดเอง'}
                                                    </span>
                                                </div>
                                                <div className="mt-0.5 flex items-center gap-2">
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{plot.area}</p>
                                                    <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                                    <p className="text-[10px] text-[#4c7c44] font-bold uppercase tracking-tight">อายุ {plot.age || 0} ปี</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] font-bold text-[#4c7c44] leading-none mb-0.5">{plot.carbon || '0.00'}</div>
                                                <div className="text-[8px] font-bold text-gray-300 uppercase tracking-tighter">TON C</div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeletePlot(plot.id);
                                                }}
                                                className="ml-2 p-2 text-gray-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <TrashIcon size={16} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 1: DRAW CONFIG */}
                {step === 1 && method === 'draw' && (
                    <div className="flex flex-col h-full animate-fadeIn gap-6">
                        {selectedAreaRai > 0 ? (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="p-8 bg-white border border-[#4c7c44]/10 rounded-[2.5rem] shadow-sm text-center relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-bold text-[#4c7c44] uppercase tracking-[4px] mb-3 leading-none opacity-60">คำนวณพื้นที่ได้</p>
                                        <h2 className="text-5xl font-bold text-[#2d4a27] tracking-tighter mb-2">{selectedAreaRai.toFixed(2)} <span className="text-xl text-gray-300 font-medium">ไร่</span></h2>
                                        <div className="flex flex-col gap-1 mt-4 pt-4 border-t border-gray-50">
                                            <p className="text-xs font-bold text-gray-500 tracking-tight">{formatThaiArea(selectedAreaRai).thai}</p>
                                        </div>
                                    </div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                                        <MapPinIcon size={150} />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">ชื่อเรียกเเปลงสวนยาง</p>
                                        <input
                                            type="text"
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#2d4a27] placeholder:text-gray-300 focus:bg-white focus:border-[#4c7c44]/20 focus:ring-4 focus:ring-[#4c7c44]/5 transition-all outline-none"
                                            placeholder="ตัวอย่าง: เเปลงบ้านเขาพนม..."
                                            value={plotName}
                                            onChange={(e) => setPlotName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">ปีที่เริ่มปลูก (พ.ศ.)</p>
                                            <div className="relative">
                                                <select
                                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#2d4a27] focus:bg-white focus:border-[#4c7c44]/20 transition-all outline-none appearance-none"
                                                    value={plantingYear}
                                                    onChange={(e) => {
                                                        const year = e.target.value;
                                                        setPlantingYear(year);
                                                        if (year) {
                                                            const age = currentYearBE - parseInt(year);
                                                            setSelectedAge(age > 0 ? age : 1);
                                                        }
                                                    }}
                                                >
                                                    <option value="">เลือกปีที่ปลูก</option>
                                                    {yearsList.map(y => (
                                                        <option key={y} value={y}>{y}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                    <ChevronRightIcon size={16} className="rotate-90" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-4 bg-[#eef2e6] rounded-2xl border border-[#4c7c44]/10">
                                            <div className="w-10 h-10 rounded-xl bg-[#4c7c44] flex items-center justify-center text-white">
                                                <TreeIcon size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">อายุต้นยางพารา</p>
                                                <p className="text-sm font-bold text-[#2d4a27]">
                                                    {plantingYear ? `${selectedAge} ปี` : 'กรุณาเลือกปีที่ปลูก'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                                <div className="w-16 h-16 bg-[#eef2e6] rounded-full flex items-center justify-center text-[#4c7c44] mb-4 animate-pulse">
                                    <MapPinIcon size={32} />
                                </div>
                                <p className="text-sm font-bold text-[#2d4a27] tracking-tight">กรุณาวาดพื้นที่บนเเผนที่</p>
                                <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-medium">ทำตามคำเเนะนำบนเเป้นควบคุม</p>
                            </div>
                        )}

                        <div className="mt-auto pt-4">
                            <button
                                className="w-full py-5 bg-[#4c7c44] text-white rounded-[2rem] font-bold text-sm shadow-xl shadow-[#4c7c44]/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-20 disabled:grayscale disabled:pointer-events-none"
                                onClick={handleCalculateManual}
                                disabled={!plotName || selectedAreaRai <= 0 || !plantingYear}
                            >
                                เริ่มการคำนวณคาร์บอน
                                <ArrowRightIcon size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 1: SHP CONFIG */}
                {step === 1 && method === 'shp' && (
                    <div className="flex flex-col h-full animate-fadeIn overflow-hidden">
                        <div className="p-5 bg-sky-50 border border-sky-100 rounded-3xl mb-6">
                            <p className="text-[10px] font-bold text-sky-700 leading-relaxed uppercase tracking-wide">
                                <span className="text-sky-400 font-black text-xs mr-2">•</span>
                                เลือกเเปลงที่ต้องการจากรายการ ระบบจะคำนวณค่าคาร์บอนให้อัตโนมัติรายเเปลง
                            </p>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">รายการเเปลง ({plots.filter(p => !p.isSaved).length})</h4>
                            <div className="flex items-center gap-2">
                                <input type="file" ref={fileInputRef} className="hidden" accept=".zip" onChange={handleFileChange} />
                                <button className="text-[10px] font-bold text-[#4c7c44] hover:underline" onClick={() => fileInputRef.current?.click()}>เปลี่ยนไฟล์</button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto bg-gray-50 border border-gray-100 rounded-[2rem] mb-6 scrollbar-hide">
                            <table className="w-full">
                                <thead className="bg-white border-b border-gray-100 sticky top-0 z-10">
                                    <tr>
                                        <th className="p-4 w-12 text-center">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const availablePlots = plots.filter(p => !p.isSaved);
                                                    if (selectedPlotIds.length === availablePlots.length) {
                                                        setSelectedPlotIds([]);
                                                    } else {
                                                        setSelectedPlotIds(availablePlots.map(p => p.id));
                                                    }
                                                }}
                                                className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all mx-auto ${selectedPlotIds.length === plots.filter(p => !p.isSaved).length && selectedPlotIds.length > 0 ? 'bg-[#4c7c44] border-[#4c7c44] shadow-sm' : 'border-gray-200'}`}
                                            >
                                                {selectedPlotIds.length === plots.filter(p => !p.isSaved).length && selectedPlotIds.length > 0 && <CheckIcon size={12} className="text-white" />}
                                            </button>
                                        </th>
                                        <th className="p-4 text-left text-[9px] font-bold text-gray-400 uppercase tracking-widest">ข้อมูลเเปลง</th>
                                        <th className="p-4 text-right text-[9px] font-bold text-gray-400 uppercase tracking-widest">ขนาดพื้นที่</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {plots.filter(p => !p.isSaved).map((plot) => (
                                        <tr key={plot.id} onClick={() => {
                                            setSelectedPlotIds(prev => prev.includes(plot.id) ? prev.filter(i => i !== plot.id) : [...prev, plot.id])
                                            onPlotSelect && onPlotSelect(plot)
                                        }} className={`hover:bg-white cursor-pointer transition-colors ${selectedPlotIds.includes(plot.id) ? 'bg-white' : ''}`}>
                                            <td className="p-4 text-center">
                                                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selectedPlotIds.includes(plot.id) ? 'bg-[#4c7c44] border-[#4c7c44] shadow-sm' : 'border-gray-200'}`}>
                                                    {selectedPlotIds.includes(plot.id) && <CheckIcon size={12} className="text-white" />}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-sm text-[#2d4a27] tracking-tight">{plot.name}</div>
                                                <div className="text-[9px] font-bold text-gray-400 mt-1 uppercase">อายุเฉลี่ย {plot.age} ปี</div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="font-bold text-sm text-[#2d4a27]">{plot.area}</div>
                                                <div className="text-[9px] font-bold text-gray-300 mt-1 uppercase tracking-tight">({formatThaiArea(plot.areaValue).sqm})</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">ระบุปีที่เริ่มปลูกสำหรับทั้งกลุ่ม (พ.ศ.)</p>
                                <div className="relative">
                                    <select
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#2d4a27] focus:bg-white focus:border-[#4c7c44]/20 transition-all outline-none appearance-none"
                                        value={plantingYear}
                                        onChange={(e) => {
                                            const year = e.target.value;
                                            setPlantingYear(year);
                                            if (year) {
                                                const age = currentYearBE - parseInt(year);
                                                setSelectedAge(age > 0 ? age : 1);
                                            }
                                        }}
                                    >
                                        <option value="">ใช้ตามข้อมูลในไฟล์ (ถ้ามี)</option>
                                        {yearsList.map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronRightIcon size={16} className="rotate-90" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            className="w-full py-5 bg-[#4c7c44] text-white rounded-[2rem] font-bold text-sm shadow-xl shadow-[#4c7c44]/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-20"
                            onClick={handleBulkCalculateShp}
                            disabled={selectedPlotIds.length === 0}
                        >
                            ยืนยัน ({selectedPlotIds.length} เเปลง)
                            <ArrowRightIcon size={20} />
                        </button>
                    </div>
                )}

                {/* STEP 2: RESULTS */}
                {step === 2 && (
                    <div className="flex flex-col h-full animate-fadeIn overflow-hidden pt-4">

                        <div className="flex-1 overflow-auto space-y-4 pr-1 scrollbar-hide mb-6">
                            {method === 'draw' || (method === 'shp' && selectedPlotIds.length === 1) ? (
                                (() => {
                                    const plot = method === 'draw' ? null : plots.find(p => p.id === selectedPlotIds[0]);
                                    const carbonVal = method === 'draw' ? calculationResult?.carbon_tons : plot?.carbon;
                                    const biomassVal = method === 'draw' ? calculationResult?.biomass_tons : (parseFloat(plot?.carbon || 0) / 0.47).toFixed(1);
                                    const name = method === 'draw' ? plotName : plot?.name;
                                    const area = method === 'draw' ? selectedAreaRai : plot?.areaValue;

                                    return (
                                        <div className="animate-slideUp">
                                            <div className="bg-white rounded-[2.5rem] p-2">
                                                <div className="space-y-10">
                                                    <div>
                                                        <div className="text-[10px] font-bold text-[#4c7c44] uppercase tracking-[4px] mb-4 opacity-100 flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#4c7c44]"></div>
                                                            สรุปเเปลง: {name || 'เเปลงยาง'}
                                                        </div>
                                                        <h4 className="text-3xl font-bold text-[#2d4a27] mb-2 tracking-tight">{formatThaiArea(area).thai}</h4>
                                                        <p className="text-[10px] font-bold text-gray-300 flex items-center gap-1.5 uppercase tracking-widest">
                                                            เเปลงของ {method === 'draw' ? 'วาดเอง' : 'ไฟล์ SHP'} • {formatThaiArea(area).sqm}
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-8 pt-8 border-t border-gray-50">
                                                        <div className="relative">
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px] mb-3 leading-none">กักเก็บคาร์บอน (CARBON)</p>
                                                            <div className="flex items-baseline gap-2">
                                                                <span className="text-6xl font-bold text-[#2d4a27] tracking-tighter">
                                                                    {carbonVal || '0.00'}
                                                                </span>
                                                                <span className="text-xl font-bold text-[#4c7c44] uppercase">ตัน</span>
                                                            </div>
                                                            <div className="absolute -top-10 -right-4 opacity-[0.05] grayscale brightness-0 pointer-events-none">
                                                                <LeafIcon size={180} />
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                                                            <div>
                                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">มวลชีวภาพ (AGB)</p>
                                                                <p className="text-xl font-bold text-[#2d4a27] tracking-tight">{biomassVal} <span className="text-[10px] text-gray-300 font-bold ml-1 uppercase leading-none">ตัน</span></p>
                                                            </div>
                                                            <div className="w-[1px] h-8 bg-gray-200"></div>
                                                            <div className="text-right">
                                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">อายุยางที่ใช้</p>
                                                                <p className="text-xl font-bold text-[#2d4a27] tracking-tight">{selectedAge} <span className="text-[10px] text-gray-300 font-bold ml-1 uppercase leading-none">ปี</span></p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })()
                            ) : (
                                plots.filter(p => selectedPlotIds.includes(p.id)).map(plot => (
                                    <div key={plot.id} className={`p-5 border rounded-[2.5rem] flex items-center gap-5 group relative transition-all overflow-hidden
                                            ${selectedPlotId === plot.id ? 'bg-[#eef2e6] border-[#4c7c44]/30' : 'bg-white border-gray-50 hover:bg-gray-50'}
                                        `} onClick={() => onPlotSelect && onPlotSelect(plot)}>
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${plot.source === 'shp' ? 'bg-sky-50 text-sky-600' : 'bg-[#eef2e6] text-[#4c7c44]'}`}>
                                            {plot.source === 'shp' ? <LayersIcon size={20} /> : <LeafIcon size={24} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-[#2d4a27] text-sm truncate">{plot.name}</h4>
                                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${plot.source === 'shp' ? 'bg-sky-100 text-sky-700' : 'bg-[#eef2e6] text-[#4c7c44]'}`}>
                                                    {plot.source === 'shp' ? 'SHP' : 'วาดเอง'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{plot.area}</p>
                                                <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                                <p className="text-[10px] font-bold text-[#4c7c44] uppercase tracking-tight">อายุ {plot.age} ปี</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-base font-bold text-[#4c7c44] leading-tight flex items-center justify-end gap-1">
                                                {plot.carbon || '0.00'}
                                                <span className="text-[9px] font-bold text-gray-300 opacity-50">C</span>
                                            </div>
                                            <div className="text-[8px] font-bold text-gray-300 uppercase tracking-widest mt-0.5">ตันคาร์บอน</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <button
                            className="w-full py-5 bg-[#4c7c44] text-white rounded-[2rem] font-bold text-sm shadow-xl shadow-[#4c7c44]/20 flex items-center justify-center gap-3 transition-transform active:scale-95"
                            onClick={handleFinalSync}
                        >
                            บันทึกข้อมูลเข้าสู่ระบบ
                            <ArrowRightIcon size={20} />
                        </button>
                    </div>
                )}

                {/* STEP 3: SUCCESS */}
                {step === 3 && (
                    <div className="flex flex-col h-full animate-fadeIn lg:px-8 pb-10">
                        <div className="flex-1 flex flex-col justify-center items-center text-center">
                            <div className="w-24 h-24 bg-[#eef2e6] text-[#4c7c44] rounded-[2rem] flex items-center justify-center mb-10 shadow-sm relative overflow-hidden group">
                                <CheckIcon size={40} strokeWidth={4} className="relative z-10 transition-transform group-hover:scale-125 duration-500" />
                                <div className="absolute inset-0 bg-white/40 translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
                            </div>
                            <h3 className="text-4xl lg:text-5xl font-bold text-[#2d4a27] tracking-tighter mb-4 leading-none lowercase">บันทึกเรียบร้อย.</h3>
                            <p className="text-sm font-medium text-gray-400 max-w-[240px] leading-relaxed">ข้อมูลเเปลงยางพาราของคุณถูกเพิ่มเข้าสู่ระบบจัดการ KeptCarbon GIS เเล้ว</p>
                        </div>

                        <div className="mt-auto">
                            <button
                                className="w-full py-5 border-2 border-[#4c7c44] text-[#4c7c44] rounded-[2rem] font-bold text-sm hover:bg-[#4c7c44] hover:text-white transition-all active:scale-95"
                                onClick={resetWorkflow}
                            >
                                ตกลงเเละกลับไปที่เเผนที่
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Support Watermark */}
            <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none opacity-10">
                <span className="text-[8px] font-black text-[#2d4a27] uppercase tracking-[10px]">KeptCarbon GIS Portal</span>
            </div>
        </div>
    )
}

export default PlotSidebar
