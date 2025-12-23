import React from 'react'
import { Badge } from '../atoms'
import { MapPinIcon } from '../atoms/Icons'

const PlotListItem = ({
    name,
    area,
    year,
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
            <div className="flex gap-4 text-sm text-gray-500 pl-10">
                <span>พื้นที่: {area}</span>
                <span>ปลูก: {year}</span>
            </div>
        </div>
    )
}

export default PlotListItem
