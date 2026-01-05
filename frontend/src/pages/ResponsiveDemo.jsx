import React from 'react'

/**
 * Responsive Design System Demo
 * Showcases mobile-first responsive components
 */
function ResponsiveDemo() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-primary-50">
            {/* Hero Section - Fully Responsive */}
            <section className="container-responsive py-8 md:py-12 lg:py-16">
                <div className="text-center animate-fadeIn">
                    <h1 className="text-h1 font-black bg-gradient-to-r from-green-600 to-primary-600 bg-clip-text text-transparent mb-4">
                        Responsive Design System
                    </h1>
                    <p className="text-body text-gray-600 max-w-2xl mx-auto mb-8">
                        A mobile-first, fully responsive UI framework built with TailwindCSS.
                        Adapts seamlessly across mobile, tablet, and desktop devices.
                    </p>

                    {/* Responsive Button Group */}
                    <div className="flex flex-col sm:flex-row gap-responsive justify-center items-center">
                        <button className="btn-primary w-full sm:w-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Get Started
                        </button>
                        <button className="btn-secondary w-full sm:w-auto">
                            Learn More
                        </button>
                    </div>
                </div>
            </section>

            {/* Responsive Grid Cards */}
            <section className="container-responsive py-8 md:py-12">
                <h2 className="text-h2 font-bold text-center mb-8 text-gray-800">
                    Key Features
                </h2>

                {/* Auto-fit Grid - 1 col mobile, 2 cols tablet, 3+ cols desktop */}
                <div className="grid-responsive">
                    {/* Feature Card 1 */}
                    <div className="card-responsive group animate-fadeIn delay-1">
                        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-h3 font-semibold mb-2 text-gray-800">Mobile First</h3>
                        <p className="text-body text-gray-600">
                            Designed for mobile devices first, then enhanced for larger screens. Ensures optimal experience on all devices.
                        </p>
                    </div>

                    {/* Feature Card 2 */}
                    <div className="card-responsive group animate-fadeIn delay-2">
                        <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                        </div>
                        <h3 className="text-h3 font-semibold mb-2 text-gray-800">Touch Optimized</h3>
                        <p className="text-body text-gray-600">
                            All interactive elements meet 48px minimum touch target guidelines for comfortable mobile interaction.
                        </p>
                    </div>

                    {/* Feature Card 3 */}
                    <div className="card-responsive group animate-fadeIn delay-3">
                        <div className="w-12 h-12 bg-gradient-cool rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                            </svg>
                        </div>
                        <h3 className="text-h3 font-semibold mb-2 text-gray-800">Flexible Grid</h3>
                        <p className="text-body text-gray-600">
                            CSS Grid-based layout system that adapts from 1 column on mobile to multiple columns on desktop.
                        </p>
                    </div>

                    {/* Feature Card 4 */}
                    <div className="card-responsive group animate-fadeIn delay-4">
                        <div className="w-12 h-12 bg-gradient-warm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-h3 font-semibold mb-2 text-gray-800">Fluid Typography</h3>
                        <p className="text-body text-gray-600">
                            Uses CSS clamp() for responsive text that scales smoothly between breakpoints without media queries.
                        </p>
                    </div>

                    {/* Feature Card 5 */}
                    <div className="card-responsive group animate-fadeIn delay-5">
                        <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-h3 font-semibold mb-2 text-gray-800">Performance</h3>
                        <p className="text-body text-gray-600">
                            GPU-accelerated animations and optimized for reduced motion preferences for better accessibility.
                        </p>
                    </div>

                    {/* Feature Card 6 */}
                    <div className="card-responsive group animate-fadeIn delay-5">
                        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 className="text-h3 font-semibold mb-2 text-gray-800">Safe Areas</h3>
                        <p className="text-body text-gray-600">
                            Supports iOS safe areas for notch and home indicator, ensuring content is never obscured.
                        </p>
                    </div>
                </div>
            </section>

            {/* Responsive Form Example */}
            <section className="container-responsive py-8 md:py-12">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-h2 font-bold text-center mb-8 text-gray-800">
                        Touch-Friendly Form
                    </h2>

                    <div className="card-responsive">
                        <form className="space-y-4 md:space-y-6">
                            {/* Input Field */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    className="input-responsive"
                                    placeholder="Enter your name"
                                />
                            </div>

                            {/* Select Field */}
                            <div>
                                <label htmlFor="device" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Device Type
                                </label>
                                <select id="device" className="select-responsive">
                                    <option>Mobile Phone</option>
                                    <option>Tablet</option>
                                    <option>Desktop</option>
                                    <option>Large Desktop</option>
                                </select>
                            </div>

                            {/* Responsive Button Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-responsive pt-4">
                                <button type="button" className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Submit Form
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* Breakpoint Indicator */}
            <section className="container-responsive py-8 md:py-12">
                <div className="card-responsive bg-gradient-to-br from-primary-500 to-green-500 text-white text-center">
                    <h3 className="text-h3 font-bold mb-4">Current Breakpoint</h3>
                    <div className="flex flex-wrap justify-center gap-4">
                        <div className="px-4 py-2 bg-white/20 backdrop-blur rounded-xl">
                            <span className="block xs:hidden font-bold">Default (&lt; 475px)</span>
                            <span className="hidden xs:block sm:hidden font-bold">XS (475px - 640px)</span>
                            <span className="hidden sm:block md:hidden font-bold">SM (640px - 768px)</span>
                            <span className="hidden md:block lg:hidden font-bold">MD (768px - 1024px)</span>
                            <span className="hidden lg:block xl:hidden font-bold">LG (1024px - 1280px)</span>
                            <span className="hidden xl:block 2xl:hidden font-bold">XL (1280px - 1536px)</span>
                            <span className="hidden 2xl:block font-bold">2XL (≥ 1536px)</span>
                        </div>
                    </div>
                    <p className="text-sm mt-4 opacity-90">
                        Resize your browser window to see the breakpoint change
                    </p>
                </div>
            </section>

            {/* Responsive Utilities Showcase */}
            <section className="container-responsive py-8 md:py-12 lg:py-16">
                <h2 className="text-h2 font-bold text-center mb-8 text-gray-800">
                    Responsive Utilities
                </h2>

                {/* Visibility Classes */}
                <div className="grid-responsive mb-8">
                    <div className="card-responsive bg-green-50 border-2 border-green-200">
                        <h4 className="text-h4 font-semibold mb-2 text-green-800">Show on Mobile Only</h4>
                        <div className="show-mobile-only p-4 bg-green-100 rounded-xl text-green-800 font-bold">
                            📱 Visible only on mobile screens (&lt; 640px)
                        </div>
                        <div className="hidden sm:block p-4 bg-gray-100 rounded-xl text-gray-600">
                            Hidden on mobile, shown on larger screens
                        </div>
                    </div>

                    <div className="card-responsive bg-blue-50 border-2 border-blue-200">
                        <h4 className="text-h4 font-semibold mb-2 text-blue-800">Hide on Mobile</h4>
                        <div className="hide-mobile p-4 bg-blue-100 rounded-xl text-blue-800 font-bold">
                            💻 Hidden on mobile, shown on tablet and desktop
                        </div>
                        <div className="sm:hidden p-4 bg-gray-100 rounded-xl text-gray-600">
                            Shown on mobile only
                        </div>
                    </div>

                    <div className="card-responsive bg-purple-50 border-2 border-purple-200">
                        <h4 className="text-h4 font-semibold mb-2 text-purple-800">Hide on Tablet</h4>
                        <div className="hide-tablet p-4 bg-purple-100 rounded-xl text-purple-800 font-bold">
                            🖥️ Hidden on tablet (640px - 1024px)
                        </div>
                        <div className="hidden sm:block lg:hidden p-4 bg-gray-100 rounded-xl text-gray-600">
                            Shown on tablet only
                        </div>
                    </div>
                </div>

                {/* Spacing Examples */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-responsive">
                    <div className="card-responsive bg-gradient-to-br from-orange-50 to-yellow-50">
                        <h4 className="text-h4 font-semibold mb-4 text-orange-800">Responsive Padding</h4>
                        <div className="p-responsive bg-orange-100 rounded-xl">
                            <p className="text-sm text-orange-800 font-medium">
                                This box has responsive padding that increases from 1rem on mobile to 2rem on desktop
                            </p>
                        </div>
                    </div>

                    <div className="card-responsive bg-gradient-to-br from-teal-50 to-cyan-50">
                        <h4 className="text-h4 font-semibold mb-4 text-teal-800">Responsive Gap</h4>
                        <div className="flex flex-wrap gap-responsive">
                            <div className="px-4 py-2 bg-teal-100 rounded-lg text-teal-800 text-sm font-medium">Tag 1</div>
                            <div className="px-4 py-2 bg-teal-100 rounded-lg text-teal-800 text-sm font-medium">Tag 2</div>
                            <div className="px-4 py-2 bg-teal-100 rounded-lg text-teal-800 text-sm font-medium">Tag 3</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="container-responsive py-8 safe-bottom">
                <div className="text-center text-gray-600 text-sm">
                    <p className="mb-2">Built with ❤️ using Mobile-First Responsive Design</p>
                    <p className="opacity-70">TailwindCSS • React • Fluid Typography • Touch-Optimized</p>
                </div>
            </footer>
        </div>
    )
}

export default ResponsiveDemo
