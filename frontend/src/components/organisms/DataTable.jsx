import React from 'react'
import { Card, Badge } from '../atoms'
import { MapPinIcon, TrendingUpIcon, EyeIcon } from '../atoms/Icons'

const DataTable = ({
    columns,
    data,
    onRowClick,
    className = ''
}) => {
    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="w-full">
                <thead>
                    <tr className="border-b-2 border-gray-100">
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className="text-left py-4 px-4 text-sm font-semibold text-gray-500"
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            onClick={() => onRowClick && onRowClick(row)}
                            className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                        >
                            {columns.map((column, colIndex) => (
                                <td key={colIndex} className="py-4 px-4">
                                    {column.render ? column.render(row) : row[column.accessor]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

// Pre-configured Plot Table
const PlotTable = ({ plots, onViewPlot }) => {
    const columns = [
        {
            header: 'ชื่อแปลง',
            accessor: 'name',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#3cc2cf]/10 rounded-xl flex items-center justify-center text-[#3cc2cf]">
                        <MapPinIcon size={20} />
                    </div>
                    <span className="font-medium text-gray-800">{row.name}</span>
                </div>
            )
        },
        {
            header: 'พื้นที่',
            accessor: 'area',
            render: (row) => <span className="text-gray-600">{row.area}</span>
        },
        {
            header: 'อายุ (ปี)',
            accessor: 'age',
            render: (row) => <span className="text-gray-600">{row.age}</span>
        },
        {
            header: 'คาร์บอน (ตัน)',
            accessor: 'carbon',
            render: (row) => (
                <span className="font-semibold text-gray-800">{row.carbon}</span>
            )
        },
        {
            header: 'สถานะ',
            accessor: 'status',
            render: (row) => (
                <Badge variant={row.status === 'completed' ? 'success' : 'warning'}>
                    {row.status === 'completed' ? 'เสร็จสิ้น' : 'รอดำเนินการ'}
                </Badge>
            )
        },
    ]

    return <DataTable columns={columns} data={plots} onRowClick={onViewPlot} />
}

export { DataTable, PlotTable }
export default DataTable
