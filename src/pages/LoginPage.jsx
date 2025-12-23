import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'

// Icons
const LeafIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
    </svg>
)

const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
)

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
)

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
)

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
)

function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const history = useHistory()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        // Simulate login
        setTimeout(() => {
            setIsLoading(false)
            history.push('/dashboard')
        }, 1000)
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#3cc2cf]/5 to-[#7c5cfc]/5 z-0">
                <div className="absolute top-[-20%] right-[-10%] w-1/2 h-1/2 bg-[#3cc2cf]/20 rounded-full blur-[80px]"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-[#7c5cfc]/15 rounded-full blur-[80px]"></div>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-[440px] relative z-10 animate-scaleIn">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-[#3cc2cf]/30">
                        <LeafIcon />
                    </div>
                    <div className="text-xl font-bold text-gray-800">KeptCarbon</div>
                </div>

                <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">ยินดีต้อนรับกลับมา</h1>
                <p className="text-center text-gray-500 mb-8 text-sm">เข้าสู่ระบบเพื่อจัดการแปลงยางและประเมินคาร์บอน</p>

                <form onSubmit={handleSubmit}>
                    {/* Email */}
                    <div className="mb-5">
                        <label className="block mb-2 font-medium text-gray-700 text-sm">อีเมล</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <MailIcon />
                            </span>
                            <input
                                type="email"
                                className="w-full py-3.5 pl-12 pr-4 border border-gray-200 rounded-xl bg-white focus:border-[#3cc2cf] focus:ring-4 focus:ring-[#3cc2cf]/15 outline-none transition-all"
                                placeholder="yourname@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="mb-5">
                        <label className="block mb-2 font-medium text-gray-700 text-sm">รหัสผ่าน</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <LockIcon />
                            </span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full py-3.5 pl-12 pr-12 border border-gray-200 rounded-xl bg-white focus:border-[#3cc2cf] focus:ring-4 focus:ring-[#3cc2cf]/15 outline-none transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#3cc2cf] transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>

                    {/* Remember & Forgot */}
                    <div className="flex items-center justify-between mb-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-[#3cc2cf] focus:ring-[#3cc2cf]"
                            />
                            <span className="text-sm text-gray-500">จดจำฉัน</span>
                        </label>
                        <a href="#" className="text-sm text-[#3cc2cf] font-medium hover:underline">ลืมรหัสผ่าน?</a>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full py-4 rounded-xl font-semibold text-white gradient-primary hover:opacity-90 transition-opacity shadow-lg shadow-[#3cc2cf]/30 flex items-center justify-center"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin-slow"></div>
                        ) : (
                            'เข้าสู่ระบบ'
                        )}
                    </button>
                </form>

                <div className="flex items-center gap-4 my-6 text-gray-400 text-sm">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span>หรือ</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                <p className="text-center text-sm text-gray-500">
                    ยังไม่มีบัญชี? <Link to="/" className="text-[#3cc2cf] font-semibold hover:underline">สมัครสมาชิก</Link>
                </p>
            </div>
        </div>
    )
}

export default LoginPage
