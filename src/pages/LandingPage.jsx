import React from 'react'
import { Link } from 'react-router-dom'

// Icons
const LeafIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
    </svg>
)

const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>
)

const BarChartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10"></line>
        <line x1="18" y1="20" x2="18" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="16"></line>
    </svg>
)

const TreeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22v-7"></path>
        <path d="M9 22h6"></path>
        <path d="M12 15l-5-5 2-3-3-3h12l-3 3 2 3z"></path>
    </svg>
)

const GlobeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
)

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
)

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
)

function LandingPage() {
    const features = [
        {
            icon: MapPinIcon,
            title: 'จัดการแปลงด้วยแผนที่',
            description: 'วาดแปลงยางพาราบนแผนที่ดาวเทียม พร้อมคำนวณพื้นที่อัตโนมัติทั้งตารางเมตรและไร่-งาน-ตารางวา'
        },
        {
            icon: BarChartIcon,
            title: 'คำนวณคาร์บอนอัตโนมัติ',
            description: 'ระบบคำนวณปริมาณคาร์บอนที่กักเก็บได้โดยอัตโนมัติ จากอายุต้นยางและพื้นที่แปลง'
        },
        {
            icon: TreeIcon,
            title: 'วิเคราะห์มวลชีวภาพ',
            description: 'คำนวณมวลชีวภาพเหนือพื้นดิน (Above-ground Biomass) ตามสูตรเฉพาะของยางพารา'
        },
        {
            icon: GlobeIcon,
            title: 'ภาพถ่ายดาวเทียมรายปี',
            description: 'ดูภาพถ่ายดาวเทียมย้อนหลังรายปี เพื่อติดตามการเปลี่ยนแปลงของแปลงยาง'
        }
    ]

    const stats = [
        { value: '1,000+', label: 'แปลงยางที่ลงทะเบียน' },
        { value: '50,000', label: 'ไร่ที่ประเมินแล้ว' },
        { value: '25,000', label: 'ตันคาร์บอนที่กักเก็บ' },
        { value: '500+', label: 'เกษตรกรที่ใช้งาน' }
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 h-[70px] bg-white/95 backdrop-blur-lg flex items-center justify-between px-8 z-50 shadow-sm">
                <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-800">
                    <div className="w-9 h-9 gradient-primary rounded-lg flex items-center justify-center text-white">
                        <LeafIcon />
                    </div>
                    <span>KeptCarbon</span>
                </Link>

                <ul className="hidden md:flex items-center gap-8 list-none">
                    <li><a href="#features" className="text-gray-500 font-medium hover:text-[#3cc2cf] transition-colors">คุณสมบัติ</a></li>
                    <li><a href="#about" className="text-gray-500 font-medium hover:text-[#3cc2cf] transition-colors">เกี่ยวกับเรา</a></li>
                    <li><a href="#contact" className="text-gray-500 font-medium hover:text-[#3cc2cf] transition-colors">ติดต่อ</a></li>
                </ul>

                <div className="hidden md:flex items-center gap-4">
                    <Link to="/login" className="px-6 py-2.5 rounded-xl font-semibold text-[#3cc2cf] border-2 border-[#3cc2cf] hover:bg-[#3cc2cf] hover:text-white transition-all">
                        เข้าสู่ระบบ
                    </Link>
                    <Link to="/login" className="px-6 py-2.5 rounded-xl font-semibold text-white gradient-primary hover:scale-105 transition-transform shadow-lg shadow-[#3cc2cf]/30">
                        เริ่มต้นใช้งาน
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="min-h-screen grid lg:grid-cols-2 items-center gap-12 pt-[100px] px-8 lg:px-16 bg-gradient-to-br from-[#3cc2cf]/5 to-[#7c5cfc]/5 relative overflow-hidden">
                <div className="absolute top-[-50%] right-[-20%] w-[80%] h-[150%] bg-[radial-gradient(circle,rgba(60,194,207,0.08)_0%,transparent_70%)] pointer-events-none"></div>

                <div className="z-10 animate-fadeIn">
                    <div className="inline-flex items-center gap-2 bg-[#3cc2cf]/10 text-[#3cc2cf] px-4 py-2 rounded-full text-sm font-medium mb-6">
                        <LeafIcon />
                        <span>ระบบประเมินคาร์บอนสวนยางพารา</span>
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 leading-tight mb-6">
                        ประเมินการกักเก็บ
                        <span className="bg-gradient-to-r from-[#3cc2cf] to-[#66d4de] bg-clip-text text-transparent"> คาร์บอน </span>
                        ในสวนยางพาราของคุณ
                    </h1>

                    <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                        เครื่องมือสำหรับคำนวณปริมาณคาร์บอนที่สวนยางพาราของคุณกักเก็บได้
                        ผ่านการวาดแปลงบนแผนที่และคำนวณด้วยสูตรมาตรฐานสำหรับยางพารา (Hevea brasiliensis)
                    </p>

                    <div className="flex flex-wrap gap-4 mb-8">
                        <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white gradient-primary hover:scale-105 transition-transform shadow-lg shadow-[#3cc2cf]/30">
                            เริ่มประเมินเลย
                            <ArrowRightIcon />
                        </Link>
                        <a href="#features" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-gray-700 bg-white border border-gray-200 hover:border-[#3cc2cf] hover:text-[#3cc2cf] transition-all">
                            ดูคุณสมบัติ
                        </a>
                    </div>

                    <div className="flex flex-wrap gap-6">
                        {['ใช้งานฟรี', 'คำนวณอัตโนมัติ', 'รองรับไฟล์ SHP'].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-gray-500 text-sm">
                                <span className="text-green-500"><CheckIcon /></span>
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hero Visual */}
                <div className="relative h-[500px] z-10 hidden lg:block">
                    <div className="absolute top-[10%] left-[10%] bg-white rounded-2xl p-5 shadow-xl flex items-center gap-4 animate-float">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">🌱</div>
                        <div>
                            <div className="text-xl font-bold text-gray-800">2,500</div>
                            <div className="text-sm text-gray-500">ตันคาร์บอน</div>
                        </div>
                    </div>

                    <div className="absolute top-[40%] right-[5%] bg-white rounded-2xl p-5 shadow-xl flex items-center gap-4 animate-float delay-1">
                        <div className="w-12 h-12 rounded-xl bg-[#3cc2cf]/15 flex items-center justify-center text-2xl">📊</div>
                        <div>
                            <div className="text-xl font-bold text-gray-800">+15%</div>
                            <div className="text-sm text-gray-500">เพิ่มขึ้นจากปีก่อน</div>
                        </div>
                    </div>

                    <div className="absolute bottom-[15%] left-[20%] bg-white rounded-2xl p-5 shadow-xl flex items-center gap-4 animate-float delay-2">
                        <div className="w-12 h-12 rounded-xl bg-[#7c5cfc]/15 flex items-center justify-center text-2xl">🗺️</div>
                        <div>
                            <div className="text-xl font-bold text-gray-800">50</div>
                            <div className="text-sm text-gray-500">แปลงยาง</div>
                        </div>
                    </div>

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-3xl bg-gradient-to-br from-green-100 via-green-200 to-green-300 shadow-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(124,179,66,0.3)_0%,transparent_40%),radial-gradient(circle_at_70%_60%,rgba(60,194,207,0.3)_0%,transparent_50%)]"></div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-white py-16 px-8">
                <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center p-6 animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="text-4xl font-bold text-[#3cc2cf] mb-2">{stat.value}</div>
                            <div className="text-gray-500 text-sm">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-8 max-w-6xl mx-auto">
                <div className="text-center max-w-xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">คุณสมบัติหลัก</h2>
                    <p className="text-gray-500 text-lg">
                        เครื่องมือครบครันสำหรับการจัดการและประเมินคาร์บอนในสวนยางพารา
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl p-8 text-center shadow-card hover:shadow-hover hover:-translate-y-2 transition-all duration-300 animate-fadeIn"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="w-16 h-16 mx-auto mb-6 bg-[#3cc2cf]/10 rounded-2xl flex items-center justify-center text-[#3cc2cf]">
                                <feature.icon />
                            </div>
                            <h3 className="text-lg font-semibold mb-3 text-gray-800">{feature.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="gradient-primary py-20 px-8 text-center">
                <div className="max-w-xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-4">พร้อมเริ่มประเมินคาร์บอนหรือยัง?</h2>
                    <p className="text-white/90 text-lg mb-8">
                        เริ่มต้นใช้งานฟรีวันนี้ และดูว่าสวนยางของคุณกักเก็บคาร์บอนได้เท่าไหร่
                    </p>
                    <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold bg-white text-[#3cc2cf] hover:scale-105 transition-transform shadow-xl">
                        เริ่มต้นใช้งานฟรี
                        <ArrowRightIcon />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 py-10 px-8">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-white text-xl font-bold">
                        <div className="w-9 h-9 gradient-primary rounded-lg flex items-center justify-center">
                            <LeafIcon />
                        </div>
                        <span>KeptCarbon</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                        © 2024 KeptCarbon - ระบบประเมินการกักเก็บคาร์บอนในสวนยางพารา
                    </p>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage
