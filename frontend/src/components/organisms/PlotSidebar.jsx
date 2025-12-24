import React, { useState, useRef, useEffect } from 'react'
import { Button, Input } from '../atoms'
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
    const fileInputRef = useRef(null)

    const currentYear = new Date().getFullYear();
    const treeAge = 10; // Default auto-age

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
        if (onDrawingStepChange) onDrawingStepChange('idle')
    }

    const handleStartManual = () => {
        setMethod('draw')
        setStep(1)
        if (onDrawingStepChange) onDrawingStepChange('drawing')
    }

    const handleStartShp = () => {
        setMethod('shp')
        setStep(1)
        if (onDrawingStepChange) onDrawingStepChange('idle')
    }

    const handleCalculateManual = async () => {
        if (onCalculate && selectedAreaRai > 0) {
            // Defaulting to 10 years if year entry is removed
            await onCalculate(10, selectedAreaRai)
            setStep(2)
        }
    }

    const handleBulkCalculateShp = async () => {
        if (onBulkCalculate && selectedPlotIds.length > 0) {
            await onBulkCalculate(selectedPlotIds)
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
                    year: plantingYear,
                    area: selectedAreaRai,
                    carbonData: calculationResult
                })
            } else {
                const tempIds = selectedPlotIds.filter(id => id.toString().startsWith('temp'))
                await onSaveAll(tempIds)
            }
            // Move to success screen instead of resetting
            setStep(3);
        } catch (err) {
            console.error(err)
            alert('บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
        }
    }

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    }

    return (
        <div className="w-[480px] bg-white rounded-[2.5rem] shadow-premium flex flex-col h-full border border-gray-100 overflow-hidden relative">

            {/* Improved Step Indicator - Global */}
            <div className="px-10 pt-10 pb-4">
                <div className="flex items-center gap-3 mb-8">
                    {[0, 1, 2, 3].map((s) => (
                        <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${step >= s ? 'bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-slate-100'}`}></div>
                    ))}
                </div>

                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-[10px] font-black text-[#10b981] uppercase tracking-[3px] mb-1">Step 0{step + 1}</p>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                            {step === 0 && "เริ่มต้นใช้งาน"}
                            {step === 1 && (method === 'draw' ? "ลงทะเบียนข้อมูล" : "เลือกเเปลงที่นำเข้า")}
                            {step === 2 && "สรุปรายการคำนวณ"}
                            {step === 3 && "บันทึกข้อมูลเรียบร้อย"}
                        </h2>
                    </div>
                    <div className="flex gap-4 items-center mb-1">
                        {step > 0 && step < 3 && (
                            <button onClick={handleBack} className="text-xs font-bold text-[#10b981] hover:bg-green-50 px-3 py-1 rounded-full border border-green-100 transition-all">
                                ← ย้อนกลับ
                            </button>
                        )}
                        {step > 0 && step < 3 && (
                            <button onClick={resetWorkflow} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors">
                                ยกเลิก
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-10 flex-1 flex flex-col overflow-hidden">

                {/* STEP 0: FARMER COMMAND CENTER */}
                {step === 0 && (
                    <div className="flex flex-col h-full animate-fadeIn overflow-hidden">
                        <div className="grid grid-cols-1 gap-5 mb-10">
                            <div
                                onClick={handleStartManual}
                                className="group relative p-8 rounded-[2.5rem] bg-gradient-to-br from-[#10b981] to-[#059669] text-white cursor-pointer shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden"
                            >
                                <div className="relative z-10 flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                        <PlusIcon size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black tracking-tight">เพิ่มเเปลงใหม่ (วาดเอง)</h3>
                                        <p className="text-xs text-white/70 font-bold mt-1 uppercase tracking-widest">กดเพื่อเริ่มวาดรูปร่างพื้นที่บนเเผนที่</p>
                                    </div>
                                </div>
                                <div className="absolute -bottom-10 -right-10 opacity-10">
                                    <MapPinIcon size={160} />
                                </div>
                            </div>

                            <div
                                onClick={handleStartShp}
                                className="group relative p-8 rounded-[2.5rem] bg-gradient-to-br from-[#3cc2cf] to-[#0891b2] text-white cursor-pointer shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden"
                            >
                                <div className="relative z-10 flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                        <UploadIcon size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black tracking-tight">อัปโหลดไฟล์ (SHP)</h3>
                                        <p className="text-xs text-white/70 font-bold mt-1 uppercase tracking-widest">ใช้ไฟล์พิกัดมาตรฐานจากโปรแกรมอื่น</p>
                                    </div>
                                </div>
                                <div className="absolute -bottom-10 -right-10 opacity-10">
                                    <LayersIcon size={160} />
                                </div>
                            </div>
                        </div>

                        {/* Managed List Section - Super Simple */}
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex justify-between items-center mb-5 px-2">
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[3px] flex items-center gap-2">
                                    <CheckIcon size={14} className="text-[#10b981]" />
                                    เเปลงที่บันทึกเเล้ว ({plots.filter(p => p.isSaved).length})
                                </h3>
                                {plots.filter(p => p.isSaved).length > 0 && (
                                    <button
                                        onClick={() => onDeleteAll('saved')}
                                        className="text-[10px] font-black text-red-400 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-all"
                                    >
                                        ลบทั้งหมด
                                    </button>
                                )}
                            </div>

                            <div className="flex-1 overflow-auto space-y-3 pr-2 scrollbar-hide">
                                {plots.filter(p => p.isSaved).length === 0 ? (
                                    <div className="py-12 text-center bg-slate-50 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-200 shadow-sm">
                                            <LayersIcon size={24} />
                                        </div>
                                        <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">ยังไม่มีข้อมูลในระบบ</p>
                                    </div>
                                ) : (
                                    plots.filter(p => p.isSaved || p.id.toString().startsWith('temp')).map((plot) => (
                                        <div
                                            key={plot.id}
                                            onClick={() => onPlotSelect && onPlotSelect(plot)}
                                            className={`group p-5 border rounded-[2rem] cursor-pointer transition-all flex items-center gap-4 shadow-sm relative overflow-hidden
                                                ${selectedPlotId === plot.id ? 'ring-2 ring-yellow-400 border-yellow-400 bg-yellow-50/10' : 'border-slate-100 hover:border-[#10b981]'}
                                                ${plot.source === 'shp' ? 'bg-sky-50/40 hover:bg-sky-50' : 'bg-white hover:bg-green-50/20'}
                                            `}
                                        >
                                            {/* Source Indicator Line */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${plot.source === 'shp' ? 'bg-[#3cc2cf]' : 'bg-[#10b981]'}`}></div>

                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${plot.source === 'shp' ? 'bg-sky-50 text-[#3cc2cf]' : 'bg-[#10b981]/5 text-[#10b981]'}`}>
                                                {plot.source === 'shp' ? <LayersIcon size={20} /> : <TreeIcon size={24} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h4 className="font-black text-slate-700 text-sm truncate">{plot.name}</h4>
                                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${plot.source === 'shp' ? 'bg-sky-100 text-[#0891b2]' : 'bg-green-100 text-[#059669]'}`}>
                                                        {plot.source === 'shp' ? 'SHP' : 'วาดเอง'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{plot.areaValue ? formatThaiArea(plot.areaValue).thai : plot.area}</p>
                                                    <p className="text-[9px] text-slate-300 font-bold">คาร์บอน: {plot.carbon || '0.00'} ตัน</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeletePlot(plot.id);
                                                }}
                                                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                            >
                                                <TrashIcon size={18} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 1: CONFIG (DRAW) */}
                {step === 1 && method === 'draw' && (
                    <div className="flex flex-col h-full animate-fadeIn gap-8">
                        {selectedAreaRai > 0 ? (
                            <div className="space-y-4 animate-fadeIn">
                                <div className="p-8 bg-white border-2 border-[#10b981] rounded-[2.5rem] shadow-lg shadow-[#10b981]/5 text-center relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <p className="text-[11px] font-black text-[#10b981] uppercase tracking-[4px] mb-3">พื้นที่ที่วาดได้</p>
                                        <h2 className="text-5xl font-black text-slate-800 tracking-tighter mb-2">{selectedAreaRai.toFixed(2)} <span className="text-xl text-slate-400">ไร่</span></h2>
                                        <div className="flex flex-col gap-1 mt-4 pt-4 border-t border-slate-50">
                                            <p className="text-sm font-black text-slate-600 tracking-tight">{formatThaiArea(selectedAreaRai).thai}</p>
                                            <p className="text-[10px] font-bold text-slate-300 uppercase letter tracking-widest">{formatThaiArea(selectedAreaRai).sqm}</p>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <LayersIcon size={80} />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <Input label="ชื่อเรียกแปลงสวนยาง" placeholder="ระบุชื่อที่คุณต้องการ..." value={plotName} onChange={(e) => setPlotName(e.target.value)} />
                                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">อายุต้นยางพารา (ประเมินอัตโนมัติ)</p>
                                            <p className="text-lg font-black text-slate-800">10 ปี</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#10b981] shadow-sm">
                                            <TreeIcon size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400">
                                <MapPinIcon size={48} className="mb-4" />
                                <p className="text-sm font-bold">กรุณาวาดพื้นที่บนแผนที่</p>
                                <p className="text-xs">เพื่อเริ่มการคำนวณคาร์บอน</p>
                            </div>
                        )}

                        <div className="mt-auto">
                            <Button variant="primary" className="w-full py-5 rounded-[1.75rem] font-black shadow-xl shadow-[#10b981]/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all" onClick={handleCalculateManual} disabled={!plotName || selectedAreaRai <= 0}>
                                คำนวณปริมาณคาร์บอน
                                <ArrowRightIcon size={20} />
                            </Button>
                        </div>
                    </div>
                )}

                {/* STEP 1: CONFIG (SHP) */}
                {step === 1 && method === 'shp' && (
                    <div className="flex flex-col h-full animate-fadeIn overflow-hidden">
                        <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-3xl mb-6">
                            <p className="text-[11px] font-bold text-blue-700 leading-relaxed">
                                <span className="text-blue-500 font-black text-xs mr-2">TIP:</span>
                                ติ๊กเลือกแปลงที่ต้องการจากรายการด้านล่าง ระบบจะใช้ค่าชื่อและอายุยางที่ระบุจากไฟล์ให้โดยอัตโนมัติ
                            </p>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">พบทั้งหมด: {plots.filter(p => !p.isSaved).length} รายการ</h4>
                            <div className="flex items-center gap-2">
                                {plots.filter(p => !p.isSaved).length > 0 && (
                                    <button
                                        onClick={() => onDeleteAll('temp')}
                                        className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest px-2 py-1 rounded-lg hover:bg-red-50"
                                    >
                                        ล้างรายการ
                                    </button>
                                )}
                                <input type="file" ref={fileInputRef} className="hidden" accept=".zip" onChange={handleFileChange} />
                                <Button variant="outline" className="!py-2 !px-4 text-[10px] font-black rounded-xl" onClick={() => fileInputRef.current?.click()}>เปลี่ยนไฟล์ .zip</Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto bg-slate-50/50 rounded-[2rem] border border-slate-100 mb-6">
                            <table className="w-full">
                                <thead className="bg-white border-b border-slate-100 sticky top-0 z-10">
                                    <tr>
                                        <th className="p-4 w-12 text-center text-[10px] font-black text-slate-300">#</th>
                                        <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">ข้อมูลพื้นที่เเปลง</th>
                                        <th className="p-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">ขนาดทั้งหมด</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {plots.filter(p => !p.isSaved).map((plot, idx) => (
                                        <tr key={plot.id} onClick={() => {
                                            setSelectedPlotIds(prev => prev.includes(plot.id) ? prev.filter(i => i !== plot.id) : [...prev, plot.id])
                                            onPlotSelect && onPlotSelect(plot)
                                        }} className={`hover:bg-white cursor-pointer transition-colors group/row ${selectedPlotIds.includes(plot.id) ? 'bg-white' : ''}`}>
                                            <td className="p-4 text-center">
                                                <input type="checkbox" checked={selectedPlotIds.includes(plot.id)} readOnly className="w-5 h-5 rounded-xl border-slate-200 text-[#3cc2cf]" />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-between items-center pr-2">
                                                    <div>
                                                        <div className="font-black text-sm text-slate-700">{plot.name}</div>
                                                        <div className="flex flex-col gap-0.5 mt-1">
                                                            <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-[9px] font-black text-[#3cc2cf] uppercase tracking-wider border border-blue-100 w-fit">
                                                                อายุยาย {plot.age} ปี (AUTO)
                                                            </div>
                                                            <div className="text-[9px] font-bold text-slate-400 uppercase">{formatThaiArea(plot.areaValue).thai}</div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDeletePlot(plot.id);
                                                        }}
                                                        className="opacity-0 group-hover/row:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all rounded-xl hover:bg-red-50"
                                                    >
                                                        <TrashIcon size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-black text-slate-600 text-sm">{plot.areaValue.toFixed(2)} ไร่</span>
                                                    <span className="text-[9px] font-bold text-slate-300 uppercase">{formatThaiArea(plot.areaValue).sqm}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <Button variant="primary" className="w-full py-5 rounded-[1.75rem] font-black shadow-xl shadow-[#10b981]/30 flex items-center justify-center gap-3" onClick={handleBulkCalculateShp} disabled={selectedPlotIds.length === 0}>
                            คำนวณทั้งหมดที่เลือก ({selectedPlotIds.length})
                            <ArrowRightIcon size={20} />
                        </Button>
                    </div>
                )}

                {/* STEP 2: MINIMAL CALCULATION LIST */}
                {step === 2 && (
                    <div className="flex flex-col h-full animate-fadeIn overflow-hidden pt-4">

                        <div className="flex-1 overflow-auto space-y-4 pr-2 scrollbar-hide mb-6">
                            {method === 'draw' || (method === 'shp' && selectedPlotIds.length === 1) ? (
                                // SINGLE PLOT PREMIUM VIEW (Avoids repetition)
                                (() => {
                                    const plot = method === 'draw' ? null : plots.find(p => p.id === selectedPlotIds[0]);
                                    const carbonVal = method === 'draw' ? calculationResult?.carbon_tons : plot?.carbon;
                                    const biomassVal = method === 'draw' ? calculationResult?.biomass_tons : (parseFloat(plot?.carbon || 0) / 0.47).toFixed(1);
                                    const name = method === 'draw' ? plotName : plot?.name;
                                    const area = method === 'draw' ? selectedAreaRai : plot?.areaValue;

                                    return (
                                        <div className="animate-slideUp">
                                            {/* MINIMAL REPORT CARD */}
                                            <div className="bg-white rounded-3xl p-2 relative">
                                                <div className="space-y-8">
                                                    <div className="pb-2">
                                                        <h4 className="text-2xl font-black text-slate-800 mb-2">{name || 'แปลงยางพารา'}</h4>
                                                        <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                                                            📍 {formatThaiArea(area).thai}
                                                        </p>
                                                    </div>

                                                    <div className="space-y-6">
                                                        {/* Minimal Carbon Metric */}
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[2px] mb-3">กักเก็บคาร์บอน (Carbon Sequestration)</p>
                                                            <div className="flex items-baseline gap-2">
                                                                <span className="text-5xl font-black text-slate-800 tracking-tighter">
                                                                    {carbonVal || '0.00'}
                                                                </span>
                                                                <span className="text-lg font-black text-[#10b981] uppercase">ตัน</span>
                                                            </div>
                                                        </div>

                                                        {/* Minimal Biomass Metric */}
                                                        <div className="pt-6 border-t border-slate-50">
                                                            <div className="flex justify-between items-center">
                                                                <div>
                                                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[2px] mb-1">มวลชีวภาพ (AGB)</p>
                                                                    <p className="text-xl font-black text-slate-700">{biomassVal}<span className="text-xs ml-1.5 font-bold text-slate-400">ตัน</span></p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[2px] mb-1">อายุต้นยาง</p>
                                                                    <p className="text-xl font-black text-slate-700">{method === 'draw' ? treeAge : plot?.age}<span className="text-xs ml-1.5 font-bold text-slate-400">ปี</span></p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })()
                            ) : (
                                // MULTIPLE PLOTS LIST VIEW
                                plots.filter(p => selectedPlotIds.includes(p.id)).map(plot => (
                                    <div key={plot.id} className={`p-5 border rounded-[2.5rem] shadow-sm flex items-center gap-5 group/item relative transition-all overflow-hidden
                                            ${selectedPlotId === plot.id ? 'ring-2 ring-yellow-400 border-yellow-400 shadow-lg' : 'border-slate-100 hover:border-[#10b981]'}
                                            ${plot.source === 'shp' ? 'bg-sky-50/40 hover:bg-sky-50' : 'bg-white hover:bg-green-50/20'}
                                        `} onClick={() => onPlotSelect && onPlotSelect(plot)}>
                                        {/* Source Indicator Line */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${plot.source === 'shp' ? 'bg-[#3cc2cf]' : 'bg-[#10b981]'}`}></div>

                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${plot.source === 'shp' ? 'bg-sky-50 text-[#3cc2cf]' : 'bg-slate-50 text-[#10b981]'}`}>
                                            {plot.source === 'shp' ? <LayersIcon size={20} /> : <TreeIcon size={24} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h4 className="font-black text-slate-800 text-sm truncate">{plot.name}</h4>
                                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${plot.source === 'shp' ? 'bg-sky-100 text-[#0891b2]' : 'bg-green-100 text-[#059669]'}`}>
                                                    {plot.source === 'shp' ? 'SHP' : 'วาดเอง'}
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{plot.areaValue ? formatThaiArea(plot.areaValue).thai : plot.area}</p>
                                                <p className="text-[8px] text-slate-300 font-bold uppercase">{plot.areaValue ? formatThaiArea(plot.areaValue).sqm : ''} • อายุ {plot.age} ปี</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-black text-[#10b981] flex items-center gap-1">
                                                    <CarbonIcon size={12} />
                                                    {plot.carbon || '0.00'}
                                                    <span className="text-[9px] text-slate-300">C</span>
                                                </span>
                                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">🌳 มวลชีวภาพ (AGB): {plot.biomass || (parseFloat(plot.carbon || 0) / 0.47).toFixed(1)}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeletePlot(plot.id);
                                            }}
                                            className="absolute top-4 right-4 opacity-0 group-hover/item:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all bg-white rounded-lg"
                                        >
                                            <TrashIcon size={12} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Summary Card Removed - User requested to remove redundant summary section */}

                        <Button variant="primary" className="w-full py-5 rounded-[1.75rem] font-black shadow-xl shadow-[#10b981]/30 flex items-center justify-center gap-3 transition-transform active:scale-95" onClick={handleFinalSync}>
                            บันทึกและประเมินผลสุทธิ
                            <ArrowRightIcon size={20} />
                        </Button>
                    </div>
                )}

                {/* STEP 3: BALANCED SUCCESS CONFIRMATION */}
                {step === 3 && (
                    <div className="flex flex-col h-full animate-fadeIn px-8 pb-10">
                        <div className="flex-1 flex flex-col justify-center items-center text-center">
                            <div className="w-20 h-20 bg-[#10b981] rounded-full flex items-center justify-center text-white mb-10 shadow-xl shadow-[#10b981]/10">
                                <CheckIcon size={40} strokeWidth={3} />
                            </div>
                            <h3 className="text-6xl font-black text-slate-800 tracking-tighter mb-4 leading-none">บันทึกสำเร็จ</h3>
                            <p className="text-xl font-bold text-slate-400">ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว</p>
                        </div>

                        <div className="mt-auto">
                            <Button variant="primary" className="w-full py-6 rounded-3xl font-black bg-[#059669] hover:bg-[#047857] border-none shadow-2xl shadow-[#10b981]/20 flex items-center justify-center gap-4 transition-all active:scale-95" onClick={resetWorkflow}>
                                กลับไปยังหน้าหลัก
                                <ArrowRightIcon size={24} />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Support Watermark */}
            <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none opacity-20">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[12px]">KeptCarbon GIS Portal</span>
            </div>
        </div>
    )
}

export default PlotSidebar
