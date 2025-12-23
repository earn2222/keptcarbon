import React from 'react'
import { Card } from '../atoms'
import { TrendingUpIcon, TrendingDownIcon } from '../atoms/Icons'

const StatCard = ({
    title,
    value,
    unit,
    icon,
    iconBg = 'bg-[#3cc2cf]/15',
    change,
    changeType = 'neutral', // positive, negative, neutral
    period,
    className = ''
}) => {
    return (
        <Card className={className}>
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center text-2xl`}>
                    {icon}
                </div>
                {period && (
                    <span className="text-xs text-gray-400">{period}</span>
                )}
            </div>

            <div className="text-sm text-gray-500 mb-1">{title}</div>

            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-800">{value}</span>
                {unit && <span className="text-gray-500 text-sm">{unit}</span>}
            </div>

            {change && changeType !== 'neutral' && (
                <div className={`flex items-center gap-1 mt-2 text-sm ${changeType === 'positive' ? 'text-green-500' : 'text-red-500'
                    }`}>
                    {changeType === 'positive' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                    <span>{change}</span>
                </div>
            )}
        </Card>
    )
}

export default StatCard
