import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import { BrandLogo } from '../components/atoms'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Internal Icons specifically for Login
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
    const [error, setError] = useState('')
    const history = useHistory()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const params = new URLSearchParams();
            params.append('username', email);
            params.append('password', password);

            const response = await axios.post(`${API_URL}/api/auth/login`, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (response.data.access_token) {
                localStorage.setItem('token', response.data.access_token);
                history.push('/dashboard');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true)
        setError('')
        try {
            // Decode JWT to get user profile info (name, picture, email)
            const decodeJWT = (token) => {
                try {
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));
                    return JSON.parse(jsonPayload);
                } catch (e) {
                    return null;
                }
            };

            const profile = decodeJWT(credentialResponse.credential);
            if (profile) {
                localStorage.setItem('userProfile', JSON.stringify({
                    name: profile.name,
                    email: profile.email,
                    picture: profile.picture,
                    given_name: profile.given_name,
                    family_name: profile.family_name
                }));
            }

            const response = await axios.post(`${API_URL}/api/auth/google`, {
                token: credentialResponse.credential
            })

            if (response.data.access_token) {
                localStorage.setItem('token', response.data.access_token)
                history.push('/dashboard')
            }
        } catch (err) {
            console.error('Google login error:', err)
            setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleError = () => {
        console.error('Google Login Failed')
        setError('การเข้าสู่ระบบด้วย Google ล้มเหลว')
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#065f46]/5 to-[#059669]/5 z-0">
                <div className="absolute top-[-20%] right-[-10%] w-1/2 h-1/2 bg-[#065f46]/10 rounded-full blur-[80px]"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-[#059669]/10 rounded-full blur-[80px]"></div>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-[440px] relative z-10 animate-scaleIn">
                {/* Unified Brand Logo */}
                <div className="flex flex-col items-center mb-8">
                    <BrandLogo mode="dark" size={48} className="transform hover:scale-110 transition-transform duration-500" />
                </div>

                <h1 className="text-2xl font-bold text-center mb-2 text-gray-800 tracking-tight">ยินดีต้อนรับกลับมา</h1>
                <p className="text-center text-gray-500 mb-8 text-sm">เข้าสู่ระบบเพื่อจัดการแปลงยางและประเมินคาร์บอน</p>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 animate-shake">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Email Input */}
                    <div className="mb-5">
                        <label className="block mb-2 font-medium text-gray-700 text-sm">อีเมล</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <MailIcon />
                            </span>
                            <input
                                type="email"
                                className="w-full py-3.5 pl-12 pr-4 border border-gray-200 rounded-xl bg-white focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 outline-none transition-all"
                                placeholder="yourname@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="mb-5">
                        <label className="block mb-2 font-medium text-gray-700 text-sm">รหัสผ่าน</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <LockIcon />
                            </span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full py-3.5 pl-12 pr-12 border border-gray-200 rounded-xl bg-white focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 outline-none transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#059669] transition-colors"
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
                                className="w-4 h-4 rounded border-gray-300 text-[#059669] focus:ring-[#059669]"
                            />
                            <span className="text-sm text-gray-500">จดจำฉัน</span>
                        </label>
                        <a href="#" className="text-sm text-[#059669] font-medium hover:underline font-bold">ลืมรหัสผ่าน?</a>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full py-4 rounded-xl font-semibold text-white gradient-primary hover:opacity-90 transition-all shadow-lg shadow-[#065f46]/20 flex items-center justify-center transform active:scale-[0.98]"
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
                    <div className="flex-1 h-px bg-gray-100"></div>
                    <span>หรือร่วมผ่าน</span>
                    <div className="flex-1 h-px bg-gray-100"></div>
                </div>

                <div className="flex justify-center mb-6">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                        theme="outline"
                        shape="pill"
                        size="large"
                        width="100%"
                        locale="th"
                    />
                </div>

                <p className="text-center text-sm text-gray-500">
                    ยังไม่มีบัญชี? <Link to="/" className="text-[#059669] font-bold hover:underline">สมัครสมาชิกใหม่</Link>
                </p>
            </div>
        </div>
    )
}

export default LoginPage
