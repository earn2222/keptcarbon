import React from 'react'
import { Badge } from '../atoms'
import { MapPinIcon } from '../atoms/Icons'

const PlotListItem = ({
    name,
    area,
    year,
    carbon, // Added prop
    status = 'complete', // complete, missing
    onClick,
    className = ''
}) => {
    return (
        <div
            onClick={onClick}
            className={`
        p-4 border border-gray-100 rounded-xl 
        hover:border-[#3cc2cf] hover:bg-[#3cc2cf]/5 
        transition-all cursor-pointer
        ${className}
      `}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#3cc2cf]/10 rounded-lg flex items-center justify-center text-[#3cc2cf]">
                        <MapPinIcon size={16} />
                    </div>
                    <h3 className="font-medium text-gray-800">{name}</h3>
                </div>
                <Badge variant={status === 'complete' ? 'success' : 'warning'} size="sm">
                    {status === 'complete' ? 'ครบถ้วน' : 'ข้อมูลไม่ครบ'}
                </Badge>
            </div>
            <span>พื้นที่: {area}</span>
            <span>ปลูก: {year}</span>
            {carbon && (
                <span className="text-[#3cc2cf] font-medium flex items-center gap-1">
                    🌱 {carbon} ตัน
                </span>
            )}
        </div>
    )
}

export default PlotListItem
