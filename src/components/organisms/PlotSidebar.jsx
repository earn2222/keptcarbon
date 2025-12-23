import React, { useState } from 'react'
import { Card, Button, Input } from '../atoms'
import { PlotListItem } from '../molecules'
import { PlusIcon } from '../atoms/Icons'

const PlotSidebar = ({
    plots = [],
    onPlotSelect,
    onSavePlot,
}) => {
    const [plotName, setPlotName] = useState('')
    const [plantingYear, setPlantingYear] = useState('')

    const handleSave = () => {
        if (onSavePlot && plotName && plantingYear) {
            onSavePlot({ name: plotName, year: plantingYear })
            setPlotName('')
            setPlantingYear('')
        }
    }

    return (
        <div className="w-[360px] bg-white rounded-2xl shadow-card p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">รายการแปลง</h2>
                <button className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#3cc2cf]/30">
                    <PlusIcon size={20} />
                </button>
            </div>

            {/* Plots List */}
            <div className="space-y-3 mb-6">
                {plots.map((plot) => (
                    <PlotListItem
                        key={plot.id}
                        name={plot.name}
                        area={plot.area}
                        year={plot.year}
                        status={plot.status}
                        onClick={() => onPlotSelect && onPlotSelect(plot)}
                    />
                ))}
            </div>

            {/* Add Plot Form */}
            <div className="pt-6 border-t border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4">เพิ่มแปลงใหม่</h3>

                <div className="space-y-4">
                    <Input
                        label="ชื่อแปลง"
                        placeholder="กรอกชื่อแปลง"
                        value={plotName}
                        onChange={(e) => setPlotName(e.target.value)}
                    />

                    <Input
                        label="ปีที่ปลูก"
                        type="number"
                        placeholder="เช่น 2015"
                        value={plantingYear}
                        onChange={(e) => setPlantingYear(e.target.value)}
                    />

                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-500 mb-2">พื้นที่ที่เลือก</div>
                        <div className="text-2xl font-bold text-gray-800">- ไร่</div>
                        <div className="text-xs text-gray-400 mt-1">วาดแปลงบนแผนที่เพื่อคำนวณ</div>
                    </div>

                    <Button
                        variant="primary"
                        fullWidth
                        onClick={handleSave}
                    >
                        บันทึกแปลง
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default PlotSidebar
