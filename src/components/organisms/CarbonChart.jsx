import React from 'react'
import { Card } from '../atoms'
import { ProgressBar } from '../molecules'
import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '../atoms/Icons'

const CarbonChart = ({
    data,
    title = 'คาร์บอนตามอายุต้นยาง',
    subtitle = 'การกระจายตัวของคาร์บอนตามช่วงอายุ',
    totalLabel = 'คาร์บอนรวมทั้งหมด',
    totalValue,
    totalUnit = 'ตัน CO₂',
    linkTo,
    linkText = 'ดูรายละเอียด'
}) => {
    return (
        <Card hover={false}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                    <p className="text-sm text-gray-500">{subtitle}</p>
                </div>
                <select className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 bg-white">
                    <option>ปี 2024</option>
                    <option>ปี 2023</option>
                </select>
            </div>

            <div className="space-y-4">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                        <div className="w-20 text-sm text-gray-600 font-medium">{item.label}</div>
                        <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full gradient-primary rounded-full transition-all duration-500"
                                style={{ width: `${item.percentage}%` }}
                            ></div>
                        </div>
                        <div className="w-24 text-right">
                            <span className="font-semibold text-gray-800">{item.value}</span>
                            <span className="text-gray-400 text-sm ml-1">ตัน</span>
                        </div>
                        <div className="w-12 text-right text-sm text-gray-500">{item.percentage}%</div>
                    </div>
                ))}
            </div>

            {(totalValue || linkTo) && (
                <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                    {totalValue && (
                        <div>
                            <span className="text-gray-500 text-sm">{totalLabel}</span>
                            <div className="text-2xl font-bold text-gray-800">
                                {totalValue} <span className="text-sm font-normal text-gray-500">{totalUnit}</span>
                            </div>
                        </div>
                    )}
                    {linkTo && (
                        <Link
                            to={linkTo}
                            className="flex items-center gap-2 text-[#3cc2cf] font-medium text-sm hover:gap-3 transition-all"
                        >
                            {linkText}
                            <ArrowRightIcon size={16} />
                        </Link>
                    )}
                </div>
            )}
        </Card>
    )
}

export default CarbonChart
