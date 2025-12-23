import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../atoms'
import { LeafIcon } from '../atoms/Icons'

const LandingTemplate = ({
    children,
    showNav = true
}) => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            {showNav && (
                <nav className="fixed top-0 left-0 right-0 h-[70px] bg-white/95 backdrop-blur-lg flex items-center justify-between px-8 z-50 shadow-sm">
                    <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-800">
                        <div className="w-9 h-9 gradient-primary rounded-lg flex items-center justify-center text-white">
                            <LeafIcon size={20} />
                        </div>
                        <span>KeptCarbon</span>
                    </Link>

                    <ul className="hidden md:flex items-center gap-8 list-none">
                        <li>
                            <a href="#features" className="text-gray-500 font-medium hover:text-[#3cc2cf] transition-colors">
                                คุณสมบัติ
                            </a>
                        </li>
                        <li>
                            <a href="#about" className="text-gray-500 font-medium hover:text-[#3cc2cf] transition-colors">
                                เกี่ยวกับเรา
                            </a>
                        </li>
                        <li>
                            <a href="#contact" className="text-gray-500 font-medium hover:text-[#3cc2cf] transition-colors">
                                ติดต่อ
                            </a>
                        </li>
                    </ul>

                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/login">
                            <Button variant="outline">เข้าสู่ระบบ</Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="primary">เริ่มต้นใช้งาน</Button>
                        </Link>
                    </div>
                </nav>
            )}

            {/* Main Content */}
            {children}

            {/* Footer */}
            <footer className="bg-gray-800 py-10 px-8">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-white text-xl font-bold">
                        <div className="w-9 h-9 gradient-primary rounded-lg flex items-center justify-center">
                            <LeafIcon size={20} />
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

export default LandingTemplate
