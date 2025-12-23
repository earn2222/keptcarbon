import React from 'react'

const AuthTemplate = ({ children }) => {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#3cc2cf]/5 to-[#7c5cfc]/5 z-0">
                <div className="absolute top-[-20%] right-[-10%] w-1/2 h-1/2 bg-[#3cc2cf]/20 rounded-full blur-[80px]"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-[#7c5cfc]/15 rounded-full blur-[80px]"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-[440px]">
                {children}
            </div>
        </div>
    )
}

export default AuthTemplate
