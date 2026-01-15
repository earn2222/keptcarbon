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
    CarbonIcon,
    PencilIcon,
    UserGroupIcon,
    InformationCircleIcon,
    SettingsIcon
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
    onUpdateTempPlot,
    selectedPlotId
}) => {
    // Steps: 
    // 0 = Choose Method
    // 1 = Data Entry / Plot Selection
    // 2 = SHP Summary & Per-Plot Config (SHP) / Calculation Result (Manual)
    // 3 = Calculation Result (SHP) / Success (Manual)
    // 4 = Success (SHP)
    const [step, setStep] = useState(0)
    const [method, setMethod] = useState(null)
    const [subStep, setSubStep] = useState('list') // 'list' | 'edit'

    const [plotName, setPlotName] = useState('')
    const [plantingYear, setPlantingYear] = useState('')
    const [selectedPlotIds, setSelectedPlotIds] = useState([])
    const [selectedAge, setSelectedAge] = useState(10)
    const [rubberVariety, setRubberVariety] = useState('') // Default variety (none)
    const [calculationFormula, setCalculationFormula] = useState('') // Calculation Method (none)
    const [isSqm, setIsSqm] = useState(false) // Area unit toggle
    const [showSummary, setShowSummary] = useState(false) // Summary modal state
    const [farmerName, setFarmerName] = useState('') // New: Farmer Name
    const [showShpInfo, setShowShpInfo] = useState(false) // New: SHP Instructions Modal
    const [showSuccessPopup, setShowSuccessPopup] = useState(false)
    const [confirmedShpIds, setConfirmedShpIds] = useState([]) // New: track plots confirmed for batch
    const [savedStats, setSavedStats] = useState({ count: 0, area: 0, carbon: 0 })
    const fileInputRef = useRef(null)

    const [isCollapsed, setIsCollapsed] = useState(false)
    const [originStep, setOriginStep] = useState(null) // New: track where edit started from

    const currentYearAD = new Date().getFullYear();
    const currentYearBE = currentYearAD + 543;
    const yearsList = Array.from({ length: 35 }, (_, i) => currentYearBE - i);

    // Filter Pending Manual Plots
    const pendingManualPlots = plots.filter(p => !p.isSaved && p.id.toString().startsWith('temp') && p.source === 'manual')

    // Auto-expand when area is selected (drawing finished)
    useEffect(() => {
        if (selectedAreaRai > 0 && subStep === 'edit') {
            setIsCollapsed(false);
        }
    }, [selectedAreaRai, subStep]);

    // Auto-Name Effect
    useEffect(() => {
        if (subStep === 'edit' && !selectedPlotId && !plotName) {
            const nextNum = plots.length + 1
            setPlotName(farmerName ? `แปลงที่ ${nextNum} - ${farmerName}` : `แปลงที่ ${nextNum}`)
        }
    }, [plots.length, farmerName, subStep, selectedPlotId])

    // Age Estimation Logic
    useEffect(() => {
        if (!plantingYear) {
            // Simulate estimation if no year provided (default)
            setSelectedAge(12)
        }
    }, [plantingYear])

    // Auto-Recalculate when formula changes in Step 2
    useEffect(() => {
        if (step === 2) {
            if (method === 'draw') {
                handleCalculateManualAllWrapper()
            } else if (method === 'shp' && selectedPlotIds.length > 0) {
                handleBulkCalculateShp()
            }
        }
    }, [calculationFormula])

    // Auto-Show SHP Info
    useEffect(() => {
        if (method === 'shp') {
            setShowShpInfo(true)
        }
    }, [method])

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
        setSubStep('list')
        setPlotName('')
        setPlantingYear('')
        setFarmerName('')
        setSelectedPlotIds([])
        setConfirmedShpIds([])
        setIsCollapsed(false)
        if (onDrawingStepChange) onDrawingStepChange('idle')
    }

    const handleStartManual = () => {
        setMethod('draw')
        setStep(1)
        setCalculationFormula('') // Reset to empty for selection prompt

        // If we already have pending plots, go to list view first
        if (pendingManualPlots.length > 0) {
            setSubStep('list')
            if (onDrawingStepChange) onDrawingStepChange('idle')
        } else {
            // Start creating first plot
            startNewPlot()
        }
    }

    const startNewPlot = () => {
        setSubStep('edit')
        setPlotName('')
        setFarmerName('')
        setPlantingYear('')
        setSelectedAge(0) // Reset age
        setRubberVariety('')
        setCalculationFormula('')
        // Reset selected ID so Map knows we are creating new
        if (onPlotSelect) onPlotSelect({ id: null })

        if (onDrawingStepChange) onDrawingStepChange('drawing')
        setIsCollapsed(true)
    }

    const startEditPlot = (plot) => {
        if (onPlotSelect) onPlotSelect(plot)
        setPlotName(plot.name)
        setFarmerName(plot.farmerName || '') // Load Farmer Name
        setPlantingYear(plot.year ? (plot.year > 2300 ? plot.year : plot.year + 543) : '') // Convert AD to BE if needed, simplistic check
        setSelectedAge(plot.age || 0)
        setRubberVariety(plot.variety || '')
        setCalculationFormula(plot.calculationMethod || '')

        setSubStep('edit')
        if (onDrawingStepChange) onDrawingStepChange('drawing') // Allow re-drawing/editing geometry
        setIsCollapsed(false)
    }

    const handleSaveToList = () => {
        if (selectedPlotId && onUpdateTempPlot) {
            onUpdateTempPlot(selectedPlotId, {
                name: plotName,
                farmerName: farmerName,
                year: plantingYear ? parseInt(plantingYear) : null,
                age: selectedAge,
                variety: rubberVariety,
                calculationMethod: calculationFormula || 'tgo'
            })
        }
        // Return to origin if set, otherwise to list subStep
        if (originStep === 2) {
            setStep(2);
            setOriginStep(null);
        } else {
            setSubStep('list');
        }

        setPlotName('')
        setFarmerName('')
        setPlantingYear('')
        setRubberVariety('')
        setCalculationFormula('')
        if (onDrawingStepChange) onDrawingStepChange('idle')
    }

    const handleCancelEdit = () => {
        if (onPlotSelect) onPlotSelect({ id: null });
        if (onDrawingStepChange) onDrawingStepChange('idle');

        if (originStep === 2) {
            setStep(2);
            setOriginStep(null);
        } else {
            setSubStep('list');
        }
    }

    const handleStartShp = () => {
        setMethod('shp')
        setStep(1)
        setPlantingYear('')
        setSelectedAge(0)
        setCalculationFormula('')
        setRubberVariety('')
        if (onDrawingStepChange) onDrawingStepChange('idle')
    }

    const handleBulkCalculateShp = async () => {
        // Apply Global Settings to SELECTED plots if defined in Step 1
        if (onUpdateTempPlot && selectedPlotIds.length > 0) {
            const updateObj = {};
            if (plantingYear) {
                updateObj.year = parseInt(plantingYear);
                updateObj.age = currentYearBE - parseInt(plantingYear);
                updateObj.plantingYear = plantingYear;
            } else {
                // If not provided, use default/existing age if available
                updateObj.age = selectedAge || 10;
            }
            if (rubberVariety) updateObj.variety = rubberVariety;
            if (calculationFormula) updateObj.calculationMethod = calculationFormula;

            // Update each selected plot individually
            for (const id of selectedPlotIds) {
                onUpdateTempPlot(id, updateObj);
            }

            // Move current selection to confirmed list
            const newConfirmed = [...new Set([...confirmedShpIds, ...selectedPlotIds])];
            setConfirmedShpIds(newConfirmed);

            // RESET for next batch
            setSelectedPlotIds([]);
            setPlantingYear('');
            setRubberVariety('');
            setCalculationFormula('');
            setSelectedAge(0);
        }
    }

    const goToShpSummary = () => {
        if (confirmedShpIds.length > 0) {
            setStep(2);
        }
    }

    const startShpCalculation = async () => {
        if (onBulkCalculate && confirmedShpIds.length > 0) {
            await onBulkCalculate(confirmedShpIds, null, null, null, null)
            setStep(3) // Move to results
        }
    }

    const handleCalculateManualAllWrapper = async () => {
        if (onBulkCalculate && pendingManualPlots.length > 0) {
            const ids = pendingManualPlots.map(p => p.id);
            // Pass null for method override so it uses each plot's own calculationMethod
            await onBulkCalculate(ids, null, null, null, null);
            setStep(2);
        }
    }

    const handleFinalSync = async () => {
        if (!onSaveAll) return;

        const plotsToSave = method === 'draw'
            ? pendingManualPlots
            : plots.filter(p => confirmedShpIds.includes(p.id));

        const ids = plotsToSave.map(p => p.id);

        const totalArea = plotsToSave.reduce((sum, p) => sum + (parseFloat(p.areaValue) || 0), 0);
        const totalCarbon = plotsToSave.reduce((sum, p) => sum + parseFloat(p.carbon || 0), 0);

        setSavedStats({
            count: ids.length,
            area: totalArea,
            carbon: totalCarbon
        });

        await onSaveAll(ids);
        setShowSummary(false);
        setStep(method === 'draw' ? 3 : 4);
    }

    const handleBack = () => {
        if (originStep === 2) {
            setStep(2);
            setOriginStep(null);
            return;
        }
        if (step === 1 && subStep === 'edit' && (pendingManualPlots.length > 0 || method === 'shp')) {
            // If editing and have list, go back to list
            setSubStep('list')
            if (onDrawingStepChange) onDrawingStepChange('idle')
            return;
        }
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

            {/* Step Indicator Section */}
            <div className="px-6 lg:px-10 pt-10 pb-2 flex-shrink-0 bg-white z-10">
                <div className="flex flex-col gap-8">
                    {/* Progress Bar (Dynamic segments) */}
                    <div className="flex gap-2">
                        {(method === 'shp' ? [0, 1, 2, 3, 4] : [0, 1, 2, 3]).map((s) => (
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
                                {step === 1 && method === 'draw' && (subStep === 'list' ? "รายการเเปลง" : (selectedPlotId ? "แก้ไขข้อมูล" : "วาดเเปลงใหม่"))}
                                {step === 1 && method === 'shp' && (subStep === 'edit' ? "แก้ไขข้อมูลแปลง" : "เลือกเเปลงที่นำเข้า")}
                                {step === 2 && method === 'shp' && "ตั้งค่ารายเเปลง"}
                                {step === 2 && method === 'draw' && "สรุปผลการประเมิน"}
                                {step === 3 && method === 'shp' && "สรุปผลการประเมิน"}
                                {step === 3 && method === 'draw' && "บันทึกเรียบร้อย"}
                                {step === 4 && "บันทึกเรียบร้อย"}
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

            <div className="px-6 lg:px-10 pt-6 flex-1 flex flex-col overflow-y-auto overflow-x-hidden pb-24 lg:pb-10">

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
                                <div className="absolute -bottom-6 -right-6 opacity-10 group-hover:opacity-20 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 ease-out">
                                    <MapPinIcon size={120} />
                                </div>
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

                        {/* Plots List - Saved only here */}
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
                                    plots.filter(p => p.isSaved).map((plot) => (
                                        <div key={plot.id} className="p-4 border bg-white border-gray-50 rounded-[2rem] flex items-center gap-4 relative overflow-hidden group">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-[#eef2e6] text-[#4c7c44]">
                                                <LeafIcon size={24} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-[#2d4a27] text-sm truncate">{plot.name}</h4>
                                                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter bg-gray-100 text-gray-500">SAVED</span>
                                                </div>
                                                <div className="mt-0.5 flex items-center gap-2">
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{plot.area}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onDeletePlot(plot.id)}
                                                className="p-2 text-gray-300 hover:text-red-500 transition-all"
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

                {/* STEP 1: MANUAL DRAW (LIST VIEW) */}
                {step === 1 && method === 'draw' && subStep === 'list' && (
                    <div className="flex flex-col animate-fadeIn">

                        <div className="flex-1 overflow-auto space-y-4 mb-4">
                            {pendingManualPlots.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                        <MapPinIcon size={32} />
                                    </div>
                                    <p className="font-bold text-gray-400">ยังไม่มีรายการวาดใหม่</p>
                                    <button onClick={startNewPlot} className="mt-4 px-6 py-2 bg-[#4c7c44] text-white font-bold rounded-xl text-xs hover:scale-105 transition-transform">
                                        เริ่มวาดเเปลง
                                    </button>
                                </div>
                            ) : (
                                pendingManualPlots.map(plot => (
                                    <div key={plot.id} className="p-5 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow relative group">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#eef2e6] rounded-xl flex items-center justify-center text-[#4c7c44]">
                                                    <MapPinIcon size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#2d4a27] leading-tight">{plot.name}</h4>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{plot.area}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => startEditPlot(plot)}
                                                    className="p-2 text-gray-400 hover:text-[#4c7c44] hover:bg-green-50 rounded-full transition-colors"
                                                    title="แก้ไข"
                                                >
                                                    <PencilIcon size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onDeletePlot(plot.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                    title="ลบ"
                                                >
                                                    <TrashIcon size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 pl-1">
                                            <div className="flex items-center gap-1.5">
                                                <TreeIcon size={12} className="text-[#4c7c44]" />
                                                <span className="text-[10px] font-bold text-gray-500">อายุ {plot.age || '?'} ปี</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                                <span className="text-[10px] font-bold text-gray-500">{plot.year ? `ปลูกปี ${plot.year}` : 'ไม่ระบุปี'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                                <span className="text-[10px] font-bold text-gray-500">
                                                    {plot.calculationMethod === 'doa' ? 'วิธีที่ 2 (DoA)' : plot.calculationMethod === 'research' ? 'วิธีที่ 3 (Res.)' : 'วิธีที่ 1 (TGO)'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-auto space-y-4 pt-4 border-t border-gray-100 mb-6">

                            <button
                                onClick={startNewPlot}
                                className="w-full py-4 bg-white border-2 border-[#4c7c44] border-dashed text-[#4c7c44] rounded-[2rem] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#f0fdf4] transition-all"
                            >
                                <PlusIcon size={18} />
                                เพิ่มเเปลงใหม่
                            </button>
                            <button
                                onClick={handleCalculateManualAllWrapper}
                                disabled={pendingManualPlots.length === 0}
                                className="w-full py-5 bg-[#4c7c44] text-white rounded-[2rem] font-bold text-sm shadow-xl shadow-[#4c7c44]/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale"
                            >
                                คำนวณคาร์บอน ({pendingManualPlots.length})
                                <ArrowRightIcon size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 1: MANUAL DRAW / SHP (EDIT/ADD VIEW) */}
                {step === 1 && (method === 'draw' || method === 'shp') && subStep === 'edit' && (() => {
                    const activePlot = selectedPlotId ? plots.find(p => p.id === selectedPlotId) : null;
                    const currentDisplayArea = selectedAreaRai || activePlot?.areaValue || 0;
                    const isExistingPlot = !!selectedPlotId;

                    return (
                        <div className="flex flex-col animate-fadeIn">
                            <div className="flex-1 overflow-auto space-y-6 pr-1 scrollbar-hide pb-6">
                                {(currentDisplayArea > 0 || isExistingPlot) ? (
                                    <div className="space-y-6 animate-fadeIn transition-all">
                                        <div className="p-10 bg-gradient-to-br from-[#4c7c44] to-[#3d6336] rounded-[2.5rem] shadow-xl text-center relative overflow-hidden group">
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-black text-white/50 uppercase tracking-[4px] mb-3 leading-none">{selectedAreaRai > 0 ? 'วาดพื้นที่ได้' : 'ขนาดพื้นที่เดิม'}</p>
                                                <h2 className="text-6xl font-black text-white tracking-tighter mb-2">
                                                    {currentDisplayArea.toFixed(2)}
                                                    <span className="text-xl text-white/40 font-medium ml-2 uppercase">Rai</span>
                                                </h2>
                                                <div className="flex flex-col gap-1 mt-4 pt-4 border-t border-white/10">
                                                    <p className="text-xs font-bold text-white/80 tracking-tight">{formatThaiArea(currentDisplayArea).thai}</p>
                                                </div>
                                            </div>
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.1] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                                                <MapPinIcon size={180} />
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">ชื่อเรียกเเปลงสวนยาง</p>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#2d4a27] placeholder-gray-300 focus:bg-white focus:border-[#4c7c44]/20 transition-all outline-none"
                                                        placeholder="ระบุชื่อเเปลง (เช่น แปลง A)"
                                                        value={plotName}
                                                        onChange={(e) => setPlotName(e.target.value)}
                                                    />
                                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                                        <PencilIcon size={16} />
                                                    </div>
                                                </div>

                                                <div className="space-y-2 pt-2">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">ชื่อเกษตรกร (Farmer Name)</p>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#2d4a27] placeholder-gray-300 focus:bg-white focus:border-[#4c7c44]/20 transition-all outline-none"
                                                            placeholder="ชื่อ-นามสกุล เจ้าของแปลง"
                                                            value={farmerName}
                                                            onChange={(e) => setFarmerName(e.target.value)}
                                                        />
                                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                                            <UserGroupIcon size={16} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
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
                                                            <option value="" disabled>กรุณากรอกปีที่ปลูก</option>
                                                            {yearsList.map(y => (
                                                                <option key={y} value={y}>{y}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                            <ChevronRightIcon size={16} className="rotate-90" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {plantingYear && (
                                                    <div className="flex items-center gap-3 p-4 bg-[#eef2e6] rounded-2xl border border-[#4c7c44]/10 animate-fadeIn">
                                                        <div className="w-10 h-10 rounded-xl bg-[#4c7c44] flex items-center justify-center text-white">
                                                            <TreeIcon size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">อายุต้นยางพารา</p>
                                                            <p className="text-sm font-bold text-[#2d4a27]">
                                                                {selectedAge} ปี
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">พันธุ์ยาง</p>
                                                    <div className="relative">
                                                        <select
                                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#2d4a27] focus:bg-white focus:border-[#4c7c44]/20 transition-all outline-none appearance-none"
                                                            value={rubberVariety}
                                                            onChange={(e) => setRubberVariety(e.target.value)}
                                                        >
                                                            <option value="" disabled>ระบุพันธุ์ยาง</option>
                                                            <option value="RRIM 600">RRIM 600 (ยอดนิยม)</option>
                                                            <option value="RRIT 251">RRIT 251</option>
                                                            <option value="PB 235">PB 235</option>
                                                            <option value="Unknown">ไม่ระบุ / อื่นๆ</option>
                                                        </select>
                                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                            <ChevronRightIcon size={16} className="rotate-90" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">วิธีการคำนวณ</p>
                                                    <div className="relative">
                                                        <select
                                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#2d4a27] focus:bg-white focus:border-[#4c7c44]/20 transition-all outline-none appearance-none"
                                                            value={calculationFormula}
                                                            onChange={(e) => setCalculationFormula(e.target.value)}
                                                        >
                                                            <option value="" disabled>เลือกวิธีการคำนวณคาร์บอน</option>
                                                            <option value="tgo">วิธีที่ 1: TGO (อบก.) - มาตรฐาน</option>
                                                            <option value="doa">วิธีที่ 2: DoA - แนะนำ</option>
                                                            <option value="research">วิธีที่ 3: งานวิจัย (Allometric)</option>
                                                        </select>
                                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                            <ChevronRightIcon size={16} className="rotate-90" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center py-10 mt-10">
                                        <div className="w-20 h-20 bg-[#eef2e6] rounded-full flex items-center justify-center text-[#4c7c44] mb-6 animate-pulse ring-8 ring-[#eef2e6]/50">
                                            <MapPinIcon size={40} />
                                        </div>
                                        <h3 className="text-xl font-bold text-[#2d4a27] mb-2">กำหนดพื้นที่แปลง</h3>
                                        <p className="text-xs text-gray-400 max-w-[200px] leading-relaxed">
                                            ใช้เครื่องมือวาดรูปบนแผนที่ เพื่อลากเส้นรอบขอบเขตแปลงยางพาราของคุณ
                                        </p>
                                    </div>
                                )}

                                <div className="mt-auto pt-4 flex gap-3">
                                    <button
                                        onClick={handleCancelEdit}
                                        className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-[2rem] font-bold text-sm hover:bg-gray-200 transition-all"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        onClick={handleSaveToList}
                                        disabled={currentDisplayArea <= 0 && !isExistingPlot}
                                        className="flex-[2] py-4 bg-[#4c7c44] text-white rounded-[2rem] font-bold text-sm shadow-xl shadow-[#4c7c44]/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale"
                                    >
                                        <CheckIcon size={18} />
                                        บันทึกข้อมูลแปลงนี้
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* STEP 1: SHP CONFIG (Unchanged mainly, but adapted) */}
                {
                    step === 1 && method === 'shp' && subStep === 'list' && (
                        <div className="flex flex-col animate-fadeIn">
                            <div className="p-5 bg-sky-50 border border-sky-100 rounded-3xl mb-6">
                                <p className="text-[10px] font-bold text-sky-700 leading-relaxed uppercase tracking-wide">
                                    <span className="text-sky-400 font-black text-xs mr-2">•</span>
                                    เลือกเเปลงที่ต้องการจากรายการและระบุปีที่ปลูก
                                </p>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">รายการเเปลง ({plots.filter(p => !p.isSaved).length})</h4>
                                <div className="flex items-center gap-2">
                                    <button className="text-[10px] font-bold text-gray-400 hover:text-[#4c7c44]" onClick={() => setShowShpInfo(true)}>
                                        <InformationCircleIcon size={16} />
                                    </button>
                                    <input type="file" ref={fileInputRef} className="hidden" accept=".zip" onChange={handleFileChange} />
                                    <button className="text-[10px] font-bold text-[#4c7c44] hover:underline" onClick={() => fileInputRef.current?.click()}>เปลี่ยนไฟล์</button>
                                </div>
                            </div>

                            {/* SHP Info Modal */}
                            {showShpInfo && (
                                <div className="fixed inset-0 z-[5000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-fadeIn cursor-pointer" onClick={() => setShowShpInfo(false)}>
                                    <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl max-w-sm w-full animate-scaleIn cursor-default" onClick={e => e.stopPropagation()}>
                                        <h4 className="text-xl font-black text-[#2d4a27] mb-4 tracking-tight">คำแนะนำการเตรียมไฟล์ SHP</h4>
                                        <div className="space-y-4 mb-8">
                                            <div className="flex items-start gap-4">
                                                <div className="w-2 h-2 rounded-full bg-[#4c7c44] mt-1.5 shrink-0" />
                                                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                                    ต้องเป็นไฟล์ <b className="text-[#2d4a27]">.zip</b> ที่รวมไฟล์ .shp, .shx, .dbf ไว้ข้างใน
                                                </p>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="w-2 h-2 rounded-full bg-[#4c7c44] mt-1.5 shrink-0" />
                                                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                                    ควรใช้ระบบพิกัด <b className="text-[#2d4a27]">WGS84 (EPSG:4326)</b>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t border-gray-50 flex justify-center">
                                            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest animate-pulse">แตะที่ใดก็ได้เพื่อปิด</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-gray-50 border border-gray-100 rounded-[2rem] mb-6 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-white border-b border-gray-100 sticky top-0 z-10">
                                        <tr>
                                            <th className="p-4 w-12 text-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const availablePlots = plots.filter(p => !p.isSaved && p.source === 'shp');
                                                        if (selectedPlotIds.length === availablePlots.length) {
                                                            setSelectedPlotIds([]);
                                                        } else {
                                                            setSelectedPlotIds(availablePlots.map(p => p.id));
                                                        }
                                                    }}
                                                    className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all mx-auto ${selectedPlotIds.length === plots.filter(p => !p.isSaved && p.source === 'shp').length && selectedPlotIds.length > 0 ? 'bg-[#4c7c44] border-[#4c7c44] shadow-sm' : 'border-gray-200'}`}
                                                >
                                                    {selectedPlotIds.length === plots.filter(p => !p.isSaved && p.source === 'shp').length && selectedPlotIds.length > 0 && <CheckIcon size={12} className="text-white" />}
                                                </button>
                                            </th>
                                            <th className="p-4 text-left text-[9px] font-bold text-gray-400 uppercase tracking-widest">ข้อมูลเเปลง</th>
                                            <th className="p-4 text-right text-[9px] font-bold text-gray-400 uppercase tracking-widest">ขนาดพื้นที่</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {plots.filter(p => !p.isSaved && p.source === 'shp').map((plot) => (
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
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase">อายุเฉลี่ย {plot.age} ปี</span>
                                                        {confirmedShpIds.includes(plot.id) && (
                                                            <>
                                                                <div className="w-1 h-1 rounded-full bg-green-300" />
                                                                <span className="text-[9px] font-bold text-[#4c7c44] uppercase flex items-center gap-1">
                                                                    <CheckIcon size={8} /> พร้อมประเมิน
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="font-bold text-sm text-[#2d4a27]">{plot.area}</div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="space-y-4 mb-8">
                                {/* Planting Year */}
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
                                            <option value="" disabled>กรุณากรอกปีที่ปลูก</option>
                                            {yearsList.map(y => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <ChevronRightIcon size={16} className="rotate-90" />
                                        </div>
                                    </div>
                                </div>

                                {/* Age Preview Card */}
                                {plantingYear && (
                                    <div className="flex items-center gap-3 p-4 bg-[#eef2e6] rounded-2xl border border-[#4c7c44]/10 animate-fadeIn">
                                        <div className="w-10 h-10 rounded-xl bg-[#4c7c44] flex items-center justify-center text-white">
                                            <TreeIcon size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">อายุต้นยางพารา</p>
                                            <p className="text-sm font-bold text-[#2d4a27]">
                                                {selectedAge} ปี (ทุกแปลง)
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Rubber Variety */}
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">พันธุ์ยาง</p>
                                    <div className="relative">
                                        <select
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#2d4a27] focus:bg-white focus:border-[#4c7c44]/20 transition-all outline-none appearance-none"
                                            value={rubberVariety}
                                            onChange={(e) => setRubberVariety(e.target.value)}
                                        >
                                            <option value="" disabled>ระบุพันธุ์ยาง</option>
                                            <option value="RRIM 600">RRIM 600 (ยอดนิยม)</option>
                                            <option value="RRIT 251">RRIT 251</option>
                                            <option value="PB 235">PB 235</option>
                                            <option value="Unknown">ไม่ระบุ / อื่นๆ</option>
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <ChevronRightIcon size={16} className="rotate-90" />
                                        </div>
                                    </div>
                                </div>

                                {/* Calculation Formula */}
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">วิธีการคำนวณ</p>
                                    <div className="relative">
                                        <select
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#2d4a27] focus:bg-white focus:border-[#4c7c44]/20 transition-all outline-none appearance-none"
                                            value={calculationFormula}
                                            onChange={(e) => setCalculationFormula(e.target.value)}
                                        >
                                            <option value="" disabled>เลือกวิธีคำนวณ</option>
                                            <option value="tgo">วิธีที่ 1: TGO (อบก.) - มาตรฐาน</option>
                                            <option value="doa">วิธีที่ 2: DoA - แนะนำ</option>
                                            <option value="research">วิธีที่ 3: งานวิจัย (Allometric)</option>
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <ChevronRightIcon size={16} className="rotate-90" />
                                        </div>
                                    </div>
                                </div>

                            </div>

                            <div className="space-y-3">
                                <button
                                    className="w-full py-5 bg-[#4c7c44] text-white rounded-[2rem] font-bold text-sm shadow-xl shadow-[#4c7c44]/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale"
                                    onClick={handleBulkCalculateShp}
                                    disabled={selectedPlotIds.length === 0}
                                >
                                    <CheckIcon size={20} />
                                    ยืนยันการตั้งค่า ({selectedPlotIds.length} เเปลง)
                                </button>

                                {confirmedShpIds.length > 0 && (
                                    <button
                                        className="w-full py-5 bg-white border-2 border-[#4c7c44] text-[#4c7c44] rounded-[2rem] font-bold text-sm shadow-sm flex items-center justify-center gap-3 active:scale-[0.98] transition-all hover:bg-[#f0fdf4]"
                                        onClick={goToShpSummary}
                                    >
                                        ตรวจสอบรายการ ({confirmedShpIds.length} แปลง)
                                        <ArrowRightIcon size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                }

                {/* STEP 2: SHP CONFIG SUMMARY */}
                {
                    step === 2 && method === 'shp' && (
                        <div className="flex flex-col animate-fadeIn">
                            {/* Summary Header */}
                            <div className="p-6 bg-[#f0f9ff] border border-sky-100 rounded-[2.5rem] mb-6">
                                <p className="text-sm font-bold text-sky-700 leading-relaxed">
                                    ตรวจสอบรายการและเลือกวิธีการคำนวณสำหรับแต่ละแปลง ({confirmedShpIds.length} แปลง)
                                </p>
                            </div>

                            {/* Plots Config List */}
                            <div className="space-y-4 mb-8">
                                {plots.filter(p => confirmedShpIds.includes(p.id)).map((plot, idx) => (
                                    <div key={plot.id} className="p-5 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600 border border-sky-100">
                                                    <MapPinIcon size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#2d4a27] leading-tight">{plot.name}</h4>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{plot.area}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => {
                                                        setOriginStep(2);
                                                        setStep(1);
                                                        startEditPlot(plot);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-[#4c7c44] hover:bg-green-50 rounded-full transition-colors"
                                                    title="แก้ไข"
                                                >
                                                    <PencilIcon size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setConfirmedShpIds(prev => prev.filter(id => id !== plot.id));
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                    title="ลบออกจากรายการ"
                                                >
                                                    <TrashIcon size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center flex-wrap gap-4 pl-1 pt-3 border-t border-gray-50 mt-1">
                                            <div className="flex items-center gap-1.5">
                                                <TreeIcon size={12} className="text-[#4c7c44]" />
                                                <span className="text-[10px] font-bold text-gray-500">อายุ {plot.age || '?'} ปี</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                                <span className="text-[10px] font-bold text-gray-500">{plot.year ? `ปีปลูก ${plot.year}` : 'ไม่ระบุปี'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 ml-auto">
                                                <span className="px-2.5 py-1 bg-[#4c7c44]/5 text-[#4c7c44] text-[9px] font-black rounded-lg uppercase tracking-tight">
                                                    {plot.calculationMethod === 'doa' ? 'วิธีที่ 2 (DoA)' : plot.calculationMethod === 'research' ? 'วิธีที่ 3 (Res.)' : 'วิธีที่ 1 (TGO)'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto space-y-3 pt-4 border-t border-gray-100 mb-6">
                                <button
                                    onClick={() => setStep(1)}
                                    className="w-full py-4 bg-white border-2 border-[#4c7c44] border-dashed text-[#4c7c44] rounded-[2rem] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#f0fdf4] transition-all"
                                >
                                    <PlusIcon size={18} />
                                    จัดการแปลงอื่นเพิ่ม
                                </button>
                                <button
                                    className="w-full py-5 bg-[#4c7c44] text-white rounded-[2rem] font-bold text-sm shadow-xl shadow-[#4c7c44]/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-30"
                                    onClick={startShpCalculation}
                                    disabled={confirmedShpIds.length === 0}
                                >
                                    เริ่มคำนวณคาร์บอน ({confirmedShpIds.length} แปลง)
                                    <ArrowRightIcon size={20} />
                                </button>
                            </div>
                        </div>
                    )
                }

                {/* STEP 2 or 3: RESULTS (Refined) */}
                {
                    ((step === 2 && method === 'draw') || (step === 3 && method === 'shp')) && (
                        <div className="flex flex-col h-full animate-fadeIn overflow-hidden pt-4">



                            <div className="flex-1 overflow-auto space-y-4 pr-1 scrollbar-hide mb-6">
                                {pendingManualPlots.length <= 1 && method === 'draw' ? (
                                    // Single plot detail view
                                    (() => {
                                        const plot = (method === 'draw' && pendingManualPlots.length === 0) ? null : pendingManualPlots[0];
                                        // If no plot found (shouldn't happen here due to logic), fallback
                                        if (!plot) return null;

                                        const estimatedAGB = plot.carbon ? (parseFloat(plot.carbon) / 0.47).toFixed(0) : 0;

                                        return (
                                            <div className="flex flex-col gap-6 animate-fadeIn pt-2">
                                                {/* 1. Header Card (Green Background) */}
                                                <div className="p-6 bg-[#dcfce7] border border-[#2d992c]/20 rounded-[2.5rem] text-center shadow-sm relative overflow-hidden">
                                                    <div className="relative z-10">
                                                        <h4 className="font-bold text-[#2d992c] text-lg mb-2">ชื่อแปลง : {plot.name}</h4>
                                                        <h2 className="text-3xl font-black text-[#2d4a27] tracking-tight mb-2">
                                                            {formatThaiArea(plot.areaValue).thai.replace(' ไร่', ' ไร่ ')}
                                                        </h2>
                                                        <p className="text-sm text-gray-500 font-medium">พื้นที่ของแปลงนี้ : {formatThaiArea(plot.areaValue).sqm}</p>
                                                    </div>
                                                </div>

                                                {/* 2. Main Carbon Stat */}
                                                <div className="flex items-center justify-center gap-6 py-2">
                                                    <div className="w-24 h-24 flex items-center justify-center relative">
                                                        <div className="absolute inset-0 bg-[#4c7c44]/5 blur-xl rounded-full"></div>
                                                        <CarbonIcon size={100} className="text-[#4c7c44] drop-shadow-sm relative z-10" />
                                                    </div>
                                                    <div className="flex flex-col justify-center">
                                                        <p className="text-xs font-bold text-gray-400 mb-1">วิธีที่ {plot.calculationMethod === 'doa' ? '2' : plot.calculationMethod === 'research' ? '3' : '1'}</p>
                                                        <h3 className="text-sm font-bold text-gray-600 mb-1">กักเก็บคาร์บอน (CARBON)</h3>
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-5xl font-black text-[#2d4a27] tracking-tighter">{parseFloat(plot.carbon || 0).toLocaleString()}</span>
                                                            <span className="text-lg font-bold text-gray-400">tCO₂e</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="h-px bg-gray-100 w-full"></div>

                                                {/* 3. Bottom Stats Grid (AGB & Age) */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-6 bg-gray-50 rounded-[2.5rem] text-center flex flex-col items-center hover:bg-gray-100 transition-colors">
                                                        <p className="text-xs font-bold text-gray-500 mb-2">มวลชีวภาพพื้นดิน (AGB)</p>
                                                        <div className="w-16 h-16 mb-2 text-[#5d4037] flex items-center justify-center">
                                                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                                                                <path d="M12 3L4 9V21H20V9L12 3ZM12 5.8L17.5 9.9V19H6.5V9.9L12 5.8Z" opacity="0.5" />
                                                                <path d="M2 13H22L12 5L2 13Z" />
                                                                <path d="M2 18C2 18 5 14 12 14C19 14 22 18 22 18H2Z" />
                                                            </svg>
                                                        </div>
                                                        <p className="text-xl font-black text-[#2d4a27]">{parseFloat(estimatedAGB).toLocaleString()} <span className="text-sm font-bold text-gray-400">ตัน</span></p>
                                                    </div>
                                                    <div className="p-6 bg-gray-50 rounded-[2.5rem] text-center flex flex-col items-center hover:bg-gray-100 transition-colors">
                                                        <p className="text-xs font-bold text-gray-500 mb-2">อายุต้นยางพารา</p>
                                                        <div className="w-16 h-16 mb-2 text-[#4c7c44] flex items-center justify-center">
                                                            <div className="flex text-[#4c7c44]">
                                                                <TreeIcon size={32} />
                                                                <TreeIcon size={24} className="-ml-1 mt-2" />
                                                            </div>
                                                        </div>
                                                        <p className="text-xl font-black text-[#2d4a27]">{plot.age} <span className="text-sm font-bold text-gray-400">ปี</span></p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })()
                                ) : (
                                    // List View for Multiple
                                    (method === 'draw' ? pendingManualPlots : plots.filter(p => confirmedShpIds.includes(p.id))).map(plot => {
                                        const estimatedAGB = plot.carbon ? (parseFloat(plot.carbon) / 0.47).toFixed(0) : 0;
                                        return (
                                            <div key={plot.id} className="p-6 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm mb-4 relative overflow-hidden">
                                                {/* Header */}
                                                <div className="text-center mb-6">
                                                    <h4 className="font-bold text-[#4c7c44] text-lg mb-1">ชื่อแปลง : {plot.name}</h4>
                                                    <h2 className="text-2xl font-black text-[#2d4a27] tracking-tight mb-1">
                                                        {formatThaiArea(plot.areaValue).thai.replace(' ไร่', ' ไร่ ')}
                                                    </h2>
                                                    <p className="text-sm text-gray-400 font-medium mb-1">พื้นที่ของแปลงนี้ : {formatThaiArea(plot.areaValue).sqm}</p>
                                                    <p className="text-sm text-gray-400 font-medium">วิธีการคำนวณ : {plot.calculationMethod === 'doa' ? 'วิธีที่ 2 (DoA)' : plot.calculationMethod === 'research' ? 'วิธีที่ 3 (Research)' : 'วิธีที่ 1 (TGO)'}</p>
                                                </div>

                                                <div className="h-px bg-gray-100 w-full mb-6"></div>

                                                {/* Grid Stats */}
                                                <div className="grid grid-cols-3 gap-2 text-center">
                                                    <div className="flex flex-col items-center justify-start gap-2">
                                                        <div className="w-12 h-12 flex items-center justify-center mb-1">
                                                            <CarbonIcon size={40} className="text-[#4c7c44]" />
                                                        </div>
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase">กักเก็บคาร์บอน (CARBON)</p>
                                                        <p className="text-sm font-black text-[#2d4a27]">{parseFloat(plot.carbon || 0).toLocaleString()} <span className="text-[10px] font-bold text-gray-400">tCO₂e</span></p>
                                                    </div>

                                                    <div className="flex flex-col items-center justify-start gap-2">
                                                        <div className="w-12 h-12 flex items-center justify-center mb-1 text-[#5d4037]">
                                                            {/* Mound/Soil Icon simulated with Layers or similar if unavailable, or just an svg path */}
                                                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                                                                <path d="M12 3L4 9V21H20V9L12 3ZM12 5.8L17.5 9.9V19H6.5V9.9L12 5.8Z" opacity="0.5" />
                                                                <path d="M2 13H22L12 5L2 13Z" />
                                                                {/* Simple hill shape */}
                                                                <path d="M2 18C2 18 5 14 12 14C19 14 22 18 22 18H2Z" />
                                                            </svg>
                                                        </div>
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase">มวลชีวภาพ (AGB)</p>
                                                        <p className="text-sm font-black text-[#2d4a27]">{parseFloat(estimatedAGB).toLocaleString()} <span className="text-[10px] font-bold text-gray-400">ตัน</span></p>
                                                    </div>

                                                    <div className="flex flex-col items-center justify-start gap-2">
                                                        <div className="w-12 h-12 flex items-center justify-center mb-1 text-[#4c7c44]">
                                                            {/* Forest/Trees Icon */}
                                                            <div className="flex text-[#4c7c44]">
                                                                <TreeIcon size={24} />
                                                                <TreeIcon size={18} className="-ml-1 mt-1" />
                                                                <TreeIcon size={20} className="-ml-1" />
                                                            </div>
                                                        </div>
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase">อายุยางพารา</p>
                                                        <p className="text-sm font-black text-[#2d4a27]">{plot.age} <span className="text-[10px] font-bold text-gray-400">ปี</span></p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>

                            <div className="flex flex-col gap-3 mt-4">
                                <button
                                    className="w-full py-5 bg-[#4c7c44] text-white rounded-[2rem] font-bold text-lg shadow-xl shadow-[#4c7c44]/20 flex items-center justify-center gap-3 transition-transform active:scale-95 hover:bg-[#3d6336]"
                                    onClick={() => setShowSummary(true)} // Open Summary Modal
                                >
                                    บันทึกข้อมูลเข้าสู่ระบบ
                                    <ArrowRightIcon size={24} />
                                </button>
                            </div>
                        </div>
                    )
                }

                {/* STEP 3 or 4: SUCCESS SCREEN (Simplified) */}
                {
                    ((step === 3 && method === 'draw') || (step === 4 && method === 'shp')) && (
                        <div className="flex flex-col animate-fadeIn pt-10 text-center">
                            <div className="w-24 h-24 bg-[#f0fdf4] text-[#2d992c] rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                                <CheckIcon size={48} strokeWidth={4} />
                            </div>
                            <h2 className="text-3xl font-black text-[#2d4a27] mb-4">บันทึกข้อมูลเรียบร้อย!</h2>
                            <p className="text-gray-500 mb-10 px-6">ข้อมูลแปลงยางพาราของคุณ จำนวน <span className="font-bold text-[#4c7c44]">{savedStats.count}</span> แปลง <br /> ถูกบันทึกเข้าสู่ระบบ KeptCarbon เรียบร้อยแล้ว</p>



                            <button
                                onClick={resetWorkflow}
                                className="w-full py-5 bg-[#4c7c44] text-white rounded-[2rem] font-bold text-lg shadow-xl shadow-[#4c7c44]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                ตกลงและกลับหน้าแผนที่
                            </button>
                        </div>
                    )
                }
            </div >

            {/* Support Watermark (Outside scroll) */}
            < div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none opacity-10" >
                <span className="text-[8px] font-black text-[#2d4a27] uppercase tracking-[10px]">KeptCarbon GIS Portal</span>
            </div >

            {/* Confirmation Popup (Pre-Save) */}
            {
                showSummary && (
                    <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-8 animate-fadeIn">
                        <div className="bg-white rounded-[3rem] w-full max-w-sm p-8 shadow-2xl animate-scaleIn flex flex-col items-center">
                            <div className="text-center mb-8">
                                <h3 className="text-[22px] font-black text-[#2d4a27] mb-1">ตรวจสอบรายการก่อนบันทึก</h3>
                                <p className="text-xs text-gray-400 font-medium">กรุณาตรวจสอบความถูกต้องของข้อมูล</p>
                            </div>

                            <div className="w-full space-y-4 mb-8 overflow-y-auto max-h-[50vh] pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                                {(method === 'draw' ? pendingManualPlots : plots.filter(p => confirmedShpIds.includes(p.id))).map((plot, i) => {
                                    const areaInfo = formatThaiArea(plot.areaValue);
                                    return (
                                        <div key={plot.id} className="p-5 bg-[#f8faf7] border border-[#eef2e6] rounded-[2.5rem] flex flex-col gap-4 relative group hover:bg-white hover:shadow-lg transition-all duration-300">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white border border-[#eef2e6] flex items-center justify-center text-[#2d4a27] font-black text-sm shadow-sm flex-shrink-0">
                                                    {i + 1}
                                                </div>
                                                <div className="flex-1 min-w-0 pr-8">
                                                    <h4 className="font-bold text-[#2d4a27] text-base truncate lowercase tracking-tight -mb-1">ชื่อเเปลง: {plot.name}</h4>
                                                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-tight">ชื่อเกษตรกร: {plot.farmerName || '-'}</p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setOriginStep(method === 'shp' ? 3 : 2); // Set origin to results
                                                        setShowSummary(false);
                                                        setStep(1);
                                                        startEditPlot(plot);
                                                    }}
                                                    className="absolute right-4 top-4 w-10 h-10 rounded-full bg-white border border-[#eef2e6] text-gray-300 hover:text-[#4c7c44] flex items-center justify-center shadow-sm transition-all active:scale-90"
                                                    title="แก้ไขรายการ"
                                                >
                                                    <PencilIcon size={16} />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#eef2e6]">
                                                <div className="space-y-0.5">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">คาร์บอน / อายุ</p>
                                                    <p className="text-[13px] font-black text-[#2d4a27]">{parseFloat(plot.carbon || 0).toLocaleString()} tCO₂e • {plot.age} ปี</p>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">พื้นที่ (ตร.ม.)</p>
                                                    <p className="text-[13px] font-black text-[#2d4a27]">{areaInfo.sqm}</p>
                                                </div>
                                                <div className="col-span-2 space-y-0.5">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">พื้นที่รายแปลง (ไทย)</p>
                                                    <p className="text-[13px] font-black text-[#2d4a27]">{areaInfo.thai}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="w-full flex gap-3">
                                <button
                                    onClick={() => setShowSummary(false)}
                                    className="flex-1 py-4 bg-[#f3f4f6] text-[#6b7280] rounded-[2rem] font-black text-sm hover:bg-gray-200 transition-all active:scale-95"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={handleFinalSync}
                                    className="flex-[2] py-4 bg-[#547c4c] text-white rounded-[2rem] font-black text-sm hover:bg-[#46683f] shadow-lg shadow-[#547c4c]/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    <CheckIcon size={18} strokeWidth={3} />
                                    ยืนยันการบันทึก
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    )
}

export default PlotSidebar
