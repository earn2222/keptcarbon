import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '../components/atoms'
import './LandingPage.css'

function LandingPage() {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        // Generate random particles for atmospheric effect
        const p = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 15}s`,
            size: `${Math.random() * 3 + 1}px`
        }));
        setParticles(p);
    }, []);

    return (
        <div className="landing-wrapper">
            {/* 1. Immersive Navigation */}
            <nav className="next-nav">
                <BrandLogo mode="white" size={24} />

                <div className="hidden lg:flex gap-12 font-bold text-sm tracking-widest text-[#64748b]">
                    <a href="#vision" className="hover:text-white transition-colors">VISION</a>
                    <a href="#technology" className="hover:text-white transition-colors">TECH</a>
                    <a href="#stats" className="hover:text-white transition-colors">DATA</a>
                </div>

                <Link to="/map" className="btn-signin">
                    Enter Portal
                </Link>
            </nav>

            {/* 2. Hero - The Next Gen Visual */}
            <section className="hero-v5">
                {particles.map(p => (
                    <div
                        key={p.id}
                        className="carbon-particle"
                        style={{ left: p.left, animationDelay: p.delay, width: p.size, height: p.size }}
                    />
                ))}

                <div className="hero-v5-content">
                    <span className="hero-v5-label">Future of Nature Assets</span>
                    <h1 className="hero-v5-title">
                        เปลี่ยนใบไม้ <span>ให้เป็นมูลค่า</span>
                    </h1>
                    <p className="hero-v5-desc">
                        KeptCarbon ปฏิวัติการประเมินคาร์บอนเครดิตด้วยเทคโนโลยีที่ล้ำสมัยที่สุด
                        เพื่อให้เกษตรกรไทยเข้าถึงอนาคตที่ยั่งยืนระดับโลก
                    </p>
                    <div className="flex gap-6 items-center">
                        <Link to="/map" className="px-10 py-5 bg-white text-black font-bold rounded-full text-lg hover:scale-105 transition-transform">
                            เริ่มประเมินแปลงของคุณ
                        </Link>
                        <a href="#" className="hidden sm:block text-[#10b981] font-bold border-b-2 border-[#10b981] pb-1">
                            เทคโนโลยีเบื้องหลังการประมวลผล
                        </a>
                    </div>
                </div>

                <div className="hero-visual-bg">
                    <img src="/carbon-next.png" alt="Leaf Tech" className="hero-v5-image" />
                </div>
            </section>

            {/* 3. Visionary Features */}
            <section id="vision" className="v5-features">
                <div className="v5-grid">
                    {[
                        { title: 'Digitalized Ecology', icon: '🧬', desc: 'แปลงสภาพระบบนิเวศของสวนยางพาราให้เป็นชุดข้อมูลดิจิทัลที่แม่นยำที่สุด' },
                        { title: 'Biotech Precision', icon: '🔋', desc: 'อ้างอิงสูตรคำนวณมวลชีวภาพระดับสากล เพื่อความน่าเชื่อถือในตลาดคาร์บอนระดับโลก' },
                        { title: 'Global Standard', icon: '🌍', desc: 'เชื่อมโยงภาคการเกษตรท้องถิ่นเข้าสู่มาตรฐานความยั่งยืนสากลอย่างราบรื่น' }
                    ].map((item, i) => (
                        <div key={i} className="v5-card">
                            <span className="v5-card-icon">{item.icon}</span>
                            <h3 className="text-xl font-bold mb-4 tracking-tight">{item.title}</h3>
                            <p className="text-[#94a3b8]">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. Data Stats Section */}
            <section id="stats" className="v5-stats">
                <div className="v5-stats-flex">
                    {[
                        { label: 'Registered Area (Rai)', val: '45K' },
                        { label: 'Calculated Co2e', val: '2.5M' },
                        { label: 'Active Farmers', val: '1.2K' }
                    ].map((stat, i) => (
                        <div key={i} className="stat-item">
                            <div className="stat-val">{stat.val}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. Immersive Technology Section */}
            <section id="technology" className="py-20 px-[6%]">
                <div className="flex flex-col lg:flex-row items-center gap-20">
                    <div className="flex-1">
                        <h2 className="text-4xl font-bold leading-tight mb-8 tracking-tight">
                            THE POWER OF <br />
                            <span className="text-[#10b981]">SPATIAL INTELLIGENCE</span>
                        </h2>
                        <p className="text-xl text-[#94a3b8] mb-10">
                            เราใช้ชุดข้อมูลจากภาพถ่ายดาวเทียมความละเอียดสูงผสานกับ AI
                            เพื่อระบุขอบเขตแปลงและวิเคราะห์สุขภาพของต้นพืชย้อนหลัง
                            สร้างรายงานคาร์บอนเครดิตที่โปร่งใสและตรวจสอบได้ 100%
                        </p>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <h4 className="font-bold text-white mb-2">Satellite Scan</h4>
                                <p className="text-sm text-[#475569]">ตรวจสอบพิกัด GIS ระดับมิลลิเมตร</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-2">Automated Report</h4>
                                <p className="text-sm text-[#475569]">สรุปรายงานผลลัพธ์ในรูปแบบ PDF ทันที</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 relative">
                        <div className="w-full aspect-square bg-[#10b981]/5 border border-[#10b981]/20 rounded-[60px] flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/20 to-transparent" />
                            <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2000" alt="Tech" className="w-[85%] h-[85%] object-cover rounded-[40px] shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000" />
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. High Impact CTA */}
            <section className="v5-cta">
                <h2 className="cta-title">
                    START THE <br />
                    <span>REVOLUTION.</span>
                </h2>
                <Link to="/map" className="cta-btn-large">
                    เข้าร่วมกับเราวันนี้
                </Link>
            </section>

            {/* 7. Minimal Footer */}
            <footer className="py-20 px-[6%] border-t border-white/5 flex flex-col items-center">
                <BrandLogo mode="white" size={40} className="mb-8" />
                <div className="flex gap-10 text-xs font-bold text-[#475569] mb-10">
                    <a href="#" className="hover:text-white">ABOUT</a>
                    <a href="#" className="hover:text-white">SUPPORT</a>
                    <a href="#" className="hover:text-white">TERMS</a>
                    <a href="#" className="hover:text-white">PRIVACY</a>
                </div>
                <div className="text-[10px] text-[#2d3748] font-bold tracking-[5px] uppercase">
                    Designed for the future of Earth.
                </div>
            </footer>
        </div>
    )
}

export default LandingPage
