import React, { useState } from 'react'
import { Button, Input } from '../atoms'
import { PlotListItem } from '../molecules'
import { PlusIcon, LeafIcon } from '../atoms/Icons'

const PlotSidebar = ({
    plots = [],
    onPlotSelect,
    onSavePlot,
    onCalculate,
    calculationResult,
    selectedAreaRai = 0
}) => {
    const [plotName, setPlotName] = useState('')
    const [plantingYear, setPlantingYear] = useState('')

    // Calculate Age
    const currentYear = new Date().getFullYear();
    const treeAge = plantingYear ? currentYear - parseInt(plantingYear) : 0;

    const handleCalculate = () => {
        if (onCalculate && plantingYear && selectedAreaRai > 0) {
            onCalculate(treeAge, selectedAreaRai)
        }
    }

    const handleSave = () => {
        if (onSavePlot && plotName && plantingYear) {
            onSavePlot({
                name: plotName,
                year: plantingYear,
                area: selectedAreaRai,
                carbonData: calculationResult
            })
            setPlotName('')
            setPlantingYear('')
        }
    }

    return (
        <div className="w-[360px] bg-white rounded-2xl shadow-card p-6 overflow-y-auto flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">รายการแปลง</h2>
                <button className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#3cc2cf]/30">
                    <PlusIcon size={20} />
                </button>
            </div>

            {/* Plots List */}
            <div className="space-y-3 mb-6 flex-1 overflow-y-auto min-h-[150px]">
                {plots.length === 0 ? (
                    <div className="text-center text-gray-400 py-4 text-sm">ยังไม่มีแปลงที่บันทึก</div>
                ) : (
                    plots.map((plot) => (
                        <PlotListItem
                            key={plot.id}
                            name={plot.name}
                            area={plot.area}
                            year={plot.year}
                            age={plot.age} // Pass age
                            carbon={plot.carbon}
                            status={plot.status}
                            onClick={() => onPlotSelect && onPlotSelect(plot)}
                        />
                    ))
                )}
            </div>

            {/* Assessment Form */}
            <div className="pt-6 border-t border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <LeafIcon className="text-[#3cc2cf]" size={18} />
                    ประเมินแปลงใหม่
                </h3>

                <div className="space-y-4">
                    <Input
                        label="ชื่อแปลง"
                        placeholder="กรอกชื่อแปลง"
                        value={plotName}
                        onChange={(e) => setPlotName(e.target.value)}
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="ปีที่ปลูก (ค.ศ.)"
                            type="number"
                            placeholder="เช่น 2015"
                            value={plantingYear}
                            onChange={(e) => setPlantingYear(e.target.value)}
                        />
                        <div className="mt-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">อายุต้นยาง</label>
                            <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600">
                                {treeAge > 0 ? `${treeAge} ปี` : '-'}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-1">
                            <div className="text-sm text-gray-500">พื้นที่วาด</div>
                            <div className="text-xl font-bold text-gray-800">{selectedAreaRai > 0 ? selectedAreaRai.toFixed(2) : '-'} <span className="text-sm font-normal text-gray-500">ไร่</span></div>
                        </div>
                        <div className="text-xs text-gray-400 mb-3">วาดแปลงบนแผนที่เพื่อคำนวณพื้นที่</div>

                        {calculationResult && (
                            <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-600">คาร์บอน:</span>
                                    <span className="font-bold text-[#3cc2cf]">{calculationResult.carbon_tons} ตัน</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">CO₂ เทียบเท่า:</span>
                                    <span className="font-bold text-green-600">{calculationResult.co2_equivalent_tons} ตัน</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handleCalculate}
                            disabled={!plantingYear || selectedAreaRai <= 0}
                        >
                            คำนวณ
                        </Button>
                        <Button
                            variant="primary"
                            className="flex-1"
                            onClick={handleSave}
                            disabled={!plotName || !plantingYear}
                        >
                            บันทึก
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlotSidebar
