import React from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '../components/atoms'

/**
 * Modern Responsive Landing Page for Carbon Assessment System
 * Minimal, Green-themed, and Mobile-First
 */
function LandingPage() {
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
                            <Link to="/map" className="bg-[#4c7c44] text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-sm hover:bg-[#3d6336] transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                                เข้าสู่ระบบ
                            </Link>
                        </div>

                        {/* Mobile Login Button */}
                        <Link to="/map" className="md:hidden bg-[#4c7c44] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm">
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

            {/* 6. Footer */}
            <footer className="bg-[#1b301a] text-white pt-24 pb-12">
                <div className="container-responsive">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-20">
                        {/* Brand Column */}
                        <div className="text-left">
                            <BrandLogo mode="white" size={40} className="mb-8" />
                            <p className="text-gray-400 font-medium leading-relaxed mb-10 max-w-sm">
                                แพลตฟอร์มดิจิทัลสำหรับการประเมินและวิเคราะห์การกักเก็บคาร์บอนจากสวนยางพารา เพื่อสนับสนุนการจัดการพื้นที่เกษตรอย่างยั่งยืน
                            </p>
                            <div className="flex gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-11 h-11 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer border border-white/10">
                                        <div className="w-2.5 h-2.5 bg-white/40 rounded-full" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Links Column */}
                        <div className="text-left">
                            <h4 className="text-xl font-bold mb-10 border-b border-white/10 pb-4 inline-block pr-12">ลิงก์ด่วน</h4>
                            <ul className="space-y-4 text-gray-400 font-medium text-base">
                                <li><a href="#" className="hover:text-white transition-colors">เกี่ยวกับเรา</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">วิธีการใช้งาน</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">คำถามที่พบบ่อย</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">นโยบายความเป็นส่วนตัว</a></li>
                            </ul>
                        </div>

                        {/* Contact Column */}
                        <div className="text-left">
                            <h4 className="text-xl font-bold mb-10 border-b border-white/10 pb-4 inline-block pr-12">ติดต่อเรา</h4>
                            <ul className="space-y-6 text-gray-400 font-medium text-base">
                                <li className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </div>
                                    info@carbonassessment.th
                                </li>
                                <li className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    </div>
                                    02-XXX-XXXX
                                </li>
                                <li className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    กรุงเทพมหานคร, ประเทศไทย
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-[4px]">
                            © 2024 KEPT CARBON System. สงวนลิขสิทธิ์.
                        </div>
                        <div className="text-xs text-gray-600 font-bold">
                            Designed for Sustainable Agriculture
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage
