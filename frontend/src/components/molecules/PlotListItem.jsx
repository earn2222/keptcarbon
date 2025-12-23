import React from 'react'
import { Badge } from '../atoms'
import { MapPinIcon } from '../atoms/Icons'

const PlotListItem = ({
    name,
    area,
    year,
    age,
    carbon,
    status = 'complete',
    onClick,
    className = ''
}) => {
    return (
        <div
            onClick={onClick}
            className={`
        p-4 border border-gray-100 rounded-xl 
        hover:border-[#3cc2cf] hover:bg-[#3cc2cf]/5 
        transition-all cursor-pointer bg-white
        ${className}
      `}
        >
            {/* Header: Icon + Name + Status */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#3cc2cf]/10 rounded-xl flex items-center justify-center text-[#3cc2cf]">
                        <MapPinIcon size={18} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800 text-sm">{name}</h3>
                        <div className="flex gap-2 text-xs text-gray-500 mt-0.5">
                            <span>ปีปลูก: {year}</span>
                            {age && <span>• อายุ {age} ปี</span>}
                        </div>
                    </div>
                </div>
                <Badge variant={status === 'complete' ? 'success' : 'warning'} size="sm">
                    {status === 'complete' ? 'ครบถ้วน' : 'ไม่ครบ'}
                </Badge>
            </div>

            {/* Info Metrics */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-xs">
                <div className="text-gray-500">
                    พื้นที่: <span className="text-gray-700 font-medium">{area}</span>
                </div>

                {carbon ? (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-lg">
                        <span className="text-lg">🌱</span>
                        <span className="text-green-700 font-bold">{carbon}</span>
                        <span className="text-green-600">ตัน</span>
                    </div>
                ) : (
                    <span className="text-gray-400">- รอคำนวณ -</span>
                )}
            </div>
        </div>
    )
}

export default PlotListItem
