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
import { provinceCoords } from '../../data/province-coords'
import geoData from '../../data/thailand-address.json'

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
    selectedPlotId,
    onLocationSelect,
    actionRequest,
    onActionHandled
}) => {
    // 1 = Start / Dashboard
    // 2 = Work (Draw/Form/List)
    // 3 = Calculation Results
    // 4 = Success
    const [step, setStep] = useState(1)
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

    // Geographic Data State (Using static import from thailand-address.json)
    const [availableProvinces, setAvailableProvinces] = useState([])
    const [availableAmphoes, setAvailableAmphoes] = useState([])
    const [availableTambons, setAvailableTambons] = useState([])

    // New: Address Search States
    const [selectedProvince, setSelectedProvince] = useState('')
    const [selectedAmphoe, setSelectedAmphoe] = useState('')
    const [selectedTambon, setSelectedTambon] = useState('')

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

    const activePlot = selectedPlotId ? plots.find(p => p.id === selectedPlotId) : null;
    const currentDisplayArea = selectedAreaRai || activePlot?.areaValue || 0;
    const isExistingPlot = !!selectedPlotId;

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

    // Initialize Geographic Data
    useEffect(() => {
        if (geoData.length > 0) {
            // Extract unique provinces
            const provinces = [...new Set(geoData.map(item => item.provinceNameTh))].sort();
            setAvailableProvinces(provinces);
        }
    }, []);

    // Filter Amphoes when Province changes
    useEffect(() => {
        if (selectedProvince && geoData.length > 0) {
            const filtered = geoData.filter(item => item.provinceNameTh === selectedProvince);
            const amphoes = [...new Set(filtered.map(item => item.districtNameTh))].sort();
            setAvailableAmphoes(amphoes);
        } else {
            setAvailableAmphoes([]);
        }
        setSelectedAmphoe('');
        setSelectedTambon('');
    }, [selectedProvince]);

    // Filter Tambons when Amphoe changes
    useEffect(() => {
        if (selectedAmphoe && selectedProvince && geoData.length > 0) {
            const filtered = geoData.filter(item =>
                item.provinceNameTh === selectedProvince &&
                item.districtNameTh === selectedAmphoe
            );
            const tambons = [...new Set(filtered.map(item => item.subdistrictNameTh))].sort();
            setAvailableTambons(tambons);
        } else {
            setAvailableTambons([]);
        }
        setSelectedTambon('');
    }, [selectedAmphoe, selectedProvince, geoData]);

    useEffect(() => {
        if (actionRequest) {
            if (actionRequest === 'draw') {
                handleStartManual()
            } else if (actionRequest === 'import') {
                handleStartShp()
            }
            if (onActionHandled) {
                onActionHandled()
            }
        }
    }, [actionRequest])

    const formatThaiArea = (raiValue) => {
        if (!raiValue || raiValue <= 0) return { rai: 0, ngan: 0, wah: 0, thai: "0 ไร่ 0 งาน 0 ตร.ว.", sqm: "0 ตร.ม." };
        const sqm = raiValue * 1600;
        const totalWah = sqm / 4;
        const rai = Math.floor(totalWah / 400);
        const remainsWah = totalWah % 400;
        const ngan = Math.floor(remainsWah / 100);
        const wah = (remainsWah % 100).toFixed(1);
        return {
            rai, ngan, wah,
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

    const handleLocationZoom = async (val, type) => {
        if (!onLocationSelect) return;

        let query = '';
        let zoomLevel = 13;

        if (type === 'province') {
            if (provinceCoords[val]) {
                onLocationSelect(provinceCoords[val], 10);
                return;
            }
            query = val;
            zoomLevel = 10;
        } else if (type === 'amphoe') {
            query = `อำเภอ${val}, จังหวัด${selectedProvince}, Thailand`;
            zoomLevel = 13;
        } else if (type === 'tambon') {
            query = `ตำบล${val}, อำเภอ${selectedAmphoe}, จังหวัด${selectedProvince}, Thailand`;
            zoomLevel = 15;
        }

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
            const data = await response.json();
            if (data && data[0]) {
                onLocationSelect([parseFloat(data[0].lat), parseFloat(data[0].lon)], zoomLevel);
            }
        } catch (error) {
            console.error("Zoom failed", error);
        }
    };

    const resetWorkflow = () => {
        setStep(1)
        setMethod(null)
        setSubStep('list')
        setPlotName('')
        setPlantingYear('')
        setFarmerName('')
        setSelectedPlotIds([])
        setConfirmedShpIds([])
        setSelectedProvince('')
        setSelectedAmphoe('')
        setSelectedTambon('')
        setIsCollapsed(false)
        if (onDrawingStepChange) onDrawingStepChange('idle')
    }

    const handleStartManual = () => {
        setMethod('draw')
        setStep(2)
        setCalculationFormula('')
        startNewPlot(true)
    }

    const startNewPlot = (immediatelyDigitize = false) => {
        setSubStep('edit')
        setPlotName('')
        setFarmerName('')
        setPlantingYear('')
        setSelectedAge(0)
        setRubberVariety('')
        setCalculationFormula('')
        setSelectedProvince('')
        setSelectedAmphoe('')
        setSelectedTambon('')

        if (onPlotSelect) onPlotSelect({ id: null })

        if (immediatelyDigitize) {
            if (onDrawingStepChange) onDrawingStepChange('drawing')
            setIsCollapsed(true)
        } else {
            setIsCollapsed(false)
            if (onDrawingStepChange) onDrawingStepChange('idle')
        }
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

        if (originStep === 3) {
            setStep(3);
            setOriginStep(null);
        } else {
            setSubStep('list');
        }
    }

    const handleStartShp = () => {
        setMethod('shp')
        setStep(2)
        setSubStep('list')
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
            setSubStep('summary');
        }
    }

    const startShpCalculation = async () => {
        if (onBulkCalculate && confirmedShpIds.length > 0) {
            await onBulkCalculate(confirmedShpIds, null, null, null, null)
            setStep(3) // Move to results
        }
    }

    const handleShpFinalSync = async () => {
        // Apply Global settings before calculation if not already done
        if (onUpdateTempPlot && selectedPlotIds.length > 0) {
            const updateObj = {
                year: plantingYear ? parseInt(plantingYear) : null,
                age: selectedAge,
                variety: rubberVariety || 'Unknown',
                calculationMethod: calculationFormula || 'tgo'
            };

            for (const id of selectedPlotIds) {
                onUpdateTempPlot(id, updateObj);
            }
        }

        if (onBulkCalculate && selectedPlotIds.length > 0) {
            await onBulkCalculate(selectedPlotIds, calculationFormula, rubberVariety, parseInt(plantingYear), selectedAge);
            setStep(3); // Result Step
        }
    }

    const handleCalculateManualAllWrapper = async () => {
        if (onBulkCalculate && pendingManualPlots.length > 0) {
            const ids = pendingManualPlots.map(p => p.id);
            // Pass null for method override so it uses each plot's own calculationMethod
            await onBulkCalculate(ids, null, null, null, null);
            setStep(3);
        }
    }

    const handleFinalSync = async () => {
        if (!onSaveAll) return;

        const plotsToSave = method === 'draw'
            ? pendingManualPlots
            : plots.filter(p => confirmedShpIds.includes(p.id));

        const ids = plotsToSave.map(p => p.id);

        const totalArea = plotsToSave.reduce((sum, p) => sum + (parseFloat(p.areaValue) || 0), 0);
        const totalCarbon = plotsToSave.reduce((sum, p) => sum + (parseFloat(p.carbon) || 0), 0);

        setSavedStats({
            count: ids.length,
            area: totalArea,
            carbon: totalCarbon
        });

        await onSaveAll(ids);
        setShowSummary(false);
        setStep(4); // Final success step for both
    }

    const handleBack = () => {
        if (originStep) {
            setStep(originStep);
            setOriginStep(null);
            return;
        }

        if (step === 1 && subStep === 'edit') {
            setSubStep('list');
            if (onDrawingStepChange) onDrawingStepChange('idle');
            return;
        }

        if (step === 2) {
            if (subStep === 'summary') {
                setSubStep('list');
                return;
            }
            if (subStep === 'edit') {
                setSubStep('list');
                if (onDrawingStepChange) onDrawingStepChange('idle');
                return;
            }
            setStep(1);
            setMethod(null);
            return;
        }

        if (step === 3) {
            setStep(2);
            if (method === 'shp') setSubStep('summary');
            else setSubStep('list');
            return;
        }

        if (step > 1) setStep(step - 1);
    }

    return (
        <div
            className={`transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] h-full w-full pointer-events-none flex flex-col justify-end lg:justify-center lg:items-end`}
        >
            <div
                className={`w-full lg:w-[420px] bg-white/95 backdrop-blur-2xl h-[80vh] lg:h-[90vh] shadow-[0_30px_100px_rgba(0,0,0,0.12)] flex flex-col border border-white/40 lg:rounded-[3rem] rounded-t-[3rem] overflow-hidden pointer-events-auto transform transition-all duration-700
                    ${isCollapsed ? 'translate-y-[85%] lg:translate-y-0 lg:translate-x-[90%]' : 'translate-y-0 lg:translate-x-0'}
                `}
            >
                {/* Drag Handle & Toggle */}
                <div
                    className="w-full flex flex-col items-center py-4 cursor-pointer group"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full group-hover:bg-emerald-300 transition-colors"></div>
                    <div className="mt-2 text-[8px] font-black text-slate-300 uppercase tracking-[3px] opacity-0 group-hover:opacity-100 transition-opacity">
                        {isCollapsed ? 'ขยายหน้าจอ' : 'ย่อหน้าจอ'}
                    </div>
                </div>
                {/* Top Action UI */}
                <div className="absolute right-8 top-10 z-20 flex items-center gap-2">
                    {step > 0 && (
                        <button
                            onClick={resetWorkflow}
                            className="w-10 h-10 bg-slate-100/50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-[1.2rem] flex items-center justify-center transition-all active:scale-90"
                            title="ยกเลิก"
                        >
                            <PlusIcon size={20} className="rotate-45" />
                        </button>
                    )}
                </div>

                {/* Header Section */}
                <div className="px-8 lg:px-10 pt-4 pb-8 border-b border-slate-50">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[3px] px-2.5 py-1 rounded-lg bg-emerald-50">
                                    STEP 0{step}
                                </span>
                                {step > 1 && (
                                    <button
                                        onClick={handleBack}
                                        className="text-[9px] font-bold text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-1 group"
                                    >
                                        <ChevronRightIcon size={14} className="rotate-180 transition-transform group-hover:-translate-x-0.5" />
                                        ย้อนกลับ
                                    </button>
                                )}
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight">
                                {step === 1 && "เริ่มต้นใช้งาน"}
                                {step === 2 && method === 'draw' && (subStep === 'edit' && !selectedAreaRai && !selectedPlotId ? "วาดแปลง" : (subStep === 'list' ? "รายการแปลง" : "ลงทะเบียนแปลง"))}
                                {step === 2 && method === 'shp' && (subStep === 'summary' ? "สรุปรายการ SHP" : "เลือกเเปลงที่นำเข้า")}
                                {step === 3 && "สรุปผลการประเมิน"}
                                {step === 4 && "บันทึกข้อมูล"}
                            </h2>
                        </div>

                        {/* 4-Segment Progress Bar */}
                        <div className="flex gap-2 h-1.5">
                            {[1, 2, 3, 4].map((s) => (
                                <div
                                    key={s}
                                    className={`h-full flex-1 rounded-full transition-all duration-700 ${step >= s ? 'bg-emerald-600' : 'bg-slate-100'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="px-6 lg:px-10 pt-6 flex-1 flex flex-col overflow-y-auto overflow-x-hidden pb-24 lg:pb-10">

                    {/* STEP 1: START / DASHBOARD */}
                    {step === 1 && (
                        <div className="flex flex-col h-full animate-fadeIn overflow-hidden">
                            <div className="space-y-4 mb-10">
                                {/* Add New Plot Button */}
                                <button
                                    onClick={handleStartManual}
                                    className="w-full p-6 bg-emerald-600 rounded-[2.5rem] flex items-center gap-6 shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-left group"
                                >
                                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white shrink-0 group-hover:rotate-90 transition-transform duration-500">
                                        <PlusIcon size={32} strokeWidth={3} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white leading-tight">เพิ่มเเปลงใหม่ (วาดเอง)</h3>
                                        <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-widest mt-1 opacity-70">กดเพื่อเริ่มวาดเเปลงบนเเผนที่</p>
                                    </div>
                                </button>

                                {/* Import SHP Button */}
                                <button
                                    onClick={handleStartShp}
                                    className="w-full p-6 bg-white border border-slate-100 rounded-[2.5rem] flex items-center gap-6 shadow-xl shadow-slate-200/50 hover:scale-[1.02] active:scale-[0.98] transition-all text-left group"
                                >
                                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 shrink-0 group-hover:-translate-y-1 transition-transform">
                                        <UploadIcon size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 leading-tight">นำเข้าไฟล์ SHP</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-70">กดเพื่อใช้ฐานข้อมูลใน Shapefile</p>
                                    </div>
                                </button>
                            </div>

                            {/* Saved Plots List */}
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="flex justify-between items-center mb-6 px-2">
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2">
                                        เเปลงที่บันทึกเเล้ว • ({plots.filter(p => p.isSaved).length})
                                    </h3>
                                    {plots.filter(p => p.isSaved).length > 0 && (
                                        <button
                                            onClick={() => onDeleteAll('saved')}
                                            className="text-[10px] font-black text-white bg-red-400 px-4 py-1.5 rounded-full hover:bg-red-500 transition-all shadow-lg shadow-red-500/20"
                                        >
                                            ลบทั้งหมด
                                        </button>
                                    )}
                                </div>
                                <div className="flex-1 overflow-auto space-y-4 pr-1 scrollbar-hide pb-10">
                                    {plots.filter(p => p.isSaved).length === 0 ? (
                                        <div className="py-20 text-center bg-slate-50 border border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-200 shadow-sm">
                                                <LeafIcon size={40} />
                                            </div>
                                            <p className="text-[11px] font-black text-slate-300 uppercase tracking-[3px]">ยังไม่มีข้อมูลเเปลงยาง</p>
                                        </div>
                                    ) : (
                                        plots.filter(p => p.isSaved).map((plot) => {
                                            const areaInfo = formatThaiArea(plot.areaValue);
                                            return (
                                                <div key={plot.id} className="p-6 bg-white border border-slate-50 rounded-[2.5rem] flex items-center gap-5 relative group hover:shadow-xl hover:shadow-emerald-500/5 transition-all border-l-8 border-emerald-500 shadow-sm animate-fadeIn">
                                                    <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600 shadow-inner">
                                                        <LeafIcon size={28} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <h4 className="font-black text-slate-800 text-lg truncate tracking-tight">{plot.name}</h4>
                                                            <span className="text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest bg-emerald-500 text-white shadow-sm">SAVED</span>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4">
                                                            <div className="flex items-center gap-1.5">
                                                                <p className="text-[12px] text-slate-500 font-bold">{areaInfo.rai} ไร่ {areaInfo.ngan} งาน {areaInfo.wah} ตร.ว.</p>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <p className="text-[12px] text-slate-500 font-bold">อายุ {plot.age || '-'} ปี</p>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <p className="text-[12px] text-emerald-600 font-black tracking-tight">{plot.carbon || '-'} tCO₂e</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 mt-2 opacity-40">
                                                            <MapPinIcon size={12} className="text-slate-400" />
                                                            <p className="text-[10px] text-slate-500 font-bold tracking-tight">พิกัด: {plot.center?.lat?.toFixed(4)}, {plot.center?.lng?.toFixed(4)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setMethod(plot.source === 'shp' ? 'shp' : 'draw');
                                                                setStep(2);
                                                                startEditPlot(plot);
                                                            }}
                                                            className="p-3 bg-slate-50 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-2xl transition-all shadow-sm"
                                                        >
                                                            <PencilIcon size={18} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeletePlot(plot.id);
                                                            }}
                                                            className="p-3 bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all shadow-sm"
                                                        >
                                                            <TrashIcon size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: MANUAL DRAW (LIST VIEW) */}
                    {step === 2 && method === 'draw' && subStep === 'list' && (
                        <div className="flex flex-col h-full animate-fadeIn overflow-hidden">
                            <div className="flex-1 overflow-auto space-y-4 pr-1 scrollbar-hide mb-6">
                                {pendingManualPlots.length === 0 ? (
                                    <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center gap-5">
                                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-200 shadow-sm">
                                            <MapPinIcon size={40} />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-300 uppercase tracking-[3px] text-xs">ยังไม่มีรายการ</p>
                                            <button onClick={startNewPlot} className="mt-4 px-8 py-2 bg-emerald-600 text-white font-black rounded-full text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20">
                                                เริ่มวาดเเปลง
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    pendingManualPlots.map(plot => (
                                        <div key={plot.id} className="p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow relative group animate-fadeIn">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                                                        <MapPinIcon size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-slate-800 text-lg leading-tight tracking-tight">{plot.name}</h4>
                                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{plot.area} • ({formatThaiArea(plot.areaValue).sqm})</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => startEditPlot(plot)}
                                                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                                    >
                                                        <PencilIcon size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => onDeletePlot(plot.id)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                    >
                                                        <TrashIcon size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 pl-1 pt-3 border-t border-slate-50 mt-3">
                                                <div className="flex items-center gap-1.5">
                                                    <TreeIcon size={12} className="text-emerald-600" />
                                                    <span className="text-[11px] font-bold text-slate-500">อายุ {plot.age || '?'} ปี</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                                                    <span className="text-[11px] font-bold text-slate-500">ปลูกปี {plot.year || plot.plantingYear || '-'}</span>
                                                </div>
                                                <div className="ml-auto">
                                                    <span className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[9px] font-black rounded-lg uppercase tracking-tight">
                                                        วิธีที่ {plot.calculationMethod === 'doa' ? '2' : plot.calculationMethod === 'research' ? '3' : '1'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-auto space-y-4 pt-4 border-t border-slate-100 mb-6">
                                <button
                                    onClick={startNewPlot}
                                    className="w-full py-5 bg-white border-2 border-emerald-600 border-dashed text-emerald-600 rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 hover:bg-emerald-50 transition-all active:scale-[0.98]"
                                >
                                    <PlusIcon size={20} strokeWidth={3} />
                                    เพิ่มเเปลงใหม่
                                </button>
                                <button
                                    onClick={handleCalculateManualAllWrapper}
                                    disabled={pendingManualPlots.length === 0}
                                    className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-4 active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale"
                                >
                                    เริ่มการคำนวณคาร์บอน ({pendingManualPlots.length})
                                    <ArrowRightIcon size={20} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: MANUAL DRAW / SHP (EDIT/ADD VIEW) */}
                    {step === 2 && (method === 'draw' || method === 'shp') && subStep === 'edit' && (
                        <div className="flex flex-col h-full animate-fadeIn overflow-hidden">
                            <div className="flex-1 overflow-auto pr-1 scrollbar-hide pb-6">
                                {/* Instruction Screen (If no area and not editing existing) */}
                                {currentDisplayArea <= 0 && !isExistingPlot ? (
                                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-8 animate-fadeIn">
                                        <div className="relative">
                                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                                <MapPinIcon size={48} />
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg animate-bounce">
                                                <PlusIcon size={20} strokeWidth={3} />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">กรุณาวาดพื้นที่บนเเผนที่</h4>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-[2px] leading-relaxed px-10">ใช้เครื่องมือวาดรูปบนเเผนที่ เพื่อลากเส้นรอบขอบเขตเเปลงยางพาราของคุณ</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (onDrawingStepChange) onDrawingStepChange('drawing');
                                                setIsCollapsed(true);
                                            }}
                                            className="px-10 py-4 bg-emerald-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                        >
                                            เริ่มวาดเเปลง
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Area Result Card */}
                                        <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-[2.5rem] text-center relative overflow-hidden group mb-8 shadow-inner shadow-emerald-500/5 transition-all">
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[3px] mb-3 leading-none opacity-60">คำนวณพื้นที่ได้</p>
                                            <h2 className="text-5xl font-black text-slate-800 tracking-tighter mb-2">
                                                {currentDisplayArea.toFixed(2)}
                                                <span className="text-lg text-emerald-600 font-bold ml-2">ไร่</span>
                                            </h2>
                                            <div className="mt-4 pt-4 border-t border-emerald-100/50 uppercase font-black text-[11px] text-slate-400 tracking-[2px]">
                                                {formatThaiArea(currentDisplayArea).thai}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (onDrawingStepChange) onDrawingStepChange('drawing');
                                                    setIsCollapsed(true);
                                                }}
                                                className="absolute top-4 right-4 p-2.5 bg-white hover:bg-emerald-600 hover:text-white rounded-2xl text-emerald-600 border border-emerald-100 transition-all active:scale-95 shadow-sm"
                                                title="วาดใหม่"
                                            >
                                                <PencilIcon size={16} />
                                            </button>
                                        </div>

                                        {/* Form Fields */}
                                        <div className="space-y-6 px-1">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">ชื่อเรียกแปลงสวนยาง</p>
                                                <input
                                                    type="text"
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200/50 rounded-2xl text-sm font-bold text-slate-800 focus:bg-white focus:border-emerald-500/30 outline-none transition-all placeholder-slate-300"
                                                    placeholder="ระบุชื่อเเปลง (เช่น เเปลงที่ 1)"
                                                    value={plotName}
                                                    onChange={(e) => setPlotName(e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">ชื่อเกษตรกร</p>
                                                <input
                                                    type="text"
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200/50 rounded-2xl text-sm font-bold text-slate-800 focus:bg-white focus:border-emerald-500/30 outline-none transition-all placeholder-slate-300"
                                                    placeholder="ชื่อ-นามสกุล เจ้าของแปลง"
                                                    value={farmerName}
                                                    onChange={(e) => setFarmerName(e.target.value)}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">ปีที่เริ่มปลูก (พ.ศ.)</p>
                                                    <div className="relative">
                                                        <select
                                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200/50 rounded-2xl text-sm font-bold text-slate-800 appearance-none focus:bg-white focus:border-emerald-500/30 outline-none transition-all"
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
                                                            <option value="" disabled>กรุณาเลือกปี</option>
                                                            {yearsList.map(y => <option key={y} value={y}>{y}</option>)}
                                                        </select>
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                                                            <ChevronRightIcon size={14} className="rotate-90" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">อายุ (ปี)</p>
                                                    <div className="w-full py-4 bg-emerald-50 border border-emerald-500/10 rounded-2xl text-sm font-black text-emerald-600 text-center shadow-inner">
                                                        {selectedAge || '-'} ปี
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">พันธุ์ยาง</p>
                                                <div className="relative">
                                                    <select
                                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200/50 rounded-2xl text-sm font-bold text-slate-800 appearance-none focus:bg-white focus:border-emerald-500/30 outline-none transition-all"
                                                        value={rubberVariety}
                                                        onChange={(e) => setRubberVariety(e.target.value)}
                                                    >
                                                        <option value="" disabled>ระบุพันธุ์ยาง</option>
                                                        <option value="RRIM 600">RRIM 600 (ยอดนิยม)</option>
                                                        <option value="RRIT 251">RRIT 251</option>
                                                        <option value="PB 235">PB 235</option>
                                                        <option value="Unknown">ไม่ระบุ / อื่นๆ</option>
                                                    </select>
                                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                                                        <ChevronRightIcon size={16} className="rotate-90" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">วิธีการคำนวณ</p>
                                                <div className="relative">
                                                    <select
                                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200/50 rounded-2xl text-sm font-bold text-slate-800 appearance-none focus:bg-white focus:border-emerald-500/30 outline-none transition-all"
                                                        value={calculationFormula}
                                                        onChange={(e) => setCalculationFormula(e.target.value)}
                                                    >
                                                        <option value="" disabled>กรุณาเลือกวิธีคำนวณ</option>
                                                        <option value="tgo">วิธีที่ 1: TGO (อบก.) - มาตรฐาน</option>
                                                        <option value="doa">วิธีที่ 2: DoA - แนะนำ</option>
                                                        <option value="research">วิธีที่ 3: งานวิจัย (Allometric)</option>
                                                    </select>
                                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                                                        <ChevronRightIcon size={16} className="rotate-90" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4 mb-6">
                                <button
                                    onClick={handleSaveToList}
                                    disabled={currentDisplayArea <= 0 && !isExistingPlot}
                                    className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-sm shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3"
                                >
                                    บันทึกข้อมูลแปลงนี้
                                    <ArrowRightIcon size={20} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: SHP CONFIG */}
                    {step === 2 && method === 'shp' && subStep === 'list' && (
                        <div className="flex flex-col h-full animate-fadeIn overflow-hidden">
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="mb-6 space-y-4">
                                    <input
                                        type="file"
                                        accept=".zip,.shp,.dbf,.shx"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`w-full p-8 rounded-[2.5rem] border-2 border-dashed transition-all flex flex-col items-center gap-4 group
                                            ${shpFileName ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:border-emerald-300'}
                                        `}
                                    >
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors
                                            ${shpFileName ? 'bg-emerald-600 text-white' : 'bg-white text-slate-300 group-hover:text-emerald-500'}
                                        `}>
                                            <UploadIcon size={32} />
                                        </div>
                                        <div className="text-center">
                                            <p className={`font-black text-sm tracking-tight ${shpFileName ? 'text-emerald-700' : 'text-slate-500'}`}>
                                                {shpFileName || 'เลือกไฟล์ Shapefile (.zip)'}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                                {shpFileName ? 'คลิกเพื่อเปลี่ยนไฟล์' : 'รองรับรูปแบบ ZIP, SHP, DBF'}
                                            </p>
                                        </div>
                                    </button>
                                </div>


                                {shpError && (
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-[11px] font-bold flex items-center gap-2 animate-shake">
                                        <div className="shrink-0"><PlusIcon size={14} className="rotate-45" /></div>
                                        {shpError}
                                    </div>
                                )}

                                {shpPlots.length > 0 && (
                                    <>
                                        <div className="flex justify-between items-center mb-4 px-2">
                                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">พบพิกัดเเปลง ({shpPlots.length})</h3>
                                            <button
                                                onClick={() => {
                                                    const allIds = shpPlots.map(p => p.id);
                                                    setSelectedPlotIds(selectedPlotIds.length === shpPlots.length ? [] : allIds);
                                                }}
                                                className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 transition-colors"
                                            >
                                                {selectedPlotIds.length === shpPlots.length ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
                                            </button>
                                        </div>
                                        <div className="flex-1 overflow-auto space-y-3 pr-1 scrollbar-hide pb-6">
                                            {shpPlots.map((plot) => (
                                                <div
                                                    key={plot.id}
                                                    onClick={() => {
                                                        const exists = selectedPlotIds.includes(plot.id);
                                                        setSelectedPlotIds(exists ? selectedPlotIds.filter(id => id !== plot.id) : [...selectedPlotIds, plot.id]);
                                                    }}
                                                    className={`p-5 rounded-[2rem] border transition-all cursor-pointer flex items-center gap-4 group
                                                        ${selectedPlotIds.includes(plot.id)
                                                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                                            : 'bg-white border-slate-100 text-slate-600 hover:border-emerald-200'}
                                                    `}
                                                >
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors
                                                        ${selectedPlotIds.includes(plot.id) ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'}
                                                    `}>
                                                        <MapPinIcon size={20} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className={`font-black tracking-tight transition-colors ${selectedPlotIds.includes(plot.id) ? 'text-white' : 'text-slate-800'}`}>
                                                            {plot.name || `เเปลงพิกัดที่ ${plot.id}`}
                                                        </h4>
                                                        <p className={`text-[10px] font-bold transition-colors ${selectedPlotIds.includes(plot.id) ? 'text-emerald-100' : 'text-slate-400'}`}>
                                                            พื้นที่ {plot.area}
                                                        </p>
                                                    </div>
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                                        ${selectedPlotIds.includes(plot.id) ? 'border-white bg-white text-emerald-600' : 'border-slate-200'}
                                                    `}>
                                                        {selectedPlotIds.includes(plot.id) && <PlusIcon size={14} strokeWidth={4} />}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="mt-auto pt-6 border-t border-slate-100 mb-6">
                                <button
                                    onClick={() => setSubStep('summary')}
                                    disabled={selectedPlotIds.length === 0}
                                    className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-sm shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3"
                                >
                                    ตั้งค่าเเละตรวจสอบ ({selectedPlotIds.length})
                                    <ArrowRightIcon size={20} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && method === 'shp' && subStep === 'summary' && (
                        <div className="flex flex-col h-full animate-fadeIn overflow-hidden">
                            <div className="flex-1 overflow-auto pr-1 scrollbar-hide pb-6">
                                <div className="space-y-6">
                                    {/* Global Config for SHP */}
                                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] space-y-5 shadow-inner">
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 leading-none">ตั้งค่าพื้นฐานสำหรับทุกเเปลงที่เลือก</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-bold text-slate-500 pl-1 text-[9px] uppercase tracking-wide">ปีที่เริ่มปลูก (พ.ศ.)</p>
                                                    <select
                                                        className="w-full px-4 py-3 bg-white border border-slate-200/50 rounded-2xl text-[13px] font-black text-slate-800 focus:border-emerald-500/30 outline-none transition-all"
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
                                                        <option value="" disabled>เลือกปี</option>
                                                        {yearsList.map(y => <option key={y} value={y}>{y}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-bold text-slate-500 pl-1 text-[9px] uppercase tracking-wide">อายุเเปลงกลาง</p>
                                                    <div className="w-full py-3 bg-emerald-50 text-emerald-600 text-[13px] font-black rounded-2xl text-center">
                                                        {selectedAge || '-'} ปี
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-[10px] font-bold text-slate-500 pl-1 text-[9px] uppercase tracking-wide">วิธีการคำนวณ</p>
                                                <select
                                                    className="w-full px-5 py-3 bg-white border border-slate-200/50 rounded-2xl text-[13px] font-black text-slate-800 focus:border-emerald-500/30 outline-none transition-all"
                                                    value={calculationFormula}
                                                    onChange={(e) => setCalculationFormula(e.target.value)}
                                                >
                                                    <option value="" disabled>เลือกวิธีคำนวณ</option>
                                                    <option value="tgo">วิธีที่ 1: TGO (อบก.)</option>
                                                    <option value="doa">วิธีที่ 2: DoA (แนะนำ)</option>
                                                    <option value="research">วิธีที่ 3: งานวิจัย (Allometric)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Selected Plots Summary */}
                                    <div className="space-y-4">
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">สรุปรายการเเปลง ({selectedPlotIds.length})</h3>
                                        <div className="space-y-3">
                                            {shpPlots.filter(p => selectedPlotIds.includes(p.id)).map((plot) => (
                                                <div key={plot.id} className="p-5 bg-white border border-slate-50 rounded-[2rem] flex items-center justify-between group hover:border-emerald-500/20 transition-all shadow-sm animate-fadeIn">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                                                            <LeafIcon size={20} />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-slate-800 text-sm tracking-tight">{plot.name || `เเปลงที่ ${plot.id}`}</h4>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">พื้นที่: {plot.area}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedPlotIds(selectedPlotIds.filter(id => id !== plot.id));
                                                        }}
                                                        className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <TrashIcon size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto pt-6 border-t border-slate-100 flex gap-4 mb-6">
                                <button
                                    onClick={() => setSubStep('list')}
                                    className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-[2rem] font-black text-sm hover:bg-slate-200 transition-all active:scale-95"
                                >
                                    ย้อนกลับ
                                </button>
                                <button
                                    onClick={handleShpFinalSync}
                                    disabled={!plantingYear || !calculationFormula}
                                    className="flex-[2] py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-sm shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3"
                                >
                                    ยืนยันเเละคำนวณ
                                    <ArrowRightIcon size={20} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: RESULTS (Refined) */}
                    {
                        step === 3 && (
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

                    {/* STEP 3: SUCCESS SCREEN (Simplified) */}
                    {
                        step === 4 && (
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
                </div>
                {/* Confirmation Popup (Pre-Save) */}
                {showSummary && (
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
                )}
            </div>
        </div>
    );
};

export default PlotSidebar;
