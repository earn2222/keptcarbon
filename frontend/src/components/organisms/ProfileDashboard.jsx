import React, { useState } from 'react';
import {
    User, MapPin, Calendar, TrendingUp, Download, Share2,
    BarChart3, Activity, Award, Target, Leaf, TreeDeciduous
} from 'lucide-react';
import { cn } from '../../lib/utils';

// ==========================================
// PROFILE DASHBOARD
// ==========================================
export default function ProfileDashboard({ user, plots = [] }) {
    const [timeRange, setTimeRange] = useState('all'); // 'week' | 'month' | 'year' | 'all'

    // Calculate user statistics
    const stats = {
        totalPlots: plots.length,
        totalCarbon: plots.reduce((sum, p) => sum + parseFloat(p.carbon || 0), 0).toFixed(2),
        totalArea: (plots.reduce((sum, p) => sum + parseFloat(p.areaSqm || 0), 0) / 1600).toFixed(2),
        avgAge: plots.length > 0 ? Math.round(plots.reduce((sum, p) => sum + (p.age || 0), 0) / plots.length) : 0,
        topVariety: getTopVariety(plots),
        recentActivity: plots.filter(p => isRecent(p.savedAt)).length
    };

    // Group plots by month for history
    const history = groupPlotsByMonth(plots);

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Profile Header */}
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8">
                    <div className="h-32 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 relative">
                        <div className="absolute -bottom-12 left-8">
                            <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white">
                                <User size={48} className="text-emerald-600" />
                            </div>
                        </div>
                    </div>
                    <div className="pt-16 pb-6 px-8">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">{user?.name || 'ผู้ใช้งาน'}</h1>
                                <p className="text-gray-500 mt-1">เกษตรกรยางพารา</p>
                                <div className="flex items-center gap-4 mt-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <MapPin size={16} className="text-gray-400" />
                                        <span>{user?.location || 'ประเทศไทย'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar size={16} className="text-gray-400" />
                                        <span>สมัครเมื่อ {user?.joinDate || '2026'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl font-medium transition-colors flex items-center gap-2">
                                    <Share2 size={18} />
                                    แชร์
                                </button>
                                <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2">
                                    <Download size={18} />
                                    ส่งออกข้อมูล
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <ProfileStatCard
                        icon={<TreeDeciduous size={24} className="text-emerald-600" />}
                        label="แปลงทั้งหมด"
                        value={stats.totalPlots}
                        subtext="แปลง"
                        trend="+2"
                        color="emerald"
                    />
                    <ProfileStatCard
                        icon={<Leaf size={24} className="text-green-600" />}
                        label="คาร์บอนสะสม"
                        value={stats.totalCarbon}
                        subtext="tCO₂e"
                        trend="+12%"
                        color="green"
                    />
                    <ProfileStatCard
                        icon={<MapPin size={24} className="text-teal-600" />}
                        label="พื้นที่รวม"
                        value={stats.totalArea}
                        subtext="ไร่"
                        trend="+5"
                        color="teal"
                    />
                    <ProfileStatCard
                        icon={<Activity size={24} className="text-blue-600" />}
                        label="อายุเฉลี่ย"
                        value={stats.avgAge}
                        subtext="ปี"
                        trend="0"
                        color="blue"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">ประวัติการคำนวณ</h2>
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100"
                            >
                                <option value="week">สัปดาห์นี้</option>
                                <option value="month">เดือนนี้</option>
                                <option value="year">ปีนี้</option>
                                <option value="all">ทั้งหมด</option>
                            </select>
                        </div>

                        <div className="space-y-3">
                            {history.length === 0 ? (
                                <div className="text-center py-12">
                                    <Calendar size={48} className="text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">ยังไม่มีประวัติการคำนวณ</p>
                                </div>
                            ) : (
                                history.slice(0, 10).map((entry, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shrink-0">
                                            <Leaf size={20} className="text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-800">{entry.farmerName}</h4>
                                            <p className="text-sm text-gray-500">{entry.variety} • {entry.method}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-emerald-600">{entry.carbon}</div>
                                            <div className="text-xs text-gray-500">tCO₂e</div>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {formatDate(entry.savedAt)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Insights */}
                    <div className="space-y-6">
                        {/* Top Variety */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">พันธุ์ที่นิยม</h3>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                                    <Award size={24} className="text-white" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">{stats.topVariety || '-'}</p>
                                    <p className="text-sm text-gray-500">มากที่สุด</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
                            <h3 className="text-lg font-bold mb-4">สถิติด่วน</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-emerald-100">กิจกรรมล่าสุด</span>
                                    <span className="font-bold">{stats.recentActivity} แปลง</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-emerald-100">คาร์บอนเฉลี่ย</span>
                                    <span className="font-bold">
                                        {stats.totalPlots > 0 ? (stats.totalCarbon / stats.totalPlots).toFixed(2) : 0} tCO₂e
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-emerald-100">พื้นที่เฉลี่ย</span>
                                    <span className="font-bold">
                                        {stats.totalPlots > 0 ? (stats.totalArea / stats.totalPlots).toFixed(2) : 0} ไร่
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Achievement */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">ความสำเร็จ</h3>
                            <div className="space-y-3">
                                <AchievementBadge
                                    icon="🌱"
                                    title="มือใหม่"
                                    description="เพิ่มแปลงแรก"
                                    achieved={stats.totalPlots >= 1}
                                />
                                <AchievementBadge
                                    icon="🌳"
                                    title="เกษตรกรตัวจริง"
                                    description="มีแปลง 5+ แปลง"
                                    achieved={stats.totalPlots >= 5}
                                />
                                <AchievementBadge
                                    icon="🏆"
                                    title="ผู้เชี่ยวชาญ"
                                    description="มีแปลง 10+ แปลง"
                                    achieved={stats.totalPlots >= 10}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// PROFILE STAT CARD
// ==========================================
function ProfileStatCard({ icon, label, value, subtext, trend, color }) {
    const colors = {
        emerald: 'from-emerald-500 to-green-600',
        green: 'from-green-500 to-emerald-600',
        teal: 'from-teal-500 to-cyan-600',
        blue: 'from-blue-500 to-indigo-600'
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className={cn(
                    "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
                    colors[color]
                )}>
                    {icon}
                </div>
                {trend !== "0" && (
                    <div className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium">
                        {trend}
                    </div>
                )}
            </div>
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-800">{value}</span>
                <span className="text-sm text-gray-500">{subtext}</span>
            </div>
        </div>
    );
}

// ==========================================
// ACHIEVEMENT BADGE
// ==========================================
function AchievementBadge({ icon, title, description, achieved }) {
    return (
        <div className={cn(
            "flex items-center gap-3 p-3 rounded-xl transition-all",
            achieved ? "bg-emerald-50 border border-emerald-200" : "bg-gray-50 border border-gray-100 opacity-50"
        )}>
            <div className="text-2xl">{icon}</div>
            <div className="flex-1">
                <p className={cn(
                    "font-semibold text-sm",
                    achieved ? "text-gray-800" : "text-gray-400"
                )}>{title}</p>
                <p className="text-xs text-gray-500">{description}</p>
            </div>
            {achieved && (
                <div className="text-emerald-600">✓</div>
            )}
        </div>
    );
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================
function getTopVariety(plots) {
    const varieties = {};
    plots.forEach(p => {
        if (p.variety) {
            varieties[p.variety] = (varieties[p.variety] || 0) + 1;
        }
    });
    let maxVariety = null;
    let maxCount = 0;
    Object.entries(varieties).forEach(([variety, count]) => {
        if (count > maxCount) {
            maxCount = count;
            maxVariety = variety;
        }
    });
    return maxVariety;
}

function isRecent(dateString) {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = (now - date) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
}

function groupPlotsByMonth(plots) {
    return plots.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'วันนี้';
    if (diffDays === 1) return 'เมื่อวาน';
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} สัปดาห์ที่แล้ว`;
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
}
