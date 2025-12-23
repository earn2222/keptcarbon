import React from 'react'
import { Card, Button } from '../atoms'
import { Link } from 'react-router-dom'

const MapPreview = ({
    plotCount = 0,
    onAddPlot,
    linkTo = '/dashboard/map'
}) => {
    return (
        <Card hover={false}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">แผนที่แปลง</h2>
                <Link
                    to={linkTo}
                    className="text-[#3cc2cf] text-sm font-medium hover:underline"
                >
                    ดูเต็ม
                </Link>
            </div>

            {/* Map Placeholder */}
            <div className="h-[200px] bg-gradient-to-br from-green-100 via-green-200 to-green-300 rounded-xl relative overflow-hidden mb-4">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(60,194,207,0.3)_0%,transparent_50%)]"></div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700">
                    {plotCount} แปลง
                </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded bg-green-300"></div>
                    <span className="text-gray-600">อายุ 1-10 ปี</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded bg-green-500"></div>
                    <span className="text-gray-600">อายุ 11-20 ปี</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded bg-green-700"></div>
                    <span className="text-gray-600">อายุ 20+ ปี</span>
                </div>
            </div>

            <Link to={linkTo}>
                <Button variant="primary" fullWidth>
                    เพิ่มแปลงใหม่
                </Button>
            </Link>
        </Card>
    )
}

export default MapPreview
