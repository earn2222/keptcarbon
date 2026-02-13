import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '../components/atoms'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import * as turf from '@turf/turf'
import L from 'leaflet'

// Fix Leaflet Icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LandingPage() {
    const [showScrollTop, setShowScrollTop] = useState(false)
    const mapRef = useRef(null)

    useEffect(() => {
        const checkScroll = () => {
            if (window.scrollY > 400) {
                setShowScrollTop(true)
            } else {
                setShowScrollTop(false)
            }
        }
        window.addEventListener('scroll', checkScroll)
        return () => window.removeEventListener('scroll', checkScroll)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    // --- Trial Map Logic ---
    const [trialArea, setTrialArea] = useState({ rai: 0, ngan: 0, wah: 0, totalSqM: 0 })
    const [marketPrice, setMarketPrice] = useState(150)
    const [calculationModel, setCalculationModel] = useState('field')
    const [isResultOpen, setIsResultOpen] = useState(false) // Mobile Result Card Visibility
    const [plantingYear, setPlantingYear] = useState(2559) // ปี พ.ศ. ที่ปลูก (ค่าเริ่มต้น 2559 = อายุ 10 ปี)

    // คำนวณอายุจากปีที่ปลูก (ปีปัจจุบัน พ.ศ. 2569)
    const currentYear = 2569; // 2026 ค.ศ. = 2569 พ.ศ.
    const calculateAge = (year) => {
        if (!year || year > currentYear) return 0;
        return currentYear - year;
    }
    const treeAge = calculateAge(plantingYear);

    // --- Location Search Logic (Mock Data) ---
    const [selectedProvince, setSelectedProvince] = useState('')
    const [selectedAmphure, setSelectedAmphure] = useState('')
    const [selectedTambon, setSelectedTambon] = useState('')

    const LOCATIONS = {
        'Surat Thani': { lat: 9.1386, lng: 99.3323, amphures: ['Mueang', 'Phunphin', 'Kanchanadit'] },
        'Songkhla': { lat: 7.1756, lng: 100.6143, amphures: ['Hat Yai', 'Sadao', 'Na Mom'] },
        'Nakhon Si Thammarat': { lat: 8.4312, lng: 99.9631, amphures: ['Thung Song', 'Ron Phibun', 'Pak Phanang'] }
    }

    const handleLocationChange = (type, val) => {
        if (!mapRef.current) return;

        if (type === 'province') {
            setSelectedProvince(val);
            setSelectedAmphure('');
            setSelectedTambon('');
            if (LOCATIONS[val]) {
                mapRef.current.flyTo([LOCATIONS[val].lat, LOCATIONS[val].lng], 10);
            }
        } else if (type === 'amphure') {
            setSelectedAmphure(val);
            // Simulate Zoom In
            if (LOCATIONS[selectedProvince]) {
                const base = LOCATIONS[selectedProvince];
                mapRef.current.flyTo([base.lat + 0.05, base.lng + 0.05], 12);
            }
        } else if (type === 'tambon') {
            setSelectedTambon(val);
            if (LOCATIONS[selectedProvince]) {
                const base = LOCATIONS[selectedProvince];
                mapRef.current.flyTo([base.lat + 0.02, base.lng + 0.02], 14);
            }
        }
    }


    // Calculation Factors (Ton CO2e per Rai)
    const MODEL_FACTORS = {
        field: 1.5,
        drone: 1.4,
        young: 0.6,
        satellite: 1.2
    }

    const calculateCarbon = (sqM, model, age) => {
        const totalRai = sqM / 1600;

        // Age multiplier: อายุต้นยางพารามีผลต่อการกักเก็บคาร์บอน
        // ยางอายุ 5-20 ปี มีประสิทธิภาพสูงสุด (100%)
        // น้อยกว่า 5 ปี ลดลงตามอายุ (50-100%)
        // มากกว่า 20 ปี ลดลงเบาๆ (60-100%)
        let ageMultiplier = 1.0;
        if (age < 5) {
            ageMultiplier = 0.5 + (age / 5) * 0.5; // 0.5 to 1.0
        } else if (age > 20) {
            ageMultiplier = Math.max(0.6, 1.0 - ((age - 20) / 30) * 0.4); // 1.0 to 0.6 (over 30 years)
        }

        if (model === 'all') {
            const sum = Object.values(MODEL_FACTORS).reduce((a, b) => a + b, 0);
            const avg = sum / 4;
            return totalRai * avg * ageMultiplier;
        }

        const factor = MODEL_FACTORS[model] || 1.2;
        return totalRai * factor * ageMultiplier;
    }

    const formatNumber = (num) => {
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    const GeomanController = ({ setArea }) => {
        const map = useMap()

        // Save map instance to ref for external control
        useEffect(() => {
            mapRef.current = map;
        }, [map]);

        useEffect(() => {
            map.pm.addControls({
                position: 'topleft',
                drawCircle: false,
                drawCircleMarker: false,
                drawMarker: false,
                drawPolyline: false,
                drawRectangle: true,
                drawPolygon: true,
                drawText: false,
                cutPolygon: false,
                rotateMode: false,
                editMode: true,
                dragMode: false,
                removalMode: true
            })

            const calculateArea = () => {
                let totalSqM = 0;
                map.eachLayer((layer) => {
                    if (layer instanceof L.Polygon && !layer._pmTempLayer) {
                        const geojson = layer.toGeoJSON();
                        totalSqM += turf.area(geojson);
                    }
                });

                const rai = Math.floor(totalSqM / 1600);
                const remainder1 = totalSqM % 1600;
                const ngan = Math.floor(remainder1 / 400);
                const remainder2 = remainder1 % 400;
                const wah = remainder2 / 4;

                setArea({
                    rai,
                    ngan,
                    wah: parseFloat(wah.toFixed(1)),
                    totalSqM
                })
            }

            map.on('pm:create', (e) => {
                calculateArea();
                e.layer.on('pm:edit', calculateArea)
                setIsResultOpen(true); // Auto-open result on draw
            });
            map.on('pm:remove', calculateArea)
        }, [map, setArea])

        return null
    }

    return (
        <div className="min-h-screen bg-white font-sans text-gray-800">
            {/* 1. Navigation */}
            <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="container-responsive">
                    <div className="flex justify-between items-center h-20 md:h-24">
                        <BrandLogo mode="dark" size={32} />
                        <div className="hidden md:flex items-center gap-10">
                            <Link to="/" className="flex items-center gap-2 text-gray-600 font-medium hover:text-[#4c7c44] transition-colors">
                                แผนที่
                            </Link>
                            <Link to="/demo" className="flex items-center gap-2 text-gray-600 font-medium hover:text-[#4c7c44] transition-colors">
                                แดชบอร์ด
                            </Link>
                            <Link to="/login" className="bg-[#4c7c44] text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-sm hover:bg-[#3d6336] transition-all">
                                เข้าสู่ระบบ
                            </Link>
                        </div>
                        <Link to="/login" className="md:hidden bg-[#4c7c44] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm">
                            เข้าสู่ระบบ
                        </Link>
                    </div>
                </div>
            </nav>

            {/* 2. Hero Section */}
            <section className="bg-[#f7f5f2] py-12 md:py-20 overflow-hidden">
                <div className="container-responsive">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        <div className="w-full lg:w-1/2 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 bg-[#eef2e6] text-[#2d4a27] px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border border-[#e0e7d5]">
                                เทคโนโลยีเพื่อความยั่งยืน
                            </div>
                            <h1 className="text-[2.5rem] md:text-5xl lg:text-[4.5rem] font-bold tracking-tight text-[#2d4a27] leading-[1.1] mb-8">
                                ระบบการประเมิน<br />
                                การกักเก็บคาร์บอน<br />
                                จากสวนยางพารา
                            </h1>
                            <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0 font-medium">
                                แพลตฟอร์มดิจิทัลสำหรับการประเมิน คำนวณ วิเคราะห์ และแสดงผลปริมาณการกักเก็บคาร์บอน เพื่อสนับสนุนการจัดการพื้นที่เกษตรอย่างยั่งยืน
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                <a href="#trial-map" className="inline-flex items-center gap-3 bg-[#4c7c44] text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:bg-[#3d6336] transition-all">
                                    ลองใช้งานฟรี
                                </a>
                                <Link to="/login" className="inline-flex items-center gap-3 bg-white text-[#4c7c44] border-2 border-[#4c7c44] px-8 py-4 rounded-xl font-semibold text-lg shadow-sm hover:bg-gray-50 transition-all">
                                    เข้าสู่ระบบ
                                </Link>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 relative">
                            <div className="rounded-[40px] overflow-hidden shadow-2xl border-[12px] border-white/50">
                                <img src="/rubber-hero.png" alt="Rubber Plantation" className="w-full h-auto object-cover" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Capabilities Section */}
            <section className="py-24 bg-[#fbfaf8]">
                <div className="container-responsive">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-[#2d4a27] mb-3">บทบาทของระบบ</h2>
                        <p className="text-gray-500 font-medium">ทำไมต้อง KEPT CARBON</p>
                        <div className="w-16 h-1 bg-[#4c7c44] mx-auto rounded-full mt-6"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {[
                            { title: 'ประเมินปริมาณคาร์บอน', desc: 'คำนวณและประเมินปริมาณการกักเก็บคาร์บอนของสวนยางพาราในพื้นที่ของคุณ โดยใช้ข้อมูลเชิงพื้นที่และสมการทางวิทยาศาสตร์ที่ได้รับการยอมรับ', icon: '🧮' },
                            { title: 'แสดงผลผ่านแดชบอร์ด', desc: 'นำเสนอข้อมูลผ่านแผนที่เชิงโต้ตอบและแดชบอร์ดที่เข้าใจง่าย แสดงภาพรวมและรายละเอียดการกักเก็บคาร์บอนในรูปแบบกราฟและตาราง', icon: '📊' },
                            { title: 'วิเคราะห์ข้อมูลเชิงพื้นที่', desc: 'ใช้เทคโนโลยี GIS และข้อมูลดาวเทียมในการวิเคราะห์พื้นที่ปลูกยางพารา ติดตามการเปลี่ยนแปลงแปลงและประเมินศักยภาพการกักเก็บคาร์บอนอย่างเป็นระบบ', icon: '🗺️' },
                            { title: 'สนับสนุนคาร์บอนเครดิต', desc: 'ให้ข้อมูลที่จำเป็นสำหรับการวางแผนและจัดการคาร์บอนเครดิต ช่วยเกษตรกรสามารถเข้าถึงโอกาสทางเศรษฐกิจจากการอนุรักษ์สิ่งแวดล้อม', icon: '💰' }
                        ].map((cap, idx) => (
                            <div key={idx} className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100 flex gap-8 hover:shadow-lg transition-all group">
                                <div className="w-20 h-20 bg-[#e8eddf] rounded-2xl flex items-center justify-center flex-shrink-0 text-4xl group-hover:bg-[#4c7c44] group-hover:text-white transition-all">
                                    {cap.icon}
                                </div>
                                <div className="text-left">
                                    <h3 className="text-2xl font-bold tracking-tight text-[#2d4a27] mb-4">{cap.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed font-medium">
                                        {cap.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Information Section */}
            <section className="py-24 bg-white">
                <div className="container-responsive">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold tracking-tight text-[#2d4a27] mb-4">การกักเก็บคาร์บอนคืออะไร</h2>
                        <div className="w-20 h-1 bg-[#4c7c44] mx-auto rounded-full mb-12"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'การกักเก็บคาร์บอน',
                                desc: 'กระบวนการดูดซับและเก็บกักก๊าซคาร์บอนไดออกไซด์ (CO₂) จากบรรยากาศเข้าสู่พืช ดิน และระบบนิเวศ ช่วยลดปริมาณก๊าซเรือนกระจกในบรรยากาศ',
                                iconPath: 'M3 15a4 4 0 111-7.93 7 7 0 0113.13-.57 4 4 0 011.87 7.5',
                                color: 'bg-[#e8eddf]'
                            },
                            {
                                title: 'บทบาทสวนยางพารา',
                                desc: 'สวนยางพารามีความสามารถในการดูดซับ CO₂ ได้สูง โดยเฉพาะในช่วงอายุ 5-20 ปี ช่วยลดผลกระทบจากการเปลี่ยนแปลงสภาพภูมิอากาศและสนับสนุนความยั่งยืนทางสิ่งแวดล้อม',
                                iconPath: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
                                color: 'bg-[#f7f5f2]'
                            },
                            {
                                title: 'เทคโนโลยีและข้อมูล',
                                desc: 'การใช้ข้อมูลเชิงพื้นที่ ภาพถ่ายดาวเทียม และระบบสารสนเทศภูมิศาสตร์ (GIS) ช่วยในการประเมินและวิเคราะห์ปริมาณการกักเก็บคาร์บอนได้อย่างแม่นยำ',
                                iconPath: 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0',
                                color: 'bg-[#e8eddf]'
                            }
                        ].map((item, idx) => (
                            <div key={idx} className={`${item.color} p-12 rounded-[40px] hover:shadow-xl transition-all border border-gray-50 flex flex-col items-center text-center`}>
                                <div className="w-20 h-20 bg-[#4c7c44] rounded-full flex items-center justify-center mb-10 shadow-lg">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.iconPath} />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight text-[#2d4a27] mb-6">{item.title}</h3>
                                <p className="text-gray-500 leading-relaxed font-medium text-sm">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Carbon Calculation Knowledge */}
            <section className="py-20 bg-[#fbfaf8]">
                <div className="container-responsive">
                    <div className="text-center mb-12">
                        <div className="inline-block bg-[#10b981] text-white px-3 py-1 rounded-full text-xs font-bold mb-4">ความรู้เรื่องราคา</div>
                        <h2 className="text-4xl font-bold text-[#2d4a27] mb-4">การคิดคำนวณมูลค่าคาร์บอน</h2>
                        <p className="text-gray-500 text-lg">เข้าใจวิธีการประเมินมูลค่าทางเศรษฐกิจจากการกักเก็บคาร์บอน</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="bg-white p-8 rounded-[24px] border border-[#e0e7d5] hover:shadow-lg transition-all">
                            <div className="w-12 h-12 bg-[#4c7c44] rounded-xl flex items-center justify-center text-white mb-6 shadow-md">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-[#2d4a27] mb-2">ช่วงราคาตลาด</h3>
                            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                ราคาคาร์บอนเครดิตในตลาดโลกปัจจุบันอยู่ที่ <span className="font-bold text-[#4c7c44]">$5-50 USD/ตัน CO₂</span> (ประมาณ ฿150-1,500 บาท)
                            </p>
                            <div className="bg-[#e2e8de] p-4 rounded-xl">
                                <span className="text-xs text-gray-500 font-semibold uppercase block mb-1">ค่าเฉลี่ยประเทศไทย</span>
                                <div className="text-3xl font-black text-[#4c7c44]">฿150-300</div>
                                <div className="text-xs text-gray-500 mt-1">per ton CO₂ equivalent</div>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-md hover:shadow-xl transition-all relative overflow-hidden">
                            <div className="w-12 h-12 bg-[#f59e0b] rounded-xl flex items-center justify-center text-white mb-6 shadow-md z-10 relative">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-[#2d4a27] mb-2 z-10 relative">วิธีคำนวณมูลค่า</h3>
                            <p className="text-gray-600 text-sm mb-4 leading-relaxed z-10 relative">
                                คำนวณจากปริมาณคาร์บอนที่กักเก็บได้ (tCO₂) คูณด้วยราคาตลาดปัจจุบัน
                            </p>
                            <div className="bg-[#fef9c3] p-4 rounded-xl border border-[#fde047] z-10 relative">
                                <div className="font-mono text-xs text-[#854d0e] mb-2">
                                    Value = Carbon (tCO₂) × Price (฿/tCO₂)
                                </div>
                                <div className="text-sm font-bold text-[#a16207]">
                                    ตัวอย่าง: 10 ตัน • ฿200 = <span className="text-lg">฿2,000</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white p-8 rounded-[24px] border border-[#e0e7d5] hover:shadow-lg transition-all">
                            <div className="w-12 h-12 bg-[#10b981] rounded-xl flex items-center justify-center text-white mb-6 shadow-md">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h6m0 0v6m0-6l-7 7" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-[#2d4a27] mb-2">ปัจจัยที่ส่งผลต่อราคา</h3>
                            <ul className="space-y-3 mt-4">
                                <li className="flex items-start gap-3 text-sm text-gray-700">
                                    <div className="w-4 h-4 rounded-full bg-[#10b981] flex items-center justify-center flex-shrink-0 mt-0.5"><svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg></div>
                                    <span><span className="font-bold">มาตรฐานการรับรอง:</span> VCS, Gold Standard</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-gray-700">
                                    <div className="w-4 h-4 rounded-full bg-[#10b981] flex items-center justify-center flex-shrink-0 mt-0.5"><svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg></div>
                                    <span><span className="font-bold">ประเภทโครงการ:</span> REDD+, Afforestation</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Scientific Models */}
            <section className="py-20 bg-white">
                <div className="container-responsive">
                    <div className="text-center mb-12">
                        <div className="inline-block bg-[#4c7c44] text-white px-3 py-1 rounded-full text-xs font-bold mb-4">Scientific Base Models</div>
                        <h2 className="text-4xl font-bold text-[#2d4a27] mb-4">ฐานข้อมูลงานวิจัย</h2>
                        <p className="text-gray-500 text-lg">เลือกใช้สมการที่ผ่านการพิสูจน์แล้ว เพื่อความแม่นยำสูงสุดในบริบทของคุณ</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { id: 'field', name: 'Field Data', desc: 'ข้อมูลภาคสนามแม่นยำสูง', eq: 'AGB = 0.118 × DBH^2.53', r2: '0.93', color: 'green', bg: 'bg-[#4c7c44]', light: 'bg-[#f0fdf4]', text: 'text-[#15803d]' },
                            { id: 'drone', name: 'Drone NDVI', desc: 'ประเมินจากภาพถ่ายโดรน', eq: 'AGB = 34.2 × NDVI + 5.8', r2: '0.89', color: 'blue', bg: 'bg-[#3b82f6]', light: 'bg-[#eff6ff]', text: 'text-[#1d4ed8]' },
                            { id: 'young', name: 'Young Rubber', desc: 'ยางพาราอายุน้อย (3-9 ปี)', eq: 'AGB = 0.062 × DBH^2.23', r2: '0.94', color: 'yellow', bg: 'bg-[#eab308]', light: 'bg-[#fefce8]', text: 'text-[#a16207]' },
                            { id: 'satellite', name: 'Satellite', desc: 'ระดับภูมิภาค (ดาวเทียม)', eq: 'AGB = 13.57 × TCARI...', r2: '0.87', color: 'purple', bg: 'bg-[#a855f7]', light: 'bg-[#faf5ff]', text: 'text-[#7e22ce]' }
                        ].map((m) => (
                            <div key={m.id} className={`bg-white rounded-[24px] border-t-4 border-t-[${m.color}-500] p-6 shadow-sm hover:shadow-xl transition-all flex flex-col h-full border border-gray-100`}>
                                <div className={`${m.light} ${m.text} text-xs font-bold px-3 py-1 rounded-full w-max mb-4 mx-auto`}>
                                    {m.name}
                                </div>
                                <p className="text-xs text-center text-gray-500 mb-4 leading-tight">{m.desc}</p>
                                <div className="bg-gray-50 rounded-xl p-4 text-center mb-4 mt-auto">
                                    <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Equation</div>
                                    <div className="font-mono text-sm font-bold text-[#2d4a27]">{m.eq}</div>
                                </div>
                                <div className="flex justify-between items-center mb-6 px-2">
                                    <span className="text-xs font-bold text-gray-400">Accuracy</span>
                                    <span className={`${m.light} ${m.text} text-xs font-bold px-2 py-0.5 rounded`}>R² = {m.r2}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. Updated Trial Map Section */}
            <section id="trial-map" className="py-20 bg-[#fbfaf8] border-t border-gray-100 scroll-mt-20">
                <div className="container-responsive">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-[#2d4a27] mb-2">เริ่มต้นวาดแปลงของคุณ</h2>
                            <p className="text-gray-500">ลองใช้เครื่องมือวาดพื้นที่บนแผนที่ เพื่อดูการคำนวณคาร์บอนและมูลค่าเบื้องต้นได้ทันที</p>
                        </div>
                        <div className="hidden md:block">
                            <span className="bg-[#ecfdf5] text-[#059669] px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#10b981]"></span> พร้อมใช้งานฟรี
                            </span>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-[32px] overflow-hidden shadow-2xl border-4 border-white h-[600px] relative font-sans">
                        {/* Map */}
                        <MapContainer
                            center={[13.7563, 100.5018]}
                            zoom={6}
                            scrollWheelZoom={true}
                            style={{ height: '100%', width: '100%' }}
                            className="z-0"
                            zoomControl={false}
                        >
                            <TileLayer
                                attribution='&copy; Google'
                                url="http://mt0.google.com/vt/lyrs=s,h&hl=en&x={x}&y={y}&z={z}"
                            />
                            <GeomanController setArea={setTrialArea} />
                        </MapContainer>

                        {/* Floating Controls - Responsive Positioning */}

                        {/* Search Control: Mobile = Top Right, Desktop = Below Geoman (Left) */}
                        <div className="absolute z-[400] flex flex-col gap-2 group transition-all duration-300
                            top-4 right-4 
                            md:top-[180px] md:left-[10px] md:right-auto md:ml-[2px]"
                        >
                            <div className="w-[30px] h-[30px] md:w-[30px] md:h-[30px] bg-white rounded-lg md:rounded-[4px] shadow-md border border-[#ccc] flex items-center justify-center text-black hover:bg-[#f4f4f4] transition-all cursor-pointer">
                                <div className="relative">
                                    <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                            </div>

                            {/* Hover Cascade Menu - Responsive Popup */}
                            <div className="absolute top-10 right-0 md:top-0 md:left-12 md:right-auto
                                w-[80vw] md:w-64 
                                bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/50 p-4 
                                opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 origin-top-right md:origin-top-left z-[500]"
                            >
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                                    <div className="w-6 h-6 rounded-full bg-[#4c7c44]/10 flex items-center justify-center text-[#4c7c44]">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800">ค้นหาพื้นที่เป้าหมาย</h4>
                                        <p className="text-[10px] text-gray-400">ระบุพิกัดเพื่อขยายแผนที่</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {/* Province */}
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">จังหวัด (Province)</label>
                                        <select
                                            value={selectedProvince}
                                            onChange={(e) => handleLocationChange('province', e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-[#4c7c44] focus:border-transparent block p-2.5 outline-none transition-all hover:bg-white"
                                        >
                                            <option value="">เลือกจังหวัด</option>
                                            {Object.keys(LOCATIONS).map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>

                                    {/* Amphure */}
                                    <div className={`transition-all duration-300 ${!selectedProvince ? 'opacity-50 grayscale pointer-events-none' : 'opacity-100'}`}>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">อำเภอ (District)</label>
                                        <select
                                            value={selectedAmphure}
                                            onChange={(e) => handleLocationChange('amphure', e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-[#4c7c44] focus:border-transparent block p-2.5 outline-none transition-all hover:bg-white"
                                            disabled={!selectedProvince}
                                        >
                                            <option value="">เลือกอำเภอ</option>
                                            {selectedProvince && LOCATIONS[selectedProvince].amphures.map(a => <option key={a} value={a}>{a}</option>)}
                                        </select>
                                    </div>

                                    {/* Tambon */}
                                    <div className={`transition-all duration-300 ${!selectedAmphure ? 'opacity-50 grayscale pointer-events-none' : 'opacity-100'}`}>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">ตำบล (Sub-district)</label>
                                        <select
                                            value={selectedTambon}
                                            onChange={(e) => handleLocationChange('tambon', e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-[#4c7c44] focus:border-transparent block p-2.5 outline-none transition-all hover:bg-white"
                                            disabled={!selectedAmphure}
                                        >
                                            <option value="">เลือกตำบล</option>
                                            <option value="T1">ตำบล 1</option>
                                            <option value="T2">ตำบล 2</option>
                                        </select>
                                    </div>

                                    {/* Muban */}
                                    <div className={`transition-all duration-300 ${!selectedTambon ? 'opacity-50 grayscale pointer-events-none' : 'opacity-100'}`}>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">หมู่บ้าน (Village)</label>
                                        <select
                                            className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-[#4c7c44] focus:border-transparent block p-2.5 outline-none transition-all hover:bg-white"
                                            disabled={!selectedTambon}
                                        >
                                            <option value="">เลือกหมู่บ้าน</option>
                                            <option value="M1">หมู่ 1</option>
                                            <option value="M2">หมู่ 2</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Zoom Controls - Hidden on Mobile */}
                        <div className="absolute bottom-24 md:bottom-6 left-4 md:left-6 z-[400] hidden md:flex flex-col gap-2">
                            <div className="bg-white rounded-xl shadow-lg flex flex-col border border-gray-200 overflow-hidden w-10">
                                <button onClick={() => mapRef.current?.zoomIn()} className="h-10 flex items-center justify-center hover:bg-gray-50 border-b border-gray-100 text-gray-600 active:bg-gray-100 transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                </button>
                                <button onClick={() => mapRef.current?.zoomOut()} className="h-10 flex items-center justify-center hover:bg-gray-50 text-gray-600 active:bg-gray-100 transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* Floating Result Card - Collapsible Bottom Sheet on Mobile / Fixed on Desktop */}
                        <div className={`absolute z-[400] overflow-y-auto custom-scrollbar transition-all duration-500 ease-in-out
                            bottom-0 left-0 right-0 w-full max-h-[60%] rounded-t-[24px] shadow-[0_-4px_20px_rgba(0,0,0,0.1)]
                            md:top-8 md:right-8 md:bottom-auto md:left-auto md:w-96 md:max-h-[calc(100%-64px)] md:rounded-[24px] md:shadow-2xl
                            ${isResultOpen ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0 md:translate-y-0 md:opacity-100'} 
                            `}
                        >
                            <div className="bg-white/95 backdrop-blur-xl p-5 border border-white/50 h-full relative">
                                {/* Mobile Pull Handle / Close Button */}
                                <div className="md:hidden flex flex-col items-center mb-2" onClick={() => setIsResultOpen(false)}>
                                    <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-2"></div>
                                </div>
                                <button
                                    onClick={() => setIsResultOpen(false)}
                                    className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-400 hover:bg-gray-200 md:hidden z-10"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>

                                <div className="flex items-center justify-between mb-4 mt-2 md:mt-0">
                                    <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        <div className="w-1.5 h-4 bg-[#4c7c44] rounded-full"></div>
                                        ผลการคำนวณ & มูลค่า (Updated)
                                    </h2>
                                    {calculationModel !== 'all' && (
                                        <button
                                            onClick={() => setCalculationModel('all')}
                                            className="text-[10px] font-bold text-[#4c7c44] bg-[#4c7c44]/10 hover:bg-[#4c7c44] hover:text-white px-2 py-1 rounded-lg transition-all"
                                        >
                                            เปรียบเทียบทั้งหมด
                                        </button>
                                    )}
                                </div>

                                {calculationModel !== 'all' && (
                                    <div className="mb-6">
                                        <div className="grid grid-cols-4 gap-2 mb-2">
                                            {[
                                                { id: 'field', label: 'ภาคสนาม', icon: '🌲', color: 'text-[#166534] bg-[#dcfce7]', hover: 'hover:bg-[#bbf7d0]' },
                                                { id: 'drone', label: 'โดรน', icon: '🚁', color: 'text-[#1e40af] bg-[#dbeafe]', hover: 'hover:bg-[#bfdbfe]' },
                                                { id: 'young', label: 'ยางเล็ก', icon: '🌱', color: 'text-[#854d0e] bg-[#fef9c3]', hover: 'hover:bg-[#fef08a]' },
                                                { id: 'satellite', label: 'ดาวเทียม', icon: '🛰️', color: 'text-[#6b21a8] bg-[#f3e8ff]', hover: 'hover:bg-[#e9d5ff]' },
                                            ].map((model) => (
                                                <button
                                                    key={model.id}
                                                    onClick={() => setCalculationModel(model.id)}
                                                    className={`
                                                        flex flex-col items-center justify-center py-2 rounded-xl transition-all border border-transparent
                                                        ${calculationModel === model.id
                                                            ? `${model.color} shadow-sm ring-1 ring-black/5 font-bold scale-105`
                                                            : 'bg-gray-50 text-gray-400 hover:bg-gray-100 scale-100'}
                                                    `}
                                                >
                                                    <span className="text-base mb-0.5">{model.icon}</span>
                                                    <span className="text-[10px] whitespace-nowrap">{model.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="bg-gray-50/50 rounded-lg p-3 mb-4 border border-gray-100 flex items-center justify-center">
                                            {[
                                                { id: 'field', name: 'ภาคสนาม', eq: 'AGB = 0.118 × DBH^2.53', r2: '0.93' },
                                                { id: 'drone', name: 'โดรน', eq: 'AGB = 34.2 × NDVI + 5.8', r2: '0.89' },
                                                { id: 'young', name: 'ยางเล็ก', eq: 'AGB = 0.062 × DBH^2.23', r2: '0.94' },
                                                { id: 'satellite', name: 'ดาวเทียม', eq: 'AGB = 13.57 × TCARI...', r2: '0.87' }
                                            ].filter(m => m.id === calculationModel).map((m) => (
                                                <div key={m.id} className="flex items-center gap-2 text-[10px] text-gray-500">
                                                    <span className="font-bold text-[#4c7c44]">{m.name}:</span>
                                                    <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200">{m.eq}</span>
                                                    <span className="text-gray-400 text-[9px]">(R² {m.r2})</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {calculationModel === 'all' && (
                                    <div className="mb-4">
                                        <button
                                            onClick={() => setCalculationModel('field')}
                                            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2 rounded-xl text-xs transition-all mb-4"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                            กลับไปเลือกแบบเดี่ยว
                                        </button>
                                    </div>
                                )}

                                {calculationModel !== 'all' ? (
                                    <div className="space-y-4">
                                        <div className="text-center">
                                            <div className="text-5xl font-black text-[#2d4a27] tracking-tight leading-none mb-1 animate-fade-in">
                                                {formatNumber(calculateCarbon(trialArea.totalSqM, calculationModel, treeAge))}
                                            </div>
                                            <div className="text-xs font-bold text-[#4c7c44] uppercase tracking-wider">ตันคาร์บอน (tCO₂e)</div>
                                        </div>

                                        <div className="bg-gradient-to-r from-[#fffbeb] to-[#fff7ed] rounded-2xl p-4 border border-[#fed7aa] flex justify-between items-center shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-white flex items-center justify-center text-lg font-bold shadow-md">฿</div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-[#9a3412] uppercase opacity-70">มูลค่าประเมิน</span>
                                                    <span className="text-sm font-bold text-[#ea580c]">ที่ราคาตลาด</span>
                                                </div>
                                            </div>
                                            <div className="text-2xl font-black text-[#c2410c]">
                                                {formatNumber(calculateCarbon(trialArea.totalSqM, calculationModel, treeAge) * marketPrice)}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-fade-in">
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { id: 'field', name: 'ภาคสนาม', icon: '🌲', color: 'text-[#166534]', border: 'border-[#166534]', shadow: 'shadow-green-100' },
                                                { id: 'drone', name: 'โดรน', icon: '🚁', color: 'text-[#1e40af]', border: 'border-[#1e40af]', shadow: 'shadow-blue-100' },
                                                { id: 'young', name: 'ยางเล็ก', icon: '🌱', color: 'text-[#854d0e]', border: 'border-[#854d0e]', shadow: 'shadow-yellow-100' },
                                                { id: 'satellite', name: 'ดาวเทียม', icon: '🛰️', color: 'text-[#6b21a8]', border: 'border-[#6b21a8]', shadow: 'shadow-purple-100' }
                                            ].map((m) => {
                                                const carbonVal = calculateCarbon(trialArea.totalSqM, m.id, treeAge);
                                                const priceVal = carbonVal * marketPrice;
                                                return (
                                                    <div key={m.id} className={`bg-white p-4 rounded-2xl border-2 ${m.border} ${m.shadow} shadow-lg transition-all hover:scale-105 flex flex-col justify-between min-h-[160px]`}>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-xl bg-gray-50 rounded-lg p-1">{m.icon}</span>
                                                                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{m.name}</span>
                                                            </div>
                                                            <div className={`text-2xl font-black ${m.color} leading-none mt-2`}>{formatNumber(carbonVal)}</div>
                                                            <div className="text-[10px] text-gray-400 font-medium">tCO₂e (Carbon)</div>
                                                        </div>

                                                        <div className="pt-3 border-t-2 border-dashed border-gray-100 mt-3">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] text-gray-500 font-bold uppercase">Estimated Value</span>
                                                                <div className="flex items-baseline gap-1">
                                                                    <span className="text-lg font-black text-[#ea580c]">{formatNumber(priceVal)}</span>
                                                                    <span className="text-[10px] text-[#ea580c] font-bold">THB</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="h-px bg-gray-100 my-5"></div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 divide-x divide-gray-100 border border-gray-100 rounded-xl bg-gray-50/50 overflow-hidden">
                                        <div className="p-2 text-center">
                                            <div className="text-lg font-bold text-gray-800 leading-none">{trialArea.rai}</div>
                                            <div className="text-[9px] text-gray-400">ไร่</div>
                                        </div>
                                        <div className="p-2 text-center">
                                            <div className="text-lg font-bold text-gray-800 leading-none">{trialArea.ngan}</div>
                                            <div className="text-[9px] text-gray-400">งาน</div>
                                        </div>
                                        <div className="p-2 text-center">
                                            <div className="text-lg font-bold text-gray-800 leading-none">{trialArea.wah}</div>
                                            <div className="text-[9px] text-gray-400">วา</div>
                                        </div>
                                    </div>

                                    {/* Planting Year Dropdown */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                ปีที่ปลูก (พ.ศ.)
                                            </span>
                                            <span className="bg-[#ecfdf5] text-[#059669] px-2 py-0.5 rounded-md text-[10px] font-bold border border-[#059669]/10 shadow-sm">
                                                อายุ {treeAge} ปี
                                            </span>
                                        </div>


                                        <select
                                            value={plantingYear}
                                            onChange={(e) => setPlantingYear(Number(e.target.value))}
                                            className="w-full bg-white border-2 border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-[#059669] block p-2.5 outline-none transition-all"
                                        >
                                            <option value="">เลือกปีที่ปลูก</option>
                                            {Array.from({ length: currentYear - 2500 + 1 }, (_, i) => currentYear - i).map(year => (
                                                <option key={year} value={year}>
                                                    พ.ศ. {year} (อายุ {currentYear - year} ปี)
                                                </option>
                                            ))}
                                        </select>

                                    </div>

                                    {/* Market Price Slider */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                ราคาตลาด
                                            </span>
                                            <span className="bg-[#f0fdf4] text-[#166534] px-2 py-0.5 rounded-md text-[10px] font-bold border border-[#166534]/10 shadow-sm">฿{marketPrice} / ตัน</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="50"
                                            max="1000"
                                            step="10"
                                            value={marketPrice}
                                            onChange={(e) => setMarketPrice(Number(e.target.value))}
                                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4c7c44]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile: Floating Action Button to Show Results manually */}
                        {!isResultOpen && (
                            <button
                                onClick={() => setIsResultOpen(true)}
                                className="md:hidden absolute bottom-6 right-6 z-[400] bg-white text-[#4c7c44] p-3 rounded-full shadow-lg flex items-center justify-center border border-gray-100 active:scale-95 transition-all"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* 8. Map Preview Section */}
            <section className="py-24 bg-white">
                <div className="container-responsive text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-[#2d4a27] mb-3">แผนที่พื้นที่ปลูกยางพาราในประเทศไทย</h2>
                    <p className="text-gray-500 font-medium">ศักยภาพการกักเก็บคาร์บอนในแต่ละภูมิภาค</p>
                    <div className="w-16 h-1 bg-[#4c7c44] mx-auto rounded-full mt-6 mb-20"></div>

                    <div className="bg-[#f7f5f2] p-8 md:p-16 rounded-[48px] shadow-sm border border-gray-50 max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16">
                            {[
                                { val: '15.2 ล้านไร่', label: 'พื้นที่ปลูกยางพาราทั้งหมด', icon: '🗺️' },
                                { val: '45.6 ล้านตัน', label: 'CO₂ ที่กักเก็บได้ต่อปี', icon: '🍃' },
                                { val: '3.2 ตัน/ไร่', label: 'อัตราเฉลี่ยการกักเก็บคาร์บอน', icon: '📈' }
                            ].map((stat, idx) => (
                                <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
                                    <span className="text-3xl mb-4">{stat.icon}</span>
                                    <div className="text-3xl font-bold text-[#2d4a27] mb-2">{stat.val}</div>
                                    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white rounded-[40px] overflow-hidden shadow-inner border border-gray-100 p-6 mb-16 relative group">
                            <div className="absolute inset-0 bg-[#4c7c44]/5 z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <img
                                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2000"
                                alt="Thailand Rubber Map"
                                className="w-full h-96 object-cover rounded-[32px] grayscale hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                <Link to="/map" className="bg-[#4c7c44] text-white px-8 py-4 rounded-xl font-black shadow-xl hover:scale-110 transition-transform">
                                    เปิดดูแผนที่แบบละเอียด
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { title: 'ภาคใต้', val: '8.5 ล้านไร่', desc: 'พื้นที่มากที่สุด', border: 'border-l-4 border-l-[#4c7c44]' },
                                { title: 'ภาคตะวันออก', val: '3.2 ล้านไร่', desc: 'พื้นที่รองลงมา', border: 'border-l-4 border-l-[#a3b18a]' },
                                { title: 'ภาคตะวันออกเฉียงเหนือ', val: '2.8 ล้านไร่', desc: 'ศักยภาพสูง', border: 'border-l-4 border-l-[#3a5a40]' },
                                { title: 'ภาคอื่นๆ', val: '0.7 ล้านไร่', desc: 'พื้นที่กระจาย', border: 'border-l-4 border-l-gray-300' }
                            ].map((reg, idx) => (
                                <div key={idx} className={`bg-white p-6 rounded-2xl ${reg.border} text-left shadow-sm`}>
                                    <div className="text-sm font-semibold text-gray-400 mb-2">{reg.title}</div>
                                    <div className="text-2xl font-bold text-[#2d4a27] mb-2">{reg.val}</div>
                                    <div className="text-xs text-gray-500 font-medium">{reg.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 9. Footer */}
            <footer className="bg-[#f7f5f2] border-t border-gray-100 pt-16 pb-10">
                <div className="container-responsive">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                        <div className="text-left">
                            <BrandLogo mode="dark" size={36} className="mb-6" />
                            <p className="text-gray-500 font-medium leading-relaxed text-sm max-w-sm">
                                แพลตฟอร์มดิจิทัลสำหรับการประเมินและวิเคราะห์การกักเก็บคาร์บอนจากสวนยางพารา เพื่อสนับสนุนการจัดการพื้นที่เกษตรอย่างยั่งยืน
                            </p>
                        </div>
                        <div className="text-left">
                            <h4 className="text-sm font-bold text-[#2d4a27] uppercase tracking-wider mb-6">ลิงก์ด่วน</h4>
                            <ul className="space-y-3 text-gray-500 font-medium text-sm">
                                <li><a href="#" className="hover:text-[#4c7c44] transition-colors">เกี่ยวกับเรา</a></li>
                                <li><a href="#" className="hover:text-[#4c7c44] transition-colors">วิธีการใช้งาน</a></li>
                                <li><a href="#" className="hover:text-[#4c7c44] transition-colors">นโยบายความเป็นส่วนตัว</a></li>
                            </ul>
                        </div>
                        <div className="text-left">
                            <h4 className="text-sm font-bold text-[#2d4a27] uppercase tracking-wider mb-6">ติดต่อทึมงาน</h4>
                            <ul className="space-y-4 text-gray-500 font-medium text-sm">
                                <li className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[#eef2e6] rounded-lg flex items-center justify-center text-[#4c7c44]">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-gray-400">Email Support</span>
                                        support@keptcarbon.com
                                    </div>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[#eef2e6] rounded-lg flex items-center justify-center text-[#4c7c44]">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-gray-400">Website</span>
                                        http://localhost:3000/
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>

            <button
                onClick={scrollToTop}
                className={`fixed bottom-8 right-8 z-[100] p-4 rounded-full bg-gradient-to-tr from-[#4c7c44] to-[#609955] text-white shadow-lg shadow-green-900/20 transition-all duration-500 transform hover:scale-110 active:scale-95 group
                    ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}
                `}
            >
                <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-0 group-hover:opacity-75 duration-1000"></div>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" /></svg>
            </button>
        </div>
    )
}

export default LandingPage
