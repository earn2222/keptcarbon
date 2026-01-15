import React, { useState, useEffect } from 'react'
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

/**
 * Modern Responsive Landing Page for Carbon Assessment System
 * Minimal, Green-themed, and Mobile-First
 */
function LandingPage() {
    const [showScrollTop, setShowScrollTop] = useState(false)

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
    const [estimatedCarbon, setEstimatedCarbon] = useState(0)

    // Geoman Control Component
    const GeomanController = ({ setArea, setCarbon }) => {
        const map = useMap()

        useEffect(() => {
            // Add Controls
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

                // Convert to Rai-Ngan-Wah
                // 1 Rai = 1600 sqm, 1 Ngan = 400 sqm, 1 Wah = 4 sqm
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

                // Estimate Carbon: Approx 1.2 ton/rai * Area (Just a rough estimate for trial)
                // Total Area in Rai (float)
                const totalRai = totalSqM / 1600;
                setCarbon(parseFloat((totalRai * 1.2).toFixed(2)))
            }

            map.on('pm:create', (e) => {
                calculateArea();
                e.layer.on('pm:edit', calculateArea);
            });
            map.on('pm:remove', calculateArea);

            return () => {
                // map.pm.removeControls() // Can cause issues if unmounting rapidly, but safe here
            }
        }, [map, setArea, setCarbon])

        return null
    }

    const handleTrialSave = () => {
        if (trialArea.totalSqM <= 0) {
            alert("กรุณาวาดแปลงอย่างน้อย 1 แปลงก่อนบันทึกข้อมูล");
            return;
        }
        if (confirm("การบันทึกข้อมูลจำเป็นต้องเข้าสู่ระบบ\n\nกด 'ตกลง' เพื่อเข้าสู่ระบบหรือสมัครสมาชิก")) {
            window.location.href = '/login'; // Or use useNavigate if available, but simple href is fine for now
        }
    }

    return (
        <div className="min-h-screen bg-white font-sans text-gray-800">
            {/* 1. Navigation */}
            <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="container-responsive">
                    <div className="flex justify-between items-center h-20 md:h-24">
                        {/* Logo */}
                        <BrandLogo mode="dark" size={32} />

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center gap-10">
                            <Link to="/" className="flex items-center gap-2 text-gray-600 font-medium hover:text-[#4c7c44] transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                แผนที่
                            </Link>
                            <Link to="/demo" className="flex items-center gap-2 text-gray-600 font-medium hover:text-[#4c7c44] transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                </svg>
                                แดชบอร์ด
                            </Link>
                            <Link to="/login" className="bg-[#4c7c44] text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-sm hover:bg-[#3d6336] transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                                เข้าสู่ระบบ
                            </Link>
                        </div>

                        {/* Mobile Login Button */}
                        <Link to="/login" className="md:hidden bg-[#4c7c44] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm">
                            เข้าสู่ระบบ
                        </Link>
                    </div>
                </div>
            </nav>

            {/* 2. Hero Section */}
            <section className="bg-[#f7f5f2] py-12 md:py-24 overflow-hidden">
                <div className="container-responsive">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        {/* Text Content */}
                        <div className="w-full lg:w-1/2 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 bg-[#eef2e6] text-[#2d4a27] px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border border-[#e0e7d5]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8.17,20C12.14,20 15.64,17.43 16.92,14H18.1L20,16V9L18.1,7H17V8Z" />
                                </svg>
                                เทคโนโลยีเพื่อความยั่งยืน
                            </div>
                            <h1 className="text-[2.75rem] md:text-5xl lg:text-[4.75rem] font-bold tracking-tight text-[#2d4a27] leading-[1.1] mb-8">
                                ระบบการประเมิน<br />
                                การกักเก็บคาร์บอน<br />
                                จากสวนยางพารา
                            </h1>
                            <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0 font-medium">
                                แพลตฟอร์มดิจิทัลสำหรับการประเมิน คำนวณ วิเคราะห์ และแสดงผลปริมาณการกักเก็บคาร์บอน เพื่อสนับสนุนการจัดการพื้นที่เกษตรอย่างยั่งยืน และการลดก๊าซเรือนกระจก
                            </p>
                            <Link to="/map" className="inline-flex items-center gap-3 bg-[#4c7c44] text-white px-10 py-5 rounded-xl font-semibold text-xl shadow-lg shadow-green-900/10 hover:bg-[#3d6336] transition-all transform hover:-translate-y-1 active:scale-95 mb-10">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                เริ่มประเมินแปลงของเรา
                            </Link>
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8">
                                <div className="flex items-center gap-2 text-[#4c7c44] font-semibold">
                                    <div className="w-8 h-8 bg-[#e8eddf] rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    ประเมินได้แม่นยำ
                                </div>
                                <div className="flex items-center gap-2 text-[#4c7c44] font-semibold">
                                    <div className="w-8 h-8 bg-[#e8eddf] rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </div>
                                    ใช้งานง่าย รวดเร็ว
                                </div>
                            </div>
                        </div>

                        {/* Image Preview */}
                        <div className="w-full lg:w-1/2 relative">
                            <div className="rounded-[48px] overflow-hidden shadow-2xl border-[16px] border-white/40">
                                <img
                                    src="/rubber-hero.png"
                                    alt="Rubber Plantation Aerial View"
                                    className="w-full h-auto object-cover"
                                />

                                {/* Floating Overlay Markers */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <div className="w-20 h-20 bg-white rounded-full p-2 shadow-2xl border-4 border-[#4c7c44] flex items-center justify-center animate-pulse">
                                        <svg className="w-12 h-12 text-[#4c7c44]" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW: Trial Map Section (Embedded) */}
            <section id="trial-map" className="py-20 bg-white border-b border-gray-100 scroll-mt-20">
                <div className="container-responsive">
                    <div className="flex flex-col md:flex-row gap-12 items-start">
                        {/* Map Area */}
                        <div className="w-full md:w-2/3">
                            <div className="bg-gray-100 rounded-[32px] overflow-hidden shadow-lg border border-gray-200 h-[500px] relative z-0">
                                <MapContainer
                                    center={[13.7563, 100.5018]}
                                    zoom={6}
                                    scrollWheelZoom={false}
                                    style={{ height: '100%', width: '100%' }}
                                    className="z-0"
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.google.com/help/terms_maps/">Google</a>'
                                        url="http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}"
                                    />
                                    <GeomanController setArea={setTrialArea} setCarbon={setEstimatedCarbon} />
                                </MapContainer>

                                {/* Overlay Badge */}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-xs font-bold text-[#4c7c44] shadow-sm z-[400]">
                                    Trial Mode (Beta)
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm mt-4 text-center">
                                * คลิกที่เครื่องมือด้านบนซ้ายของแผนที่เพื่อเริ่มวาดแปลง (สี่เหลี่ยม หรือ หลายเหลี่ยม)
                            </p>
                        </div>

                        {/* Controls & Stats */}
                        <div className="w-full md:w-1/3 space-y-8">
                            <div>
                                <h3 className="text-3xl font-bold text-[#2d4a27] mb-2">ทดลองประเมิน</h3>
                                <p className="text-gray-500 font-medium">
                                    ลองวาดแปลงของคุณเพื่อดูศักยภาพการกักเก็บคาร์บอนเบื้องต้น
                                </p>
                            </div>

                            {/* Stats Card */}
                            <div className="bg-[#f7f5f2] rounded-3xl p-8 border border-[#e0e7d5]">
                                <div className="mb-6">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">ขนาดพื้นที่</label>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className="text-4xl font-bold text-[#2d4a27]">{trialArea.rai}</span>
                                        <span className="text-gray-500 font-medium">ไร่</span>
                                        <span className="text-2xl font-bold text-[#2d4a27] ml-2">{trialArea.ngan}</span>
                                        <span className="text-gray-500 font-medium">งาน</span>
                                        <span className="text-2xl font-bold text-[#2d4a27] ml-2">{trialArea.wah}</span>
                                        <span className="text-gray-500 font-medium">ตร.ว.</span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">({trialArea.totalSqM.toLocaleString()} ตร.ม.)</div>
                                </div>

                                <div className="mb-8">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">คาร์บอนโดยประมาณ</label>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className="text-5xl font-bold text-[#4c7c44]">{estimatedCarbon}</span>
                                        <span className="text-lg text-gray-500 font-medium">ตัน CO₂</span>
                                    </div>
                                    <p className="text-xs text-red-400 mt-2">* เป็นค่าประมาณการเบื้องต้นเท่านั้น</p>
                                </div>

                                <button
                                    onClick={handleTrialSave}
                                    className="w-full bg-[#2d4a27] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-[#1f351b] transition-all flex items-center justify-center gap-2 active:scale-95"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                    </svg>
                                    บันทึกข้อมูลแปลง
                                </button>
                                <p className="text-center text-xs text-gray-400 mt-4">
                                    ต้องเข้าสู่ระบบสมาชิกเพื่อบันทึก
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </section>



            {/* NEW: Assessment Process Section */}
            <section className="py-24 bg-[#fbfaf8]">
                <div className="container-responsive">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-[#2d4a27] mb-3">ขั้นตอนการประเมินและการคำนวณ</h2>
                        <p className="text-gray-500 font-medium">กระบวนการวิเคราะห์การกักเก็บคาร์บอนที่เป็นมาตรฐาน</p>
                        <div className="w-16 h-1 bg-[#4c7c44] mx-auto rounded-full mt-6"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            { step: '01', title: 'กำหนดพื้นที่', desc: 'วาดขอบเขตแปลงยางพาราบนแผนที่ หรือนำเข้าไฟล์ Shapefile (.zip) ที่มีพิกัด WGS84' },
                            { step: '02', title: 'ระบุข้อมูลเพาะปลูก', desc: 'ใส่อายุต้นยาง, ปีที่เริ่มปลูก และสายพันธุ์ (เช่น RRIM 600) เพื่อความแม่นยำในการคำนวณ' },
                            { step: '03', title: 'เลือกสูตรคำนวณ', desc: 'รองรับมาตรฐาน TGO (อบก.), กรมวิชาการเกษตร และสมการ Allometric จากงานวิจัย' },
                            { step: '04', title: 'สรุปผลและรายงาน', desc: 'แสดงปริมาณคาร์บอน (tCO₂e), มวลชีวภาพ และมูลค่าคาร์บอนเครดิตเบื้องต้น' }
                        ].map((item, idx) => (
                            <div key={idx} className="relative group">
                                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm h-full hover:shadow-lg transition-all relative z-10">
                                    <div className="text-6xl font-black text-gray-100 mb-6 absolute top-4 right-6 group-hover:text-[#eef2e6] transition-colors">{item.step}</div>
                                    <h3 className="text-xl font-bold text-[#2d4a27] mb-4 relative z-20">{item.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed relative z-20">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. Information Section */}
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

            {/* 4. Capabilities Section */}
            <section className="py-24 bg-[#fbfaf8]">
                <div className="container-responsive">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-[#2d4a27] mb-3">บทบาทของระบบ</h2>
                        <p className="text-gray-500 font-medium">ระบบนี้ทำหน้าที่อะไรบ้าง</p>
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

            {/* 5. Map Preview Section */}
            <section className="py-24 bg-white">
                <div className="container-responsive text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-[#2d4a27] mb-3">แผนที่พื้นที่ปลูกยางพาราในประเทศไทย</h2>
                    <p className="text-gray-500 font-medium">ศักยภาพการกักเก็บคาร์บอนในแต่ละภูมิภาค</p>
                    <div className="w-16 h-1 bg-[#4c7c44] mx-auto rounded-full mt-6 mb-20"></div>

                    <div className="bg-[#f7f5f2] p-8 md:p-16 rounded-[48px] shadow-sm border border-gray-50 max-w-6xl mx-auto">
                        {/* Highlights Grid */}
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

                        {/* Map Image Placeholder */}
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

                        {/* Regional Data Grid */}
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

            {/* 6. Footer - Minimal Light */}
            <footer className="bg-[#f7f5f2] border-t border-gray-100 pt-16 pb-10">
                <div className="container-responsive">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                        {/* Brand Column */}
                        <div className="text-left">
                            <BrandLogo mode="dark" size={36} className="mb-6" />
                            <p className="text-gray-500 font-medium leading-relaxed text-sm max-w-sm">
                                แพลตฟอร์มดิจิทัลสำหรับการประเมินและวิเคราะห์การกักเก็บคาร์บอนจากสวนยางพารา เพื่อสนับสนุนการจัดการพื้นที่เกษตรอย่างยั่งยืน
                            </p>
                        </div>

                        {/* Links Column */}
                        <div className="text-left">
                            <h4 className="text-sm font-bold text-[#2d4a27] uppercase tracking-wider mb-6">ลิงก์ด่วน</h4>
                            <ul className="space-y-3 text-gray-500 font-medium text-sm">
                                <li><a href="#" className="hover:text-[#4c7c44] transition-colors">เกี่ยวกับเรา</a></li>
                                <li><a href="#" className="hover:text-[#4c7c44] transition-colors">วิธีการใช้งาน</a></li>
                                <li><a href="#" className="hover:text-[#4c7c44] transition-colors">คำถามที่พบบ่อย</a></li>
                                <li><a href="#" className="hover:text-[#4c7c44] transition-colors">นโยบายความเป็นส่วนตัว</a></li>
                            </ul>
                        </div>

                        {/* Contact Column */}
                        <div className="text-left">
                            <h4 className="text-sm font-bold text-[#2d4a27] uppercase tracking-wider mb-6">ติดต่อเรา</h4>
                            <ul className="space-y-4 text-gray-500 font-medium text-sm">
                                <li className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[#eef2e6] rounded-lg flex items-center justify-center text-[#4c7c44]">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-gray-400">Technical Support</span>
                                        support@engrid.co.th
                                    </div>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[#eef2e6] rounded-lg flex items-center justify-center text-[#4c7c44]">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-gray-400">Call Center</span>
                                        02-XXX-XXXX (Engrid)
                                    </div>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[#eef2e6] rounded-lg flex items-center justify-center text-[#4c7c44]">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-gray-400">Location</span>
                                        Engrid Co., Ltd. Thailand
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-xs text-gray-400 font-medium">
                            © 2024 KEPT CARBON System. สงวนลิขสิทธิ์
                        </div>
                        <div className="text-xs text-gray-400 font-medium">
                            Designed for Sustainable Agriculture
                        </div>
                    </div>
                </div>
            </footer>
            {/* Scroll to Top Button */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-8 right-8 z-[100] p-4 rounded-full bg-gradient-to-tr from-[#4c7c44] to-[#609955] text-white shadow-lg shadow-green-900/20 transition-all duration-500 transform hover:scale-110 active:scale-95 group
                    ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}
                `}
                aria-label="Scroll to top"
            >
                <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-0 group-hover:opacity-75 duration-1000"></div>
                <svg
                    className="w-6 h-6 group-hover:-translate-y-1 transition-transform duration-300 ease-out"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" />
                </svg>
            </button>
        </div >
    )
}

export default LandingPage
