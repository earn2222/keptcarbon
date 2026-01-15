import React, { useEffect, useState } from 'react'
import { CheckIcon, MapPinIcon, LeafIcon, LayersIcon, ChevronRightIcon } from '../atoms/Icons'

const GuideModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[3000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn cursor-pointer"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-[2rem] sm:rounded-[2.5rem] w-full max-w-sm sm:max-w-md shadow-2xl relative overflow-hidden animate-scaleIn cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Graphic */}
                <div className="h-24 sm:h-28 bg-[#2d4a27] relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-[url('/rubber-hero.png')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2d4a27] to-transparent"></div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white relative z-10 tracking-tight">ยินดีต้อนรับ</h2>
                </div>

                <div className="p-6 sm:p-8 pt-4">
                    <div className="text-center mb-8">
                        <p className="text-sm sm:text-base text-gray-500 font-medium leading-tight">ระบบประเมินคาร์บอนเครดิตสำหรับสวนยางพารา</p>
                        <p className="text-[10px] sm:text-xs text-gray-400 mt-1 uppercase tracking-wider">เริ่มต้นใช้งานง่ายๆ ใน 3 ขั้นตอน</p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4 group/item cursor-pointer" onClick={() => (window.location.hash = '')}>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#eef2e6] rounded-xl sm:rounded-2xl flex items-center justify-center text-[#4c7c44] shrink-0 group-hover/item:scale-110 group-hover/item:bg-[#4c7c44] group-hover/item:text-white transition-all duration-300">
                                <MapPinIcon size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm sm:text-base font-bold text-[#2d4a27] group-hover/item:text-[#4c7c44] transition-colors">1. วาดแปลง หรือ นำเข้า SHP</h4>
                                <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 leading-relaxed">
                                    ใช้เครื่องมือวาดรูปบนแผนที่เพื่อกำหนดขอบเขตสวนยางของคุณ หรืออัปโหลดไฟล์ Shapefile ที่มีอยู่
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 group/item cursor-pointer">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#eef2e6] rounded-xl sm:rounded-2xl flex items-center justify-center text-[#4c7c44] shrink-0 group-hover/item:scale-110 group-hover/item:bg-[#4c7c44] group-hover/item:text-white transition-all duration-300">
                                <LeafIcon size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm sm:text-base font-bold text-[#2d4a27] group-hover/item:text-[#4c7c44] transition-colors">2. ระบุข้อมูลแปลง</h4>
                                <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 leading-relaxed">
                                    กรอกชื่อแปลง ปีที่ปลูก และพันธุ์ยาง ระบบจะช่วยประเมินอายุและปริมาณคาร์บอนให้โดยอัตโนมัติ
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 group/item cursor-pointer">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#eef2e6] rounded-xl sm:rounded-2xl flex items-center justify-center text-[#4c7c44] shrink-0 group-hover/item:scale-110 group-hover/item:bg-[#4c7c44] group-hover/item:text-white transition-all duration-300">
                                <CheckIcon size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm sm:text-base font-bold text-[#2d4a27] group-hover/item:text-[#4c7c44] transition-colors">3. บันทึกข้อมูล</h4>
                                <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 leading-relaxed">
                                    ตรวจสอบความถูกต้องและบันทึกข้อมูลเข้าสู่ระบบเพื่อดูสรุปผลในแดชบอร์ด
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default GuideModal
