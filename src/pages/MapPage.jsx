import React, { useState } from 'react'

// Icons
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
)

const ZoomInIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        <line x1="11" y1="8" x2="11" y2="14"></line>
        <line x1="8" y1="11" x2="14" y2="11"></line>
    </svg>
)

const ZoomOutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        <line x1="8" y1="11" x2="14" y2="11"></line>
    </svg>
)

const LocateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>
)

const PenToolIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
        <path d="M2 2l7.586 7.586"></path>
        <circle cx="11" cy="11" r="2"></circle>
    </svg>
)

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
)

const LayersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 17 12 22 22 17"></polyline>
        <polyline points="2 12 12 17 22 12"></polyline>
    </svg>
)

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
)

function MapPage() {
    const [selectedTool, setSelectedTool] = useState('select')
    const [showSidebar, setShowSidebar] = useState(true)

    const plots = [
        { id: 1, name: 'แปลงที่ 1 - บ้านนา', area: '50 ไร่', year: 2009, status: 'complete' },
        { id: 2, name: 'แปลงที่ 2 - ท่าศาลา', area: '35 ไร่', year: 2016, status: 'complete' },
        { id: 3, name: 'แปลงที่ 3 - หัวไทร', area: '42 ไร่', year: 2012, status: 'missing' },
    ]

    const tools = [
        { id: 'select', icon: LocateIcon, label: 'เลือก' },
        { id: 'polygon', icon: PenToolIcon, label: 'วาดแปลง' },
        { id: 'upload', icon: UploadIcon, label: 'อัปโหลด SHP' },
    ]

    return (
        <div className="h-[calc(100vh-150px)] flex gap-6">
            {/* Map Area */}
            <div className="flex-1 bg-white rounded-2xl shadow-card overflow-hidden relative">
                {/* Map Container */}
                <div className="w-full h-full bg-gradient-to-br from-green-100 via-green-200 to-emerald-200 relative">
                    {/* Placeholder Map Pattern */}
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-[20%] left-[30%] w-32 h-24 bg-green-400 rounded-lg transform rotate-12"></div>
                        <div className="absolute top-[40%] left-[50%] w-40 h-28 bg-green-500 rounded-lg transform -rotate-6"></div>
                        <div className="absolute top-[60%] left-[20%] w-36 h-20 bg-green-400 rounded-lg transform rotate-3"></div>
                        <div className="absolute top-[30%] right-[20%] w-28 h-32 bg-emerald-400 rounded-lg transform -rotate-12"></div>
                    </div>

                    {/* Map Controls */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <button className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-gray-600 hover:bg-[#3cc2cf] hover:text-white transition-all">
                            <ZoomInIcon />
                        </button>
                        <button className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-gray-600 hover:bg-[#3cc2cf] hover:text-white transition-all">
                            <ZoomOutIcon />
                        </button>
                        <div className="w-10 h-px bg-gray-200"></div>
                        <button className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-gray-600 hover:bg-[#3cc2cf] hover:text-white transition-all">
                            <LocateIcon />
                        </button>
                        <button className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-gray-600 hover:bg-[#3cc2cf] hover:text-white transition-all">
                            <LayersIcon />
                        </button>
                    </div>

                    {/* Toolbar */}
                    <div className="absolute top-4 left-4 bg-white rounded-2xl shadow-lg p-2 flex gap-2">
                        {tools.map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => setSelectedTool(tool.id)}
                                className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all ${selectedTool === tool.id
                                        ? 'gradient-primary text-white shadow-lg shadow-[#3cc2cf]/30'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <tool.icon />
                                <span>{tool.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="absolute bottom-4 left-4 right-4 max-w-md">
                        <div className="bg-white rounded-2xl shadow-lg p-2 flex items-center gap-3">
                            <div className="pl-3 text-gray-400">
                                <SearchIcon />
                            </div>
                            <input
                                type="text"
                                placeholder="ค้นหาจังหวัด/อำเภอ/ตำบล..."
                                className="flex-1 py-2 bg-transparent border-none outline-none text-sm"
                            />
                            <button className="px-4 py-2 gradient-primary text-white rounded-xl text-sm font-medium">
                                ค้นหา
                            </button>
                        </div>
                    </div>

                    {/* Coordinates */}
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur rounded-xl px-4 py-2 text-xs text-gray-600">
                        <span>Lat: 8.4304° N</span>
                        <span className="mx-2">|</span>
                        <span>Long: 99.9631° E</span>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="w-[360px] bg-white rounded-2xl shadow-card p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">รายการแปลง</h2>
                    <button className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#3cc2cf]/30">
                        <PlusIcon />
                    </button>
                </div>

                {/* Plots List */}
                <div className="space-y-3">
                    {plots.map((plot) => (
                        <div
                            key={plot.id}
                            className="p-4 border border-gray-100 rounded-xl hover:border-[#3cc2cf] hover:bg-[#3cc2cf]/5 transition-all cursor-pointer"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium text-gray-800">{plot.name}</h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${plot.status === 'complete'
                                        ? 'bg-green-100 text-green-600'
                                        : 'bg-amber-100 text-amber-600'
                                    }`}>
                                    {plot.status === 'complete' ? 'ครบถ้วน' : 'ข้อมูลไม่ครบ'}
                                </span>
                            </div>
                            <div className="flex gap-4 text-sm text-gray-500">
                                <span>พื้นที่: {plot.area}</span>
                                <span>ปลูก: {plot.year}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Plot Form */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="font-semibold text-gray-800 mb-4">เพิ่มแปลงใหม่</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อแปลง</label>
                            <input
                                type="text"
                                placeholder="กรอกชื่อแปลง"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#3cc2cf] focus:ring-4 focus:ring-[#3cc2cf]/15 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ปีที่ปลูก</label>
                            <input
                                type="number"
                                placeholder="เช่น 2015"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#3cc2cf] focus:ring-4 focus:ring-[#3cc2cf]/15 outline-none transition-all"
                            />
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                            <div className="text-sm text-gray-500 mb-2">พื้นที่ที่เลือก</div>
                            <div className="text-2xl font-bold text-gray-800">- ไร่</div>
                            <div className="text-xs text-gray-400 mt-1">วาดแปลงบนแผนที่เพื่อคำนวณ</div>
                        </div>

                        <button className="w-full py-3.5 gradient-primary text-white rounded-xl font-semibold shadow-lg shadow-[#3cc2cf]/30 hover:opacity-90 transition-opacity">
                            บันทึกแปลง
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MapPage
